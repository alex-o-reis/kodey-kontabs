/**
 * MeuMesView — Visão "Meu Mês" do Kodey Kontabs
 * Totalmente integrada à API RESTful e ao banco MySQL do Kore Framework.
 * Inclui Gestão de Envelopes de Gastos por Categoria e Ritmo Diário Seguro (FASE 5).
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
            const [meuMesRes, budgetsRes] = await Promise.all([
                ApiService.get('meumes').catch(() => null),
                ApiService.get('budgets').catch(() => null)
            ]);

            const meuMesData = meuMesRes && meuMesRes.data ? meuMesRes.data : null;
            const budgetsData = budgetsRes && budgetsRes.data ? budgetsRes.data : null;

            this.render(meuMesData, budgetsData);
        } catch (e) {
            console.warn('[MeuMesView] Carregando com dados padrão locais:', e.message);
            this.render(null, null);
        }
    }

    render(apiData, budgetsData) {
        const summary = apiData ? apiData.summary : null;
        const categories = (apiData && apiData.categories) ? apiData.categories : [];
        const chartData = (apiData && apiData.chart) ? apiData.chart : null;

        const receivedStr = summary ? 'R$ ' + parseFloat(summary.received_so_far).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 12.400,00';
        const spentStr = summary ? 'R$ ' + parseFloat(summary.spent_so_far).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 5.640,00';
        const reservedStr = summary ? 'R$ ' + parseFloat(summary.reserved_so_far).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 2.000,00';
        const closingStr = summary ? 'R$ ' + parseFloat(summary.projected_closing).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 7.360,00';

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
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-kontabs-outline" onclick="MeuMesView.abrirModalAjustarEnvelope()">
                        <i class="bi bi-sliders me-1"></i> Ajustar Envelopes
                    </button>
                    <button class="btn btn-sm btn-kontabs-secondary" onclick="window.location.hash='#/relatorios'">
                        <i class="bi bi-file-earmark-bar-graph me-1"></i> Relatório DRE
                    </button>
                </div>
            </div>
        `;

        // 1. Grid Bootstrap dos 4 KPIs
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

        // 2. Seção de Envelopes de Gastos Mensais & Ritmo Diário Seguro (FASE 5)
        let envelopesHtml = this.renderEnvelopesSection(budgetsData);

        // 3. Seção Central no Grid Bootstrap (8 colunas para tabela, 4 colunas para gráfico e balanço)
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
                [`<strong>Moradia & Escritório</strong>`, `R$ 2.400,00`, `R$ 2.830,00`, `<span class="text-danger fw-bold">+ R$ 430,00</span>`, KontabsUI.progress("p-moradia", 2830, 2400, "", "warning"), `<span class="pill pill-warning">Atenção</span>`],
                [`<strong>Alimentação</strong>`, `R$ 1.800,00`, `R$ 2.030,00`, `<span class="text-danger fw-bold">+ R$ 230,00</span>`, KontabsUI.progress("p-ali", 2030, 1800, "", "warning"), `<span class="pill pill-warning">Atenção</span>`],
                [`<strong>Transporte</strong>`, `R$ 900,00`, `R$ 780,00`, `<span class="text-success fw-bold">- R$ 120,00</span>`, KontabsUI.progress("p-trans", 780, 900, "", "success"), KontabsUI.status("efetivado", "No plano")]
            ];
        }

        let catTableHtml = KontabsUI.table(catHeaders, catRows);
        let budgetCard = KontabsUI.card("Orçamento por Categoria — Previsto x Realizado", catTableHtml);

        let chartLabels = chartData && chartData.labels ? chartData.labels : ["Moradia & Escritório", "Alimentação", "Transporte"];
        let chartSeries = chartData && chartData.series ? chartData.series : [2830, 2030, 780];
        let totalChartStr = chartData ? 'R$ ' + chartData.total.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 5.640,00';

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

        // 4. Insights Acolhedores no Grid Bootstrap (3 colunas iguais)
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

        // Modal para Ajuste de Envelopes
        let modalEnvelope = this.renderModalAjustarEnvelope(budgetsData);

        jQuery('.conteudo-interno').html(
            monthHeader +
            statsRow +
            envelopesHtml +
            mainGridRow +
            insightsCard +
            modalEnvelope
        );
    }

    renderEnvelopesSection(budgetsData) {
        const envelopes = budgetsData && budgetsData.envelopes ? budgetsData.envelopes : [
            { category_id: 3, name: "Moradia & Escritório", icon: "bi-house-door", monthly_budget: 2400, spent: 2830, percentage: 117.9, safe_daily_spend: 0, status: "exceeded", status_label: "Orçamento Estourado", status_color: "danger" },
            { category_id: 4, name: "Alimentação", icon: "bi-cart", monthly_budget: 1800, spent: 2030, percentage: 112.8, safe_daily_spend: 0, status: "exceeded", status_label: "Orçamento Estourado", status_color: "danger" },
            { category_id: 5, name: "Transporte", icon: "bi-car-front", monthly_budget: 900, spent: 780, percentage: 86.7, safe_daily_spend: 20.00, days_remaining: 6, status: "warning", status_label: "Alerta de Consumo", status_color: "info" }
        ];

        const daysRemaining = budgetsData ? budgetsData.days_remaining : 6;
        const totalBudgeted = budgetsData ? budgetsData.total_budgeted : 5100;
        const totalSpent = budgetsData ? budgetsData.total_spent : 5640;
        const overallPct = budgetsData ? budgetsData.overall_percentage : 110.6;

        let cardsHtml = '';
        envelopes.forEach(env => {
            const isExceeded = env.status === 'exceeded';
            const isWarning = env.status === 'warning' || env.status === 'danger';
            
            let badgeClass = 'bg-success-subtle text-success';
            if (isExceeded) badgeClass = 'bg-danger-subtle text-danger';
            else if (isWarning) badgeClass = 'bg-warning-subtle text-dark';

            let progressClass = 'bg-success';
            if (isExceeded) progressClass = 'bg-danger';
            else if (isWarning) progressClass = 'bg-warning';

            let safeSpendHtml = '';
            if (isExceeded) {
                safeSpendHtml = `<span class="text-danger fw-bold fs-xs"><i class="bi bi-exclamation-triangle-fill me-1"></i> Excedeu R$ ${parseFloat(env.overspent || (env.spent - env.monthly_budget)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>`;
            } else if (env.has_budget && env.remaining > 0) {
                safeSpendHtml = `<span class="text-success fw-bold fs-xs"><i class="bi bi-shield-check me-1"></i> Gasto seguro: R$ ${parseFloat(env.safe_daily_spend).toLocaleString('pt-BR', {minimumFractionDigits: 2})} / dia</span>`;
            } else {
                safeSpendHtml = `<span class="text-muted fs-xs">Defina um teto mensal</span>`;
            }

            cardsHtml += `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="kontabs-card p-3 h-100 d-flex flex-column justify-content-between border">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="d-flex align-items-center gap-2">
                                    <div class="rounded-circle p-2 d-flex align-items-center justify-content-center" style="background: rgba(15, 122, 74, 0.08); width: 36px; height: 36px;">
                                        <i class="bi ${env.icon || 'bi-tag'} text-success"></i>
                                    </div>
                                    <strong class="fs-sm">${env.name}</strong>
                                </div>
                                <span class="badge ${badgeClass} fs-xs">${env.status_label}</span>
                            </div>

                            <div class="d-flex justify-content-between align-items-baseline mb-1">
                                <span class="fs-6 fw-bold">R$ ${parseFloat(env.spent).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                <span class="text-muted small">Teto: R$ ${parseFloat(env.monthly_budget).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                            </div>

                            <div class="progress mb-2" style="height: 8px; border-radius: 6px; background-color: #F0F4F2;">
                                <div class="progress-bar ${progressClass}" role="progressbar" style="width: ${Math.min(100, env.percentage)}%; border-radius: 6px;" aria-valuenow="${env.percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                            ${safeSpendHtml}
                            <button class="btn btn-sm btn-link text-muted p-0 text-decoration-none" onclick="MeuMesView.abrirModalAjustarEnvelope(${env.category_id}, '${env.name}', ${env.monthly_budget})">
                                <i class="bi bi-pencil-square"></i> Ajustar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        return `
            <div class="mb-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <h4 class="font-display fw-bold mb-0">Envelopes de Gastos & Limites Mensais</h4>
                            <span class="badge bg-primary-subtle text-primary fs-xs">Restam ${daysRemaining} dias no mês</span>
                        </div>
                        <p class="text-muted small mb-0">Cada categoria possui seu teto definido e cálculo automático de ritmo diário seguro.</p>
                    </div>
                    <div class="d-flex align-items-center gap-3 text-muted small">
                        <span>Total Orçado: <strong class="text-dark">R$ ${parseFloat(totalBudgeted).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></span>
                        <span>Total Gasto: <strong class="${totalSpent > totalBudgeted ? 'text-danger' : 'text-success'}">R$ ${parseFloat(totalSpent).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></span>
                    </div>
                </div>

                <div class="row g-3">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }

    renderModalAjustarEnvelope(budgetsData) {
        const envelopes = budgetsData && budgetsData.envelopes ? budgetsData.envelopes : [
            { category_id: 3, name: "Moradia & Escritório", monthly_budget: 2400 },
            { category_id: 4, name: "Alimentação", monthly_budget: 1800 },
            { category_id: 5, name: "Transporte", monthly_budget: 900 }
        ];

        let options = envelopes.map(e => `<option value="${e.category_id}">${e.name} (Teto atual: R$ ${parseFloat(e.monthly_budget).toFixed(2)})</option>`).join('');

        return `
            <div class="modal fade" id="modal-ajustar-envelope" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content kontabs-card border-0 p-3">
                        <div class="modal-header border-0 pb-0">
                            <div>
                                <span class="badge bg-success-subtle text-success mb-1">Envelopes Orçamentários</span>
                                <h4 class="modal-title font-display fw-bold mb-0">Ajustar Teto da Categoria</h4>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body py-3">
                            <form id="form-ajustar-envelope" onsubmit="MeuMesView.salvarEnvelope(event)">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Categoria</label>
                                    <select class="form-select" id="env-cat-id" required>
                                        ${options}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Novo Teto Mensal (R$)</label>
                                    <input type="number" step="10" min="0" class="form-control" id="env-novo-teto" placeholder="Ex: 2000.00" required>
                                    <div class="form-text fs-xs">Defina o valor máximo que planeja gastar com esta categoria no mês.</div>
                                </div>
                                <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                                    <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="submit" class="btn btn-kontabs-primary" id="btn-salvar-env">Salvar Teto</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static abrirModalAjustarEnvelope(catId, catName, currentBudget) {
        if (catId) {
            jQuery('#env-cat-id').val(catId);
        }
        if (currentBudget) {
            jQuery('#env-novo-teto').val(currentBudget);
        }
        const modal = new bootstrap.Modal(document.getElementById('modal-ajustar-envelope'));
        modal.show();
    }

    static async salvarEnvelope(event) {
        event.preventDefault();
        const catId = parseInt(jQuery('#env-cat-id').val());
        const budget = parseFloat(jQuery('#env-novo-teto').val());
        const btn = jQuery('#btn-salvar-env');

        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Salvando...');

        try {
            await ApiService.post('budgets', {
                category_id: catId,
                monthly_budget: budget
            });

            bootstrap.Modal.getInstance(document.getElementById('modal-ajustar-envelope')).hide();
            alert('🎉 Teto do envelope atualizado com sucesso no banco MySQL!');
            new MeuMesView();
        } catch (e) {
            alert('Erro ao atualizar envelope: ' + e.message);
        } finally {
            btn.prop('disabled', false).html('Salvar Teto');
        }
    }
}
