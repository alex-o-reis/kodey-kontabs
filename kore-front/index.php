<?php
require_once __DIR__ . '/environment.php';
$version = 'v=' . KORE_VERSION . '&t=' . time(); // Cache busting para assets durante desenvolvimento/deploy

// URLs Absolutas Canônicas para Open Graph e Compartilhamento Social (WhatsApp, Facebook, Twitter, LinkedIn)
$baseUrl = rtrim(FRONTEND_URL, '/');
$canonicalUrl = $baseUrl . '/';
$ogSquareUrl = $baseUrl . '/app/assets/logos/og-whatsapp.png'; // 800x800 (1:1 perfeito para WhatsApp e Telegram)
$ogWideUrl = $baseUrl . '/app/assets/logos/og-image.png';       // 1200x630 (1.91:1 para Twitter, LinkedIn e Facebook)
$appleIconUrl = $baseUrl . '/app/assets/logos/og-icon.png';
$siteTitle = 'Kodey Kontabs — Cada real com uma origem. Cada real com um destino.';
$shareTitle = 'Kodey Kontabs — Finanças Inteligentes';
$shareDescription = 'Cada real com uma origem. Cada real com um destino. Gestão financeira inteligente, envelopes orçamentários e fluxo protegido.';
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?=htmlspecialchars($siteTitle)?></title>

    <!-- Meta Tags Primárias & SEO -->
    <meta name="description" content="<?=htmlspecialchars($shareDescription)?>">
    <meta name="keywords" content="kontabs, finanças pessoais, controle financeiro, gestão financeira, fluxo de caixa, envelopes de gastos, kodey sistemas, planejamento financeiro">
    <meta name="author" content="Kodey Sistemas">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="<?=htmlspecialchars($canonicalUrl)?>">
    <meta name="theme-color" content="#0E5A4F">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Kodey Kontabs">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <!-- Open Graph / WhatsApp / Facebook / Telegram (1:1 Square Primário para evitar cortes no WhatsApp) -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?=htmlspecialchars($canonicalUrl)?>">
    <meta property="og:title" content="<?=htmlspecialchars($shareTitle)?>">
    <meta property="og:description" content="<?=htmlspecialchars($shareDescription)?>">
    <meta property="og:image" content="<?=htmlspecialchars($ogSquareUrl)?>">
    <meta property="og:image:secure_url" content="<?=htmlspecialchars($ogSquareUrl)?>">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="800">
    <meta property="og:image:height" content="800">
    <meta property="og:image:alt" content="Kodey Kontabs — Cada real com uma origem. Cada real com um destino.">
    <meta property="og:site_name" content="Kodey Kontabs">
    <meta property="og:locale" content="pt_BR">

    <!-- Versão Alternativa Widescreen (1200x630 para redes que preferem 1.91:1) -->
    <meta property="og:image" content="<?=htmlspecialchars($ogWideUrl)?>">
    <meta property="og:image:secure_url" content="<?=htmlspecialchars($ogWideUrl)?>">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter Card / X -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="<?=htmlspecialchars($canonicalUrl)?>">
    <meta name="twitter:title" content="<?=htmlspecialchars($shareTitle)?>">
    <meta name="twitter:description" content="<?=htmlspecialchars($shareDescription)?>">
    <meta name="twitter:image" content="<?=htmlspecialchars($ogWideUrl)?>">
    <meta name="twitter:image:alt" content="Kodey Kontabs — Gestão Financeira Inteligente">

    <!-- Favicons & App Icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="app/assets/logos/app-icon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="app/assets/logos/app-icon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="<?=htmlspecialchars($appleIconUrl)?>">

    <!-- Bootstrap 5.3 & Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.bootstrap5.min.css">
    
    <!-- Kontabs Design System Style (Powered by Kore Framework) -->
    <link rel="stylesheet" href="templates/kontabs/css/kontabs.css?<?=$version?>">

    <!-- Google Identity Services (GIS) para Registro e Login Google Oficial -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
    <div class="conteudo-principal">
        <!-- Template carregado dinamicamente -->
    </div>

    <!-- Scripts Core Vendors -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.bootstrap5.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"></script>

    <!-- Kore Framework (kore/) -->
    <script src="kore/js/kore.js?<?=$version?>"></script>
    <script src="kore/js/cookies.js?<?=$version?>"></script>
    <script src="kore/js/Style.js?<?=$version?>"></script>
    <script src="kore/renderers/base-renderer.js?<?=$version?>"></script>
    <script src="kore/renderers/bootstrap.js?<?=$version?>"></script>
    <script src="kore/js/ui.js?<?=$version?>"></script>

    <script src="kore/js/kodey-charts.js?<?=$version?>"></script>
    <script src="kore/js/smartbox.js?<?=$version?>"></script>
    <script src="kore/js/model.js?<?=$version?>"></script>
    <script src="kore/js/datatable.js?<?=$version?>"></script>
    <script src="kore/js/controller.js?<?=$version?>"></script>
    <script src="kore/js/view.js?<?=$version?>"></script>
    <script src="kore/js/template.js?<?=$version?>"></script>
    <script src="kore/js/router.js?<?=$version?>"></script>

    <!-- Configuração Dinâmica da API Backend via Ambiente (Local vs Produção Online) -->
    <script>
        window.KONTABS_API_URL = <?=json_encode(rtrim(API_URL, '/') . '/')?>;
        window.KONTABS_IS_LOCAL = <?=json_encode(IS_LOCAL)?>;
        window.KONTABS_FRONTEND_URL = <?=json_encode(FRONTEND_URL)?>;
        window.KONTABS_GOOGLE_CLIENT_ID = <?=json_encode(defined('GOOGLE_CLIENT_ID') ? GOOGLE_CLIENT_ID : '')?>;
    </script>

    <!-- Configuração do Usuário (app/config.js) -->
    <script src="app/config.js?<?=$version?>"></script>

    <!-- Auto-inclusão de arquivos da aplicação do usuário (app/) -->
    <?php
    function includeUserScripts($dir, $version) {
        if (!is_dir($dir)) return;
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                includeUserScripts($path, $version);
            } elseif (pathinfo($path, PATHINFO_EXTENSION) === 'js') {
                $relative = str_replace('\\', '/', $path);
                echo "<script src=\"$relative?$version\"></script>\n";
            }
        }
    }
    includeUserScripts('app/renderers', $version);
    includeUserScripts('app/services', $version);
    includeUserScripts('app/components', $version);
    includeUserScripts('app/models', $version);
    includeUserScripts('app/controllers', $version);
    includeUserScripts('app/views', $version);
    ?>

    <script>
        // Inicialização do Template e Router do Kontabs
        jQuery(document).ready(function() {
            // Se usuário não está autenticado e está na raiz ou páginas protegidas, direciona para login/registro
            const currentHash = window.location.hash;
            const token = localStorage.getItem('kontabs_token');
            const isAuthRoute = currentHash === '#/login' || currentHash === '#/register';

            if (!token && !isAuthRoute) {
                // Primeira visita: redireciona para a tela de login/registro
                window.location.hash = '#/login';
            }

            let templateLoader = new Template();
            templateLoader.getTemplate('main', 'templates/kontabs/template.html?<?=$version?>', function(html) {
                jQuery('.conteudo-principal').html(html);
                
                // Inicializa o roteador do Kore e monta o menu
                router.init(KoreConfig.ROUTES, KoreConfig.MENU);
                jQuery('.kore-menu-container').html(router.createMenu(KoreConfig.MENU));
                router.executeRoute();
                
                // Atualiza perfil e organizações reais do usuário na interface
                if (typeof KontabsUI !== 'undefined') {
                    if (KontabsUI.initUserDisplay) KontabsUI.initUserDisplay();
                    if (KontabsUI.initOrganizations) KontabsUI.initOrganizations();
                }

                // Dispara tutorial automático se for primeiro acesso
                if (typeof KontabsTutorial !== 'undefined' && KontabsTutorial.checkAutoStart) {
                    setTimeout(() => KontabsTutorial.checkAutoStart(), 800);
                }
            });
        });
    </script>
</body>
</html>