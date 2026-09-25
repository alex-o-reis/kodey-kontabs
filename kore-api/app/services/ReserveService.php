<?php

require_once __DIR__ . '/../../kore/Model.php';

class ReserveService
{
    /**
     * Retorna projeções e metas de todas as reservas ativas da organização.
     */
    public static function getProjections(int $orgId): array
    {
        $stmt = Model::query(
            "SELECT r.*, a.name AS custody_account_name 
             FROM reserves r
             LEFT JOIN accounts a ON r.account_id = a.id
             WHERE r.organization_id = ? AND r.is_active = 1
             ORDER BY r.priority ASC, r.name ASC",
            [$orgId]
        );
        $reserves = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $totalAccumulated = 0.0;
        $totalTarget = 0.0;
        $totalMonthlyTarget = 0.0;

        foreach ($reserves as &$r) {
            $target = (float) $r['target_amount'];
            $current = (float) $r['current_amount'];
            $monthly = (float) $r['monthly_contribution_target'];

            $r['percentage'] = $target > 0 ? min(100, round(($current / $target) * 100)) : 0;
            $r['remaining_amount'] = max(0.0, $target - $current);
            $r['estimated_months'] = ($monthly > 0 && $r['remaining_amount'] > 0) ? (int) ceil($r['remaining_amount'] / $monthly) : 0;

            if ($r['percentage'] >= 100) {
                $r['status_badge'] = 'completed';
                $r['status_label'] = 'Meta 100% Atingida!';
            } elseif ($r['percentage'] >= 50) {
                $r['status_badge'] = 'on_track';
                $r['status_label'] = 'No Ritmo Certo';
            } else {
                $r['status_badge'] = 'attention';
                $r['status_label'] = 'Acelerar Aportes';
            }

            $r['formatted_current'] = 'R$ ' . number_format($current, 2, ',', '.');
            $r['formatted_target'] = 'R$ ' . number_format($target, 2, ',', '.');
            $r['formatted_remaining'] = 'R$ ' . number_format($r['remaining_amount'], 2, ',', '.');

            $totalAccumulated += $current;
            $totalTarget += $target;
            $totalMonthlyTarget += $monthly;
        }

        return [
            'reserves' => $reserves,
            'summary' => [
                'total_accumulated' => $totalAccumulated,
                'total_target' => $totalTarget,
                'total_monthly_target' => $totalMonthlyTarget,
                'overall_percentage' => $totalTarget > 0 ? round(($totalAccumulated / $totalTarget) * 100) : 0
            ]
        ];
    }

    /**
     * Fluxo "Dar Destino ao Dinheiro" — Aloca saldo livre diretamente em um envelope de reserva.
     */
    public static function allocate(int $orgId, int $reserveId, float $amount, ?int $accountId = null, ?string $date = null, ?string $notes = null): array
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException("O valor a alocar deve ser maior que zero.");
        }

        $date = $date ?? date('Y-m-d');
        $pdo = Model::getPdo();
        $pdo->beginTransaction();

        try {
            $stmt = Model::query("SELECT * FROM reserves WHERE id = ? AND organization_id = ? FOR UPDATE", [$reserveId, $orgId]);
            $reserve = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$reserve) {
                throw new Exception("Reserva financeira não encontrada.");
            }

            // 1. Incrementa valor na reserva
            Model::query("UPDATE reserves SET current_amount = current_amount + ? WHERE id = ?", [$amount, $reserveId]);

            // 2. Se informada conta de custódia/origem, debita o saldo
            $accName = null;
            if ($accountId) {
                $stmtAcc = Model::query("SELECT * FROM accounts WHERE id = ? AND organization_id = ? FOR UPDATE", [$accountId, $orgId]);
                $acc = $stmtAcc->fetch(PDO::FETCH_ASSOC);
                if ($acc) {
                    $accName = $acc['name'];
                    Model::query("UPDATE accounts SET current_balance = current_balance - ? WHERE id = ?", [$amount, $accountId]);
                }
            }

            // 3. Registra movimentação de destino com status efetivado
            $desc = "Destino Alocado: " . $reserve['name'];
            $noteText = !empty($notes) ? $notes : "Alocação do princípio 'Todo dinheiro deve ter um destino'.";
            Model::query(
                "INSERT INTO transactions (organization_id, user_id, account_id, reserve_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination, notes)
                 VALUES (?, 1, ?, ?, 'reserve_deposit', ?, ?, ?, ?, ?, ?, 'effective', 1, 1, ?)",
                [$orgId, $accountId, $reserveId, $desc, $amount, $amount, $date, $date, $date, $noteText]
            );
            $txId = (int) $pdo->lastInsertId();

            $pdo->commit();

            return [
                'success' => true,
                'transaction_id' => $txId,
                'reserve_name' => $reserve['name'],
                'amount_allocated' => $amount,
                'new_current_amount' => (float) $reserve['current_amount'] + $amount
            ];
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Resgate de reserva para conta bancária corrente.
     */
    public static function withdraw(int $orgId, int $reserveId, float $amount, int $destinationAccountId, ?string $date = null, ?string $reason = null): array
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException("O valor do resgate deve ser maior que zero.");
        }

        $date = $date ?? date('Y-m-d');
        $pdo = Model::getPdo();
        $pdo->beginTransaction();

        try {
            $stmt = Model::query("SELECT * FROM reserves WHERE id = ? AND organization_id = ? FOR UPDATE", [$reserveId, $orgId]);
            $reserve = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$reserve) {
                throw new Exception("Reserva não encontrada.");
            }

            if ((float) $reserve['current_amount'] < $amount) {
                throw new Exception("Saldo insuficiente na reserva para este valor de resgate.");
            }

            // 1. Decrementa na reserva
            Model::query("UPDATE reserves SET current_amount = current_amount - ? WHERE id = ?", [$amount, $reserveId]);

            // 2. Credita na conta destino
            $stmtAcc = Model::query("SELECT * FROM accounts WHERE id = ? AND organization_id = ? FOR UPDATE", [$destinationAccountId, $orgId]);
            $acc = $stmtAcc->fetch(PDO::FETCH_ASSOC);
            if (!$acc) {
                throw new Exception("Conta de destino não encontrada.");
            }
            Model::query("UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?", [$amount, $destinationAccountId]);

            // 3. Registra movimentação de resgate
            $desc = "Resgate de Reserva: " . $reserve['name'];
            $noteText = !empty($reason) ? $reason : "Resgate para conta " . $acc['name'];
            Model::query(
                "INSERT INTO transactions (organization_id, user_id, account_id, destination_account_id, reserve_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination, notes)
                 VALUES (?, 1, ?, ?, ?, 'reserve_withdraw', ?, ?, ?, ?, ?, ?, 'effective', 1, 1, ?)",
                [$orgId, null, $destinationAccountId, $reserveId, $desc, $amount, $amount, $date, $date, $date, $noteText]
            );
            $txId = (int) $pdo->lastInsertId();

            $pdo->commit();

            return [
                'success' => true,
                'transaction_id' => $txId,
                'reserve_name' => $reserve['name'],
                'destination_account' => $acc['name'],
                'amount_withdrawn' => $amount,
                'new_reserve_amount' => (float) $reserve['current_amount'] - $amount,
                'new_account_balance' => (float) $acc['current_balance'] + $amount
            ];
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}
