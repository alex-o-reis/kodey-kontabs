<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/Reserve.php';
require_once __DIR__ . '/../services/ReserveService.php';

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

        $result = ReserveService::getProjections($orgId);
        return $this->json([
            'data' => $result['reserves'],
            'meta' => $result['summary']
        ]);
    }

    /**
     * GET /reserves/projections
     */
    public function get_projections()
    {
        $orgId = $this->getActiveOrgId();
        $result = ReserveService::getProjections($orgId);
        return $this->json(['data' => $result]);
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
     * POST /reserves/{id}/allocate
     * Fluxo "Dar Destino ao Dinheiro"
     */
    public function post_allocate($id)
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $amount = (float) ($body['amount'] ?? 0.0);
        $accountId = !empty($body['account_id']) ? (int) $body['account_id'] : null;
        $date = $body['date'] ?? date('Y-m-d');
        $notes = $body['notes'] ?? 'Alocação de saldo livre (Dar Destino)';

        try {
            $result = ReserveService::allocate($orgId, (int) $id, $amount, $accountId, $date, $notes);
            return $this->json([
                'message' => 'Saldo alocado com sucesso! Todo dinheiro agora tem um destino.',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * POST /reserves/{id}/withdraw
     * Resgate financeiro para conta corrente
     */
    public function post_withdraw($id)
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $amount = (float) ($body['amount'] ?? 0.0);
        $destAccountId = (int) ($body['destination_account_id'] ?? 0);
        $date = $body['date'] ?? date('Y-m-d');
        $reason = $body['reason'] ?? 'Resgate de reserva';

        if (!$destAccountId || $amount <= 0) {
            return $this->error("Informe a conta de destino e o valor do resgate.", 422);
        }

        try {
            $result = ReserveService::withdraw($orgId, (int) $id, $amount, $destAccountId, $date, $reason);
            return $this->json([
                'message' => 'Resgate realizado com sucesso!',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * POST /reserves/{id}/deposit
     */
    public function post_deposit($id)
    {
        return $this->post_allocate($id);
    }
}
