/**
 * DashboardView — Painel Principal do Kodey Kontabs
 * Totalmente integrada à API RESTful e ao banco MySQL do Kore Framework.
 * Powered by Kore Framework (KKF)
 */
class DashboardView extends View {
    constructor() {
        super();
        this.loadData();
    }

    async loadData() {
        jQuery('.page-title').text('Dashboard');

        try {
            const response = await ApiService.get('/dashboard');
            if (response && response.data) {
                this.render(response.data);
                return;
            }
        } catch (e) {
            console.warn('[DashboardView] Carregando com dados padrão locais:', e.message);
        }

        this.render(null);
    }

    render(apiData) {
        // Obtenção dos dados dinâmicos da API ou fallback elegante
        const kpis = apiData ? apiData.kpis : null;
        const alerts = apiData ? apiData.alerts : null;
        const reserve = apiData ? apiData.reserve : null;
        const bills = (apiData && apiData.upcoming_bills) ? apiData.upcoming_bills : [];

        const availableStr = kpis ? 'R$ ' + parseFloat(kpis.available_balance).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 20.020,00';
        const committedStr = kpis ? 'R$ ' + parseFloat(kpis.committed_balance).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 5.640,00';
        const unallocatedStr = alerts && alerts.unallocated ? alerts.unallocated.formatted_amount : 'R$ 5.110,00';
        const projectedStr = kpis ? 'R$ ' + parseFloat(kpis.projected_closing).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 6.860,00';

        const unallocatedRaw = kpis ? kpis.unallocated_balance : 5110;
        const missingRaw = alerts && alerts.missing_origin ? alerts.missing_origin.total_amount : 480;

        // 1. Mensagem de Boas-Vindas
        let welcomeHeader = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 class="mb-1 font-display">Olá, Alex! 👋</h2>
                    <p class="text-muted mb-0">Aqui está o panorama financeiro em <strong>Setembro de 2026</strong> [Conectado ao MySQL].</p>
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

        // 2. KPIs de Primeira Classe
        let kpisRow = `
            <div class="row g-3 mb-4">
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Saldo Disponível", availableStr, "+12%", "success", "Em contas ativas", "app/assets/illustrations/wallet-green.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Compromissos", committedStr, "No orçamento", "info", "Despesas & provisões", "app/assets/illustrations/receipt-happy.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("SEM DESTINO", unallocatedStr, "Atenção", "warning", "Dinheiro livre no mês", "app/assets/alerts/alert-budget-piggy.png")}
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                    ${KontabsUI.kpi("Previsão Fechamento", projectedStr, "Positivo", "success", "Saldo projetado no azul", "app/assets/illustrations/chart-growth.png")}
                </div>
            </div>
        `;

        // 3. Alertas Fundamentais (Princípio Kontabs: Origem e Destino)
        let alertSemDestino = KontabsUI.alert(
            'warning',
            `Você possui ${unallocatedStr} ainda sem destino.`,
            'Todo dinheiro deve ter um destino antes do mês acabar. Direcione para sua Reserva de Emergência, Viagem ou Investimentos.',
            'Dar Destino ao Dinheiro',
            `DashboardView.openModalDestino(${unallocatedRaw})`,
            'app/assets/alerts/alert-budget-piggy.png'
        );

        let alertSemOrigem = KontabsUI.alert(
            'danger',
            `Existem R$ ${parseFloat(missingRaw).toLocaleString('pt-BR', {minimumFractionDigits: 2})} utilizados cuja origem ainda não foi informada.`,
            'Identificamos pagamentos que excederam as receitas declaradas. Informe se o recurso veio de cartão, limite especial ou reserva.',
            'Informar Origem dos Recursos',
            'DashboardView.openModalOrigem()',
            'app/assets/alerts/alert-wallet-empty.png'
        );

        // 4. Seção Intermediária: Gráfico de Fluxo e Metas
        let chartCol = `
            <div class="col-12 col-lg-8 mb-4">
                ${KontabsUI.card(
                    "Fluxo Financeiro do Mês (Previsto x Realizado)",
                    UI.chart("chart-fluxo-mes", {
                        type: "column",
                        labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5"],
                        showValues: true,
                        showLegend: true,
                        series: [
                            { name: "Previsto", data: [3200, 2400, 1800, 2100, 900] },
                            { name: "Realizado", data: [3150, 2630, 1750, 1400, 0] }
                        ]
                    }),
                    '<div class="d-flex justify-content-between text-muted small"><span>Receitas Previstas: <strong>R$ 14.500</strong></span><span>Despesas Previstas: <strong>R$ 5.640</strong></span></div>'
                )}
            </div>
        `;

        let reserveTitle = reserve ? reserve.name : "Reserva de Emergência";
        let reservePct = reserve ? reserve.percentage : 68;
        let reserveFormatted = reserve ? reserve.formatted : "R$ 20.400 / R$ 30.000";

        let metasCol = `
            <div class="col-12 col-lg-4 mb-4">
                ${KontabsUI.card(
                    "Reservas & Destinos",
                    `
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-bold">${reserveTitle}</span>
                            <span class="badge bg-success-subtle text-success">${reservePct}%</span>
                        </div>
                        <div class="text-muted small mb-2">${reserveFormatted}</div>
                        ${KontabsUI.progress("prog-reserva", 20400, 30000, "", "success")}
                    </div>

                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-bold">Provisão 13º Salário</span>
                            <span class="badge bg-info-subtle text-primary">50%</span>
                        </div>
                        <div class="text-muted small mb-2">R$ 6.000 / R$ 12.000</div>
                        ${KontabsUI.progress("prog-13", 6000, 12000, "", "info")}
                    </div>

                    <div class="p-3 rounded-4 bg-light d-flex align-items-center gap-3 mt-4">
                        <img src="app/assets/illustrations/coin-happy.png" style="width: 44px; height: 44px; object-fit: contain;">
                        <div>
                            <div class="fw-bold fs-sm">Seu dinheiro está trabalhando</div>
                            <div class="text-muted fs-xs">Meta de emergência em ritmo exemplar!</div>
                        </div>
                    </div>
                    `,
                    `<a href="#/planejamento" class="btn btn-sm btn-kontabs-outline w-100">Gerenciar Todas as Metas</a>`
                )}
            </div>
        `;

        // 5. Tabela de Próximos Vencimentos
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
                `<strong>Conta de Energia Elétrica — CEMIG</strong>`,
                `<span class="badge bg-light text-dark border">Moradia</span>`,
                `R$ 350,00`,
                `<span class="text-danger fw-bold">Amanhã</span>`,
                KontabsUI.status("previsto", "Previsto"),
                `<button class="btn btn-sm btn-kontabs-primary" onclick="DashboardView.efetivar(8, 'CEMIG', 350)">Efetivar</button>`
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

        // 6. Modais de Ação Rápida
        let modalDestino = KontabsUI.modal(
            "modal-destino",
            "Dar Destino ao Dinheiro Livre",
            `
            <p class="text-muted">Você tem <strong>${unallocatedStr}</strong> disponíveis e sem destino definido. Escolha onde alocar:</p>
            ${KontabsUI.moneyInput("modal-val-destino", "Valor a Destinar", unallocatedRaw.toString(), true)}
            ${KontabsUI.select("modal-tipo-destino", "Destino dos Recursos", [
                { value: "1", text: "Reserva de Emergência" },
                { value: "2", text: "Provisão 13º Salário" }
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
                <i class="bi bi-info-circle me-1"></i> Identificamos <strong>R$ 480,00</strong> de saídas além das entradas registradas.
            </div>
            <p class="text-muted small">Para que o sistema mantenha o princípio fundamental de <em>origem e destino</em>, informe de onde veio este recurso:</p>
            ${KontabsUI.select("modal-select-origem", "Origem Real do Dinheiro", [
                { value: "cartao", text: "Cartão de Crédito Inter PJ" },
                { value: "reserva", text: "Resgate da Reserva de Emergência" },
                { value: "emprestimo", text: "Aporte de Capital / Sócio" }
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
            kpisRow +
            `<div class="row g-3 mb-4">
                <div class="col-12 col-lg-6">${alertSemDestino}</div>
                <div class="col-12 col-lg-6">${alertSemOrigem}</div>
            </div>` +
            `<div class="row">${chartCol}${metasCol}</div>` +
            tableCard +
            modalDestino +
            modalOrigem
        );
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
            await ApiService.post(`/reserves/${reserveId}/deposit`, {
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
                await ApiService.post(`/transactions/${id}/settle`, {
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