<?php

class RoutesCommand extends Command
{
    protected string $description = "Lista todas as rotas e endpoints detectados via Reflection nos Controllers";

    public function handle(): void
    {
        $this->info("Mapeando rotas da API (Kore Reflection Router)...\n");

        $controllersDir = __DIR__ . '/../controllers';
        if (!is_dir($controllersDir)) {
            $this->warn("Diretorio de controllers nao encontrado.");
            return;
        }

        $files = scandir($controllersDir);
        $routes = [];

        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'php') {
                $controllerName = pathinfo($file, PATHINFO_FILENAME);
                $className = ucfirst($controllerName);

                require_once $controllersDir . '/' . $file;

                if (class_exists($className)) {
                    $reflection = new ReflectionClass($className);
                    $methods = $reflection->getMethods(ReflectionMethod::IS_PUBLIC);

                    foreach ($methods as $method) {
                        $mName = $method->getName();
                        
                        // Ignora métodos mágicos ou da classe base
                        if (str_starts_with($mName, '__') || in_array($mName, ['getMiddleware', 'getRequest', 'json', 'error', 'not_implemented'])) {
                            continue;
                        }

                        $httpVerb = 'GET';
                        $routePath = '/' . strtolower($controllerName);

                        if (in_array($mName, ['get', 'post', 'put', 'delete', 'patch'])) {
                            $httpVerb = strtoupper($mName);
                            if ($httpVerb === 'GET') {
                                $routePath .= '/{id?}';
                            }
                        } elseif (strpos($mName, '_') !== false) {
                            $parts = explode('_', $mName, 2);
                            $httpVerb = strtoupper($parts[0]);
                            if (in_array($httpVerb, ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])) {
                                $routePath .= '/' . $parts[1] . '/{id?}';
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                        }

                        $routes[] = [
                            'verb' => $httpVerb,
                            'path' => $routePath,
                            'handler' => $className . '::' . $mName . '()'
                        ];
                    }

                }
            }
        }

        if (empty($routes)) {
            $this->warn("Nenhuma rota encontrada.");
            return;
        }

        printf("  \033[33m%-8s %-32s %-25s\033[0m\n", "METODO", "ENDPOINT", "CONTROLLER");
        echo "  " . str_repeat("-", 68) . "\n";

        foreach ($routes as $r) {
            $verbColor = match($r['verb']) {
                'GET' => "\033[32m",
                'POST' => "\033[34m",
                'PUT', 'PATCH' => "\033[33m",
                'DELETE' => "\033[31m",
                default => "\033[37m"
            };
            printf("  %s%-8s\033[0m %-32s \033[36m%-25s\033[0m\n", $verbColor, $r['verb'], $r['path'], $r['handler']);
        }
        echo "\n";
    }
}