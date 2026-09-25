<?php

class DevCommand extends Command
{
    protected string $description = "Inicia simultaneamente o servidor da API e do Frontend em modo desenvolvimento";

    public function handle(string $apiPort = "8000", string $frontPort = "3000"): void
    {
        $this->info("======================================================");
        $this->info("  Iniciando Kore Dev Server (Full-Stack Mode)");
        $this->info("======================================================");

        $baseDir = dirname(dirname(dirname(dirname(__DIR__))));
        $apiDir = is_dir($baseDir . '/kore-api') ? $baseDir . '/kore-api' : dirname(dirname(dirname(__DIR__)));
        $frontDir = $baseDir . '/kore-front';

        $hasFront = is_dir($frontDir);

        $this->info("  📡 API Backend : http://localhost:$apiPort");
        if ($hasFront) {
            $this->info("  🖥️  Frontend    : http://localhost:$frontPort");
        } else {
            $this->warn("  ℹ️  Frontend não detectado localmente (Modo Repositório de API Isolado)");
        }
        $this->info("");
        $this->info("Pressione Ctrl+C para encerrar.");
        $this->line();

        // Se for Windows
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            if ($hasFront) {
                $cmdFront = "start /B php -S localhost:$frontPort -t " . escapeshellarg($frontDir);
                pclose(popen($cmdFront, "r"));
            }
            passthru("php -S localhost:$apiPort -t " . escapeshellarg($apiDir));
        } else {
            // Linux/macOS
            if ($hasFront) {
                exec("php -S localhost:$frontPort -t " . escapeshellarg($frontDir) . " > /dev/null 2>&1 &");
            }
            passthru("php -S localhost:$apiPort -t " . escapeshellarg($apiDir));
        }

    }
}