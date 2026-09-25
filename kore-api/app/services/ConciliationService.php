<?php

require_once __DIR__ . '/../../kore/Model.php';

class ConciliationService
{
    /**
     * Interpreta conteúdo OFX (Open Financial Exchange).
     */
    public static function parseOfx(string $content): array
    {
        $transactions = [];

        // Extrai blocos <STMTTRN> ... </STMTTRN>
        if (preg_match_all('/<STMTTRN>([\s\S]*?)<\/STMTTRN>/i', $content, $matches)) {
            $blocks = $matches[1];
        } else {
            // Alguns OFX não fecham tags (SGML style)
            $blocks = preg_split('/<STMTTRN>/i', $content);
            array_shift($blocks); // remove cabeçalho anterior ao primeiro STMTTRN
        }

        foreach ($blocks as $block) {
            $type = self::extractTagValue($block, 'TRNTYPE');
            $dtPosted = self::extractTagValue($block, 'DTPOSTED');
            $trnAmt = (float) str_replace(',', '.', self::extractTagValue($block, 'TRNAMT'));
            $fitId = self::extractTagValue($block, 'FITID');
            $memo = self::extractTagValue($block, 'MEMO');
            if (empty($memo)) {
                $memo = self::extractTagValue($block, 'NAME');
            }

            // Formata data YYYYMMDD... -> YYYY-MM-DD
            $formattedDate = date('Y-m-d');
            if (!empty($dtPosted) && strlen($dtPosted) >= 8) {
                $y = substr($dtPosted, 0, 4);
                $m = substr($dtPosted, 4, 2);
                $d = substr($dtPosted, 6, 2);
                $formattedDate = "$y-$m-$d";
            }

            $cleanMemo = trim(strip_tags($memo));
            if (empty($cleanMemo)) {
                $cleanMemo = $trnAmt > 0 ? 'Crédito via Transferência / PIX' : 'Débito Bancário';
            }

            $transactions[] = [
                'fit_id' => trim($fitId),
                'date' => $formattedDate,
                'amount' => $trnAmt,
                'is_income' => $trnAmt > 0,
                'abs_amount' => abs($trnAmt),
                'description' => $cleanMemo,
                'raw_type' => $type
            ];
        }

        return $transactions;
    }

    /**
     * Interpreta conteúdo CSV bancário brasileiro.
     */
    public static function parseCsv(string $content): array
    {
        $lines = preg_split('/\r\n|\r|\n/', trim($content));
        if (empty($lines)) return [];

        // Detecta separador (, ou ;)
        $firstLine = $lines[0];
        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

        $header = str_getcsv(array_shift($lines), $delimiter);
        $headerLower = array_map(function($h) {
            return mb_strtolower(trim(str_replace(['"', "'"], '', $h)));
        }, $header);

        // Identifica índices
        $dateIdx = -1;
        $descIdx = -1;
        $valIdx = -1;

        foreach ($headerLower as $idx => $col) {
            if ($dateIdx === -1 && (str_contains($col, 'data') || str_contains($col, 'date'))) {
                $dateIdx = $idx;
            } elseif ($descIdx === -1 && (str_contains($col, 'descri') || str_contains($col, 'hist') || str_contains($col, 'memo') || str_contains($col, 'titulo'))) {
                $descIdx = $idx;
            } elseif ($valIdx === -1 && (str_contains($col, 'valor') || str_contains($col, 'amount') || str_contains($col, 'val'))) {
                $valIdx = $idx;
            }
        }

        if ($dateIdx === -1) $dateIdx = 0;
        if ($descIdx === -1) $descIdx = 1;
        if ($valIdx === -1) $valIdx = 2;

        $transactions = [];
        foreach ($lines as $line) {
            if (empty(trim($line))) continue;
            $cols = str_getcsv($line, $delimiter);
            if (count($cols) <= max($dateIdx, $descIdx, $valIdx)) continue;

            $rawDate = trim($cols[$dateIdx]);
            $rawDesc = trim($cols[$descIdx]);
            $rawVal = trim($cols[$valIdx]);

            // Normaliza data (DD/MM/YYYY ou YYYY-MM-DD)
            $date = date('Y-m-d');
            if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $rawDate, $m)) {
                $date = sprintf('%04d-%02d-%02d', $m[3], $m[2], $m[1]);
            } elseif (preg_match('/^\d{4}-\d{2}-\d{2}$/', $rawDate)) {
                $date = $rawDate;
            }

