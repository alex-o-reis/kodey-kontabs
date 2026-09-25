/**
 * DashboardView — Painel Principal do Kodey Kontabs
 * Powered by Kore Framework (KKF)
 */
class DashboardView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('Dashboard');

        // 1. Mensagem de Boas-Vindas
        let welcomeHeader = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 class="mb-1 font-display">Olá, Alex! 👋</h2>
                    <p class="text-muted mb-0">Aqui está o panorama financeiro da sua organização em <strong>Setembro de 2026</strong>.</p>
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
        let kpisRow = UI.row(
            UI.col(3, 
                KontabsUI.kpi("Saldo Disponível", "R$ 4.780,00", "+12%", "success", "Em 3 contas ativas", "app/assets/illustrations/wallet-green.png"),
                "col-12 col-sm-6 col-xl-3 mb-3"
            ) +
            UI.col(3,
                KontabsUI.kpi("Já Tem Destino", "R$ 3.550,00", "74% alocado", "info", "Compromissos & reservas", "app/assets/illustrations/coin-happy.png"),
                "col-12 col-sm-6 col-xl-3 mb-3"
            ) +
            UI.col(3,
                KontabsUI.kpi("SEM DESTINO", "R$ 1.230,00", "Atenção", "warning", "Dinheiro livre no mês", "app/assets/alerts/alert-budget-piggy.png"),
                "col-12 col-sm-6 col-xl-3 mb-3"
            ) +
            UI.col(3,
                KontabsUI.kpi("Previsão Fechamento", "R$ 1.520,00", "Positivo", "success", "Após todas as contas", "app/assets/illustrations/chart-growth.png"),
                "col-12 col-sm-6 col-xl-3 mb-3"
            )
        );

        // 3. Alertas Fundamentais (Princípio Kontabs: Origem e Destino)
        let alertSemDestino = KontabsUI.alert(
            'warning',
            'Você possui R$ 1.230,00 ainda sem destino.',
            'Todo dinheiro deve ter um destino antes do mês acabar. Direcione para sua Reserva de Emergência, Viagem ou Investimentos.',
            'Dar Destino ao Dinheiro',
            'DashboardView.openModalDestino()',
            'app/assets/alerts/alert-budget-piggy.png'
        );

        let alertSemOrigem = KontabsUI.alert(
            'danger',
            'Existem R$ 480,00 utilizados cuja origem ainda não foi informada.',
            'Identificamos pagamentos que excederam as receitas declaradas. Informe se o recurso veio de cartão, limite especial ou reserva.',
            'Informar Origem dos Recursos',
            'DashboardView.openModalOrigem()',
            'app/assets/alerts/alert-wallet-empty.png'
        );

        // 4. Seção Intermediária: Gráfico de Fluxo e Metas
        let chartCol = UI.col(8, 
            KontabsUI.card(
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
                '<div class="d-flex justify-content-between text-muted small"><span>Receitas Previstas: <strong>R$ 10.400</strong></span><span>Despesas Previstas: <strong>R$ 8.880</strong></span></div>'
            ),
            "col-12 col-lg-8 mb-4"
        );

        let metasCol = UI.col(4,
            KontabsUI.card(
                "Reservas & Destinos",
                `
                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-bold">Reserva de Emergência</span>
                        <span class="badge bg-success-subtle text-success">68%</span>
                    </div>
                    <div class="text-muted small mb-2">R$ 20.400 / R$ 30.000</div>
                    ${KontabsUI.progress("prog-reserva", 20400, 30000, "", "success")}
                </div>

                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-bold">Férias & Viagem</span>
                        <span class="badge bg-warning-subtle text-warning">42%</span>
                    </div>
                    <div class="text-muted small mb-2">R$ 4.200 / R$ 10.000</div>
                    ${KontabsUI.progress("prog-ferias", 4200, 10000, "", "warning")}
                </div>

                <div>
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="fw-bold">Capital de Giro</span>
                        <span class="badge bg-success-subtle text-success">100%</span>
                    </div>
                    <div class="text-muted small mb-2">R$ 15.000 / R$ 15.000</div>
                    ${KontabsUI.progress("prog-giro", 15000, 15000, "", "success")}
                </div>
                `,
                `<a href="#/planejamento" class="small fw-bold text-decoration-none">Gerenciar todas as 6 metas <i class="bi bi-arrow-right"></i></a>`
            ),
            "col-12 col-lg-4 mb-4"
        );

        let chartsRow = UI.row(chartCol + metasCol);

        // 5. Tabela de Contas e Movimentações Próximas
        let tableHeaders = ["Tipo / Descrição", "Categoria", "Conta", "Previsto", "Realizado", "Vencimento", "Status", "Ação"];
        let tableRows = [
            [
                `<div class="d-flex align-items-center gap-2">
                    <img src="app/assets/alerts/alert-bill-due.png" style="width: 26px; height: 26px; object-fit: contain;">
                    <strong>Conta de Energia Elétrica</strong>
                </div>`,
                `<span class="badge bg-light text-dark border">Moradia > Energia</span>`,
                `Banco Inter`,
                `R$ 350,00`,
                `<span class="text-muted">-</span>`,
                `<span class="text-danger fw-bold">Amanhã (26/09)</span>`,
                KontabsUI.status("previsto", "Previsto"),
                `<button class="btn btn-sm btn-kontabs-primary" onclick="DashboardView.efetivar(1, 'Energia', 350)">Efetivar</button>`
            ],
            [
                `<div class="d-flex align-items-center gap-2">
                    <i class="bi bi-wifi text-primary fs-5"></i>
                    <strong>Internet Fibra 600MB</strong>
                </div>`,
                `<span class="badge bg-light text-dark border">Serviços > Telecom</span>`,
                `Nubank`,
                `R$ 149,90`,
                `<span class="text-muted">-</span>`,
                `28/09/2026`,
                KontabsUI.status("previsto", "Previsto"),
                `<button class="btn btn-sm btn-kontabs-primary" onclick="DashboardView.efetivar(2, 'Internet', 149.90)">Efetivar</button>`
            ],
            [
                `<div class="d-flex align-items-center gap-2">
                    <i class="bi bi-arrow-down-left-circle text-success fs-5"></i>
                    <strong>Consultoria Software Acme Corp</strong>
                </div>`,
                `<span class="badge bg-light text-dark border">Receita > Serviços</span>`,
                `Banco Inter PJ`,
                `R$ 5.200,00`,
                `<strong>R$ 5.200,00</strong>`,
                `24/09/2026`,
                KontabsUI.status("efetivado", "Recebido"),
                `<span class="text-success small fw-bold"><i class="bi bi-check2"></i> Liquidado</span>`
            ],
            [
                `<div class="d-flex align-items-center gap-2">
                    <i class="bi bi-cart3 text-warning fs-5"></i>
                    <strong>Supermercado Mensal</strong>
                </div>`,
                `<span class="badge bg-light text-dark border">Alimentação > Mercado</span>`,
                `Cartão XP`,
                `R$ 600,00`,
                `<strong class="text-danger">R$ 642,10</strong>`,
                `22/09/2026`,
                KontabsUI.status("efetivado", "Efetivado"),
                `<span class="text-muted small">+R$ 42,10 vs prev.</span>`
            ]
        ];

        let tableCard = KontabsUI.card(
            "Próximos Compromissos & Movimentações",
            KontabsUI.table(tableHeaders, tableRows),
            `<div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small">Exibindo 4 movimentações prioritárias</span>
                <a href="#/movimentacoes" class="btn btn-sm btn-kontabs-outline">Ver todas as movimentações</a>
            </div>`
        );

        // 6. Modais de Ação Rápida
        let modalDestino = KontabsUI.modal(
            "modal-destino",
            "Dar Destino ao Dinheiro Livre",
            `
            <p class="text-muted">Você tem <strong>R$ 1.230,00</strong> disponíveis e sem destino definido. Escolha onde alocar:</p>
            ${KontabsUI.moneyInput("modal-val-destino", "Valor a Destinar", "1230,00", true)}
            ${KontabsUI.select("modal-tipo-destino", "Destino dos Recursos", [
                { value: "reserva", text: "Reserva de Emergência (+ R$ 1.230)" },
                { value: "invest", text: "Carteira de Investimentos" },
                { value: "viagem", text: "Fundo de Férias & Viagem" },
                { value: "outros", text: "Outro Fundo Personalizado..." }
            ], "reserva", true)}
            ${KontabsUI.input("text", "modal-obs-destino", "Observação (Opcional)", "", false, "Ex: Aporte extraordinário de Setembro")}
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
            ${KontabsUI.moneyInput("modal-val-origem", "Valor a Justificar", "480,00", true)}
            ${KontabsUI.select("modal-tipo-origem", "Qual foi a origem deste dinheiro?", [
                { value: "cartao", text: "Cartão de Crédito (Gera fatura futura)" },
                { value: "cheque_especial", text: "Limite / Cheque Especial Bancário" },
                { value: "emprestimo", text: "Empréstimo / Financiamento" },
                { value: "reserva", text: "Resgate de Reserva Financeira" },
                { value: "outra", text: "Outra Origem Declarada" }
            ], "cartao", true)}
            ${KontabsUI.input("text", "modal-obs-origem", "Detalhes da Origem", "", false, "Ex: Fatura Mastercard para o próximo mês")}
            `,
            `
            <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-kontabs-primary" onclick="DashboardView.confirmarOrigem()">Registrar Origem</button>
            `
        );

        let modalNovaMov = KontabsUI.modal(
            "modal-nova-movimentacao",
            "Nova Movimentação Financeira",
            `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Tipo de Movimentação</label>
                    <select class="form-select" id="mov-tipo">
                        <option value="despesa">Despesa (Saída)</option>
                        <option value="receita">Receita (Entrada)</option>
                        <option value="transferencia">Transferência Entre Contas</option>
                    </select>
                </div>
                <div class="col-md-6">
                    ${KontabsUI.moneyInput("mov-valor", "Valor Previsto", "", true, "0,00")}
                </div>
                <div class="col-12">
                    ${KontabsUI.input("text", "mov-desc", "Descrição", "", true, "Ex: Pagamento Fornecedor XYZ")}
                </div>
                <div class="col-md-6">
                    ${KontabsUI.select("mov-cat", "Categoria", [
                        { value: "moradia", text: "Moradia > Energia" },
                        { value: "alimentacao", text: "Alimentação > Restaurante" },
                        { value: "transporte", text: "Transporte > Combustível" },
                        { value: "servicos", text: "Serviços > Software" },
                        { value: "receita_salario", text: "Receita > Salário / Pró-labore" }
                    ])}
                </div>
                <div class="col-md-6">
                    ${KontabsUI.select("mov-conta", "Conta / Cartão", [
                        { value: "inter", text: "Banco Inter (Saldo: R$ 3.250)" },
                        { value: "nubank", text: "Nubank (Saldo: R$ 1.530)" },
                        { value: "xp", text: "Cartão XP Visa Infinite" }
                    ])}
                </div>
                <div class="col-md-6">
                    ${KontabsUI.dateInput("mov-vencimento", "Data de Vencimento", "2026-09-30", true)}
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Situação</label>
                    <div class="d-flex gap-3 mt-2">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="mov-status" id="status-previsto" checked>
                            <label class="form-check-label" for="status-previsto">Previsto</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="mov-status" id="status-efetivado">
                            <label class="form-check-label" for="status-efetivado">Efetivado (Já pago/recebido)</label>
                        </div>
                    </div>
                </div>
            </div>
            `,
            `
            <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Fechar</button>
            <button type="button" class="btn btn-kontabs-primary" onclick="DashboardView.salvarNovaMovimentacao()">Salvar Movimentação</button>
            `,
            "lg"
        );

        // Renderiza tudo na div do template
        jQuery('.conteudo-interno').html(
            welcomeHeader +
            kpisRow +
            alertSemDestino +
            alertSemOrigem +
            chartsRow +
            tableCard +
            modalDestino +
            modalOrigem +
            modalNovaMov
        );
    }

    static openModalDestino() {
        UI.showModal('#modal-destino');
    }

    static openModalOrigem() {
        UI.showModal('#modal-origem');
    }

    static confirmarDestino() {
        UI.hideModal('#modal-destino');
        alert('🎉 Parabéns! R$ 1.230,00 foram direcionados para a Reserva de Emergência. Saldo sem destino agora é R$ 0,00!');
        window.location.hash = '#/planejamento';
    }

    static confirmarOrigem() {
        UI.hideModal('#modal-origem');
        alert('✅ Origem registrada com sucesso! A obrigação financeira de R$ 480,00 foi alocada na fatura futura do Cartão.');
        window.location.hash = '#/contas';
    }

    static efetivar(id, desc, valor) {
        alert(`Conta "${desc}" (R$ ${valor.toFixed(2)}) marcada como EFETIVADA! Preservando valor previsto.`);
    }

    static salvarNovaMovimentacao() {
        UI.hideModal('#modal-nova-movimentacao');
        alert('✨ Nova movimentação registrada com sucesso no Kodey Kontabs!');
    }
}