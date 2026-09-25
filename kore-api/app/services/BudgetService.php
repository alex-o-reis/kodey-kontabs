<?php

require_once __DIR__ . '/../../kore/Model.php';

/**
 * BudgetService — Sistema de Envelopes Orçamentários e Limites Mensais por Categoria
 * Powered by Kore Framework (KKF)
 * 
 * Princípio: Todo dinheiro deve ter um destino pré-definido.
 * Os envelopes garantem que cada categoria de despesa tenha um teto claro e acompanhamento em tempo real.
 */
class BudgetService
{
    /**
     * Retorna os envelopes de gastos do mês para a organização ativa
     * 
     * @param int $orgId
     * @param string|null $month 'YYYY-MM'
     * @return array
     */
    public function getEnvelopes(int $orgId, ?string $month = null): array
    {
        $currentYearMonth = date('Y-m');
        $month = $month ?: $currentYearMonth;

        $totalDaysInMonth = (int) date('t', strtotime("$month-01"));
        $isCurrentMonth = ($month === $currentYearMonth);
        $curDay = $isCurrentMonth ? (int) date('d') : $totalDaysInMonth;
        $daysRemaining = max(1, $totalDaysInMonth - $curDay + 1);

        // Buscar categorias de despesa da organização
        $stmtCats = Model::query(
            "SELECT id, name, monthly_budget, icon, color 
             FROM categories 
             WHERE organization_id = ? AND is_active = 1 AND type = 'expense'
             ORDER BY monthly_budget DESC, name ASC",
            [$orgId]
        );
        $categories = $stmtCats->fetchAll(PDO::FETCH_ASSOC);

        $envelopes = [];
        $totalBudgeted = 0.0;
        $totalSpent = 0.0;

        foreach ($categories as $cat) {
            $catId = (int) $cat['id'];
            $budget = (float) $cat['monthly_budget'];

            // Somar despesas efetivadas ou previstas do mês
            $stmtSpent = Model::query(
                "SELECT COALESCE(SUM(COALESCE(amount_effective, amount_expected)), 0) AS spent
                 FROM transactions 
                 WHERE organization_id = ? 
                   AND category_id = ? 
                   AND type = 'expense'
                   AND competence_date LIKE ?",
                [$orgId, $catId, "$month%"]
            );
            $spent = (float) $stmtSpent->fetch(PDO::FETCH_ASSOC)['spent'];

            $hasBudget = ($budget > 0);
            $percentage = $hasBudget ? round(($spent / $budget) * 100, 1) : 0.0;
            $remaining = $hasBudget ? max(0.0, $budget - $spent) : 0.0;
            $overspent = ($hasBudget && $spent > $budget) ? round($spent - $budget, 2) : 0.0;
            $safeDailySpend = ($hasBudget && $remaining > 0) ? round($remaining / $daysRemaining, 2) : 0.0;

            // Determinar status do envelope
            if (!$hasBudget) {
                $status = 'unbudgeted';
                $statusLabel = 'Sem Teto Definido';
                $statusColor = 'secondary';
            } elseif ($spent > $budget) {
                $status = 'exceeded';
                $statusLabel = 'Orçamento Estourado';
                $statusColor = 'danger';
            } elseif ($percentage >= 90.0) {
                $status = 'danger';
                $statusLabel = 'Atenção Máxima (>90%)';
                $statusColor = 'warning';
            } elseif ($percentage >= 75.0) {
                $status = 'warning';
                $statusLabel = 'Alerta de Consumo';
                $statusColor = 'info';
            } else {
                $status = 'healthy';
                $statusLabel = 'Dentro da Meta';
                $statusColor = 'success';
            }

            if ($hasBudget) {
                $totalBudgeted += $budget;
                $totalSpent += $spent;
            }

            $envelopes[] = [
                'category_id' => $catId,
                'name' => $cat['name'],
                'icon' => $cat['icon'] ?: 'bi-tag',
                'color' => $cat['color'] ?: '#0F7A4A',
                'monthly_budget' => $budget,
                'spent' => round($spent, 2),
                'remaining' => round($remaining, 2),
                'overspent' => $overspent,
                'percentage' => $percentage,
                'safe_daily_spend' => $safeDailySpend,
                'days_remaining' => $daysRemaining,
                'status' => $status,
                'status_label' => $statusLabel,
                'status_color' => $statusColor,
                'has_budget' => $hasBudget
            ];
        }

        $overallPct = ($totalBudgeted > 0) ? round(($totalSpent / $totalBudgeted) * 100, 1) : 0.0;
        $totalRemaining = max(0.0, $totalBudgeted - $totalSpent);

        return [
            'month' => $month,
            'days_total' => $totalDaysInMonth,
            'days_passed' => $curDay,
            'days_remaining' => $daysRemaining,
            'total_budgeted' => round($totalBudgeted, 2),
            'total_spent' => round($totalSpent, 2),
            'total_remaining' => round($totalRemaining, 2),
            'overall_percentage' => $overallPct,
            'envelopes' => $envelopes
        ];
    }

    /**
     * Atualiza o orçamento mensal de uma categoria
     */
    public function updateEnvelope(int $orgId, int $categoryId, float $monthlyBudget): bool
    {
        $stmt = Model::query(
            "UPDATE categories SET monthly_budget = ? WHERE id = ? AND organization_id = ?",
            [$monthlyBudget, $categoryId, $orgId]
        );
        return $stmt->rowCount() >= 0;
    }
}
