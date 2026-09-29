<?php

require_once __DIR__ . '/../../kore/Model.php';

class BalanceService
{
    /**
     * Retorna o saldo disponível consolidado das contas da organização.
     */
    public static function getAvailableBalance(int $organizationId): float
    {
        $stmt = Model::query(
            "SELECT COALESCE(SUM(current_balance), 0) as total FROM accounts WHERE organization_id = ? AND is_active = 1",
            [$organizationId]
        );
        return (float) ($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
    }

    /**
     * Retorna o resumo financeiro do mês (Receitas, Despesas, Aportes e Previsão).
     */
    public static function getMonthlySummary(int $organizationId, string $month): array
    {
        // Mês no formato YYYY-MM
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));

        // 1. Receitas Efetivadas (Recebi até agora)
        $stmt = Model::query(
            "SELECT COALESCE(SUM(COALESCE(amount_effective, amount_expected)), 0) as total 
             FROM transactions 
             WHERE organization_id = ? AND type = 'income' AND status = 'effective' 
             AND competence_date BETWEEN ? AND ?",
            [$organizationId, $startDate, $endDate]
        );
        $receivedSoFar = (float) $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 2. Receitas Previstas ainda não efetivadas
        $stmt = Model::query(
            "SELECT COALESCE(SUM(amount_expected), 0) as total 
             FROM transactions 
             WHERE organization_id = ? AND type = 'income' AND status = 'expected' 
             AND competence_date BETWEEN ? AND ?",
            [$organizationId, $startDate, $endDate]
        );
        $toReceive = (float) $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 3. Despesas Efetivadas (Gastei até agora)
        $stmt = Model::query(
            "SELECT COALESCE(SUM(COALESCE(amount_effective, amount_expected)), 0) as total 
             FROM transactions 
             WHERE organization_id = ? AND type = 'expense' AND status = 'effective' 
             AND competence_date BETWEEN ? AND ?",
            [$organizationId, $startDate, $endDate]
        );
        $spentSoFar = (float) $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 4. Despesas Previstas a pagar
        $stmt = Model::query(
            "SELECT COALESCE(SUM(amount_expected), 0) as total 
             FROM transactions 
             WHERE organization_id = ? AND type = 'expense' AND status = 'expected' 
             AND competence_date BETWEEN ? AND ?",
            [$organizationId, $startDate, $endDate]
        );
        $toPay = (float) $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 5. Reservas e Investimentos (Aportes no mês)
        $stmt = Model::query(
            "SELECT COALESCE(SUM(COALESCE(amount_effective, amount_expected)), 0) as total 
             FROM transactions 
             WHERE organization_id = ? AND type = 'reserve_deposit' 
             AND competence_date BETWEEN ? AND ?",
            [$organizationId, $startDate, $endDate]
        );
        $reservedSoFar = (float) $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 6. Projeção de Fechamento do Mês: Saldo Líquido Projetado
        $totalProjectedIncome = $receivedSoFar + $toReceive;
        $totalProjectedExpense = $spentSoFar + $toPay;
        $projectedClosing = $totalProjectedIncome - $totalProjectedExpense - $reservedSoFar;

        return [
            'month' => $month,
            'received_so_far' => $receivedSoFar,
            'to_receive' => $toReceive,
            'total_income_expected' => $totalProjectedIncome,
            'spent_so_far' => $spentSoFar,
            'to_pay' => $toPay,
            'total_expense_expected' => $totalProjectedExpense,
            'reserved_so_far' => $reservedSoFar,
            'projected_closing' => $projectedClosing,
            'status' => $projectedClosing >= 0 ? 'positive' : 'negative'
        ];
    }

    /**
     * Retorna o fluxo financeiro semanal (Previsto x Realizado) para o mês da organização ativa.
     */
    public static function getWeeklyFlow(int $organizationId, string $month): array
    {
        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));

        $expected = [0.0, 0.0, 0.0, 0.0, 0.0];
        $effective = [0.0, 0.0, 0.0, 0.0, 0.0];

        $stmt = Model::query(
            "SELECT DAY(due_date) as d, type, status, amount_expected, COALESCE(amount_effective, amount_expected) as amount_actual
             FROM transactions 
             WHERE organization_id = ? AND competence_date BETWEEN ? AND ?",
            [$organizationId, $startDate, $endDate]
        );
        $txs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($txs as $tx) {
            $day = (int) ($tx['d'] ?: 1);
            $weekIdx = min(4, intdiv(max(1, $day) - 1, 7));
            $amtExp = (float) $tx['amount_expected'];
            $amtAct = (float) $tx['amount_actual'];

            $expected[$weekIdx] += $amtExp;
            if ($tx['status'] === 'effective') {
                $effective[$weekIdx] += $amtAct;
            }
        }

        return [
            'labels' => ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5'],
            'expected' => $expected,
            'effective' => $effective
        ];
    }
}