            // Normaliza valor: remove R$, espaços, converte '1.234,56' ou '-1234.56'
            $valClean = preg_replace('/[^\d,.-]/', '', $rawVal);
            if (str_contains($valClean, ',') && str_contains($valClean, '.')) {
                $valClean = str_replace('.', '', $valClean);
                $valClean = str_replace(',', '.', $valClean);
            } elseif (str_contains($valClean, ',')) {
                $valClean = str_replace(',', '.', $valClean);
            }
            $amount = (float) $valClean;

            $transactions[] = [
                'fit_id' => md5($date . $rawDesc . $amount),
                'date' => $date,
                'amount' => $amount,
                'is_income' => $amount > 0,
                'abs_amount' => abs($amount),
                'description' => !empty($rawDesc) ? $rawDesc : ($amount > 0 ? 'Crédito Recebido' : 'Débito Bancário'),
                'raw_type' => $amount > 0 ? 'CREDIT' : 'DEBIT'
            ];
        }

        return $transactions;
    }

    /**
     * Cruza transações do arquivo com contas previstas no sistema.
     */
    public static function matchTransactions(int $orgId, int $accountId, array $statementItems): array
    {
        // Busca movimentações previstas em aberto para este mês e próximos
        $sql = "SELECT t.*, c.name AS category_name, c.color AS category_color
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.organization_id = ? 
                  AND t.status = 'expected'
                ORDER BY t.due_date ASC";

        $stmt = Model::query($sql, [$orgId]);
        $expectedBills = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Busca transações já efetivadas nos últimos 60 dias para evitar duplicação
        $stmtEffective = Model::query(
            "SELECT id, description, amount_effective, payment_date, competence_date 
             FROM transactions 
             WHERE organization_id = ? AND status = 'effective'
             ORDER BY payment_date DESC LIMIT 200",
            [$orgId]
        );
        $effectiveBills = $stmtEffective->fetchAll(PDO::FETCH_ASSOC);

        // Categorias para sugestão automática
        $stmtCats = Model::query("SELECT id, name, type FROM categories WHERE organization_id = ? AND is_active = 1", [$orgId]);
        $categories = $stmtCats->fetchAll(PDO::FETCH_ASSOC);

        $matchedResults = [];

        foreach ($statementItems as $item) {
            $absAmt = $item['abs_amount'];
            $isIncome = $item['is_income'];
            $date = $item['date'];
            $desc = $item['description'];

            // 1. Verifica duplicidade (já importado / liquidado)
            $isDuplicate = false;
            foreach ($effectiveBills as $eff) {
                if (abs((float)$eff['amount_effective'] - $absAmt) < 0.01 && ($eff['payment_date'] === $date || $eff['competence_date'] === $date)) {
                    $isDuplicate = true;
                    break;
                }
            }

            if ($isDuplicate) {
                $item['match_status'] = 'already_reconciled';
                $item['status_badge'] = 'pill-efetivado';
                $item['status_label'] = 'Já Conciliado';
                $item['action_suggested'] = 'ignore';
                $item['matched_transaction'] = null;
                $matchedResults[] = $item;
                continue;
            }

            // 2. Busca Match com movimentação prevista
            $matchCandidate = null;
            $matchIndex = -1;

            foreach ($expectedBills as $idx => $exp) {
                $expType = $exp['type'];
                if (($isIncome && $expType !== 'income') || (!$isIncome && $expType !== 'expense')) {
                    continue;
                }

                $expAmt = (float) $exp['amount_expected'];
                if (abs($expAmt - $absAmt) < 0.05) {
                    // Valor bateu! Verifica proximidade de data (+- 5 dias)
                    $diffDays = abs((strtotime($date) - strtotime($exp['due_date'])) / 86400);
                    if ($diffDays <= 7) {
                        $matchCandidate = $exp;
                        $matchIndex = $idx;
                        break;
                    }
                }
            }

            if ($matchCandidate) {
                // Remove dos previstos para não dar match duplo
                unset($expectedBills[$matchIndex]);

                $item['match_status'] = 'match';
                $item['status_badge'] = 'pill-previsto';
                $item['status_label'] = 'Match Encontrado!';
                $item['action_suggested'] = 'settle';
                $item['matched_transaction'] = $matchCandidate;
            } else {
                // Novo lançamento
                $suggestedCat = self::suggestCategory($desc, $categories, $isIncome ? 'income' : 'expense');

                $item['match_status'] = 'new';
                $item['status_badge'] = 'badge-soft-warning';
                $item['status_label'] = 'Novo Lançamento';
                $item['action_suggested'] = 'create';
                $item['matched_transaction'] = null;
                $item['suggested_category_id'] = $suggestedCat['id'] ?? null;
                $item['suggested_category_name'] = $suggestedCat['name'] ?? 'Sem Categoria';
            }

            $matchedResults[] = $item;
        }

        return $matchedResults;
    }

    /**
     * Executa a conciliação em lote confirmada pelo usuário.
     */
    public static function processReconciliation(int $orgId, int $accountId, array $items): array
    {
        $pdo = Model::getPdo();
        $pdo->beginTransaction();

        $settledCount = 0;
        $createdCount = 0;
        $totalBalanceDiff = 0.0;

        try {
            foreach ($items as $item) {
                $action = $item['action'] ?? 'ignore';
                if ($action === 'ignore') continue;

                $amount = (float) ($item['abs_amount'] ?? $item['amount'] ?? 0);
                $isIncome = !empty($item['is_income']);
                $date = $item['date'] ?? date('Y-m-d');
                $desc = trim($item['description'] ?? '');

                if ($action === 'settle' && !empty($item['matched_id'])) {
                    // Liquida transação prevista existente
                    $matchedId = (int) $item['matched_id'];
                    Model::query(
                        "UPDATE transactions 
                         SET amount_effective = ?, payment_date = ?, account_id = ?, status = 'effective', has_origin = 1, has_destination = 1
                         WHERE id = ? AND organization_id = ?",
                        [$amount, $date, $accountId, $matchedId, $orgId]
                    );
                    $settledCount++;
                    $totalBalanceDiff += ($isIncome ? $amount : -$amount);
                } elseif ($action === 'create') {
                    // Cria nova movimentação
                    $catId = !empty($item['category_id']) ? (int) $item['category_id'] : null;
                    $type = $isIncome ? 'income' : 'expense';

                    Model::query(
                        "INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination, notes)
                         VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'effective', 1, 1, 'Importado via Extrato Bancário')",
                        [$orgId, $accountId, $catId, $type, $desc, $amount, $amount, $date, $date, $date]
                    );
                    $createdCount++;
                    $totalBalanceDiff += ($isIncome ? $amount : -$amount);
                }
            }

            // Atualiza saldo da conta bancária
            if ($totalBalanceDiff != 0.0) {
                Model::query(
                    "UPDATE accounts SET current_balance = current_balance + ? WHERE id = ? AND organization_id = ?",
                    [$totalBalanceDiff, $accountId, $orgId]
                );
            }

            $pdo->commit();

            return [
                'success' => true,
                'settled_count' => $settledCount,
                'created_count' => $createdCount,
                'total_reconciled' => $settledCount + $createdCount,
                'balance_adjustment' => $totalBalanceDiff
            ];
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    private static function extractTagValue(string $block, string $tag): string
    {
        if (preg_match('/<' . $tag . '>([^<\r\n]+)/i', $block, $m)) {
            return trim($m[1]);
        }
        return '';
    }

    private static function suggestCategory(string $desc, array $categories, string $type): ?array
    {
        $descLower = mb_strtolower($desc);
        foreach ($categories as $cat) {
            if ($cat['type'] !== $type) continue;
            $catLower = mb_strtolower($cat['name']);
            if (str_contains($descLower, $catLower) || str_contains($catLower, $descLower)) {
                return $cat;
            }
        }
        return null;
    }
}
