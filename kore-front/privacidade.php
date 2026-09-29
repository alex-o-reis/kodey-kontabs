<?php
if (function_exists('opcache_reset')) {
    @opcache_reset();
}
require_once __DIR__ . '/environment.php';
$version = 'v=' . KORE_VERSION . '&t=' . time();
$baseUrl = rtrim(FRONTEND_URL, '/');
// Debug Info: API_URL=[<?=API_URL?>] IS_LOCAL=[<?=IS_LOCAL ? 'true' : 'false'?>] ENV_MTIME=[<?=filemtime(__DIR__ . '/environment.php')?>]
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidade — Kodey Kontabs</title>
    <link rel="icon" type="image/png" href="app/assets/logos/app-icon.png">

    <!-- Bootstrap 5.3 & Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@700;800&display=swap" rel="stylesheet">

    <!-- Kontabs Design Style -->
    <link rel="stylesheet" href="templates/kontabs/css/kontabs.css?<?=$version?>">

    <style>
        body {
            background-color: var(--kk-cream, #FFF9EE);
            color: #1f2937;
            font-family: 'Inter', sans-serif;
            line-height: 1.7;
        }
        .policy-container {
            max-width: 860px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .policy-card {
            background: #ffffff;
            border-radius: 20px;
            padding: 48px;
            box-shadow: 0 10px 30px rgba(14, 90, 79, 0.06);
            border: 1px solid rgba(14, 90, 79, 0.08);
        }
        h1, h2, h3, h4 {
            font-family: 'Nunito', sans-serif;
            font-weight: 800;
            color: var(--kk-green-700, #0E5A4F);
        }
        .highlight-box {
            background: var(--kk-mint-100, #D1F2E0);
            border-left: 4px solid var(--kk-green-600, #0F7A4A);
            padding: 16px 20px;
            border-radius: 8px;
            margin: 24px 0;
            font-size: 0.95rem;
        }
        .section-divider {
            height: 1px;
            background: #e5e7eb;
            margin: 32px 0;
        }
        @media (max-width: 768px) {
            .policy-card {
                padding: 24px;
            }
        }
    </style>
</head>
<body>

    <div class="policy-container">
        <!-- Top Bar com Logo e Voltar -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <a href="<?=$baseUrl?>/#/login" class="text-decoration-none">
                <img src="app/assets/logos/logo-horizontal.png" alt="Kodey Kontabs" style="height: 48px; object-fit: contain;">
            </a>
            <a href="<?=$baseUrl?>/#/login" class="btn btn-kontabs-outline btn-sm px-3">
                <i class="bi bi-arrow-left me-1"></i> Voltar ao Kontabs
            </a>
        </div>

        <div class="policy-card">
            <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge rounded-pill bg-success-subtle text-success fw-bold px-3 py-1">LGPD & Privacidade de Dados</span>
                <span class="text-muted small">Última atualização: 29 de setembro de 2026</span>
            </div>

            <h1 class="mb-3">Política de Privacidade</h1>
            <p class="lead text-muted fs-6">
                A sua privacidade e a proteção de suas informações financeiras são o alicerce fundamental do <strong>Kodey Kontabs</strong>, desenvolvido e mantido pela <strong>Kodey Sistemas</strong>.
            </p>

            <div class="highlight-box">
                <strong><i class="bi bi-shield-check text-success me-1"></i> O Princípio Kontabs:</strong>
                Seus dados financeiros pertencem exclusivamente a você. Eles são confidenciais, protegidos por criptografia de ponta a ponta e jamais serão comercializados, compartilhados ou utilizados para fins publicitários.
            </div>

            <h3 class="mt-4 mb-3">1. Informações Coletadas</h3>
            <p>O Kodey Kontabs coleta apenas as informações estritamente necessárias para a prestação dos serviços de gestão financeira:</p>
            <ul>
                <li><strong>Dados de Identificação e Cadastro:</strong> Nome completo, endereço de e-mail e foto/avatar de perfil (quando fornecida voluntariamente ou via login social).</li>
                <li><strong>Dados Financeiros Inseridos pelo Usuário:</strong> Contas bancárias, categorias personalizadas, movimentações de receitas e despesas, compras no cartão de crédito, metas e reservas patrimoniais.</li>
                <li><strong>Metadados Técnicos:</strong> Endereço IP, tipo de navegador, registros de data/hora de acesso e identificadores de sessão com a finalidade exclusiva de segurança e auditoria contra acessos não autorizados.</li>
            </ul>

            <div class="section-divider"></div>

            <h3 class="mb-3">2. Uso de Dados de Autenticação do Google (Google OAuth)</h3>
            <p>
                Quando você opta por se registrar ou acessar o Kontabs utilizando sua <strong>Conta do Google</strong> (via <em>Google Identity Services - GIS</em>):
            </p>
            <ul>
                <li>Acessamos exclusivamente suas informações públicas básicas: <strong>Nome</strong>, <strong>Endereço de E-mail</strong> e <strong>Identificador do Google (Google ID)</strong> para autenticar sua identidade com rapidez e segurança.</li>
                <li><strong>Não solicitamos nem acessamos</strong> e-mails do Gmail, arquivos do Google Drive, contatos ou qualquer outro dado pessoal fora do escopo estrito de autenticação de perfil.</li>
                <li>O uso de informações recebidas de APIs do Google está em estrita conformidade com a <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" class="text-success text-decoration-none fw-semibold">Política de Dados do Usuário dos Serviços de API do Google</a>.</li>
            </ul>

            <div class="section-divider"></div>

            <h3 class="mb-3">3. Finalidade do Tratamento de Dados</h3>
            <p>Os dados tratados destinam-se única e exclusivamente a:</p>
            <ol>
                <li>Permitir o cálculo dinâmico de liquidez, projeção futura de caixa e saldo livre ("sem destino");</li>
                <li>Apresentar a gestão de envelopes orçamentários mensais e ritmo diário seguro;</li>
                <li>Emitir relatórios gerenciais e demonstrativos (DRE e extratos);</li>
                <li>Garantir a segurança patrimonial por meio do isolamento rigoroso entre contas (<em>multi-tenancy</em>), impedindo que dados de uma conta sejam visíveis para outra.</li>
            </ol>

            <div class="section-divider"></div>

            <h3 class="mb-3">4. Segurança e Criptografia</h3>
            <p>
                Adotamos os mais rigorosos padrões da indústria de tecnologia para proteger seus dados:
            </p>
            <ul>
                <li>Transmissão criptografada de dados através de protocolo seguro <strong>HTTPS / TLS 1.3</strong>;</li>
                <li>Senhas de acesso armazenadas com algoritmo de hash criptográfico unidirecional seguro (<em>bcrypt</em>);</li>
                <li>Isolamento estrito a nível de banco de dados entre organizações de usuários;</li>
                <li>Sessões autenticadas gerenciadas por tokens individuais expiráveis.</li>
            </ul>

            <div class="section-divider"></div>

            <h3 class="mb-3">5. Seus Direitos (LGPD — Lei Geral de Proteção de Dados)</h3>
            <p>
                Em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), você possui o direito de:
            </p>
            <ul>
                <li>Confirmar a existência de tratamento e acessar integralmente seus dados;</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados diretamente na plataforma;</li>
                <li>Exportar seus dados e movimentações a qualquer momento em formatos abertos (CSV);</li>
                <li>Solicitar a revogação do consentimento e a exclusão definitiva de sua conta e histórico financeiro.</li>
            </ul>

            <div class="section-divider"></div>

            <h3 class="mb-3">6. Contato com o Encarregado de Dados (DPO)</h3>
            <p>
                Se você tiver dúvidas, solicitações ou quiser exercer seus direitos de privacidade, entre em contato com nossa equipe oficial:
            </p>
            <div class="p-3 bg-light rounded-3 border">
                <strong>Kodey Sistemas</strong><br>
                E-mail para suporte e privacidade: <a href="mailto:suporte@kodey.com.br" class="text-success text-decoration-none fw-semibold">suporte@kodey.com.br</a><br>
                Website oficial: <a href="https://kodey.com.br" target="_blank" class="text-success text-decoration-none fw-semibold">https://kodey.com.br</a>
            </div>
        </div>

        <!-- Rodapé simples -->
        <div class="text-center text-muted small mt-4">
            <strong>Kodey Kontabs</strong> &copy; 2026. Um produto oficial da <a href="https://kodey.com.br" target="_blank" class="text-success text-decoration-none">Kodey Sistemas</a>.
        </div>
    </div>

</body>
</html>
