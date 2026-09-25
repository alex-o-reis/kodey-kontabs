<?php

class NewCommand extends Command
{
    protected string $description = "Cria um novo projeto baseado no Kore Framework";

    public function handle(?string $projectName = null): void
    {
        if (!$projectName) {
            $this->error("Erro: Informe o nome da pasta do novo projeto.");
            $this->line("Exemplo: kore new meu-app");
            return;
        }

        $targetDir = getcwd() . DIRECTORY_SEPARATOR . $projectName;

        if (is_dir($targetDir) && count(scandir($targetDir)) > 2) {
            $this->error("Erro: O diretório '$projectName' já existe e não está vazio.");
            return;
        }

        $this->info("======================================================");
        $this->info("  Criando novo projeto Kore Framework: $projectName");
        $this->info("======================================================");

        $zipUrl = "https://github.com/alex-o-reis/kore-framework/archive/refs/heads/main.zip";
        $tempZip = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "kore_" . uniqid() . ".zip";
        $tempExtract = sys_get_temp_dir() . DIRECTORY_SEPARATOR . "kore_extracted_" . uniqid();

        $this->line("Baixando a versão mais recente do Kore Framework...");

        $options = [
            "http" => [
                "method" => "GET",
                "header" => "User-Agent: Kore-CLI/1.0\r\n"
            ]
        ];
        $context = stream_context_create($options);
        $zipData = @file_get_contents($zipUrl, false, $context);

        if (!$zipData) {
            $this->error("Erro ao baixar o template do GitHub ($zipUrl).");
            return;
        }

        file_put_contents($tempZip, $zipData);

        $this->line("Extraindo arquivos...");
        $zip = new ZipArchive();
        if ($zip->open($tempZip) === TRUE) {
            $zip->extractTo($tempExtract);
            $zip->close();
            @unlink($tempZip);
        } else {
            $this->error("Erro ao descompactar os arquivos temporários.");
            @unlink($tempZip);
            return;
        }

        $extractedFolders = scandir($tempExtract);
        $sourceDir = null;
        foreach ($extractedFolders as $folder) {
            if ($folder !== '.' && $folder !== '..' && is_dir($tempExtract . DIRECTORY_SEPARATOR . $folder)) {
                $sourceDir = $tempExtract . DIRECTORY_SEPARATOR . $folder;
                break;
            }
        }

        if (!$sourceDir) {
            $this->error("Erro ao localizar pasta extraída do framework.");
            return;
        }

        $this->copyDirectory($sourceDir, $targetDir);
        $this->deleteDirectory($tempExtract);

        // Inicializa o banco de dados padrão SQLite se necessário
        $dbDir = $targetDir . DIRECTORY_SEPARATOR . 'kore-api' . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'database';
        if (!is_dir($dbDir)) {
            @mkdir($dbDir, 0777, true);
        }

        // Garante existência do arquivo .env a partir de .env.example
        $envExample = $targetDir . DIRECTORY_SEPARATOR . 'kore-api' . DIRECTORY_SEPARATOR . '.env.example';
        $envTarget = $targetDir . DIRECTORY_SEPARATOR . 'kore-api' . DIRECTORY_SEPARATOR . '.env';
        if (file_exists($envExample) && !file_exists($envTarget)) {
            @copy($envExample, $envTarget);
        }

        $this->info("\n✅ Projeto '$projectName' criado com sucesso!");
        $this->line("\nPróximos passos:");
        $this->line("  \033[33mcd $projectName\033[0m");
        $this->line("  \033[33mkore seed\033[0m         (Popula o banco SQLite inicial)");
        $this->line("  \033[33mkore dev\033[0m          (Inicia a API na 8000 e o Front na 3000)\n");
    }

    protected function copyDirectory(string $src, string $dst): void
    {
        $dir = opendir($src);
        @mkdir($dst, 0777, true);

        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..') && ($file != '.git')) {
                if (is_dir($src . DIRECTORY_SEPARATOR . $file)) {
                    $this->copyDirectory($src . DIRECTORY_SEPARATOR . $file, $dst . DIRECTORY_SEPARATOR . $file);
                } else {
                    copy($src . DIRECTORY_SEPARATOR . $file, $dst . DIRECTORY_SEPARATOR . $file);
                }
            }
        }
        closedir($dir);
    }

    protected function deleteDirectory(string $dir): void
    {
        if (!is_dir($dir)) return;
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            (is_dir("$dir/$file")) ? $this->deleteDirectory("$dir/$file") : @unlink("$dir/$file");
        }
        @rmdir($dir);
    }
}
