<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/CreditCard.php';
require_once __DIR__ . '/../services/CreditCardService.php';

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
            $details = CreditCardService::getCardDetails($orgId, (int) $id);
            if (!$details) {
                return $this->error("Cartão não encontrado.", 404);
            }
            return $this->json(['data' => $details]);
        }

        $stmt = Model::query("SELECT * FROM credit_cards WHERE organization_id = ? AND is_active = 1 ORDER BY name ASC", [$orgId]);
        $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Enriquece cada cartão com dados de faturas e limites
        $enriched = [];
        foreach ($cards as $c) {
            $details = CreditCardService::getCardDetails($orgId, (int) $c['id']);
            $enriched[] = $details ? $details : ['card' => $c];
        }

        return $this->json(['data' => $enriched]);
    }

    /**
     * GET /creditcards/{id}/invoices
     */
    public function get_invoices($id)
    {
        $orgId = $this->getActiveOrgId();
        $details = CreditCardService::getCardDetails($orgId, (int) $id);
        if (!$details) {
            return $this->error("Cartão não encontrado.", 404);
        }
        return $this->json(['data' => $details]);
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

    /**
     * POST /creditcards/{id}/pay
     * Liquidação de fatura do cartão com débito em conta.
     */
    public function post_pay($id)
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $accountId = (int) ($body['account_id'] ?? 0);
        $amount = (float) ($body['amount'] ?? 0.0);
        $date = $body['date'] ?? date('Y-m-d');
        $notes = trim($body['notes'] ?? '');

        if (!$accountId || $amount <= 0) {
            return $this->error("Informe a conta bancária pagadora e o valor do pagamento.", 422);
        }

        try {
            $result = CreditCardService::payInvoice($orgId, (int) $id, $accountId, $amount, $date, $notes);
            return $this->json([
                'message' => 'Fatura paga com sucesso!',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
