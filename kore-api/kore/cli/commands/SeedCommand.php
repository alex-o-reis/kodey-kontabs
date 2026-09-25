<?php

require_once __DIR__ . '/../../Seeder.php';

class SeedCommand extends Command
{
    protected string $description = "Popula o banco de dados com dados iniciais e seeders";

    public function handle(string $specificSeeder = ""): void
    {
        $this->info("Executando Seeders do Banco de Dados...\n");

        $seedersDir = __DIR__ . '/../../../app/seeders';
        if (!is_dir($seedersDir)) {
            mkdir($seedersDir, 0777, true);
        }

        $seederClass = $specificSeeder ? ucfirst($specificSeeder) : 'DatabaseSeeder';
        $seederFile = $seedersDir . '/' . $seederClass . '.php';

        if (!file_exists($seederFile)) {
            $this->error("Arquivo de seeder nao encontrado: " . $seederFile);
            return;
        }

        require_once $seederFile;

        if (class_exists($seederClass)) {
            $seeder = new $seederClass();
            $seeder->run();
            $this->line();
            $this->info("Seeders concluidos com sucesso!");
        } else {
            $this->error("Classe " . $seederClass . " nao encontrada no arquivo.");
        }
    }
}