/**
 * KoreConfig — Configuração Oficial do Frontend Kodey Kontabs
 * Powered by Kore Framework (KKF)
 * Suporte automático a Localhost e Produção Online (kontabs.kodey.com.br -> kontabsapi.kodey.com.br)
 */
const isBrowserEnv = typeof window !== 'undefined' && window.location;
const isLocalHostEnv = isBrowserEnv ? (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1' ||
    window.location.hostname.endsWith('.local') ||
    window.location.hostname.endsWith('.test')
) : false;

const resolvedApiUrl = (isBrowserEnv && window.KONTABS_API_URL) ?
    window.KONTABS_API_URL :
    (isLocalHostEnv ? 'http://localhost:8000/' : 'https://kontabsapi.kodey.com.br/');

const KoreConfig = {
    APP_NAME: 'Kodey Kontabs',
    TAGLINE: 'Cada real com uma origem. Cada real com um destino.',
    API_URL: resolvedApiUrl,
    IS_LOCAL: isLocalHostEnv,
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
        { url: '#/login', controller: 'LoginController' },
        { url: '#/register', controller: 'LoginController' }
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
        { title: 'Relatórios', url: '#/relatorios', icon: 'bi-bar-chart-line-fill', type: 'item' }
    ]
};