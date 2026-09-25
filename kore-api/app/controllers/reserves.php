<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/Reserve.php';

class Reserves extends Controller
{
    protected function getActiveOrgId(): int
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        if (!empty($headers['X-Organization-Id'])) {
            return (int) $headers['X-Organization-Id'];
        }
        if (!empty($_GET['org_id'])) {
            return (int) $_GET['org_id'];
        }
        return 1;
    }

    public function get($id = null)
    {
        $orgId = $this->getActiveOrgId();

        if ($id) {
            $stmt = Model::query("SELECT * FROM reserves WHERE id = ? AND organization_id = ?", [$id, $orgId]);
            $reserve = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$reserve) {
                return $this->error("Reserva não encontrada.", 404);
            }
            $target = (float) $reserve['target_amount'];
            $current = (float) $reserve['current_amount'];
            $reserve['percentage'] = $target > 0 ? round(($current / $target) * 100) : 0;
            return $this->json(['data' => $reserve]);
        }

        $stmt = Model::query("SELECT * FROM reserves WHERE organization_id = ? AND is_active = 1 ORDER BY priority ASC, name ASC", [$orgId]);
        $reserves = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $totalAccumulated = 0.0;
        $totalTarget = 0.0;

        foreach ($reserves as &$r) {
            $target = (float) $r['target_amount'];
            $current = (float) $r['current_amount'];
            $r['percentage'] = $target > 0 ? round(($current / $target) * 100) : 0;
            $r['formatted_current'] = 'R$ ' . number_format($current, 2, ',', '.');
            $r['formatted_target'] = 'R$ ' . number_format($target, 2, ',', '.');
            $totalAccumulated += $current;
            $totalTarget += $target;
        }

        return $this->json([
            'data' => $reserves,
            'meta' => [
                'total_accumulated' => $totalAccumulated,
                'total_target' => $totalTarget,
                'overall_percentage' => $totalTarget > 0 ? round(($totalAccumulated / $totalTarget) * 100) : 0
            ]
        ]);
    }

    public function post()
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $name = trim($body['name'] ?? '');
        $type = $body['type'] ?? 'emergency';
        $target = (float) ($body['target_amount'] ?? 0.0);
        $current = (float) ($body['current_amount'] ?? 0.0);
        $monthly = (float) ($body['monthly_contribution_target'] ?? 0.0);
        $priority = $body['priority'] ?? 'high';
        $icon = $body['icon'] ?? 'app/assets/illustrations/coin-happy.png';
        $color = $body['color'] ?? '#22C55E';
        $accountId = !empty($body['account_id']) ? (int) $body['account_id'] : null;

        if (empty($name)) {
            return $this->error("O nome da reserva ou meta é obrigatório.", 422);
        }

        Model::query(
            "INSERT INTO reserves (organization_id, account_id, name, type, target_amount, current_amount, monthly_contribution_target, priority, icon, color) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [$orgId, $accountId, $name, $type, $target, $current, $monthly, $priority, $icon, $color]
        );
        $id = (int) Model::getPdo()->lastInsertId();

        return $this->json(['message' => 'Reserva criada com sucesso.', 'id' => $id], 201);
    }

    /**
     * POST /reserves/{id}/deposit
     * Realiza um aporte na reserva, criando uma transação e incrementando o saldo.
     */
    public function post_deposit($id)
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $amount = (float) ($body['amount'] ?? 0.0);
        $accountId = !empty($body['account_id']) ? (int) $body['account_id'] : null;
        $date = $body['date'] ?? date('Y-m-d');
        $notes = $body['notes'] ?? 'Aporte em reserva';

        if ($amount <= 0) {
            return $this->error("O valor do aporte deve ser maior que zero.", 422);
        }

        // Verifica reserva
        $stmt = Model::query("SELECT * FROM reserves WHERE id = ? AND organization_id = ?", [$id, $orgId]);
        $reserve = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$reserve) {
            return $this->error("Reserva não encontrada.", 404);
        }

        // Incrementa saldo da reserva
        Model::query("UPDATE reserves SET current_amount = current_amount + ? WHERE id = ?", [$amount, $id]);

        // Debita da conta caso informada
        if ($accountId) {
            Model::query("UPDATE accounts SET current_balance = current_balance - ? WHERE id = ? AND organization_id = ?", [$amount, $accountId, $orgId]);
        }

        // Registra movimentação do tipo reserve_deposit
        Model::query(
            "INSERT INTO transactions (organization_id, user_id, account_id, reserve_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination, notes)
             VALUES (?, 1, ?, ?, 'reserve_deposit', ?, ?, ?, ?, ?, ?, 'effective', 1, 1, ?)",
            [$orgId, $accountId, $id, "Aporte em " . $reserve['name'], $amount, $amount, $date, $date, $date, $notes]
        );

        return $this->json(['message' => 'Aporte realizado com sucesso!']);
    }
}
