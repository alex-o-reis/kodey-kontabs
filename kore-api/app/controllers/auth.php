<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../../kore/Model.php';

class Auth extends Controller
{
    /**
     * Login com usuário/e-mail e senha
     */
    public function post_login()
    {
        $body = $this->request->getJson() ?: [];
        $username = trim($body['username'] ?? $this->request->input('username') ?? '');
        $password = $body['password'] ?? $this->request->input('password') ?? '';

        if (!$username || !$password) {
            return $this->error('Informe o usuário/e-mail e a senha de acesso.', 400);
        }

        try {
            $stmt = Model::query(
                "SELECT * FROM users WHERE (username = ? OR email = ?) AND deleted_at IS NULL LIMIT 1",
                [$username, $username]
            );
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && $user['password'] && password_verify($password, $user['password'])) {
                $token = bin2hex(random_bytes(32));
                Model::query("UPDATE users SET token = ? WHERE id = ?", [$token, $user['id']]);

                unset($user['password']);

                $orgs = $this->getUserOrganizations($user['id']);
                $activeOrg = !empty($orgs) ? $orgs[0] : null;

                return $this->json([
                    'message' => 'Login realizado com sucesso!',
                    'token' => $token,
                    'user' => $user,
                    'organizations' => $orgs,
                    'active_organization' => $activeOrg
                ]);
            }
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 500);
        }

        return $this->error('Usuário/e-mail ou senha inválidos.', 401);
    }

    /**
     * Registro de novo usuário
     */
    public function post_register()
    {
        $body = $this->request->getJson() ?: [];
        $name = trim($body['name'] ?? $this->request->input('name') ?? '');
        $email = strtolower(trim($body['email'] ?? $this->request->input('email') ?? ''));
        $password = $body['password'] ?? $this->request->input('password') ?? '';
        $orgType = strtoupper(trim($body['org_type'] ?? $this->request->input('org_type') ?? 'PF'));
        $orgName = trim($body['org_name'] ?? $this->request->input('org_name') ?? '');

        if (!$name) {
            return $this->error('Por favor, informe seu nome completo.', 400);
        }
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->error('Por favor, informe um endereço de e-mail válido.', 400);
        }
        if (!$password || strlen($password) < 6) {
            return $this->error('A senha deve conter no mínimo 6 caracteres.', 400);
        }

        if (!in_array($orgType, ['PF', 'PJ'])) {
            $orgType = 'PF';
        }

        try {
            // Verifica duplicidade de e-mail
            $stmt = Model::query("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1", [$email]);
            if ($stmt->fetch()) {
                return $this->error('Este e-mail já está cadastrado no Kontabs. Tente fazer login.', 409);
            }

            // Gera username único a partir do e-mail
            $baseUsername = strtolower(preg_replace('/[^a-z0-9]/', '', explode('@', $email)[0]));
            if (empty($baseUsername)) $baseUsername = 'usuario';
            $username = $baseUsername;
            $counter = 1;
            while (true) {
                $check = Model::query("SELECT id FROM users WHERE username = ? LIMIT 1", [$username]);
                if (!$check->fetch()) break;
                $username = $baseUsername . $counter;
                $counter++;
            }

            // Iniciais do Avatar
            $nameParts = preg_split('/\s+/', $name);
            $avatar = strtoupper(substr($nameParts[0], 0, 1) . (isset($nameParts[1]) ? substr($nameParts[1], 0, 1) : ''));

            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $token = bin2hex(random_bytes(32));

            Model::query(
                "INSERT INTO users (name, username, email, password, role, avatar, token, auth_provider) VALUES (?, ?, ?, ?, 'user', ?, ?, 'local')",
                [$name, $username, $email, $passwordHash, $avatar, $token]
            );
            $userId = (int) Model::getPdo()->lastInsertId();

            // Nome padrão da organização inicial se não informado
            if (!$orgName) {
                $orgName = ($orgType === 'PJ') ? ($name . ' Serviços') : ('Finanças de ' . $nameParts[0]);
            }

            $orgColor = ($orgType === 'PJ') ? '#0F7A4A' : '#103C35';
            $orgIcon = ($orgType === 'PJ') ? 'bi-buildings' : 'bi-person-circle';

            Model::query(
                "INSERT INTO organizations (name, type, color, icon, is_active) VALUES (?, ?, ?, ?, 1)",
                [$orgName, $orgType, $orgColor, $orgIcon]
            );
            $orgId = (int) Model::getPdo()->lastInsertId();

            Model::query(
                "INSERT INTO organization_users (organization_id, user_id, role, is_default) VALUES (?, ?, 'owner', 1)",
                [$orgId, $userId]
            );

            // Popula contas e categorias padrão acolhedoras
            $this->seedUserDefaults($orgId, $orgType, $userId);

            $stmtUser = Model::query("SELECT id, name, username, email, role, avatar, created_at FROM users WHERE id = ?", [$userId]);
            $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

            $orgs = $this->getUserOrganizations($userId);
            $activeOrg = !empty($orgs) ? $orgs[0] : null;

            return $this->json([
                'message' => 'Conta criada com sucesso! Bem-vindo ao Kodey Kontabs.',
                'token' => $token,
                'user' => $user,
                'organizations' => $orgs,
                'active_organization' => $activeOrg,
                'is_new_user' => true
            ], 201);

        } catch (Exception $e) {
            return $this->error('Erro ao realizar cadastro: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Autenticação e Registro via Google Sign-In / OAuth
     */
    public function post_google()
    {
        $body = $this->request->getJson() ?: [];
        $credential = $body['credential'] ?? $this->request->input('credential') ?? '';
        $userData = $body['user_data'] ?? [];

        $email = null;
        $name = null;
        $googleId = null;
        $avatar = null;

        // Decodifica JWT ID Token do Google se fornecido
        if ($credential) {
            $payload = $this->decodeGoogleJwt($credential);
            if ($payload) {
                $email = isset($payload['email']) ? strtolower(trim($payload['email'])) : null;
                $name = $payload['name'] ?? ($payload['given_name'] ?? null);
                $googleId = $payload['sub'] ?? null;
                $avatar = $payload['picture'] ?? null;
            }
        }

        // Fallback para user_data enviado diretamente
        if (!$email && !empty($userData['email'])) {
            $email = strtolower(trim($userData['email']));
            $name = $name ?: ($userData['name'] ?? 'Usuário Google');
            $googleId = $googleId ?: ($userData['google_id'] ?? ($userData['id'] ?? ''));
            $avatar = $avatar ?: ($userData['avatar'] ?? ($userData['picture'] ?? null));
        }

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->error('Não foi possível identificar a conta Google informada.', 400);
        }

        try {
            // Busca se usuário já existe por email ou google_id
            $stmt = Model::query(
                "SELECT * FROM users WHERE (email = ? OR (google_id IS NOT NULL AND google_id = ?)) AND deleted_at IS NULL LIMIT 1",
                [$email, $googleId ?: '___none___']
            );
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            $token = bin2hex(random_bytes(32));
            $isNewUser = false;

            if ($user) {
                // Usuário existente: atualiza token e dados do Google se necessário
                $updateFields = ["token = ?"];
                $params = [$token];

                if (empty($user['google_id']) && $googleId) {
                    $updateFields[] = "google_id = ?";
                    $params[] = $googleId;
                }
                if ($avatar && (empty($user['avatar']) || strlen($user['avatar']) <= 3)) {
                    $updateFields[] = "avatar = ?";
                    $params[] = $avatar;
                }

                $params[] = $user['id'];
                Model::query("UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?", $params);

                $userId = (int) $user['id'];
            } else {
                // Novo usuário via Google: cria conta automaticamente
                $isNewUser = true;
                $nameParts = preg_split('/\s+/', $name ?: 'Usuário Kontabs');
                $userInitials = strtoupper(substr($nameParts[0], 0, 1) . (isset($nameParts[1]) ? substr($nameParts[1], 0, 1) : 'G'));

                $baseUsername = strtolower(preg_replace('/[^a-z0-9]/', '', explode('@', $email)[0]));
                if (empty($baseUsername)) $baseUsername = 'google_user';
                $username = $baseUsername;
                $counter = 1;
                while (true) {
                    $check = Model::query("SELECT id FROM users WHERE username = ? LIMIT 1", [$username]);
                    if (!$check->fetch()) break;
                    $username = $baseUsername . $counter;
                    $counter++;
                }

                $randomPass = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
                $avatarVal = $avatar ?: $userInitials;

                Model::query(
                    "INSERT INTO users (name, username, email, password, role, avatar, token, google_id, auth_provider) VALUES (?, ?, ?, ?, 'user', ?, ?, ?, 'google')",
                    [$name ?: 'Usuário Kontabs', $username, $email, $randomPass, $avatarVal, $token, $googleId]
                );
                $userId = (int) Model::getPdo()->lastInsertId();

                // Cria organização pessoal inicial
                $orgName = 'Finanças de ' . $nameParts[0];
                Model::query(
                    "INSERT INTO organizations (name, type, color, icon, is_active) VALUES (?, 'PF', '#103C35', 'bi-person-circle', 1)",
                    [$orgName]
                );
                $orgId = (int) Model::getPdo()->lastInsertId();

                Model::query(
                    "INSERT INTO organization_users (organization_id, user_id, role, is_default) VALUES (?, ?, 'owner', 1)",
                    [$orgId, $userId]
                );

                // Popula estrutura padrão
                $this->seedUserDefaults($orgId, 'PF', $userId);
            }

            $stmtUser = Model::query("SELECT id, name, username, email, role, avatar, google_id, created_at FROM users WHERE id = ?", [$userId]);
            $freshUser = $stmtUser->fetch(PDO::FETCH_ASSOC);

            $orgs = $this->getUserOrganizations($userId);
            $activeOrg = !empty($orgs) ? $orgs[0] : null;

            return $this->json([
                'message' => $isNewUser ? 'Conta Google registrada com sucesso no Kontabs!' : 'Login com Google efetuado com sucesso!',
                'token' => $token,
                'user' => $freshUser,
                'organizations' => $orgs,
                'active_organization' => $activeOrg,
                'is_new_user' => $isNewUser
            ]);

        } catch (Exception $e) {
            return $this->error('Falha na autenticação Google: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Retorna dados do usuário autenticado
     */
    public function get_me()
    {
        $token = $this->request->bearerToken();
        if (!$token) {
            $headers = function_exists('getallheaders') ? getallheaders() : [];
            $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            return $this->error('Não autenticado.', 401);
        }

        try {
            $stmt = Model::query("SELECT id, name, username, email, role, avatar, google_id, auth_provider, created_at FROM users WHERE token = ? AND deleted_at IS NULL LIMIT 1", [$token]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $orgs = $this->getUserOrganizations($user['id']);

                return $this->json([
                    'user' => $user,
                    'organizations' => $orgs
                ]);
            }
        } catch (Exception $e) {}

        return $this->error('Sessão expirada ou inválida.', 401);
    }

    /**
     * Alterna organização ativa
     */
    public function post_switch_org()
    {
        $body = $this->request->getJson() ?: [];
        $orgId = (int) ($body['organization_id'] ?? $this->request->input('organization_id') ?? 0);

        if (!$orgId) {
            return $this->error('ID da organização é obrigatório.', 422);
        }

        $stmt = Model::query("SELECT * FROM organizations WHERE id = ? AND is_active = 1", [$orgId]);
        $org = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$org) {
            return $this->error('Organização não encontrada.', 404);
        }

        return $this->json([
            'message' => 'Organização alternada com sucesso.',
            'active_organization' => $org
        ]);
    }

    /**
     * Helper: Busca organizações vinculadas ao usuário
     */
    private function getUserOrganizations($userId): array
    {
        $stmtOrgs = Model::query(
            "SELECT o.*, ou.role, ou.is_default 
             FROM organizations o
             INNER JOIN organization_users ou ON ou.organization_id = o.id
             WHERE ou.user_id = ? AND o.is_active = 1
             ORDER BY ou.is_default DESC, o.name ASC",
            [$userId]
        );
        $orgs = $stmtOrgs->fetchAll(PDO::FETCH_ASSOC);

        // Se não tiver vínculo explícito em organization_users, tenta pegar ou criar uma default
        if (empty($orgs)) {
            $stmtAll = Model::query("SELECT *, 'owner' as role, 1 as is_default FROM organizations WHERE is_active = 1 ORDER BY id ASC LIMIT 5");
            $orgs = $stmtAll->fetchAll(PDO::FETCH_ASSOC);
        }

        return $orgs;
    }

    /**
     * Helper: Popula dados padrão para novas contas
     */
    private function seedUserDefaults(int $orgId, string $orgType, int $userId): void
    {
        // Contas Bancárias Padrão
        if ($orgType === 'PJ') {
            Model::query(
                "INSERT INTO accounts (organization_id, name, type, bank_name, initial_balance, current_balance, color, icon) VALUES (?, 'Conta Bancária PJ', 'checking', 'Banco Inter PJ', 0.00, 0.00, '#0F7A4A', 'bi-bank')",
                [$orgId]
            );
            Model::query(
                "INSERT INTO accounts (organization_id, name, type, bank_name, initial_balance, current_balance, color, icon) VALUES (?, 'Caixa da Empresa', 'cash', 'Dinheiro', 0.00, 0.00, '#103C35', 'bi-cash-stack')",
                [$orgId]
            );
        } else {
            Model::query(
                "INSERT INTO accounts (organization_id, name, type, bank_name, initial_balance, current_balance, color, icon) VALUES (?, 'Conta Corrente Principal', 'checking', 'Banco Digital', 0.00, 0.00, '#0F7A4A', 'bi-bank')",
                [$orgId]
            );
            Model::query(
                "INSERT INTO accounts (organization_id, name, type, bank_name, initial_balance, current_balance, color, icon) VALUES (?, 'Carteira / Dinheiro', 'cash', 'Dinheiro', 0.00, 0.00, '#103C35', 'bi-cash-stack')",
                [$orgId]
            );
        }

        // Categorias Padrão
        $defaultCategories = [
            ['name' => 'Salário & Rendimentos', 'type' => 'income', 'budget' => 0.00, 'icon' => 'bi-cash-coin', 'color' => '#22C55E'],
            ['name' => 'Serviços & Contratos', 'type' => 'income', 'budget' => 0.00, 'icon' => 'bi-diagram-3', 'color' => '#22C55E'],
            ['name' => 'Outras Receitas', 'type' => 'income', 'budget' => 0.00, 'icon' => 'bi-plus-circle', 'color' => '#22C55E'],
            ['name' => 'Moradia & Contas de Casa', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-house-door', 'color' => '#0E5A4F'],
            ['name' => 'Alimentação & Supermercado', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-cart', 'color' => '#FF7A6B'],
            ['name' => 'Transporte & Veículo', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-car-front', 'color' => '#68A9FF'],
            ['name' => 'Saúde & Cuidados', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-heart-pulse', 'color' => '#FF7A6B'],
            ['name' => 'Lazer & Estilo de Vida', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-controller', 'color' => '#FACC15'],
            ['name' => 'Educação & Cursos', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-book', 'color' => '#68A9FF'],
            ['name' => 'Outras Despesas', 'type' => 'expense', 'budget' => 0.00, 'icon' => 'bi-tag', 'color' => '#667A74']
        ];

        foreach ($defaultCategories as $c) {
            Model::query(
                "INSERT INTO categories (organization_id, name, type, monthly_budget, icon, color) VALUES (?, ?, ?, ?, ?, ?)",
                [$orgId, $c['name'], $c['type'], $c['budget'], $c['icon'], $c['color']]
            );
        }

        // Reserva de Emergência Padrão
        Model::query(
            "INSERT INTO reserves (organization_id, name, type, target_amount, current_amount, monthly_contribution_target, priority, color, icon) VALUES (?, 'Reserva de Emergência', 'emergency', 10000.00, 0.00, 500.00, 'high', '#22C55E', 'app/assets/illustrations/coin-happy.png')",
            [$orgId]
        );
    }

    /**
     * Decodifica JWT do Google sem dependência de libs pesadas
     */
    private function decodeGoogleJwt(string $jwt): ?array
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }

        $payloadBase64 = strtr($parts[1], '-_', '+/');
        $remainder = strlen($payloadBase64) % 4;
        if ($remainder) {
            $payloadBase64 .= str_repeat('=', 4 - $remainder);
        }

        $json = base64_decode($payloadBase64);
        if (!$json) {
            return null;
        }

        $data = json_decode($json, true);
        return is_array($data) ? $data : null;
    }
}