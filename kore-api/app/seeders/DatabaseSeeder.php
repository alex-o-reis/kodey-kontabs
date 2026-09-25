<?php

require_once __DIR__ . '/../../kore/Seeder.php';
require_once __DIR__ . '/../../kore/Model.php';

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        try {
            echo "Iniciando Seeding do Kodey Kontabs...\n";

            // 1. Usuário Padrão
            $email = 'alex@kodey.com.br';
            $username = 'alex';
            $password = password_hash('kontabs123', PASSWORD_DEFAULT);
            $token = bin2hex(random_bytes(32));

            $stmt = Model::query("SELECT id FROM users WHERE email = ? LIMIT 1", [$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Model::query(
                    "INSERT INTO users (name, username, email, password, role, avatar, token) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    ['Alex Reis', $username, $email, $password, 'admin', 'AR', $token]
                );
                $userId = (int) Model::getPdo()->lastInsertId();
                echo "  -> Usuario Alex Reis criado [alex@kodey.com.br / kontabs123]\n";
            } else {
                $userId = (int) $user['id'];
                echo "  -> Usuario Alex Reis ja existente (ID: $userId)\n";
            }

            // 2. Organizações (PJ e PF)
            $stmt = Model::query("SELECT id FROM organizations WHERE name = ? LIMIT 1", ['Kodey Sistemas']);
            $orgPj = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$orgPj) {
                Model::query(
                    "INSERT INTO organizations (name, type, document, color, icon) VALUES (?, ?, ?, ?, ?)",
                    ['Kodey Sistemas', 'PJ', '42.123.456/0001-89', '#0F7A4A', 'bi-buildings']
                );
                $orgPjId = (int) Model::getPdo()->lastInsertId();
                echo "  -> Organizacao PJ 'Kodey Sistemas' criada (ID: $orgPjId)\n";
            } else {
                $orgPjId = (int) $orgPj['id'];
            }

            $stmt = Model::query("SELECT id FROM organizations WHERE name = ? LIMIT 1", ['Minhas Finanças']);
            $orgPf = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$orgPf) {
                Model::query(
                    "INSERT INTO organizations (name, type, document, color, icon) VALUES (?, ?, ?, ?, ?)",
                    ['Minhas Finanças', 'PF', '123.456.789-00', '#103C35', 'bi-person-circle']
                );
                $orgPfId = (int) Model::getPdo()->lastInsertId();
                echo "  -> Organizacao PF 'Minhas Finanças' criada (ID: $orgPfId)\n";
            } else {
                $orgPfId = (int) $orgPf['id'];
            }

            // 3. Vínculo Usuário-Organização
            $stmt = Model::query("SELECT id FROM organization_users WHERE organization_id = ? AND user_id = ?", [$orgPjId, $userId]);
            if (!$stmt->fetch()) {
                Model::query("INSERT INTO organization_users (organization_id, user_id, role, is_default) VALUES (?, ?, 'owner', 1)", [$orgPjId, $userId]);
            }
            $stmt = Model::query("SELECT id FROM organization_users WHERE organization_id = ? AND user_id = ?", [$orgPfId, $userId]);
            if (!$stmt->fetch()) {
                Model::query("INSERT INTO organization_users (organization_id, user_id, role, is_default) VALUES (?, ?, 'owner', 0)", [$orgPfId, $userId]);
            }

            // 4. Contas Financeiras da Kodey Sistemas
            $stmt = Model::query("SELECT COUNT(*) as total FROM accounts WHERE organization_id = ?", [$orgPjId]);
            if ((int)$stmt->fetch(PDO::FETCH_ASSOC)['total'] === 0) {
                Model::query("INSERT INTO accounts (organization_id, name, type, bank_name, initial_balance, current_balance, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [$orgPjId, 'Banco Inter PJ', 'checking', 'Banco Inter', 10000.00, 14250.00, '#FF7A00', 'bi-bank']);
                $interAccountId = (int) Model::getPdo()->lastInsertId();

                Model::query("INSERT INTO accounts (organization_id, name, type, bank_name, initial_balance, current_balance, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [$orgPjId, 'Nubank PJ', 'checking', 'Nubank', 3000.00, 5320.00, '#820AD9', 'bi-credit-card']);
                $nubankAccountId = (int) Model::getPdo()->lastInsertId();

                Model::query("INSERT INTO accounts (organization_id, name, type, bank_name, initial_balance, current_balance, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [$orgPjId, 'Caixa / Gaveta', 'cash', 'Dinheiro', 500.00, 450.00, '#0F7A4A', 'bi-cash-stack']);
                echo "  -> Contas financeiras cadastradas com sucesso\n";
            } else {
                $interAccountId = (int) Model::query("SELECT id FROM accounts WHERE organization_id = ? LIMIT 1", [$orgPjId])->fetchColumn();
                $nubankAccountId = $interAccountId;
            }

            // 5. Cartões de Crédito
            $stmt = Model::query("SELECT COUNT(*) as total FROM credit_cards WHERE organization_id = ?", [$orgPjId]);
            if ((int)$stmt->fetch(PDO::FETCH_ASSOC)['total'] === 0) {
                Model::query("INSERT INTO credit_cards (organization_id, account_id, name, brand, credit_limit, closing_day, due_day, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [$orgPjId, $interAccountId, 'Inter Mastercard Black PJ', 'Mastercard', 25000.00, 20, 28, '#103C35']);
                $cardId = (int) Model::getPdo()->lastInsertId();
                echo "  -> Cartao de credito cadastrado com sucesso\n";
            } else {
                $cardId = (int) Model::query("SELECT id FROM credit_cards WHERE organization_id = ? LIMIT 1", [$orgPjId])->fetchColumn();
            }

            // 6. Categorias
            $stmt = Model::query("SELECT COUNT(*) as total FROM categories WHERE organization_id = ?", [$orgPjId]);
            if ((int)$stmt->fetch(PDO::FETCH_ASSOC)['total'] === 0) {
                Model::query("INSERT INTO categories (organization_id, name, type, monthly_budget, icon, color) VALUES (?, ?, 'income', 0, 'bi-cash', '#22C55E')",
                    [$orgPjId, 'Serviços de TI / Software']);
                $catSoftwareId = (int) Model::getPdo()->lastInsertId();

                Model::query("INSERT INTO categories (organization_id, name, type, monthly_budget, icon, color) VALUES (?, ?, 'income', 0, 'bi-diagram-3', '#22C55E')",
                    [$orgPjId, 'Consultoria & Treinamentos']);
                $catConsultoriaId = (int) Model::getPdo()->lastInsertId();

                Model::query("INSERT INTO categories (organization_id, name, type, monthly_budget, icon, color) VALUES (?, ?, 'expense', 2400.00, 'bi-house-door', '#0E5A4F')",
                    [$orgPjId, 'Moradia & Escritório']);
                $catMoradiaId = (int) Model::getPdo()->lastInsertId();

                Model::query("INSERT INTO categories (organization_id, name, type, monthly_budget, icon, color) VALUES (?, ?, 'expense', 1800.00, 'bi-cart', '#FF7A6B')",
                    [$orgPjId, 'Alimentação']);
                $catAlimentacaoId = (int) Model::getPdo()->lastInsertId();

                Model::query("INSERT INTO categories (organization_id, name, type, monthly_budget, icon, color) VALUES (?, ?, 'expense', 900.00, 'bi-car-front', '#68A9FF')",
                    [$orgPjId, 'Transporte']);
                $catTransporteId = (int) Model::getPdo()->lastInsertId();

                echo "  -> Categorias orcamentarias cadastradas com sucesso\n";
            } else {
                $catMoradiaId = (int) Model::query("SELECT id FROM categories WHERE organization_id = ? AND name LIKE 'Moradia%' LIMIT 1", [$orgPjId])->fetchColumn();
                $catAlimentacaoId = (int) Model::query("SELECT id FROM categories WHERE organization_id = ? AND name LIKE 'Alimentação%' LIMIT 1", [$orgPjId])->fetchColumn();
                $catTransporteId = (int) Model::query("SELECT id FROM categories WHERE organization_id = ? AND name LIKE 'Transporte%' LIMIT 1", [$orgPjId])->fetchColumn();
                $catSoftwareId = (int) Model::query("SELECT id FROM categories WHERE organization_id = ? AND type = 'income' LIMIT 1", [$orgPjId])->fetchColumn();
                $catConsultoriaId = $catSoftwareId;
            }

            // 7. Reservas & Destinos
            $stmt = Model::query("SELECT COUNT(*) as total FROM reserves WHERE organization_id = ?", [$orgPjId]);
            if ((int)$stmt->fetch(PDO::FETCH_ASSOC)['total'] === 0) {
                Model::query("INSERT INTO reserves (organization_id, account_id, name, type, target_amount, current_amount, monthly_contribution_target, priority, color, icon) VALUES (?, ?, ?, 'emergency', 30000.00, 20400.00, 2000.00, 'high', '#22C55E', 'app/assets/illustrations/coin-happy.png')",
                    [$orgPjId, $interAccountId, 'Reserva de Emergência']);
                $reserveEmergenciaId = (int) Model::getPdo()->lastInsertId();

                Model::query("INSERT INTO reserves (organization_id, account_id, name, type, target_amount, current_amount, monthly_contribution_target, priority, color, icon) VALUES (?, ?, ?, 'provision', 12000.00, 6000.00, 1000.00, 'medium', '#0F7A4A', 'app/assets/illustrations/wallet-green.png')",
                    [$orgPjId, $interAccountId, 'Provisão 13º Salário']);

                echo "  -> Reservas e Metas cadastradas com sucesso\n";
            } else {
                $reserveEmergenciaId = (int) Model::query("SELECT id FROM reserves WHERE organization_id = ? LIMIT 1", [$orgPjId])->fetchColumn();
            }

            // 8. Movimentações do Mês Corrente (Setembro de 2026)
            $stmt = Model::query("SELECT COUNT(*) as total FROM transactions WHERE organization_id = ?", [$orgPjId]);
            if ((int)$stmt->fetch(PDO::FETCH_ASSOC)['total'] === 0) {
                // Receita 1: Efetivada
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, ?, ?, 'income', ?, ?, ?, '2026-09-01', '2026-09-05', '2026-09-05', 'effective', 1, 1)",
                    [$orgPjId, $userId, $interAccountId, $catSoftwareId, 'Contrato Mensal de Software — Cliente Alpha', 10000.00, 10000.00]);

                // Receita 2: Efetivada
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, ?, ?, 'income', ?, ?, ?, '2026-09-01', '2026-09-10', '2026-09-10', 'effective', 1, 1)",
                    [$orgPjId, $userId, $interAccountId, $catSoftwareId, 'Licenciamento Kore Framework', 2400.00, 2400.00]);

                // Receita 3: Prevista (a receber no final do mês)
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, ?, ?, 'income', ?, ?, NULL, '2026-09-01', '2026-09-28', NULL, 'expected', 1, 1)",
                    [$orgPjId, $userId, $interAccountId, $catConsultoriaId, 'Consultoria Tecnológica Especializada', 2100.00]);

                // Despesa 1: Aluguel Escritório (Efetivada - no valor previsto)
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, ?, ?, 'expense', ?, ?, ?, '2026-09-01', '2026-09-10', '2026-09-10', 'effective', 1, 1)",
                    [$orgPjId, $userId, $interAccountId, $catMoradiaId, 'Aluguel do Escritório & Condomínio', 2000.00, 2000.00]);

                // Despesa 2: Supermercado (Efetivada - desvio preservando previsto vs efetivado)
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, ?, ?, 'expense', ?, ?, ?, '2026-09-01', '2026-09-12', '2026-09-12', 'effective', 1, 1)",
                    [$orgPjId, $userId, $interAccountId, $catAlimentacaoId, 'Supermercado & Insumos Mensais', 900.00, 1030.00]);

                // Despesa 3: Restaurante e Alimentação
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, ?, ?, 'expense', ?, ?, ?, '2026-09-01', '2026-09-20', '2026-09-20', 'effective', 1, 1)",
                    [$orgPjId, $userId, $interAccountId, $catAlimentacaoId, 'Alimentação Equipe & Café', 900.00, 1000.00]);

                // Despesa 4: Combustível
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, ?, ?, 'expense', ?, ?, ?, '2026-09-01', '2026-09-18', '2026-09-18', 'effective', 1, 1)",
                    [$orgPjId, $userId, $interAccountId, $catTransporteId, 'Combustível & Estacionamento', 900.00, 780.00]);

                // Despesa 5: Conta de Energia CEMIG (Prevista, vence amanhã!)
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, ?, ?, 'expense', ?, ?, NULL, '2026-09-01', '2026-09-26', NULL, 'expected', 1, 1)",
                    [$orgPjId, $userId, $interAccountId, $catMoradiaId, 'Conta de Energia Elétrica — CEMIG', 350.00]);

                // Despesa 6: "Dinheiro Sem Origem" (Para demonstrar a regra de negócio do Kontabs!)
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, category_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, NULL, ?, 'expense', ?, ?, ?, '2026-09-01', '2026-09-22', '2026-09-22', 'effective', 0, 1)",
                    [$orgPjId, $userId, $catMoradiaId, 'Serviço Emergencial de Reparo', 480.00, 480.00]);

                // Aporte em Reserva: R$ 2.000,00
                Model::query("INSERT INTO transactions (organization_id, user_id, account_id, reserve_id, type, description, amount_expected, amount_effective, competence_date, due_date, payment_date, status, has_origin, has_destination) VALUES (?, ?, ?, ?, 'reserve_deposit', ?, ?, ?, '2026-09-01', '2026-09-15', '2026-09-15', 'effective', 1, 1)",
                    [$orgPjId, $userId, $interAccountId, $reserveEmergenciaId, 'Aporte Mensal para Reserva de Emergência', 2000.00, 2000.00]);

                echo "  -> Movimentacoes realistas de teste criadas com sucesso (incluindo previstas, sem origem e aportes)\n";
            }

            echo "Seeding finalizado com sucesso no MySQL (kontabs)!\n";
        } catch (Exception $e) {
            echo "Erro no Seeder: " . $e->getMessage() . "\n";
        }
    }
}