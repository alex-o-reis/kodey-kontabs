<?php

require_once __DIR__ . '/../../kore/Model.php';

class ReportService
{
    /**
     * DRE Simplificado e Gerencial (Demonstrativo de Resultado do Período).
     */
    public static function getDre(int $orgId, ?string $month = null): array
    {
        $month = $month ?? date('Y-m');
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));

        // Busca todas as transações efetivadas do período
        $sql = "SELECT t.*, c.name AS category_name, c.type AS category_type
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.organization_id = ? 
                  AND t.competence_date BETWEEN ? AND ?
                  AND t.status = 'effective'
                ORDER BY t.competence_date ASC";

        $stmt = Model::query($sql, [$orgId, $startDate, $endDate]);
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $grossRevenue = 0.0;
        $operatingExpenses = 0.0;
        $variableExpenses = 0.0;
        $financialExpenses = 0.0;
        $reserveDeposits = 0.0;

        $revenueItems = [];
        $operatingItems = [];
        $variableItems = [];
        $financialItems = [];
        $reserveItems = [];

        foreach ($transactions as $tx) {
            $amount = (float) ($tx['amount_effective'] ?? $tx['amount_expected']);
            $catName = $tx['category_name'] ?? 'Outros / Sem Categoria';

            if ($tx['type'] === 'income') {
                $grossRevenue += $amount;
                $revenueItems[$catName] = ($revenueItems[$catName] ?? 0.0) + $amount;
            } elseif ($tx['type'] === 'expense') {
                // Classificação gerencial de despesas
                $lowerCat = mb_strtolower($catName);
                if (str_contains($lowerCat, 'tarifa') || str_contains($lowerCat, 'juros') || str_contains($lowerCat, 'banco') || str_contains($lowerCat, 'anuidade')) {
                    $financialExpenses += $amount;
                    $financialItems[$catName] = ($financialItems[$catName] ?? 0.0) + $amount;
                } elseif (str_contains($lowerCat, 'moradia') || str_contains($lowerCat, 'servidor') || str_contains($lowerCat, 'salário') || str_contains($lowerCat, 'aluguel') || str_contains($lowerCat, 'luz') || str_contains($lowerCat, 'internet') || str_contains($lowerCat, 'pró-labore')) {
                    $operatingExpenses += $amount;
                    $operatingItems[$catName] = ($operatingItems[$catName] ?? 0.0) + $amount;
                } else {
                    $variableExpenses += $amount;
                    $variableItems[$catName] = ($variableItems[$catName] ?? 0.0) + $amount;
                }
            } elseif ($tx['type'] === 'reserve_deposit') {
                $reserveDeposits += $amount;
                $reserveItems[$tx['description']] = ($reserveItems[$tx['description']] ?? 0.0) + $amount;
            }
        }

        $operatingResult = $grossRevenue - $operatingExpenses;
        $netResult = $operatingResult - $variableExpenses - $financialExpenses;
        $effectiveFreeBalance = $netResult - $reserveDeposits;

        return [
            'period' => $month,
            'summary' => [
                'gross_revenue' => $grossRevenue,
                'operating_expenses' => $operatingExpenses,
                'operating_result' => $operatingResult,
                'variable_expenses' => $variableExpenses,
                'financial_expenses' => $financialExpenses,
                'net_result' => $netResult,
                'reserve_deposits' => $reserveDeposits,
                'effective_free_balance' => $effectiveFreeBalance,
                'net_margin_percentage' => $grossRevenue > 0 ? round(($netResult / $grossRevenue) * 100, 1) : 0
            ],
            'details' => [
                'revenues' => $revenueItems,
                'operating' => $operatingItems,
                'variable' => $variableItems,
                'financial' => $financialItems,
                'reserves' => $reserveItems
            ]
        ];
    }

    /**
     * Fluxo de Caixa Mensal por Dia (entradas vs saídas) para gráficos.
     */
    public static function getCashFlow(int $orgId, ?string $month = null): array
    {
        $month = $month ?? date('Y-m');
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));
        $daysInMonth = (int) date('t', strtotime($startDate));

        $stmt = Model::query(
            "SELECT competence_date, type, SUM(COALESCE(amount_effective, amount_expected)) AS total
             FROM transactions
             WHERE organization_id = ? 
               AND competence_date BETWEEN ? AND ?
               AND status = 'effective'
             GROUP BY competence_date, type",
            [$orgId, $startDate, $endDate]
        );
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $dailyIncomes = array_fill(1, $daysInMonth, 0.0);
        $dailyExpenses = array_fill(1, $daysInMonth, 0.0);

        foreach ($rows as $r) {
            $day = (int) date('j', strtotime($r['competence_date']));
            $total = (float) $r['total'];
            if ($r['type'] === 'income') {
                $dailyIncomes[$day] += $total;
            } elseif ($r['type'] === 'expense' || $r['type'] === 'reserve_deposit') {
                $dailyExpenses[$day] += $total;
            }
        }

        $labels = [];
        $dataIncome = [];
        $dataExpense = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $labels[] = 'Dia ' . $d;
            $dataIncome[] = $dailyIncomes[$d];
            $dataExpense[] = $dailyExpenses[$d];
        }

        return [
            'month' => $month,
            'labels' => $labels,
            'incomes' => $dataIncome,
            'expenses' => $dataExpense
        ];
    }
}
