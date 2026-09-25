<?php

require_once __DIR__ . '/../../Migrator.php';

class MigrateCommand extends Command
{
    protected string $description = "Executa as migracoes pendentes no banco de dados";

    /**
     * Executa todas as migracoes pendentes
     */
    public function handle(): void
    {
        $migrator = new Migrator(__DIR__ . '/../../../app/migrations');
        $count = $migrator->run();
        if ($count === 0) {
            $this->info("Nenhuma migracao pendente para executar.");
        } else {
            $this->info("Total de migracoes executadas com sucesso: $count");
        }
    }

    /**
     * Reverte a ultima migracao executada
     */
    public function rollback(): void
    {
        $migrator = new Migrator(__DIR__ . '/../../../app/migrations');
        $migrator->rollback();
    }
}