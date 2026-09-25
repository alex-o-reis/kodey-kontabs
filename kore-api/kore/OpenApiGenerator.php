<?php

require_once __DIR__ . '/Kore.php';

class OpenApiGenerator
{
    public static function generate(): array
    {
        $appVersion = defined('APP_VERSION') ? APP_VERSION : (getenv('APP_VERSION') ?: '1.0.0');

        $spec = [
            'openapi' => '3.0.0',
            'info' => [
                'title' => 'Kore Framework REST API',
                'description' => 'Documentacao interativa OpenAPI gerada automaticamente por Reflection a partir dos Controllers do Kore Framework.',
                'version' => $appVersion,
                'contact' => [
                    'name' => Kore::AUTHOR,
                    'url' => 'https://kodey.com.br'
                ]
            ],
            'servers' => [
                [
                    'url' => '/',
                    'description' => 'Servidor Local'
                ]
            ],
            'paths' => [],
            'components' => [
                'securitySchemes' => [
                    'BearerAuth' => [
                        'type' => 'http',
                        'scheme' => 'bearer',
                        'bearerFormat' => 'Token'
                    ]
                ]
            ]
        ];

        $controllersDir = __DIR__ . '/../app/controllers';
        if (!is_dir($controllersDir)) {
            return $spec;
        }

        $files = scandir($controllersDir);

        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'php') {
                $controllerName = pathinfo($file, PATHINFO_FILENAME);
                $className = ucfirst($controllerName);

                require_once $controllersDir . '/' . $file;

                if (class_exists($className)) {
                    $reflection = new ReflectionClass($className);
                    $methods = $reflection->getMethods(ReflectionMethod::IS_PUBLIC);

                    $isProtected = false;
                    $defaultProps = $reflection->getDefaultProperties();
                    if (isset($defaultProps['middleware']) && is_array($defaultProps['middleware'])) {
                        $isProtected = in_array('AuthMiddleware', $defaultProps['middleware']);
                    }

                    foreach ($methods as $method) {
                        $mName = $method->getName();

                        if (str_starts_with($mName, '__') || in_array($mName, ['getMiddleware', 'getRequest', 'json', 'error', 'not_implemented'])) {
                            continue;
                        }

                        $httpVerb = 'get';
                        $routePath = '/' . strtolower($controllerName);
                        $hasIdParam = false;

                        if (in_array($mName, ['get', 'post', 'put', 'delete', 'patch'])) {
                            $httpVerb = strtolower($mName);
                            if ($httpVerb === 'get' || $httpVerb === 'put' || $httpVerb === 'delete' || $httpVerb === 'patch') {
                                $routePath .= '/{id}';
                                $hasIdParam = true;
                            }
                        } elseif (strpos($mName, '_') !== false) {
                            $parts = explode('_', $mName, 2);
                            $candidateVerb = strtolower($parts[0]);
                            if (in_array($candidateVerb, ['get', 'post', 'put', 'delete', 'patch'])) {
                                $httpVerb = $candidateVerb;
                                $routePath .= '/' . $parts[1];
                            } else {
                                continue;
                            }
                        } else {
                            continue;
                        }

                        if (!isset($spec['paths'][$routePath])) {
                            $spec['paths'][$routePath] = [];
                        }

                        $docComment = $method->getDocComment() ? trim(preg_replace('/[*\/\s]+/', ' ', $method->getDocComment())) : '';
                        $summary = $docComment ?: 'Executa acao ' . $mName . ' em ' . $className;

                        $operation = [
                            'tags' => [$className],
                            'summary' => $summary,
                            'responses' => [
                                '200' => [
                                    'description' => 'Operacao realizada com sucesso'
                                ],
                                '400' => [
                                    'description' => 'Requisicao invalida'
                                ]
                            ]
                        ];

                        if ($isProtected) {
                            $operation['security'] = [
                                ['BearerAuth' => []]
                            ];
                            $operation['responses']['401'] = [
                                'description' => 'Nao autorizado (Token ausente ou invalido)'
                            ];
                        }

                        if ($hasIdParam) {
                            $operation['parameters'] = [
                                [
                                    'name' => 'id',
                                    'in' => 'path',
                                    'required' => true,
                                    'description' => 'Identificador do recurso',
                                    'schema' => [
                                        'type' => 'string'
                                    ]
                                ]
                            ];
                        }

                        if (in_array($httpVerb, ['post', 'put', 'patch'])) {
                            $operation['requestBody'] = [
                                'required' => true,
                                'content' => [
                                    'application/json' => [
                                        'schema' => [
                                            'type' => 'object'
                                        ]
                                    ]
                                ]
                            ];
                        }

                        $spec['paths'][$routePath][$httpVerb] = $operation;
                    }
                }
            }
        }

        return $spec;
    }
}