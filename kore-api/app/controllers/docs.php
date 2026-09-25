<?php

require_once __DIR__ . '/../../kore/Controller.php';
require_once __DIR__ . '/../../kore/OpenApiGenerator.php';

class Docs extends Controller
{
    public function get($type = null)
    {
        if ($type === 'json' || $type === 'openapi.json') {
            return $this->json(OpenApiGenerator::generate());
        }

        // Renderiza interface Swagger UI
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Kore Framework - API Documentation (Swagger)</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
        body { margin: 0; padding: 0; background: #fafafa; }
        .topbar { display: none !important; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle({
                url: "/docs/json",
                dom_id: "#swagger-ui",
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout",
                deepLinking: true
            });
        };
    </script>
</body>
</html>';
        exit;
    }
}