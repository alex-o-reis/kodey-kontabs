<?php

require_once __DIR__ . '/../../kore/Model.php';

class AccountService
{
    /**
     * Retorna o extrato detalhado de uma conta bancária com saldo progressivo.
     */
    public static function getStatement(int $orgId, int $accountId, array $filters = []): array
    {
        // Busca a conta
        $stmt = Model::query("SELECT * FROM accounts WHERE id = ? AND organization_id = ?", [$accountId, $orgId]);
        $account = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$account) {
            return [];
        }

        $month = $filters['month'] ?? date('Y-m');
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));

        // Busca movimentações vinculadas à conta (como pagadora ou como destino de transferência)
        $sql = "SELECT t.*, 
                       c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
                       orig.name AS origin_account_name,
                       dest.name AS destination_account_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN accounts orig ON t.account_id = orig.id
                LEFT JOIN accounts dest ON t.destination_account_id = dest.id
                WHERE t.organization_id = ? 
                  AND (t.account_id = ? OR t.destination_account_id = ?)
                  AND t.competence_date BETWEEN ? AND ?
                ORDER BY t.due_date ASC, t.id ASC";

        $stmt = Model::query($sql, [$orgId, $accountId, $accountId, $startDate, $endDate]);
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calcula entradas, saídas e linhas de extrato
        $totalIn = 0.0;
        $totalOut = 0.0;
        $items = [];

        foreach ($transactions as $tx) {
            $effective = $tx['amount_effective'] !== null ? (float) $tx['amount_effective'] : (float) $tx['amount_expected'];
            $isIncome = false;

            if ($tx['type'] === 'income') {
                $isIncome = true;
                $totalIn += $effective;
            } elseif ($tx['type'] === 'expense') {
                $isIncome = false;
                $totalOut += $effective;
            } elseif ($tx['type'] === 'transfer') {
                if ((int) $tx['destination_account_id'] === $accountId) {
                    $isIncome = true; // Entrada por transferência recebida
                    $totalIn += $effective;
                } else {
                    $isIncome = false; // Saída por transferência enviada
                    $totalOut += $effective;
                }
            } elseif ($tx['type'] === 'reserve_withdraw') {
                $isIncome = true; // Resgate de reserva entrando na conta
                $totalIn += $effective;
            } elseif ($tx['type'] === 'reserve_deposit' || $tx['type'] === 'card_payment') {
                $isIncome = false; // Aporte saindo da conta
                $totalOut += $effective;
            }

            $tx['is_income'] = $isIncome;
            $tx['signed_amount'] = $isIncome ? $effective : -$effective;
            $tx['formatted_amount'] = ($isIncome ? '+ ' : '- ') . 'R$ ' . number_format($effective, 2, ',', '.');

            $items[] = $tx;
        }

        return [
            'account' => $account,
            'month' => $month,
            'initial_balance' => (float) $account['initial_balance'],
            'current_balance' => (float) $account['current_balance'],
            'total_in' => $totalIn,
            'total_out' => $totalOut,
            'net_flow' => $totalIn - $totalOut,
            'transactions' => $items
        ];
    }

    /**
     * Realiza transferência atômica entre contas da organização.
     * Regra Kore: Transferência entre contas NÃO é despesa nem receita, é movimentação patrimonial.
     */
    public static function transfer(int $orgId, int $fromAccountId, int $toAccountId, float $amount, string $date, string $description, ?string $notes = null): array
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException("O valor da transferência deve ser maior que zero.");
        }

        if ($fromAccountId === $toAccountId) {
            throw new InvalidArgumentException("As contas de origem e destino devem ser diferentes.");
        }

        $pdo = Model::getPdo();
        $pdo->beginTransaction();

        try {
            // Verifica conta origem
            $stmt = Model::query("SELECT * FROM accounts WHERE id = ? AND organization_id = ? FOR UPDATE", [$fromAccountId, $orgId]);
            $fromAcc = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$fromAcc) {
                throw new Exception("Conta de origem não encontrada.");
            }

            // Verifica conta destino
            $stmt = Model::query("SELECT * FROM accounts WHERE id = ? AND organization_id = ? FOR UPDATE", [$toAccountId, $orgId]);
            $toAcc = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$toAcc) {
                throw new Exception("Conta de destino não encontrada.");
            }

            // 1. Debita da conta de origem
            Model::query("UPDATE accounts SET current_balance = current_balance - ? WHERE id = ?", [$amount, $fromAccountId]);

            // 2. Credita na conta de destino
            Model::query("UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?", [$amount, $toAccountId]);

            // 3. Registra a movimentação de transferência
            $txDescription = !empty($description) ? $description : "Transferência: {$fromAcc['name']} -> {$toAcc['name']}";
            Model::query(
                "INSERT INTO transactions (organization_id, user_id, account_id, destination_account_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination, notes)
                 VALUES (?, 1, ?, ?, 'transfer', ?, ?, ?, ?, ?, ?, 'effective', 1, 1, ?)",
                [$orgId, $fromAccountId, $toAccountId, $txDescription, $amount, $amount, $date, $date, $date, $notes]
            );
            $txId = (int) $pdo->lastInsertId();

            $pdo->commit();

            return [
                'success' => true,
                'transaction_id' => $txId,
                'from_account' => $fromAcc['name'],
                'to_account' => $toAcc['name'],
                'amount' => $amount,
                'new_from_balance' => (float) $fromAcc['current_balance'] - $amount,
                'new_to_balance' => (float) $toAcc['current_balance'] + $amount
            ];
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}
