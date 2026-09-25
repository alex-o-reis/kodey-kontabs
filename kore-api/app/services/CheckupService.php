<?php

require_once __DIR__ . '/../../kore/Model.php';
require_once __DIR__ . '/DestinyService.php';

class CheckupService
{
    /**
     * Retorna os 4 pontos prioritários para o Check-up Semanal de 3 minutos.
     */
    public static function getCheckupData(int $organizationId): array
    {
        $currentMonth = date('Y-m');
        $today = date('Y-m-d');
        $sevenDaysAhead = date('Y-m-d', strtotime('+7 days'));

        // 1. Dinheiro Sem Destino
        $destinyInfo = DestinyService::getUnallocatedBalance($organizationId, $currentMonth);

        // 2. Contas Vencendo nos Próximos 7 Dias
        $stmt = Model::query(
            "SELECT id, description, amount_expected, due_date 
             FROM transactions 
             WHERE organization_id = ? AND type = 'expense' AND status = 'expected' 
             AND due_date BETWEEN ? AND ? 
             ORDER BY due_date ASC LIMIT 5",
            [$organizationId, $today, $sevenDaysAhead]
        );
        $upcomingBills = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Categorias com Alerta de Teto (Gastos > Orçamento previsto)
        $monthStart = $currentMonth . '-01';
        $monthEnd = date('Y-m-t', strtotime($monthStart));

        $stmt = Model::query(
            "SELECT c.id, c.name, c.monthly_budget,
                    COALESCE(SUM(COALESCE(t.amount_effective, t.amount_expected)), 0) as total_spent
             FROM categories c
             LEFT JOIN transactions t ON t.category_id = c.id 
                AND t.type = 'expense' 
                AND t.competence_date BETWEEN ? AND ?
             WHERE c.organization_id = ? AND c.monthly_budget > 0
             GROUP BY c.id, c.name, c.monthly_budget
             HAVING total_spent > c.monthly_budget",
            [$monthStart, $monthEnd, $organizationId]
        );
        $overBudgetCategories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Progresso da Reserva de Emergência
        $stmt = Model::query(
            "SELECT id, name, target_amount, current_amount 
             FROM reserves 
             WHERE organization_id = ? AND type = 'emergency' 
             LIMIT 1",
            [$organizationId]
        );
        $emergencyReserve = $stmt->fetch(PDO::FETCH_ASSOC);
        $reserveData = null;
        if ($emergencyReserve) {
            $target = (float) $emergencyReserve['target_amount'];
            $current = (float) $emergencyReserve['current_amount'];
            $pct = $target > 0 ? round(($current / $target) * 100) : 0;
            $reserveData = [
                'id' => (int) $emergencyReserve['id'],
                'name' => $emergencyReserve['name'],
                'target_amount' => $target,
                'current_amount' => $current,
                'percentage' => $pct,
                'formatted_current' => 'R$ ' . number_format($current, 2, ',', '.'),
                'formatted_target' => 'R$ ' . number_format($target, 2, ',', '.')
            ];
        }

        return [
            'organization_id' => $organizationId,
            'date' => $today,
            'items' => [
                'unallocated' => [
                    'active' => $destinyInfo['has_unallocated'],
                    'amount' => $destinyInfo['unallocated_amount'],
                    'formatted' => $destinyInfo['formatted_amount'],
                    'message' => $destinyInfo['message']
                ],
                'upcoming_bills' => [
                    'count' => count($upcomingBills),
                    'bills' => $upcomingBills
                ],
                'over_budget' => [
                    'count' => count($overBudgetCategories),
                    'categories' => $overBudgetCategories
                ],
                'reserve' => $reserveData
            ]
        ];
    }
}
