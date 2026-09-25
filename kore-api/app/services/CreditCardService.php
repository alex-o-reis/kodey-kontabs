<?php

require_once __DIR__ . '/../../kore/Model.php';

class CreditCardService
{
    /**
     * Retorna informações completas do cartão, cálculo de limite e faturas.
     */
    public static function getCardDetails(int $orgId, int $cardId): ?array
    {
        $stmt = Model::query(
            "SELECT c.*, a.name AS default_account_name 
             FROM credit_cards c
             LEFT JOIN accounts a ON c.account_id = a.id
             WHERE c.id = ? AND c.organization_id = ?",
            [$cardId, $orgId]
        );
        $card = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$card) {
            return null;
        }

        $limit = (float) $card['credit_limit'];
        $closingDay = (int) $card['closing_day'];
        $dueDay = (int) $card['due_day'];

        // Melhor dia para compras: dia seguinte ao fechamento
        $bestDayToBuy = $closingDay + 1;
        if ($bestDayToBuy > 30) {
            $bestDayToBuy = 1;
        }

        // Busca todas as transações feitas com o cartão
        $sql = "SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.organization_id = ? 
                  AND t.credit_card_id = ? 
                  AND t.type = 'expense'
                ORDER BY t.due_date DESC, t.id DESC";

        $stmt = Model::query($sql, [$orgId, $cardId]);
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Agrupamento por fatura (mês/ano de vencimento ou competência)
        $invoices = [];
        $totalUsedLimit = 0.0;
        $openInvoiceTotal = 0.0;

        foreach ($transactions as $tx) {
            $val = $tx['amount_effective'] !== null ? (float) $tx['amount_effective'] : (float) $tx['amount_expected'];
            
            // Fatura baseada no mês de competência ou vencimento
            $invoiceKey = substr($tx['due_date'], 0, 7); // YYYY-MM
            if (!isset($invoices[$invoiceKey])) {
                $invoices[$invoiceKey] = [
                    'competence' => $invoiceKey,
                    'due_date' => $invoiceKey . '-' . str_pad($dueDay, 2, '0', STR_PAD_LEFT),
                    'closing_date' => $invoiceKey . '-' . str_pad($closingDay, 2, '0', STR_PAD_LEFT),
                    'total' => 0.0,
                    'status' => 'open', // open, closed, paid
                    'transactions' => []
                ];
            }

            $invoices[$invoiceKey]['total'] += $val;
            $invoices[$invoiceKey]['transactions'][] = $tx;

            if ($tx['status'] !== 'effective') {
                $totalUsedLimit += $val;
            }
        }

        $currentMonthKey = date('Y-m');
        if (isset($invoices[$currentMonthKey])) {
            $openInvoiceTotal = $invoices[$currentMonthKey]['total'];
        } elseif (!empty($invoices)) {
            // Pega a fatura mais recente
            $firstKey = array_key_first($invoices);
            $openInvoiceTotal = $invoices[$firstKey]['total'];
        }

        $availableLimit = max(0.0, $limit - $totalUsedLimit);
        $usedPercentage = $limit > 0 ? round(($totalUsedLimit / $limit) * 100) : 0;

        return [
            'card' => $card,
            'credit_limit' => $limit,
            'used_limit' => $totalUsedLimit,
            'available_limit' => $availableLimit,
            'used_percentage' => $usedPercentage,
            'closing_day' => $closingDay,
            'due_day' => $dueDay,
            'best_day_to_buy' => $bestDayToBuy,
            'open_invoice_total' => $openInvoiceTotal,
            'invoices' => array_values($invoices)
        ];
    }

    /**
     * Realiza o pagamento/quitação da fatura do cartão com débito em conta bancária.
     */
    public static function payInvoice(int $orgId, int $cardId, int $accountId, float $amount, string $date, ?string $notes = null): array
    {
        if ($amount <= 0) {
            throw new InvalidArgumentException("O valor do pagamento da fatura deve ser maior que zero.");
        }

        $pdo = Model::getPdo();
        $pdo->beginTransaction();

        try {
            // Busca o cartão
            $stmt = Model::query("SELECT * FROM credit_cards WHERE id = ? AND organization_id = ?", [$cardId, $orgId]);
            $card = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$card) {
                throw new Exception("Cartão de crédito não encontrado.");
            }

            // Busca a conta de débito
            $stmt = Model::query("SELECT * FROM accounts WHERE id = ? AND organization_id = ? FOR UPDATE", [$accountId, $orgId]);
            $account = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$account) {
                throw new Exception("Conta bancária para pagamento não encontrada.");
            }

            // 1. Debita da conta bancária
            Model::query("UPDATE accounts SET current_balance = current_balance - ? WHERE id = ?", [$amount, $accountId]);

            // 2. Registra movimentação de liquidação de fatura
            $desc = "Pagamento de Fatura: " . $card['name'];
            Model::query(
                "INSERT INTO transactions (organization_id, user_id, account_id, credit_card_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination, notes)
                 VALUES (?, 1, ?, ?, 'expense', ?, ?, ?, ?, ?, ?, 'effective', 1, 1, ?)",
                [$orgId, $accountId, $cardId, $desc, $amount, $amount, $date, $date, $date, $notes]
            );
            $txId = (int) $pdo->lastInsertId();

            // 3. Atualiza as movimentações em aberto deste cartão até a data para 'effective'
            Model::query(
                "UPDATE transactions 
                 SET status = 'effective', payment_date = ?, amount_effective = amount_expected 
                 WHERE organization_id = ? AND credit_card_id = ? AND status = 'expected' AND due_date <= ?",
                [$date, $orgId, $cardId, $date]
            );

            $pdo->commit();

            return [
                'success' => true,
                'transaction_id' => $txId,
                'card_name' => $card['name'],
                'account_name' => $account['name'],
                'amount_paid' => $amount,
                'new_account_balance' => (float) $account['current_balance'] - $amount
            ];
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}
