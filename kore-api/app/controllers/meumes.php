<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../services/BalanceService.php';

class Meumes extends Controller
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

    public function get()
    {
        $orgId = $this->getActiveOrgId();
        $month = $_GET['month'] ?? date('Y-m');

        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));

        $summary = BalanceService::getMonthlySummary($orgId, $month);

        // Orçamento por Categoria (Previsto x Realizado)
        $stmt = Model::query(
            "SELECT c.id, c.name, c.monthly_budget, c.color,
                    COALESCE(SUM(CASE WHEN t.status = 'effective' THEN COALESCE(t.amount_effective, t.amount_expected) ELSE 0 END), 0) as realized,
                    COUNT(t.id) as tx_count
             FROM categories c
             LEFT JOIN transactions t ON t.category_id = c.id 
                AND t.type = 'expense' 
                AND t.competence_date BETWEEN ? AND ?
             WHERE c.organization_id = ? AND c.type = 'expense' AND c.is_active = 1
             GROUP BY c.id, c.name, c.monthly_budget, c.color
             ORDER BY c.monthly_budget DESC, realized DESC",
            [$startDate, $endDate, $orgId]
        );
        $categoriesBudget = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $chartLabels = [];
        $chartData = [];
        $totalSpentInCategories = 0.0;

        foreach ($categoriesBudget as &$cat) {
            $budget = (float) $cat['monthly_budget'];
            $realized = (float) $cat['realized'];
            $diff = $budget - $realized;
            $cat['budget'] = $budget;
            $cat['realized'] = $realized;
            $cat['difference'] = $diff;
            $cat['percentage'] = $budget > 0 ? round(($realized / $budget) * 100) : 0;
            $cat['status'] = $realized <= $budget ? 'normal' : 'warning';

            if ($realized > 0) {
                $chartLabels[] = $cat['name'];
                $chartData[] = $realized;
                $totalSpentInCategories += $realized;
            }
        }

        return $this->json([
            'data' => [
                'month' => $month,
                'summary' => $summary,
                'categories' => $categoriesBudget,
                'chart' => [
                    'labels' => $chartLabels,
                    'series' => $chartData,
                    'total' => $totalSpentInCategories
                ]
            ]
        ]);
    }
}
