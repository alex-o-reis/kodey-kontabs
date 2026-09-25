/**
 * KoreConfig — Configuração Oficial do Frontend Kodey Kontabs
 * Powered by Kore Framework (KKF)
 */
const KoreConfig = {
    APP_NAME: 'Kodey Kontabs',
    TAGLINE: 'Cada real com uma origem. Cada real com um destino.',
    API_URL: 'http://localhost:8000/',
    DEFAULT_ROUTE: '#/',

    // Rotas da Aplicação Kontabs
    ROUTES: [
        { url: '#/', controller: 'DashboardController' },
        { url: '#/meu-mes', controller: 'MeuMesController' },
        { url: '#/movimentacoes', controller: 'MovimentacoesController' },
        { url: '#/contas', controller: 'ContasController' },
        { url: '#/planejamento', controller: 'PlanejamentoController' },
        { url: '#/financeiro', controller: 'FinanceiroController' },
        { url: '#/checkup', controller: 'CheckupController' },
        { url: '#/relatorios', controller: 'RelatoriosController' },
        { url: '#/showcase', controller: 'ShowcaseController' },
        { url: '#/login', controller: 'LoginController' }
    ],

    // Menu Lateral Oficial do Kontabs
    MENU: [
        { title: 'Dashboard', url: '#/', icon: 'bi-grid-1x2-fill', type: 'item' },
        { title: 'Meu Mês', url: '#/meu-mes', icon: 'bi-calendar2-check-fill', type: 'item' },
        { title: 'Movimentações', url: '#/movimentacoes', icon: 'bi-arrow-left-right', type: 'item' },
        { title: 'Contas & Cartões', url: '#/contas', icon: 'bi-wallet2', type: 'item' },
        { title: 'Planejamento & Metas', url: '#/planejamento', icon: 'bi-piggy-bank-fill', type: 'item' },
        { title: 'Financeiro', url: '#/financeiro', icon: 'bi-cash-coin', type: 'item' },
        { title: 'Check-up Semanal', url: '#/checkup', icon: 'bi-shield-check', type: 'item' },
        { title: 'Relatórios', url: '#/relatorios', icon: 'bi-bar-chart-line-fill', type: 'item' },
        { title: 'UI Showcase', url: '#/showcase', icon: 'bi-palette2', type: 'item' }
    ]
};