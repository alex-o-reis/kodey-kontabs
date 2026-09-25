<?php

require_once __DIR__ . '/Model.php';
require_once __DIR__ . '/Migration.php';

class Migrator
{
    protected string $migrationsPath;

    public function __construct(string $migrationsPath)
    {
        $this->migrationsPath = $migrationsPath;
    }

    public function initTable(): void
    {
        Model::query('CREATE TABLE IF NOT EXISTS `migrations` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `migration` VARCHAR(255) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    }

    public function getRanMigrations(): array
    {
        $this->initTable();
        $stmt = Model::query('SELECT migration FROM migrations');
        $ran = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
        {
            $ran[] = $row['migration'];
        }
        return $ran;
    }

    public function run(): int
    {
        $this->initTable();
        $ranMigrations = $this->getRanMigrations();

        if (!is_dir($this->migrationsPath))
        {
            mkdir($this->migrationsPath, 0777, true);
        }

        $files = scandir($this->migrationsPath);
        $files = array_filter($files, function ($file) {
            return pathinfo($file, PATHINFO_EXTENSION) === 'php';
        });
        sort($files, SORT_NATURAL);

        $executed = 0;

        foreach ($files as $file)
        {
            if (!in_array($file, $ranMigrations))
            {
                require_once $this->migrationsPath . '/' . $file;

                $className = preg_replace('/^[0-9_]+/', '', pathinfo($file, PATHINFO_FILENAME));

                if (class_exists($className))
                {
                    echo "Migrando: " . $file . "\n";
                    $migration = new $className();
                    try
                    {
                        $migration->up();
                        Model::query('INSERT INTO migrations (migration) VALUES (?)', [$file]);
                        echo "Migrado com sucesso: " . $file . "\n";
                        $executed++;
                    }
                    catch (Exception $e)
                    {
                        echo "Erro na migracao " . $file . ":\n" . $e->getMessage() . "\n";
                        break;
                    }
                }
                else
                {
                    echo "Aviso: Classe " . $className . " nao encontrada em " . $file . ". Ignorando.\n";
                }
            }
        }

        return $executed;
    }

    public function rollback(): bool
    {
        $this->initTable();
        $stmt = Model::query('SELECT * FROM migrations ORDER BY id DESC LIMIT 1');
        $last = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$last)
        {
            echo "Nenhuma migracao para reverter.\n";
            return false;
        }

        $file = $last['migration'];
        $filePath = $this->migrationsPath . '/' . $file;

        if (file_exists($filePath))
        {
            require_once $filePath;
            $className = preg_replace('/^[0-9_]+/', '', pathinfo($file, PATHINFO_FILENAME));
            if (class_exists($className))
            {
                echo "Revertendo: " . $file . "\n";
                $migration = new $className();
                $migration->down();
                Model::query('DELETE FROM migrations WHERE id = ?', [$last['id']]);
                echo "Revertido com sucesso: " . $file . "\n";
                return true;
            }
        }

        return false;
    }
}
