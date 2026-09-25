/**
 * MeuMesView — Visão "Meu Mês" do Kodey Kontabs
 * Uma das áreas centrais do produto: foco em clareza, previsões e insights acolhedores.
 * 100% responsiva utilizando o grid do Bootstrap.
 */
class MeuMesView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('Meu Mês');

        // Seletor de Mês e Resumo
        let monthHeader = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div class="d-flex align-items-center gap-3">
                    <div class="btn-group shadow-sm">
                        <button class="btn btn-sm btn-kontabs-outline"><i class="bi bi-chevron-left"></i></button>
                        <button class="btn btn-sm btn-kontabs-dark px-3 fw-bold">Setembro de 2026</button>
                        <button class="btn btn-sm btn-kontabs-outline"><i class="bi bi-chevron-right"></i></button>
                    </div>
                    <span class="badge bg-success-subtle text-success fs-xs fw-bold px-3 py-2 rounded-pill">Mês em andamento (Dia 25/30)</span>
                </div>
                <div>
                    <button class="btn btn-kontabs-secondary" onclick="window.location.hash='#/relatorios'">
                        <i class="bi bi-file-earmark-bar-graph me-1"></i> Relatório Completo
                    </button>
                </div>
            </div>
        `;

        // 1. Grid Bootstrap dos 4 KPIs (4 colunas no desktop, 2 no tablet, 1 no mobile)
        let statsRow = `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Recebi até agora", "R$ 12.400,00", "+R$ 2.100", "info", "Previsto total: R$ 14.500", "app/assets/illustrations/coin-happy.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Gastei até agora", "R$ 8.930,00", "R$ 1.250 a pagar", "warning", "Previsto total: R$ 10.180", "app/assets/illustrations/receipt-happy.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Reservei & Investi", "R$ 2.800,00", "Meta batida!", "success", "R$ 2.000 res. + R$ 800 inv.", "app/assets/illustrations/chart-growth.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Previsão Fechamento", "R$ 1.520,00", "Positivo 🟢", "success", "Saldo livre projetado", "app/assets/illustrations/wallet-green.png")}
                </div>
            </div>
        `;

        // 2. Seção Central no Grid Bootstrap (8 colunas para tabela, 4 colunas para gráfico e balanço)
        let catHeaders = ["Categoria", "Previsto", "Realizado", "Diferença", "Progresso", "Situação"];
        let catRows = [
            [
                `<strong>Moradia</strong> <span class="text-muted small d-block">Aluguel, Energia, Água</span>`,
                `R$ 2.400,00`,
                `R$ 2.352,00`,
                `<span class="text-success fw-bold">- R$ 48,00</span>`,
                KontabsUI.progress("p-moradia", 2352, 2400, "", "success"),
                KontabsUI.status("efetivado", "No plano")
            ],
            [
                `<strong>Alimentação</strong> <span class="text-muted small d-block">Mercado, Feira, Delivery</span>`,
                `R$ 1.800,00`,
                `R$ 2.030,00`,
                `<span class="text-danger fw-bold">+ R$ 230,00</span>`,
                KontabsUI.progress("p-alimentacao", 2030, 1800, "", "warning"),
                `<span class="pill pill-warning">Atenção</span>`
            ],
            [
                `<strong>Transporte</strong> <span class="text-muted small d-block">Combustível, IPVA</span>`,
                `R$ 900,00`,
                `R$ 780,00`,
                `<span class="text-success fw-bold">- R$ 120,00</span>`,
                KontabsUI.progress("p-transporte", 780, 900, "", "success"),
                KontabsUI.status("efetivado", "No plano")
            ],
            [
                `<strong>Reserva de Emergência</strong> <span class="text-muted small d-block">Aporte Mensal</span>`,
                `R$ 2.000,00`,
                `R$ 2.000,00`,
                `<span class="text-muted">R$ 0,00</span>`,
                KontabsUI.progress("p-reserva", 2000, 2000, "", "success"),
                `<span class="pill pill-efetivado">100%</span>`
            ],
            [
                `<strong>Investimentos</strong> <span class="text-muted small d-block">Longo Prazo</span>`,
                `R$ 800,00`,
                `R$ 800,00`,
                `<span class="text-muted">R$ 0,00</span>`,
                KontabsUI.progress("p-invest", 800, 800, "", "success"),
                `<span class="pill pill-efetivado">100%</span>`
            ]
        ];

        let catTableHtml = KontabsUI.table(catHeaders, catRows);
        let budgetCard = KontabsUI.card("Orçamento por Categoria — Previsto x Realizado", catTableHtml);

        let chartCard = KontabsUI.card(
            "Distribuição dos Gastos",
            `
            ${UI.chart("chart-meu-mes-rosca", {
                type: "doughnut",
                labels: ["Moradia", "Alimentação", "Transporte", "Reserva", "Investimentos"],
                showLegend: true,
                series: [
                    { name: "Gastos", data: [2352, 2030, 780, 2000, 800] }
                ]
            })}
            <div class="mt-3 pt-3 border-top text-center text-muted small">
                Total Comprometido no Mês: <strong>R$ 7.962,00</strong>
            </div>
            `
        );

        let mainGridRow = `
            <div class="row g-4 mb-4">
                <div class="col-12 col-xl-8">
                    ${budgetCard}
                </div>
                <div class="col-12 col-xl-4">
                    ${chartCard}
                </div>
            </div>
        `;

        // 3. Insights Acolhedores no Grid Bootstrap (3 colunas iguais)
        let insightsCard = `
            <div class="kontabs-card p-4">
                <h5 class="fw-bold mb-3 font-display">💡 Observações & Insights do Mês</h5>
                <div class="row g-3">
                    <div class="col-12 col-md-4">
                        <div class="p-3 rounded-4 bg-light h-100 d-flex gap-3 align-items-start">
                            <img src="app/assets/alerts/alert-budget-piggy.png" style="width: 36px; height: 36px; object-fit: contain;">
                            <div>
                                <strong class="d-block mb-1">Alimentação</strong>
                                <p class="text-muted small mb-0">Gasto <strong>R$ 230,00</strong> acima do planejado para o período. Quer revisar os próximos dias?</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="p-3 rounded-4 bg-light h-100 d-flex gap-3 align-items-start">
                            <img src="app/assets/illustrations/coin-happy.png" style="width: 36px; height: 36px; object-fit: contain;">
                            <div>
                                <strong class="d-block mb-1">Economia em Energia</strong>
                                <p class="text-muted small mb-0">Conta de energia ficou <strong>R$ 48,00</strong> abaixo da média histórica. Ótimo resultado!</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="p-3 rounded-4 bg-light h-100 d-flex gap-3 align-items-start">
                            <img src="app/assets/illustrations/chart-growth.png" style="width: 36px; height: 36px; object-fit: contain;">
                            <div>
                                <strong class="d-block mb-1">Meta da Reserva</strong>
                                <p class="text-muted small mb-0">Você já cumpriu <strong>68%</strong> da Reserva de Emergência. Mantendo o ritmo, atinge o total em 4 meses!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery('.conteudo-interno').html(
            monthHeader +
            statsRow +
            mainGridRow +
            insightsCard
        );
    }
}
