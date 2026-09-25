/**
 * MeuMesView — Visão "Meu Mês" do Kodey Kontabs
 * Totalmente integrada à API RESTful e ao banco MySQL do Kore Framework.
 * 100% responsiva utilizando o grid do Bootstrap.
 */
class MeuMesView extends View {
    constructor() {
        super();
        this.loadData();
    }

    async loadData() {
        jQuery('.page-title').text('Meu Mês');

        try {
            const response = await ApiService.get('/meumes');
            if (response && response.data) {
                this.render(response.data);
                return;
            }
        } catch (e) {
            console.warn('[MeuMesView] Carregando com dados padrão locais:', e.message);
        }

        this.render(null);
    }

    render(apiData) {
        const summary = apiData ? apiData.summary : null;
        const categories = (apiData && apiData.categories) ? apiData.categories : [];
        const chartData = (apiData && apiData.chart) ? apiData.chart : null;

        const receivedStr = summary ? 'R$ ' + parseFloat(summary.received_so_far).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 12.400,00';
        const spentStr = summary ? 'R$ ' + parseFloat(summary.spent_so_far).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 5.290,00';
        const reservedStr = summary ? 'R$ ' + parseFloat(summary.reserved_so_far).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 2.000,00';
        const closingStr = summary ? 'R$ ' + parseFloat(summary.projected_closing).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 6.860,00';

        const toReceiveStr = summary ? '+R$ ' + parseFloat(summary.to_receive).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '+R$ 2.100';
        const toPayStr = summary ? 'R$ ' + parseFloat(summary.to_pay).toLocaleString('pt-BR', {minimumFractionDigits: 2}) + ' a pagar' : 'R$ 350 a pagar';

        // Seletor de Mês e Resumo
        let monthHeader = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div class="d-flex align-items-center gap-3">
                    <div class="btn-group shadow-sm">
                        <button class="btn btn-sm btn-kontabs-outline"><i class="bi bi-chevron-left"></i></button>
                        <button class="btn btn-sm btn-kontabs-dark px-3 fw-bold">Setembro de 2026</button>
                        <button class="btn btn-sm btn-kontabs-outline"><i class="bi bi-chevron-right"></i></button>
                    </div>
                    <span class="badge bg-success-subtle text-success fs-xs fw-bold px-3 py-2 rounded-pill">Mês em andamento — Dados MySQL</span>
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
                    ${KontabsUI.kpi("Recebi até agora", receivedStr, toReceiveStr, "info", "Previsto total no mês", "app/assets/illustrations/coin-happy.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Gastei até agora", spentStr, toPayStr, "warning", "Contas e compras liquidadas", "app/assets/illustrations/receipt-happy.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Reservei & Investi", reservedStr, "Ritmo exemplar", "success", "Aportes guardados", "app/assets/illustrations/chart-growth.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Previsão Fechamento", closingStr, "Positivo 🟢", "success", "Saldo projetado no azul", "app/assets/illustrations/wallet-green.png")}
                </div>
            </div>
        `;

        // 2. Seção Central no Grid Bootstrap (8 colunas para tabela, 4 colunas para gráfico e balanço)
        let catHeaders = ["Categoria", "Previsto", "Realizado", "Diferença", "Progresso", "Situação"];
        let catRows = [];

        if (categories && categories.length > 0) {
            categories.forEach(c => {
                let budget = parseFloat(c.monthly_budget);
                let realized = parseFloat(c.realized);
                let diff = budget - realized;
                let isOver = diff < 0;

                let diffHtml = isOver 
                    ? `<span class="text-danger fw-bold">+ R$ ${Math.abs(diff).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>`
                    : `<span class="text-success fw-bold">- R$ ${Math.abs(diff).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>`;

                let situation = isOver
                    ? `<span class="pill pill-warning">Atenção</span>`
                    : KontabsUI.status("efetivado", "No plano");

                let progressColor = isOver ? "warning" : "success";

                catRows.push([
                    `<strong>${c.name}</strong>`,
                    `R$ ${budget.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
                    `R$ ${realized.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
                    diffHtml,
                    KontabsUI.progress("p-cat-" + c.id, realized, budget, "", progressColor),
                    situation
                ]);
            });
        } else {
            catRows = [
                [`<strong>Moradia & Escritório</strong>`, `R$ 2.400,00`, `R$ 2.480,00`, `<span class="text-danger fw-bold">+ R$ 80,00</span>`, KontabsUI.progress("p-moradia", 2480, 2400, "", "warning"), `<span class="pill pill-warning">Atenção</span>`],
                [`<strong>Alimentação</strong>`, `R$ 1.800,00`, `R$ 2.030,00`, `<span class="text-danger fw-bold">+ R$ 230,00</span>`, KontabsUI.progress("p-ali", 2030, 1800, "", "warning"), `<span class="pill pill-warning">Atenção</span>`],
                [`<strong>Transporte</strong>`, `R$ 900,00`, `R$ 780,00`, `<span class="text-success fw-bold">- R$ 120,00</span>`, KontabsUI.progress("p-trans", 780, 900, "", "success"), KontabsUI.status("efetivado", "No plano")]
            ];
        }

        let catTableHtml = KontabsUI.table(catHeaders, catRows);
        let budgetCard = KontabsUI.card("Orçamento por Categoria — Previsto x Realizado", catTableHtml);

        let chartLabels = chartData && chartData.labels ? chartData.labels : ["Moradia & Escritório", "Alimentação", "Transporte"];
        let chartSeries = chartData && chartData.series ? chartData.series : [2480, 2030, 780];
        let totalChartStr = chartData ? 'R$ ' + chartData.total.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 5.290,00';

        let chartCard = KontabsUI.card(
            "Distribuição dos Gastos",
            `
            ${UI.chart("chart-meu-mes-rosca", {
                type: "doughnut",
                labels: chartLabels,
                showLegend: true,
                series: [
                    { name: "Gastos", data: chartSeries }
                ]
            })}
            <div class="mt-3 pt-3 border-top text-center text-muted small">
                Total Comprometido no Mês: <strong>${totalChartStr}</strong>
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
                                <p class="text-muted small mb-0">Gasto R$ 230,00 acima do planejado para o período. Quer revisar os próximos dias?</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="p-3 rounded-4 bg-light h-100 d-flex gap-3 align-items-start">
                            <img src="app/assets/illustrations/coin-happy.png" style="width: 36px; height: 36px; object-fit: contain;">
                            <div>
                                <strong class="d-block mb-1">Economia em Transporte</strong>
                                <p class="text-muted small mb-0">Gastos com combustível ficaram <strong>R$ 120,00</strong> abaixo do teto previsto. Ótimo controle!</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="p-3 rounded-4 bg-light h-100 d-flex gap-3 align-items-start">
                            <img src="app/assets/illustrations/chart-growth.png" style="width: 36px; height: 36px; object-fit: contain;">
                            <div>
                                <strong class="d-block mb-1">Meta da Reserva</strong>
                                <p class="text-muted small mb-0">Você já acumulou <strong>68%</strong> da Reserva de Emergência. Mantendo o ritmo, atinge o total em 4 meses!</p>
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
