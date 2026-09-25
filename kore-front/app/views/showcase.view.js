/**
 * ShowcaseView — Vitrine Completa (Kitchen Sink) dos Componentes e Brand Kit do Kodey Kontabs
 * Powered by Kore Framework (KKF) & Brand Kit Oficial
 */
class ShowcaseView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('UI Showcase & Brand Kit');

        let header = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 class="font-display mb-1">Brand Kit & Componentes Kontabs</h2>
                    <p class="text-muted mb-0">Demonstração viva de todos os tokens, componentes, ilustrações 3D e ícones de alerta oficiais.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-kontabs-primary" onclick="UI.showModal('#modal-showcase-demo')">
                        <i class="bi bi-window me-1"></i> Abrir Modal de Demonstração
                    </button>
                </div>
            </div>
        `;

        // 1. Swatches de Cores do Brand Kit
        let coresSection = KontabsUI.card(
            "🎨 Paleta Oficial Kontabs (Regra 70 / 20 / 10)",
            `
            <div class="row g-3">
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 text-white" style="background: #0E5A4F; min-height: 90px;">
                        <strong>Verde profundo</strong>
                        <div class="small opacity-75">#0E5A4F</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 text-white" style="background: #0F7A4A; min-height: 90px;">
                        <strong>Verde principal</strong>
                        <div class="small opacity-75">#0F7A4A</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4" style="background: #22C55E; color: #083A2D; min-height: 90px;">
                        <strong>Verde vivo</strong>
                        <div class="small opacity-75">#22C55E</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4" style="background: #D1F2E0; color: #0E5A4F; min-height: 90px;">
                        <strong>Menta claro</strong>
                        <div class="small opacity-75">#D1F2E0</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4" style="background: #FACC15; color: #4D3C00; min-height: 90px;">
                        <strong>Amarelo destaque</strong>
                        <div class="small opacity-75">#FACC15</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 text-white" style="background: #FF7A6B; min-height: 90px;">
                        <strong>Coral alerta</strong>
                        <div class="small opacity-75">#FF7A6B</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 border" style="background: #FFF9EE; color: #14352F; min-height: 90px;">
                        <strong>Creme de fundo</strong>
                        <div class="small opacity-75">#FFF9EE</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 text-white" style="background: #14352F; min-height: 90px;">
                        <strong>Tinta / texto</strong>
                        <div class="small opacity-75">#14352F</div>
                    </div>
                </div>
            </div>
            `
        );

        // 2. Botões Oficiais Kontabs
        let botoesSection = KontabsUI.card(
            "🔘 Botões (KontabsButton)",
            `
            <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
                ${KontabsUI.button("btn-s-prim", "+ Nova Movimentação", "primary", "plus-lg")}
                ${KontabsUI.button("btn-s-dark", "Provisionar Saldo", "dark", "check-circle")}
                ${KontabsUI.button("btn-s-sec", "Ver Detalhes", "secondary", "eye")}
                ${KontabsUI.button("btn-s-warn", "Revisar Gastos", "warning", "exclamation-circle")}
                ${KontabsUI.button("btn-s-dang", "Excluir Registro", "danger", "trash")}
                ${KontabsUI.button("btn-s-outl", "Cancelar", "outline")}
            </div>
            `
        );

        // 3. Ilustrações 3D Oficiais
        let ilustracoesSection = KontabsUI.card(
            "✨ Ilustrações 3D Oficiais da Marca (assets/illustrations/)",
            `
            <div class="row g-3 text-center">
                <div class="col-6 col-md-2dot4 col-lg">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/illustrations/mascot-workspace.png" style="max-height: 110px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-0">Mascote</h6>
                        <span class="text-muted small">Workspace / Boas-vindas</span>
                    </div>
                </div>
                <div class="col-6 col-md-2dot4 col-lg">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/illustrations/coin-happy.png" style="max-height: 110px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-0">Moeda Feliz</h6>
                        <span class="text-muted small">Receita, Sucesso, Saldo</span>
                    </div>
                </div>
                <div class="col-6 col-md-2dot4 col-lg">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/illustrations/wallet-green.png" style="max-height: 110px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-0">Carteira</h6>
                        <span class="text-muted small">Contas & Disponível</span>
                    </div>
                </div>
                <div class="col-6 col-md-2dot4 col-lg">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/illustrations/receipt-happy.png" style="max-height: 110px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-0">Recibo Feliz</h6>
                        <span class="text-muted small">Comprovantes & Despesas</span>
                    </div>
                </div>
                <div class="col-6 col-md-2dot4 col-lg">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/illustrations/chart-growth.png" style="max-height: 110px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-0">Crescimento</h6>
                        <span class="text-muted small">Metas & Investimentos</span>
                    </div>
                </div>
            </div>
            `
        );

        // 4. Ícones de Alerta 3D Oficiais
        let alertas3DSection = KontabsUI.card(
            "⚠️ Biblioteca de Ícones de Alerta 3D (assets/alerts/)",
            `
            <div class="row g-3 text-center">
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/alerts/alert-bill-due.png" style="max-height: 70px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-1">Conta Vencendo</h6>
                        <span class="text-muted small">Vencimentos & Boletos</span>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/alerts/alert-wallet-empty.png" style="max-height: 70px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-1">Carteira Vazia</h6>
                        <span class="text-muted small">Saldo zerando ou negativo</span>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/alerts/alert-budget-piggy.png" style="max-height: 70px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-1">Orçamento / Destino</h6>
                        <span class="text-muted small">Dinheiro sem destino</span>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/alerts/alert-calendar-reminder.png" style="max-height: 70px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-1">Lembrete Calendário</h6>
                        <span class="text-muted small">Agenda & Compromissos</span>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/alerts/alert-chart-down.png" style="max-height: 70px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-1">Queda / Desvio</h6>
                        <span class="text-muted small">Gasto acima do plano</span>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/alerts/alert-fraud-check.png" style="max-height: 70px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-1">Auditoria & Checagem</h6>
                        <span class="text-muted small">Transação a verificar</span>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/alerts/alert-payment-failed.png" style="max-height: 70px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-1">Pagamento Falhou</h6>
                        <span class="text-muted small">Erro de liquidação</span>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="p-3 rounded-4 border bg-white h-100">
                        <img src="app/assets/alerts/alert-payment-cards.png" style="max-height: 70px; object-fit: contain;">
                        <h6 class="fw-bold mt-2 mb-1">Problema com Cartão</h6>
                        <span class="text-muted small">Limite ou fatura</span>
                    </div>
                </div>
            </div>
            `
        );

        // 5. Formulários, Inputs & MoneyInput
        let formSection = KontabsUI.card(
            "📝 Campos de Formulário Especializados",
            `
            <div class="row">
                <div class="col-md-4">
                    ${KontabsUI.input("text", "sc-desc", "Descrição da Despesa", "Conta de Energia", true)}
                </div>
                <div class="col-md-4">
                    ${KontabsUI.moneyInput("sc-money", "Valor Previsto (com Máscara)", "347,82", true)}
                </div>
                <div class="col-md-4">
                    ${KontabsUI.dateInput("sc-date", "Data de Vencimento", "2026-10-10", true)}
                </div>
            </div>
            `
        );

        // 6. Alertas e Banners da Filosofia Kontabs
        let alertsSection = KontabsUI.card(
            "🔔 Banners e Alertas Acolhedores (Sem Culpa / Sem Julgamento)",
            `
            ${KontabsUI.alert("success", "Tudo provisionado!", "Todo o dinheiro recebido neste mês já possui um destino claro e planejado.", "Ver Destinos", "alert('Resumo de destinos')", "app/assets/illustrations/coin-happy.png")}
            ${KontabsUI.alert("warning", "Você possui R$ 430,00 ainda sem destino.", "Escolha poupança, reserva de emergência, investimento ou amortização.", "Dar Destino", "alert('Destinar saldo')", "app/assets/alerts/alert-budget-piggy.png")}
            ${KontabsUI.alert("danger", "Existem R$ 280,00 utilizados cuja origem ainda não foi informada.", "Informe se o recurso veio de cartão de crédito, limite especial, empréstimo ou reserva.", "Informar Origem", "alert('Informar origem')", "app/assets/alerts/alert-wallet-empty.png")}
            `
        );

        // 7. Modal de Demonstração
        let demoModal = KontabsUI.modal(
            "modal-showcase-demo",
            "Modal de Demonstração KontabsUI",
            `
            <p>Este modal foi construído utilizando a camada <code>KontabsUI.modal()</code> integrada ao <strong>Kore Framework</strong>.</p>
            <p class="text-muted small">Ele herda automaticamente os raios de 24px, a sombra esverdeada suave, tipografia e botões padronizados do Brand Kit.</p>
            `,
            `
            <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Fechar</button>
            <button type="button" class="btn btn-kontabs-primary" onclick="alert('Ação confirmada!')">Confirmar</button>
            `
        );

        jQuery('.conteudo-interno').html(
            header +
            coresSection +
            `<div class="my-4">${botoesSection}</div>` +
            `<div class="my-4">${ilustracoesSection}</div>` +
            `<div class="my-4">${alertas3DSection}</div>` +
            `<div class="my-4">${formSection}</div>` +
            `<div class="my-4">${alertsSection}</div>` +
            demoModal
        );
    }
}
