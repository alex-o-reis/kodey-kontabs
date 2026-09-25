<?php

class ServeCommand extends Command
{
    protected string $description = "Inicia o servidor embutido de desenvolvimento do PHP";

    /**
     * Inicia o servidor local
     */
    public function handle(string $port = "8000"): void
    {
        $dir = dirname(dirname(dirname(__DIR__)));
        $this->info("Iniciando servidor de desenvolvimento Kore API em http://localhost:$port");
        $this->info("Pressione Ctrl+C para encerrar.");
        passthru("php -S localhost:$port -t " . escapeshellarg($dir));
    }
}