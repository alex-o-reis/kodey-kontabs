<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../services/BudgetService.php';

/**
 * Budgets Controller — Envelopes Orçamentários e Tetos Mensais por Categoria
 * Powered by Kore Framework (KKF)
 */
class Budgets extends Controller
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

    /**
     * GET /budgets
     * GET /budgets/envelopes
     * Parâmetros: ?month=YYYY-MM
     */
    public function get()
    {
        $orgId = $this->getActiveOrgId();
        $month = $_GET['month'] ?? date('Y-m');

        $service = new BudgetService();
        $data = $service->getEnvelopes($orgId, $month);

        return $this->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * POST /budgets
     * Atualiza o orçamento mensal de uma categoria
     */
    public function post()
    {
        $orgId = $this->getActiveOrgId();
        $input = method_exists($this->request, 'getJson') ? $this->request->getJson() : $_POST;

        $categoryId = (int) ($input['category_id'] ?? 0);
        $monthlyBudget = (float) ($input['monthly_budget'] ?? 0.0);

        if (!$categoryId) {
            return $this->error("Categoria não informada.", 400);
        }

        $service = new BudgetService();
        $success = $service->updateEnvelope($orgId, $categoryId, $monthlyBudget);

        if (!$success) {
            return $this->error("Falha ao atualizar orçamento da categoria.", 500);
        }

        return $this->json([
            'status' => 'success',
            'message' => 'Teto da categoria atualizado com sucesso!',
            'data' => [
                'category_id' => $categoryId,
                'monthly_budget' => $monthlyBudget
            ]
        ]);
    }
}
