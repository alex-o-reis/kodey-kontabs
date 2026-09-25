<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../../kore/Model.php';

class Auth extends Controller
{
    public function post_login()
    {
        $body = $this->request->getJson();
        $username = trim($body['username'] ?? $this->request->input('username') ?? '');
        $password = $body['password'] ?? $this->request->input('password') ?? '';

        if (!$username || !$password) {
            return $this->error('Informe o usuário/e-mail e a senha.', 400);
        }

        try {
            $stmt = Model::query("SELECT * FROM users WHERE (username = ? OR email = ?) AND deleted_at IS NULL LIMIT 1", [$username, $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                $token = bin2hex(random_bytes(32));
                Model::query("UPDATE users SET token = ? WHERE id = ?", [$token, $user['id']]);

                unset($user['password']);

                // Busca organizações do usuário
                $stmtOrgs = Model::query(
                    "SELECT o.*, ou.role, ou.is_default 
                     FROM organizations o
                     INNER JOIN organization_users ou ON ou.organization_id = o.id
                     WHERE ou.user_id = ? AND o.is_active = 1
                     ORDER BY ou.is_default DESC, o.name ASC",
                    [$user['id']]
                );
                $orgs = $stmtOrgs->fetchAll(PDO::FETCH_ASSOC);

                // Se não tiver vínculo explícito em organization_users, busca todas as ativas
                if (empty($orgs)) {
                    $stmtAll = Model::query("SELECT *, 'owner' as role, 1 as is_default FROM organizations WHERE is_active = 1 ORDER BY id ASC");
                    $orgs = $stmtAll->fetchAll(PDO::FETCH_ASSOC);
                }

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

        return $this->error('Usuário ou senha inválidos.', 401);
    }

    public function get_me()
    {
        $token = $this->request->bearerToken();
        if (!$token) {
            // Tenta pegar do cookie ou header customizado
            $headers = function_exists('getallheaders') ? getallheaders() : [];
            $authHeader = $headers['Authorization'] ?? '';
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            return $this->error('Não autenticado.', 401);
        }

        try {
            $stmt = Model::query("SELECT id, name, username, email, role, avatar, created_at FROM users WHERE token = ? AND deleted_at IS NULL LIMIT 1", [$token]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $stmtOrgs = Model::query(
                    "SELECT o.*, ou.role, ou.is_default 
                     FROM organizations o
                     INNER JOIN organization_users ou ON ou.organization_id = o.id
                     WHERE ou.user_id = ? AND o.is_active = 1
                     ORDER BY ou.is_default DESC, o.name ASC",
                    [$user['id']]
                );
                $orgs = $stmtOrgs->fetchAll(PDO::FETCH_ASSOC);
                if (empty($orgs)) {
                    $stmtAll = Model::query("SELECT *, 'owner' as role, 1 as is_default FROM organizations WHERE is_active = 1 ORDER BY id ASC");
                    $orgs = $stmtAll->fetchAll(PDO::FETCH_ASSOC);
                }

                return $this->json([
                    'user' => $user,
                    'organizations' => $orgs
                ]);
            }
        } catch (Exception $e) {}

        return $this->error('Sessão expirada ou inválida.', 401);
    }

    public function post_switch_org()
    {
        $body = $this->request->getJson();
        $orgId = (int) ($body['organization_id'] ?? 0);

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
}