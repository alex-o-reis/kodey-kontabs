<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../models/Transaction.php';
require_once __DIR__ . '/../services/ConciliationService.php';

class Transactions extends Controller
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
            $stmt = Model::query(
                "SELECT t.*, c.name as category_name, a.name as account_name, cc.name as credit_card_name, r.name as reserve_name
                 FROM transactions t
                 LEFT JOIN categories c ON c.id = t.category_id
                 LEFT JOIN accounts a ON a.id = t.account_id
                 LEFT JOIN credit_cards cc ON cc.id = t.credit_card_id
                 LEFT JOIN reserves r ON r.id = t.reserve_id
                 WHERE t.id = ? AND t.organization_id = ?",
                [$id, $orgId]
            );
            $tx = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$tx) {
                return $this->error("Movimentação não encontrada.", 404);
            }
            return $this->json(['data' => $tx]);
        }

        $sql = "SELECT t.*, c.name as category_name, c.color as category_color, a.name as account_name, cc.name as credit_card_name, r.name as reserve_name
                FROM transactions t
                LEFT JOIN categories c ON c.id = t.category_id
                LEFT JOIN accounts a ON a.id = t.account_id
                LEFT JOIN credit_cards cc ON cc.id = t.credit_card_id
                LEFT JOIN reserves r ON r.id = t.reserve_id
                WHERE t.organization_id = ?";
        $params = [$orgId];

        // Filtro por Mês (YYYY-MM)
        if (!empty($_GET['month'])) {
            $month = $_GET['month'];
            $startDate = $month . '-01';
            $endDate = date('Y-m-t', strtotime($startDate));
            $sql .= " AND t.competence_date BETWEEN ? AND ?";
            $params[] = $startDate;
            $params[] = $endDate;
        }

        // Filtro por Tipo
        if (!empty($_GET['type'])) {
            $sql .= " AND t.type = ?";
            $params[] = $_GET['type'];
        }

        // Filtro por Status
        if (!empty($_GET['status'])) {
            $sql .= " AND t.status = ?";
            $params[] = $_GET['status'];
        }

        // Filtro por Dinheiro Sem Origem
        if (isset($_GET['has_origin'])) {
            $sql .= " AND t.has_origin = ?";
            $params[] = (int) $_GET['has_origin'];
        }

        // Filtro por Dinheiro Sem Destino
        if (isset($_GET['has_destination'])) {
            $sql .= " AND t.has_destination = ?";
            $params[] = (int) $_GET['has_destination'];
        }

        $sql .= " ORDER BY t.due_date DESC, t.id DESC";
        $stmt = Model::query($sql, $params);
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $totalExpected = 0.0;
        $totalEffective = 0.0;
        foreach ($transactions as &$t) {
            $t['amount_expected'] = (float) $t['amount_expected'];
            $t['amount_effective'] = $t['amount_effective'] !== null ? (float) $t['amount_effective'] : null;
            $totalExpected += $t['amount_expected'];
            if ($t['status'] === 'effective') {
                $totalEffective += ($t['amount_effective'] ?? $t['amount_expected']);
            }
        }

        return $this->json([
            'data' => $transactions,
            'meta' => [
                'count' => count($transactions),
                'total_expected' => $totalExpected,
                'total_effective' => $totalEffective
            ]
        ]);
    }

    public function post()
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $description = trim($body['description'] ?? '');
        $type = $body['type'] ?? 'expense';
        $amountExpected = (float) ($body['amount_expected'] ?? 0.0);
        $amountEffective = isset($body['amount_effective']) && $body['amount_effective'] !== '' ? (float) $body['amount_effective'] : null;
        $competenceDate = $body['competence_date'] ?? date('Y-m-01');
        $dueDate = $body['due_date'] ?? date('Y-m-d');
        $paymentDate = $body['payment_date'] ?? null;
        $status = $body['status'] ?? 'expected';

        $accountId = !empty($body['account_id']) ? (int) $body['account_id'] : null;
        $creditCardId = !empty($body['credit_card_id']) ? (int) $body['credit_card_id'] : null;
        $categoryId = !empty($body['category_id']) ? (int) $body['category_id'] : null;
        $reserveId = !empty($body['reserve_id']) ? (int) $body['reserve_id'] : null;

        $hasOrigin = isset($body['has_origin']) ? (int) $body['has_origin'] : ($accountId || $creditCardId || $type === 'income' ? 1 : 0);
        $hasDestination = isset($body['has_destination']) ? (int) $body['has_destination'] : 1;
        $notes = $body['notes'] ?? null;

        $installmentsTotal = (int) ($body['installments_total'] ?? 1);

        if (empty($description)) {
            return $this->error("A descrição da movimentação é obrigatória.", 422);
        }
        if ($amountExpected <= 0) {
            return $this->error("O valor deve ser maior que zero.", 422);
        }

        // Caso Parcelado: gera N parcelas
        if ($installmentsTotal > 1) {
            $installmentAmount = round($amountExpected / $installmentsTotal, 2);
            $createdIds = [];

            for ($i = 1; $i <= $installmentsTotal; $i++) {
                $monthOffset = $i - 1;
                $instDueDate = date('Y-m-d', strtotime("+$monthOffset month", strtotime($dueDate)));
                $instCompDate = date('Y-m-01', strtotime("+$monthOffset month", strtotime($competenceDate)));
                $instDesc = "$description ($i/$installmentsTotal)";

                $instStatus = ($i === 1 && $status === 'effective') ? 'effective' : 'expected';
                $instPaymentDate = ($instStatus === 'effective') ? ($paymentDate ?? date('Y-m-d')) : null;
                $instAmountEff = ($instStatus === 'effective') ? $installmentAmount : null;

                Model::query(
                    "INSERT INTO transactions (organization_id, user_id, account_id, credit_card_id, category_id, reserve_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination, installment_current, installment_total, notes)
                     VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [$orgId, $accountId, $creditCardId, $categoryId, $reserveId, $type, $instDesc, $installmentAmount, $instAmountEff, $instCompDate, $instDueDate, $instPaymentDate, $instStatus, $hasOrigin, $hasDestination, $i, $installmentsTotal, $notes]
                );
                $createdIds[] = (int) Model::getPdo()->lastInsertId();
            }

            return $this->json([
                'message' => "Compra parcelada em {$installmentsTotal}x registrada com sucesso!",
                'ids' => $createdIds,
                'installment_amount' => $installmentAmount
            ], 201);
        }

        // Lançamento normal à vista
        if ($status === 'effective' && empty($paymentDate)) {
            $paymentDate = date('Y-m-d');
        }
        if ($status === 'effective' && $amountEffective === null) {
            $amountEffective = $amountExpected;
        }

        Model::query(
            "INSERT INTO transactions (organization_id, user_id, account_id, credit_card_id, category_id, reserve_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination, notes)
             VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [$orgId, $accountId, $creditCardId, $categoryId, $reserveId, $type, $description, $amountExpected, $amountEffective, $competenceDate, $dueDate, $paymentDate, $status, $hasOrigin, $hasDestination, $notes]
        );
        $id = (int) Model::getPdo()->lastInsertId();

        // Se for efetivado e vinculado a uma conta, atualiza o saldo
        if ($status === 'effective' && $accountId) {
            $delta = $type === 'income' ? $amountEffective : -$amountEffective;
            Model::query("UPDATE accounts SET current_balance = current_balance + ? WHERE id = ? AND organization_id = ?", [$delta, $accountId, $orgId]);
        }

        return $this->json(['message' => 'Movimentação registrada com sucesso.', 'id' => $id], 201);
    }

    /**
     * POST /transactions/{id}/settle
     * Efetiva a movimentação definindo o valor real pago/recebido SEM apagar o valor previsto original!
     */
    public function post_settle($id)
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $stmt = Model::query("SELECT * FROM transactions WHERE id = ? AND organization_id = ?", [$id, $orgId]);
        $tx = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$tx) {
            return $this->error("Movimentação não encontrada.", 404);
        }

        $amountEffective = isset($body['amount_effective']) ? (float) $body['amount_effective'] : (float) $tx['amount_expected'];
        $paymentDate = $body['payment_date'] ?? date('Y-m-d');
        $accountId = !empty($body['account_id']) ? (int) $body['account_id'] : $tx['account_id'];

        Model::query(
            "UPDATE transactions 
             SET amount_effective = ?, payment_date = ?, status = 'effective', account_id = ?, has_origin = 1
             WHERE id = ? AND organization_id = ?",
            [$amountEffective, $paymentDate, $accountId, $id, $orgId]
        );

        // Atualiza saldo da conta se informada
        if ($accountId) {
            $delta = $tx['type'] === 'income' ? $amountEffective : -$amountEffective;
            Model::query("UPDATE accounts SET current_balance = current_balance + ? WHERE id = ? AND organization_id = ?", [$delta, $accountId, $orgId]);
        }

        return $this->json([
            'message' => 'Movimentação efetivada com sucesso.',
            'amount_expected' => (float) $tx['amount_expected'],
            'amount_effective' => $amountEffective,
            'payment_date' => $paymentDate
        ]);
    }

    /**
     * POST /transactions/import
     * Processa extrato bancário (OFX ou CSV) e retorna correspondências (matching).
     */
    public function post_import()
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $accountId = (int) ($body['account_id'] ?? 0);
        $format = strtolower($body['format'] ?? 'ofx');
        $rawContent = $body['content'] ?? '';

        if (!$accountId) {
            return $this->error("Selecione a conta bancária para conciliação.", 422);
        }
        if (empty($rawContent)) {
            return $this->error("Conteúdo do arquivo de extrato não enviado.", 422);
        }

        if ($format === 'ofx') {
            $parsed = ConciliationService::parseOfx($rawContent);
        } else {
            $parsed = ConciliationService::parseCsv($rawContent);
        }

        if (empty($parsed)) {
            return $this->error("Nenhuma transação válida identificada no extrato fornecido.", 422);
        }

        $matched = ConciliationService::matchTransactions($orgId, $accountId, $parsed);

        return $this->json([
            'message' => 'Extrato processado com sucesso!',
            'data' => [
                'account_id' => $accountId,
                'total_items' => count($matched),
                'items' => $matched
            ]
        ]);
    }

    /**
     * POST /transactions/reconcile
     * Aplica em lote as ações aprovadas de conciliação.
     */
    public function post_reconcile()
    {
        $orgId = $this->getActiveOrgId();
        $body = $this->request->getJson();

        $accountId = (int) ($body['account_id'] ?? 0);
        $items = $body['items'] ?? [];

        if (!$accountId || empty($items)) {
            return $this->error("Informe a conta e a lista de itens para conciliação.", 422);
        }

        try {
            $result = ConciliationService::processReconciliation($orgId, $accountId, $items);
            return $this->json([
                'message' => 'Conciliação bancária concluída com sucesso!',
                'data' => $result
            ]);
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
