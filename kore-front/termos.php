<?php
require_once __DIR__ . '/environment.php';
$version = 'v=' . KORE_VERSION . '&t=' . time();
$baseUrl = rtrim(FRONTEND_URL, '/');
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Termos de Uso — Kodey Kontabs</title>
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
        .terms-container {
            max-width: 860px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .terms-card {
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
            .terms-card {
                padding: 24px;
            }
        }
    </style>
</head>
<body>

    <div class="terms-container">
        <!-- Top Bar com Logo e Voltar -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <a href="<?=$baseUrl?>/#/login" class="text-decoration-none">
                <img src="app/assets/logos/logo-horizontal.png" alt="Kodey Kontabs" style="height: 48px; object-fit: contain;">
            </a>
            <a href="<?=$baseUrl?>/#/login" class="btn btn-kontabs-outline btn-sm px-3">
                <i class="bi bi-arrow-left me-1"></i> Voltar ao Kontabs
            </a>
        </div>

        <div class="terms-card">
            <div class="d-flex align-items-center gap-2 mb-2">
                <span class="badge rounded-pill bg-success-subtle text-success fw-bold px-3 py-1">Termos de Serviço</span>
                <span class="text-muted small">Última atualização: 29 de setembro de 2026</span>
            </div>

            <h1 class="mb-3">Termos de Uso</h1>
            <p class="lead text-muted fs-6">
                Bem-vindo ao <strong>Kodey Kontabs</strong>. Ao criar uma conta ou utilizar os nossos serviços, você concorda expressamente com estes Termos de Uso.
            </p>

            <div class="highlight-box">
                <strong><i class="bi bi-info-circle text-success me-1"></i> Propósito do Kontabs:</strong>
                O Kontabs é uma plataforma de controle e inteligência financeira que ajuda você e sua empresa a organizarem receitas, despesas, envelopes orçamentários e metas, sob a premissa de que "todo real deve ter uma origem e um destino".
            </div>

            <h3 class="mt-4 mb-3">1. Cadastro e Responsabilidades da Conta</h3>
            <p>
                Para acessar as funcionalidades do Kontabs, o usuário deve criar uma conta utilizando credenciais próprias ou autenticação autorizada do Google. O usuário é o único responsável pela guarda e confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
            </p>

            <div class="section-divider"></div>

            <h3 class="mb-3">2. Natureza da Plataforma</h3>
            <p>
                O Kontabs é uma ferramenta tecnológica de apoio à gestão financeira gerencial e planejamento. O sistema:
            </p>
            <ul>
                <li><strong>Não é uma instituição financeira</strong>, nem realiza intermediação financeira, empréstimos, custódia de valores ou assessoria de investimentos com garantia de retorno.</li>
                <li>Os cálculos de liquidez, projeção de fechamento e envelopes orçamentários são projeções matemáticas baseadas estritamente nos lançamentos informados pelo usuário.</li>
            </ul>

            <div class="section-divider"></div>

            <h3 class="mb-3">3. Propriedade Intelectual</h3>
            <p>
                O software, as interfaces, elementos gráficos, logotipos, mascotes e a tecnologia proprietária do Kodey Kontabs e do Kore Framework são de propriedade exclusiva da <strong>Kodey Sistemas</strong>. É concedida ao usuário uma licença de uso pessoal ou corporativo, intransferível e não exclusiva.
            </p>

            <div class="section-divider"></div>

            <h3 class="mb-3">4. Confidencialidade e Dados</h3>
            <p>
                A Kodey Sistemas compromete-se a manter total sigilo sobre os dados financeiros inseridos. As informações de um usuário jamais serão compartilhadas com outros usuários ou comercializadas para terceiros, em total conformidade com a nossa <a href="privacidade.php" class="text-success text-decoration-none fw-semibold">Política de Privacidade</a>.
            </p>

            <div class="section-divider"></div>

            <h3 class="mb-3">5. Encerramento e Cancelamento</h3>
            <p>
                O usuário pode interromper o uso do sistema ou solicitar o cancelamento e exclusão de sua conta a qualquer momento, sem ônus, por meio do suporte oficial.
            </p>

            <div class="section-divider"></div>

            <h3 class="mb-3">6. Contato e Suporte</h3>
            <p>
                Para dúvidas jurídicas ou suporte aos termos de uso, fale com a <strong>Kodey Sistemas</strong> através do e-mail <a href="mailto:suporte@kodey.com.br" class="text-success text-decoration-none fw-semibold">suporte@kodey.com.br</a>.
            </p>
        </div>

        <!-- Rodapé simples -->
        <div class="text-center text-muted small mt-4">
            <strong>Kodey Kontabs</strong> &copy; 2026. Um produto oficial da <a href="https://kodey.com.br" target="_blank" class="text-success text-decoration-none">Kodey Sistemas</a>.
        </div>
    </div>

</body>
</html>
