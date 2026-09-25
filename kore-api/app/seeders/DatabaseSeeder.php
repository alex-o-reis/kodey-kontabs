<?php

require_once __DIR__ . '/../../kore/Seeder.php';
require_once __DIR__ . '/../../kore/Model.php';

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        try {
            $username = 'admin';
            $email = 'admin@kore.local';
            $password = password_hash('admin123', PASSWORD_DEFAULT);
            $token = bin2hex(random_bytes(32));

            $stmt = Model::query("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1", [$username, $email]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$existing) {
                Model::query(
                    "INSERT INTO users (name, username, email, password, role, token) VALUES (?, ?, ?, ?, ?, ?)",
                    ['Administrador Kore', $username, $email, $password, 'admin', $token]
                );
                echo "  -> Usuario Admin criado com sucesso: [admin / admin123]\n";
            } else {
                Model::query(
                    "UPDATE users SET password = ?, role = 'admin' WHERE id = ?",
                    [$password, $existing['id']]
                );
                echo "  -> Usuario Admin ja existente atualizado: [admin / admin123]\n";
            }
        } catch (Exception $e) {
            echo "  -> Erro ao criar usuario admin: " . $e->getMessage() . "\n";
        }
    }
}