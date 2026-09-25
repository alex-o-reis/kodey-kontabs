<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/CreditCard.php';

class Creditcards extends Controller
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
            $stmt = Model::query("SELECT * FROM credit_cards WHERE id = ? AND organization_id = ?", [$id, $orgId]);
            $card = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$card) {
                return $this->error("Cartão não encontrado.", 404);
            }
            return $this->json(['data' => $card]);
        }

        $stmt = Model::query("SELECT * FROM credit_cards WHERE organization_id = ? AND is_active = 1 ORDER BY name ASC", [$orgId]);
        $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $this->json(['data' => $cards]);
    }

    public function post()
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $name = trim($body['name'] ?? '');
        $accountId = !empty($body['account_id']) ? (int) $body['account_id'] : null;
        $brand = $body['brand'] ?? 'Mastercard';
        $limit = (float) ($body['credit_limit'] ?? 0.0);
        $closing = (int) ($body['closing_day'] ?? 20);
        $due = (int) ($body['due_day'] ?? 28);
        $color = $body['color'] ?? '#103C35';

        if (empty($name)) {
            return $this->error("O nome do cartão é obrigatório.", 422);
        }

        Model::query(
            "INSERT INTO credit_cards (organization_id, account_id, name, brand, credit_limit, closing_day, due_day, color) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [$orgId, $accountId, $name, $brand, $limit, $closing, $due, $color]
        );
        $id = (int) Model::getPdo()->lastInsertId();

        return $this->json(['message' => 'Cartão de crédito criado com sucesso.', 'id' => $id], 201);
    }
}
