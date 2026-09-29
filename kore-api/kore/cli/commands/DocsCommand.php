<?php

require_once __DIR__ . '/../../OpenApiGenerator.php';

class DocsCommand extends Command
{
    protected string $description = "Gera o arquivo openapi.json ou exibe a URL da documentacao Swagger";

    public function handle(string $action = "generate"): void
    {
        $spec = OpenApiGenerator::generate();
        $outputFile = dirname(dirname(dirname(__DIR__))) . '/openapi.json';

        file_put_contents($outputFile, json_encode($spec, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        $port = Env::get('APP_PORT', '8000');
        $this->info("======================================================");
        $this->info("  Documentacao OpenAPI / Swagger Gerada!");
        $this->info("======================================================");
        $this->info("  📁 Arquivo JSON : " . $outputFile);
        $this->info("  🌐 Swagger UI   : http://localhost:$port/docs");
        $this->info("  📄 OpenAPI Spec : http://localhost:$port/docs/json");
        $this->line();
    }
}