<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../../kore/Model.php';

class Auth extends Controller
{
    public function post_login()
    {
        $username = $this->request->input('username');
        $password = $this->request->input('password');

        if (!$username || !$password) {
            return $this->error('Username e password são obrigatórios.', 400);
        }

        try {
            $stmt = Model::query("SELECT * FROM users WHERE (username = ? OR email = ?) AND deleted_at IS NULL LIMIT 1", [$username, $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                $token = bin2hex(random_bytes(32));
                Model::query("UPDATE users SET token = ? WHERE id = ?", [$token, $user['id']]);

                unset($user['password']);
                return $this->json([
                    'message' => 'Login realizado com sucesso',
                    'token' => $token,
                    'user' => $user
                ]);
            }
        } catch (Exception $e) {
            // Se tabela não existir ainda ou der erro
        }

        return $this->error('Usuário ou senha inválidos.', 401);
    }

    public function get_me()
    {
        $token = $this->request->bearerToken();
        if (!$token) {
            return $this->error('Não autenticado.', 401);
        }

        try {
            $stmt = Model::query("SELECT id, name, username, email, role, avatar, created_at FROM users WHERE token = ? AND deleted_at IS NULL LIMIT 1", [$token]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                return $this->json(['user' => $user]);
            }
        } catch (Exception $e) {}

        return $this->error('Sessão expirada ou inválida.', 401);
    }
}