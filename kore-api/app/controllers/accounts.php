<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/Account.php';

class Accounts extends Controller
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
            $stmt = Model::query("SELECT * FROM accounts WHERE id = ? AND organization_id = ?", [$id, $orgId]);
            $account = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$account) {
                return $this->error("Conta não encontrada.", 404);
            }
            return $this->json(['data' => $account]);
        }

        $stmt = Model::query("SELECT * FROM accounts WHERE organization_id = ? AND is_active = 1 ORDER BY name ASC", [$orgId]);
        $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $totalBalance = 0.0;
        foreach ($accounts as $acc) {
            $totalBalance += (float) $acc['current_balance'];
        }

        return $this->json([
            'data' => $accounts,
            'meta' => [
                'total_balance' => $totalBalance,
                'count' => count($accounts)
            ]
        ]);
    }

    public function post()
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $name = trim($body['name'] ?? '');
        $type = $body['type'] ?? 'checking';
        $bankName = $body['bank_name'] ?? null;
        $initialBalance = (float) ($body['initial_balance'] ?? 0.0);
        $color = $body['color'] ?? '#0F7A4A';
        $icon = $body['icon'] ?? 'bi-bank';

        if (empty($name)) {
            return $this->error("O nome da conta é obrigatório.", 422);
        }

        Model::query(
            "INSERT INTO accounts (organization_id, name, type, bank_name, initial_balance, current_balance, color, icon) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [$orgId, $name, $type, $bankName, $initialBalance, $initialBalance, $color, $icon]
        );
        $id = (int) Model::getPdo()->lastInsertId();

        return $this->json(['message' => 'Conta criada com sucesso.', 'id' => $id], 201);
    }
}
