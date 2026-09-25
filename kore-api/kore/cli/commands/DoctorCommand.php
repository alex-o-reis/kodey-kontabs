<?php

class DoctorCommand extends Command
{
    protected string $description = "Verifica os requisitos e a saude do ambiente de desenvolvimento";

    public function handle(): void
    {
        $this->info("Executando Kore Doctor — Diagnostico do Ambiente...\n");

        // 1. Versao do PHP
        $phpVersion = phpversion();
        if (version_compare($phpVersion, '8.1.0', '>=')) {
            $this->info("  [OK] Versao do PHP: $phpVersion");
        } else {
            $this->error("  [FALHA] Versao do PHP ($phpVersion). Requerido >= 8.1.0");
        }

        // 2. Extensoes necessarias
        $extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'curl'];
        foreach ($extensions as $ext) {
            if (extension_loaded($ext)) {
                $this->info("  [OK] Extensao PHP: $ext");
            } else {
                $this->warn("  [AVISO] Extensao PHP '$ext' nao encontrada.");
            }
        }

        // 3. Conexao com Banco de Dados
        try {
            if (class_exists('Model') && Model::getPdo()) {
                $db = $GLOBALS['active_tenant_db'] ?? 'desconhecido';
                $this->info("  [OK] Conexao com Banco de Dados estabelecida ($db)");
            } else {
                $this->warn("  [AVISO] Conexao com banco nao inicializada ou banco indisponivel.");
            }
        } catch (Exception $e) {
            $this->error("  [ERRO] Falha no banco: " . $e->getMessage());
        }

        // 4. Estrutura de pastas
        $paths = [
            'kore-api/app/controllers' => __DIR__ . '/../../../app/controllers',
            'kore-api/app/models' => __DIR__ . '/../../../app/models',
            'kore-api/app/traits' => __DIR__ . '/../../../app/traits',
            'kore-front/kore' => __DIR__ . '/../../../../kore-front/kore'
        ];

        foreach ($paths as $name => $path) {
            if (is_dir($path)) {
                $this->info("  [OK] Diretorio: $name");
            } else {
                $this->warn("  [AVISO] Diretorio ausente: $name");
            }
        }

        $this->line();
        $this->info("Diagnostico finalizado com sucesso!");
    }
}