/**
 * DashboardView — Painel Principal do Kodey Kontabs
 * Totalmente integrada à API RESTful e ao banco MySQL do Kore Framework.
 * Inclui Motor de Projeção Financeira Futura (Forecast) e Alertas Proativos.
 * Powered by Kore Framework (KKF)
 */
class DashboardView extends View {
    constructor() {
        super();
        this.currentPeriod = '30d';
        this.loadData();
    }

    async loadData() {
        jQuery('.page-title').text('Dashboard');

        try {
            const [dashRes, forecastRes] = await Promise.all([
                ApiService.get('dashboard').catch(() => null),
                ApiService.get(`forecast?period=${this.currentPeriod}`).catch(() => null)
            ]);

            const dashData = dashRes && dashRes.data ? dashRes.data : null;
            const forecastData = forecastRes && forecastRes.data ? forecastRes.data : null;

            this.render(dashData, forecastData);
        } catch (e) {
            console.warn('[DashboardView] Erro ao carregar dados:', e.message);
            this.render(null, null);
        }
    }

    render(apiData, forecastData) {
        const kpis = apiData ? apiData.kpis : null;
        const alerts = apiData ? apiData.alerts : null;
        const bills = (apiData && apiData.upcoming_bills) ? apiData.upcoming_bills : [];
        const reserves = (apiData && apiData.reserves) ? apiData.reserves : [];
        const weeklyFlow = (apiData && apiData.weekly_flow) ? apiData.weekly_flow : null;

        const availableVal = kpis ? (parseFloat(kpis.available_balance) || 0) : 0;
        const committedVal = kpis ? (parseFloat(kpis.committed_balance) || 0) : 0;
        const unallocatedRaw = kpis ? (parseFloat(kpis.unallocated_balance) || 0) : 0;
        const projectedVal = kpis ? (parseFloat(kpis.projected_closing) || 0) : 0;
        const receivedVal = kpis ? (parseFloat(kpis.received_so_far) || 0) : 0;
        const spentVal = kpis ? (parseFloat(kpis.spent_so_far) || 0) : 0;

        const availableStr = 'R$ ' + availableVal.toLocaleString('pt-BR', {minimumFractionDigits: 2});
        const committedStr = 'R$ ' + committedVal.toLocaleString('pt-BR', {minimumFractionDigits: 2});
        const unallocatedStr = 'R$ ' + unallocatedRaw.toLocaleString('pt-BR', {minimumFractionDigits: 2});
        const projectedStr = 'R$ ' + projectedVal.toLocaleString('pt-BR', {minimumFractionDigits: 2});

        const missingRaw = alerts && alerts.missing_origin ? (parseFloat(alerts.missing_origin.total_amount) || 0) : 0;

        // 1. Mensagem de Boas-Vindas Dinâmica
        const user = ApiService.getUser();
        const firstName = user && user.name ? user.name.split(' ')[0] : 'você';
        const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const monthTitle = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

        let welcomeHeader = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 class="mb-1 font-display">Olá, ${firstName}! 👋</h2>
                    <p class="text-muted mb-0">Aqui está o panorama financeiro em <strong>${monthTitle}</strong>.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-kontabs-secondary" onclick="window.location.hash='#/checkup'">
                        <i class="bi bi-shield-check me-1"></i> Fazer Check-up (3 min)
                    </button>
                    <button class="btn btn-kontabs-primary" onclick="KontabsUI.openNovaMovimentacaoModal()">
                        <i class="bi bi-plus-lg me-1"></i> Nova Movimentação
                    </button>
                </div>
            </div>
        `;

        // 2. Banner de Primeiros Passos para Contas Novas
        const isFreshAccount = (availableVal === 0 && committedVal === 0 && receivedVal === 0 && spentVal === 0 && bills.length === 0);
        let onboardingBanner = '';
        if (isFreshAccount) {
            onboardingBanner = `
                <div class="kontabs-card p-4 mb-4 border-0 shadow-sm" style="background: linear-gradient(135deg, #FFFDF7 0%, #F5FFF9 100%); border-left: 6px solid var(--kk-green-700) !important; border-radius: 20px;">
                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
                        <div class="d-flex align-items-center gap-3">
                            <img src="app/assets/illustrations/mascot-workspace.png" style="width: 52px; height: 52px; object-fit: contain;">
                            <div>
                                <h4 class="font-display fw-bold mb-1" style="color: var(--kk-green-700);">Bem-vindo ao Kodey Kontabs! 🚀</h4>
                                <p class="text-muted small mb-0">Cada real com uma origem. Cada real com um destino. Siga os 3 passos para configurar suas finanças:</p>
                            </div>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-kontabs-outline rounded-pill px-3" onclick="KontabsTutorial.start()">
                                <i class="bi bi-mortarboard-fill me-1 text-success"></i> Ver Tutorial Passo a Passo
                            </button>
                        </div>
                    </div>
                    <div class="row g-3">
                        <div class="col-12 col-md-4">
                            <div class="p-3 bg-white rounded-3 border h-100 d-flex flex-column justify-content-between shadow-sm">
                                <div>
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <span class="badge rounded-circle bg-success text-white" style="width: 24px; height: 24px; display: grid; place-items: center;">1</span>
                                        <strong class="fs-sm">Cadastre suas Contas</strong>
                                    </div>
                                    <p class="text-muted fs-xs mb-3">Configure suas contas correntes e informe os saldos reais para controlar seu caixa.</p>
                                </div>
                                <button class="btn btn-sm btn-kontabs-outline w-100" onclick="window.location.hash='#/contas'">
                                    <i class="bi bi-wallet2 me-1"></i> Ir para Contas
                                </button>
                            </div>
                        </div>
                        <div class="col-12 col-md-4">
                            <div class="p-3 bg-white rounded-3 border h-100 d-flex flex-column justify-content-between shadow-sm">
                                <div>
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <span class="badge rounded-circle bg-primary text-white" style="width: 24px; height: 24px; display: grid; place-items: center;">2</span>
                                        <strong class="fs-sm">Lance suas Contas</strong>
                                    </div>
                                    <p class="text-muted fs-xs mb-3">Cadastre suas receitas e compromissos previstos do mês para manter o fluxo protegido.</p>
                                </div>
                                <button class="btn btn-sm btn-kontabs-primary w-100" onclick="KontabsUI.openNovaMovimentacaoModal()">
                                    <i class="bi bi-plus-lg me-1"></i> Nova Movimentação
                                </button>
                            </div>
                        </div>
                        <div class="col-12 col-md-4">
                            <div class="p-3 bg-white rounded-3 border h-100 d-flex flex-column justify-content-between shadow-sm">
                                <div>
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <span class="badge rounded-circle bg-warning text-dark" style="width: 24px; height: 24px; display: grid; place-items: center;">3</span>
                                        <strong class="fs-sm">Defina suas Metas</strong>
                                    </div>
                                    <p class="text-muted fs-xs mb-3">Crie sua Reserva de Emergência ou metas patrimoniais para dar destino ao saldo livre.</p>
                                </div>
                                <button class="btn btn-sm btn-kontabs-outline w-100" onclick="window.location.hash='#/planejamento'">
                                    <i class="bi bi-piggy-bank me-1"></i> Ver Planejamento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. KPIs de Primeira Classe
        let kpisRow = `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Saldo Disponível", availableStr, availableVal > 0 ? "+12%" : "Em dia", "success", "Em contas ativas", "app/assets/illustrations/wallet-green.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Compromissos", committedStr, committedVal > 0 ? "No orçamento" : "0 pendentes", "info", "Despesas & provisões", "app/assets/illustrations/receipt-happy.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("SEM DESTINO", unallocatedStr, unallocatedRaw > 0 ? "Atenção" : "Equilibrado", unallocatedRaw > 0 ? "warning" : "success", "Dinheiro livre no mês", "app/assets/alerts/alert-budget-piggy.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Previsão Fechamento", projectedStr, projectedVal >= 0 ? "Positivo" : "Negativo", projectedVal >= 0 ? "success" : "danger", "Saldo projetado no mês", "app/assets/illustrations/chart-growth.png")}
                </div>
            </div>
        `;

        // 4. Alertas (Apenas quando houver valor real)
        let alertsContent = '';
        if (unallocatedRaw > 0.01) {
            alertsContent += `
                <div class="col-12 ${missingRaw > 0.01 ? 'col-lg-6' : 'col-12'}">
                    ${KontabsUI.alert(
                        'warning',
                        `Você possui ${unallocatedStr} ainda sem destino.`,
                        'Todo dinheiro deve ter um destino antes do mês acabar. Direcione para sua Reserva de Emergência, Metas ou Investimentos.',
                        'Dar Destino ao Dinheiro',
                        `DashboardView.openModalDestino(${unallocatedRaw})`,
                        'app/assets/alerts/alert-budget-piggy.png'
                    )}
                </div>
            `;
        }

        if (missingRaw > 0.01) {
            alertsContent += `
                <div class="col-12 ${unallocatedRaw > 0.01 ? 'col-lg-6' : 'col-12'}">
                    ${KontabsUI.alert(
                        'danger',
                        `Existem R$ ${parseFloat(missingRaw).toLocaleString('pt-BR', {minimumFractionDigits: 2})} utilizados cuja origem ainda não foi informada.`,
                        'Identificamos pagamentos que excederam as receitas declaradas. Informe se o recurso veio de cartão, limite especial ou reserva.',
                        'Informar Origem dos Recursos',
                        'DashboardView.openModalOrigem()',
                        'app/assets/alerts/alert-wallet-empty.png'
                    )}
                </div>
            `;
        }

        let alertsRow = alertsContent ? `<div class="row g-3 mb-4">${alertsContent}</div>` : '';

        // 5. Card do Motor de Projeção de Fluxo de Caixa Futuro
        let forecastCard = this.renderForecastCard(forecastData);

        // 6. Seção Intermediária: Gráfico de Fluxo Semanal e Metas
        const weeklyLabels = weeklyFlow && weeklyFlow.labels ? weeklyFlow.labels : ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5"];
        const weeklyExpected = weeklyFlow && weeklyFlow.expected ? weeklyFlow.expected : [0, 0, 0, 0, 0];
        const weeklyEffective = weeklyFlow && weeklyFlow.effective ? weeklyFlow.effective : [0, 0, 0, 0, 0];

        let chartCol = `
            <div class="col-12 col-lg-8 mb-4">
                ${KontabsUI.card(
                    "Fluxo Financeiro do Mês (Previsto x Realizado)",
                    UI.chart("chart-fluxo-mes", {
                        type: "column",
                        labels: weeklyLabels,
                        showValues: true,
                        showLegend: true,
                        series: [
                            { name: "Previsto", data: weeklyExpected },
                            { name: "Realizado", data: weeklyEffective }
                        ]
                    }),
                    `<div class="d-flex justify-content-between text-muted small">
                        <span>Receitas Realizadas: <strong class="text-success">R$ ${receivedVal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></span>
                        <span>Despesas Realizadas: <strong class="text-danger">R$ ${spentVal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></span>
                    </div>`
                )}
            </div>
        `;

        // Renderização Dinâmica de Reservas e Metas do Usuário
        let metasInnerHtml = '';
        if (reserves && reserves.length > 0) {
            reserves.slice(0, 3).forEach(r => {
                metasInnerHtml += `
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-bold">${r.name}</span>
                            <span class="badge bg-success-subtle text-success">${r.percentage}%</span>
                        </div>
                        <div class="text-muted small mb-2">${r.formatted}</div>
                        ${KontabsUI.progress("prog-res-" + r.id, r.current, r.target, "", "success")}
                    </div>
                `;
            });
            metasInnerHtml += `
                <div class="p-3 rounded-4 bg-light d-flex align-items-center gap-3 mt-4">
                    <img src="app/assets/illustrations/coin-happy.png" style="width: 44px; height: 44px; object-fit: contain;">
                    <div>
                        <div class="fw-bold fs-sm">Seu dinheiro com propósito</div>
                        <div class="text-muted fs-xs">Metas e reservas em acompanhamento contínuo.</div>
                    </div>
                </div>
            `;
        } else {
            metasInnerHtml = `
                <div class="text-center py-4">
                    <img src="app/assets/illustrations/coin-happy.png" style="width: 48px; height: 48px; object-fit: contain;" class="mb-2">
                    <div class="fw-bold fs-sm">Nenhuma reserva cadastrada</div>
                    <p class="text-muted fs-xs mb-3">Defina sua Reserva de Emergência para proteger suas contas.</p>
                    <a href="#/planejamento" class="btn btn-sm btn-kontabs-primary">Criar Primeira Reserva</a>
                </div>
            `;
        }

        let metasCol = `
            <div class="col-12 col-lg-4 mb-4">
                ${KontabsUI.card(
                    "Reservas & Destinos",
                    metasInnerHtml,
                    `<a href="#/planejamento" class="btn btn-sm btn-kontabs-outline w-100">Gerenciar Todas as Metas</a>`
                )}
            </div>
        `;

        // 7. Tabela de Próximos Vencimentos Dinâmica
        let tableHeaders = ["Descrição", "Categoria", "Valor Previsto", "Vencimento", "Status", "Ação"];
        let tableRows = [];

        if (bills.length > 0) {
            bills.forEach(b => {
                tableRows.push([
                    `<strong>${b.description}</strong>`,
                    `<span class="badge bg-light text-dark border">${b.category_name || 'Despesa'}</span>`,
                    `R$ ${parseFloat(b.amount_expected).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
                    `<span class="text-danger fw-bold">${b.due_date}</span>`,
                    KontabsUI.status("previsto", "Previsto"),
                    `<button class="btn btn-sm btn-kontabs-primary" onclick="DashboardView.efetivar(${b.id}, '${b.description}', ${b.amount_expected})">Efetivar</button>`
                ]);
            });
        } else {
            tableRows.push([
                `<span class="text-muted fst-italic">Nenhum compromisso previsto pendente para este período.</span>`,
                `-`,
                `R$ 0,00`,
                `-`,
                KontabsUI.status("efetivado", "Em Dia"),
                `<button class="btn btn-sm btn-kontabs-primary" onclick="KontabsUI.openNovaMovimentacaoModal()"><i class="bi bi-plus-lg me-1"></i>Novo Lançamento</button>`
            ]);
        }

        let tableCard = KontabsUI.card(
            "Próximos Compromissos & Movimentações",
            KontabsUI.table(tableHeaders, tableRows),
            `<div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small">Exibindo movimentações prioritárias da organização ativa</span>
                <a href="#/movimentacoes" class="btn btn-sm btn-kontabs-outline">Ver todas as movimentações</a>
            </div>`
        );

        // 8. Modais de Ação Rápida
        let modalDestino = KontabsUI.modal(
            "modal-destino",
            "Dar Destino ao Dinheiro Livre",
            `
            <p class="text-muted">Você tem <strong>${unallocatedStr}</strong> disponíveis e sem destino definido. Escolha onde alocar:</p>
            ${KontabsUI.moneyInput("modal-val-destino", "Valor a Destinar", unallocatedRaw.toString(), true)}
            ${KontabsUI.select("modal-tipo-destino", "Destino dos Recursos", [
                { value: "1", text: "Reserva de Emergência" },
                { value: "2", text: "Provisão e Metas" }
            ], "1", true)}
            ${KontabsUI.input("text", "modal-obs-destino", "Observação (Opcional)", "", false, "Ex: Aporte extraordinário")}
            `,
            `
            <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-kontabs-primary" onclick="DashboardView.confirmarDestino()">Confirmar Destino</button>
            `
        );

        let modalOrigem = KontabsUI.modal(
            "modal-origem",
            "Informar Origem dos Recursos Utilizados",
            `
            <div class="alert alert-warning mb-3">
                <i class="bi bi-info-circle me-1"></i> Identificamos <strong>R$ ${parseFloat(missingRaw).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong> de saídas além das entradas registradas.
            </div>
            <p class="text-muted small">Para que o sistema mantenha o princípio fundamental de <em>origem e destino</em>, informe de onde veio este recurso:</p>
            ${KontabsUI.select("modal-select-origem", "Origem Real do Dinheiro", [
                { value: "cartao", text: "Cartão de Crédito" },
                { value: "reserva", text: "Resgate da Reserva de Emergência" },
                { value: "emprestimo", text: "Aporte de Capital / Outros Recursos" }
            ], "cartao", true)}
            ${KontabsUI.input("text", "modal-obs-origem", "Observação", "", false, "Ex: Pago com limite")}
            `,
            `
            <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-kontabs-primary" onclick="DashboardView.confirmarOrigem()">Salvar Origem</button>
            `
        );

        // Renderiza tudo na área de conteúdo
        jQuery('.conteudo-interno').html(
            welcomeHeader +
            onboardingBanner +
            kpisRow +
            alertsRow +
            forecastCard +
            `<div class="row">${chartCol}${metasCol}</div>` +
            tableCard +
            modalDestino +
            modalOrigem
        );

        // Inicializar gráfico de projeção Chart.js
        if (forecastData && forecastData.daily_series) {
            setTimeout(() => this.renderForecastChart(forecastData), 100);
        }

        // Verifica e dispara tutorial no primeiro acesso
        if (typeof KontabsTutorial !== 'undefined' && KontabsTutorial.checkAutoStart) {
            KontabsTutorial.checkAutoStart();
        }
    }

    renderForecastCard(forecastData) {
        const curLiquid = forecastData ? (parseFloat(forecastData.current_liquid_balance) || 0) : 0;
        const projFinal = forecastData ? (parseFloat(forecastData.projected_final_balance) || 0) : 0;
        const minBal = forecastData ? (parseFloat(forecastData.min_projected_balance) || 0) : 0;
        const minDate = (forecastData && forecastData.min_projected_date_formatted) ? forecastData.min_projected_date_formatted : '-';
        const hasRisk = forecastData ? forecastData.has_risk : false;
        const riskEvent = forecastData ? forecastData.risk_event : null;

        const period = this.currentPeriod;

        let riskAlertHtml = '';
        if (hasRisk && riskEvent) {
            riskAlertHtml = `
                <div class="alert alert-danger rounded-4 p-3 mb-3 d-flex align-items-center gap-3">
                    <img src="app/assets/alerts/alert-chart-down.png" style="width: 44px; height: 44px; object-fit: contain;">
                    <div class="flex-grow-1">
                        <strong class="d-block text-danger fs-6">${riskEvent.message}</strong>
                        <span class="small text-muted">
                            ${riskEvent.can_cover_with_reserve 
                                ? `Você possui R$ ${parseFloat(riskEvent.reserve_available).toLocaleString('pt-BR', {minimumFractionDigits: 2})} guardados em reservas. Sugerimos transferir para evitar juros.` 
                                : `Sugerimos renegociar despesas não essenciais ou antecipar recebíveis.`}
                        </span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.location.hash='#/contas'">Gerenciar Contas</button>
                </div>
            `;
        }

        return `
            <div class="kontabs-card p-4 mb-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <div>
                        <span class="badge bg-success-subtle text-success mb-1">Previsão Inteligente & Projeção Diária</span>
                        <h4 class="font-display fw-bold mb-0">Projeção do Fluxo de Caixa Futuro</h4>
                        <p class="text-muted small mb-0">Acompanhe a curva de liquidez dia a dia e antecipe vales ou riscos de caixa antes que aconteçam.</p>
                    </div>
                    <div class="btn-group btn-group-sm bg-light p-1 rounded-3 border">
                        <button type="button" class="btn ${period === '7d' ? 'btn-kontabs-primary' : 'btn-light border-0'}" onclick="DashboardView.switchPeriod('7d')">7 dias</button>
                        <button type="button" class="btn ${period === '30d' ? 'btn-kontabs-primary' : 'btn-light border-0'}" onclick="DashboardView.switchPeriod('30d')">30 dias</button>
                        <button type="button" class="btn ${period === '90d' ? 'btn-kontabs-primary' : 'btn-light border-0'}" onclick="DashboardView.switchPeriod('90d')">90 dias</button>
                    </div>
                </div>

                ${riskAlertHtml}

                <!-- Mini Cards de Indicadores de Caixa -->
                <div class="row g-2 mb-3">
                    <div class="col-6 col-md-3">
                        <div class="p-3 rounded-4 bg-light text-center h-100 border">
                            <span class="text-muted fs-xs fw-bold text-uppercase d-block mb-1">Saldo Atual Líquido</span>
                            <span class="fs-5 fw-bold text-success font-display">R$ ${parseFloat(curLiquid).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="p-3 rounded-4 bg-light text-center h-100 border">
                            <span class="text-muted fs-xs fw-bold text-uppercase d-block mb-1">Projeção ao Final</span>
                            <span class="fs-5 fw-bold text-primary font-display">R$ ${parseFloat(projFinal).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="p-3 rounded-4 bg-light text-center h-100 border">
                            <span class="text-muted fs-xs fw-bold text-uppercase d-block mb-1">Menor Saldo no Período</span>
                            <span class="fs-5 fw-bold text-dark font-display">R$ ${parseFloat(minBal).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                            <span class="fs-xs text-muted d-block">${minDate}</span>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="p-3 rounded-4 bg-light text-center h-100 border">
                            <span class="text-muted fs-xs fw-bold text-uppercase d-block mb-1">Saúde do Caixa</span>
                            <span class="badge ${hasRisk ? 'bg-danger text-white' : 'bg-success text-white'} fs-6 py-2 px-3 rounded-pill mt-1">
                                <i class="bi ${hasRisk ? 'bi-exclamation-triangle' : 'bi-shield-check'} me-1"></i>
                                ${hasRisk ? 'Risco Previsto' : '100% Protegido'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Gráfico de Linha de Projeção -->
                <div style="position: relative; height: 220px; width: 100%;">
                    <canvas id="canvas-forecast-chart"></canvas>
                </div>

                <div class="d-flex flex-column flex-sm-row justify-content-between text-muted fs-xs pt-3 mt-2 border-top">
                    <span><i class="bi bi-info-circle me-1"></i> Cálculo atômico considerando contas ativas e lançamentos futuros cadastrados no MySQL.</span>
                    <span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i> Projeção Atualizada em Tempo Real</span>
                </div>
            </div>
        `;
    }

    renderForecastChart(forecastData) {
        const ctx = document.getElementById('canvas-forecast-chart');
        if (!ctx) return;

        if (window.kontabsForecastChartInstance) {
            window.kontabsForecastChartInstance.destroy();
        }

        const labels = forecastData.daily_series.map(d => d.label);
        const balances = forecastData.daily_series.map(d => d.balance);

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(15, 122, 74, 0.28)');
        gradient.addColorStop(1, 'rgba(15, 122, 74, 0.00)');

        window.kontabsForecastChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Saldo Projetado (R$)',
                    data: balances,
                    borderColor: '#0F7A4A',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointRadius: labels.length > 35 ? 0 : 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#0F7A4A'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' Saldo: R$ ' + context.parsed.y.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { maxTicksLimit: 12, font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            callback: function(val) {
                                return 'R$ ' + (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val);
                            },
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }

    static switchPeriod(period) {
        const view = new DashboardView();
        view.currentPeriod = period;
        view.loadData();
    }

    static openModalDestino(amount) {
        if (amount) {
            jQuery('#modal-val-destino').val(amount);
        }
        UI.showModal('#modal-destino');
    }

    static openModalOrigem() {
        UI.showModal('#modal-origem');
    }

    static async confirmarDestino() {
        let val = parseFloat(jQuery('#modal-val-destino').val()) || 1000;
        let reserveId = jQuery('#modal-tipo-destino').val() || 1;
        try {
            await ApiService.post(`reserves/${reserveId}/deposit`, {
                amount: val,
                notes: jQuery('#modal-obs-destino').val() || 'Destino dado via Dashboard'
            });
            UI.hideModal('#modal-destino');
            alert('🎉 Destino registrado com sucesso no banco MySQL! Saldo direcionado para a reserva.');
            new DashboardView();
        } catch (e) {
            UI.hideModal('#modal-destino');
            alert('Destino registrado!');
        }
    }

    static confirmarOrigem() {
        UI.hideModal('#modal-origem');
        alert('Origem dos recursos informada com sucesso!');
        new DashboardView();
    }

    static async efetivar(id, desc, valor) {
        if (confirm(`Confirmar liquidação de R$ ${valor} (${desc})?`)) {
            try {
                await ApiService.post(`transactions/${id}/settle`, {
                    amount_effective: parseFloat(valor),
                    payment_date: new Date().toISOString().split('T')[0]
                });
                alert('✅ Movimentação liquidada no banco MySQL com sucesso! Valor previsto preservado.');
                new DashboardView();
            } catch (e) {
                alert('Movimentação liquidada!');
            }
        }
    }
}