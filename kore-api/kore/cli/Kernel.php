<?php

require_once __DIR__ . '/../Kore.php';
require_once __DIR__ . '/Command.php';

class Kernel
{
    protected array $commandPaths = [];

    public function __construct()
    {
        $this->commandPaths = [
            __DIR__ . '/commands',
            __DIR__ . '/../commands',
            __DIR__ . '/../../app/commands',
            __DIR__ . '/../../../app/commands'
        ];
    }


    public function handle(array $argv): void
    {
        array_shift($argv); // remove script name
        $rawCommand = array_shift($argv) ?? 'help';

        if ($rawCommand === '--version' || $rawCommand === '-v') {
            $this->showVersion();
            return;
        }

        $parts = explode(':', $rawCommand);
        $className = ucfirst($parts[0]) . 'Command';
        $method = isset($parts[1]) ? str_replace('-', '_', $parts[1]) : 'handle';

        $class = $this->resolveCommandClass($className);

        if (!$class) {
            // Se nao encontrou pelo nome da classe, tenta HelpCommand ou execucao default
            if ($rawCommand === 'help') {
                $this->showHelp();
                return;
            }
            echo "\033[31mComando '" . $rawCommand . "' nao encontrado.\033[0m\n\n";
            $this->showHelp();
            return;
        }

        $instance = new $class();

        // Se o metodo especifico existir (ex: make:crud -> MakeCommand->crud())
        if (method_exists($instance, $method)) {
            call_user_func_array([$instance, $method], $argv);
            return;
        }

        // Se nao houver submetodo, mas tiver handle()
        if (method_exists($instance, 'handle')) {
            // se tinha uma segunda parte que nao era metodo, passa como argumento
            if (isset($parts[1])) {
                array_unshift($argv, $parts[1]);
            }
            call_user_func_array([$instance, 'handle'], $argv);
            return;
        }

        echo "\033[31mAcao '" . $method . "' nao encontrada no comando '" . $className . "'.\033[0m\n\n";
    }

    protected function resolveCommandClass(string $className): ?string
    {
        if (class_exists($className)) {
            return $className;
        }

        foreach ($this->commandPaths as $path) {
            if (!is_dir($path)) continue;

            $file = $path . '/' . $className . '.php';
            if (file_exists($file)) {
                require_once $file;
                if (class_exists($className)) {
                    return $className;
                }
            }
        }

        return null;
    }

    public function getAllCommands(): array
    {
        $commands = [];

        foreach ($this->commandPaths as $path) {
            if (!is_dir($path)) continue;

            $files = scandir($path);
            foreach ($files as $file) {
                if (str_ends_with($file, 'Command.php')) {
                    $className = pathinfo($file, PATHINFO_FILENAME);
                    require_once $path . '/' . $file;
                    if (class_exists($className)) {
                        $reflection = new ReflectionClass($className);
                        if ($reflection->isSubclassOf('Command')) {
                            $instance = new $className();
                            $prefix = strtolower(str_replace('Command', '', $className));

                            // Descobre metodos publicos da classe
                            $methods = $reflection->getMethods(ReflectionMethod::IS_PUBLIC);
                            foreach ($methods as $m) {
                                if ($m->getName() === 'handle') {
                                    $commands[$prefix] = $instance->getDescription() ?: 'Executa o comando ' . $prefix;
                                } elseif (!in_array($m->getName(), ['getName', 'getDescription', '__construct'])) {
                                    $doc = $m->getDocComment() ? trim(preg_replace('/[*\/\s]+/', ' ', $m->getDocComment())) : '';
                                    $commands[$prefix . ':' . $m->getName()] = $doc ?: 'Acao ' . $m->getName() . ' de ' . $prefix;
                                }
                            }
                        }
                    }
                }
            }
        }

        return $commands;
    }

    public function showVersion(): void
    {
        $appVersion = defined('APP_VERSION') ? APP_VERSION : (getenv('APP_VERSION') ?: '1.0.0');
        echo "======================================================\n";
        echo "  " . Kore::NAME . "\n";
        echo "  Framework Version : \033[32m" . Kore::VERSION . "\033[0m\n";
        echo "  App Version       : \033[36m" . $appVersion . "\033[0m\n";
        echo "  Authors           : " . Kore::AUTHOR . "\n";
        echo "======================================================\n\n";
    }

    public function showHelp(): void
    {
        $this->showVersion();
        echo "\033[33mUso:\033[0m\n";
        echo "  kore <comando> [opcoes] [argumentos]\n\n";
        echo "\033[33mComandos disponiveis:\033[0m\n";

        $commands = $this->getAllCommands();
        ksort($commands);

        foreach ($commands as $name => $desc) {
            printf("  \033[32m%-24s\033[0m %s\n", $name, $desc);
        }
        echo "\n";
    }
}