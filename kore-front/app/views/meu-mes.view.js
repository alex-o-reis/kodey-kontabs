/**
 * MeuMesView — Visão "Meu Mês" do Kodey Kontabs
 * Uma das áreas centrais do produto: foco em clareza, previsões e insights acolhedores.
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

        // Cartões Resumo do Mês
        let statsRow = UI.row(
            UI.col(3, KontabsUI.kpi("Recebi até agora", "R$ 12.400,00", "+R$ 2.100", "info", "Previsto total: R$ 14.500", "app/assets/illustrations/coin-happy.png"), "col-12 col-sm-6 col-xl-3 mb-3") +
            UI.col(3, KontabsUI.kpi("Gastei até agora", "R$ 8.930,00", "R$ 1.250 a pagar", "warning", "Previsto total: R$ 10.180", "app/assets/illustrations/receipt-happy.png"), "col-12 col-sm-6 col-xl-3 mb-3") +
            UI.col(3, KontabsUI.kpi("Reservei & Investi", "R$ 2.800,00", "Meta batida!", "success", "R$ 2.000 res. + R$ 800 inv.", "app/assets/illustrations/chart-growth.png"), "col-12 col-sm-6 col-xl-3 mb-3") +
            UI.col(3, KontabsUI.kpi("Previsão Fechamento", "R$ 1.520,00", "Positivo 🟢", "success", "Saldo livre projetado", "app/assets/illustrations/wallet-green.png"), "col-12 col-sm-6 col-xl-3 mb-3")
        );

        // Insights Acolhedores (Tom de Voz Humano e Positivo)
        let insightsCard = KontabsUI.card(
            "💡 Observações & Insights do Mês",
            `
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="p-3 rounded-4 bg-light h-100 d-flex gap-3 align-items-start">
                        <img src="app/assets/alerts/alert-budget-piggy.png" style="width: 36px; height: 36px; object-fit: contain;">
                        <div>
                            <strong>Alimentação</strong>
                            <p class="text-muted small mb-0 mt-1">Seu gasto com alimentação está <strong>R$ 230,00</strong> acima do planejado para este período do mês. Quer revisar os próximos dias?</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 rounded-4 bg-light h-100 d-flex gap-3 align-items-start">
                        <img src="app/assets/illustrations/coin-happy.png" style="width: 36px; height: 36px; object-fit: contain;">
                        <div>
                            <strong>Economia em Energia</strong>
                            <p class="text-muted small mb-0 mt-1">A conta de energia elétrica deste mês ficou <strong>R$ 48,00</strong> abaixo da média dos últimos meses. Ótimo resultado!</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 rounded-4 bg-light h-100 d-flex gap-3 align-items-start">
                        <img src="app/assets/illustrations/chart-growth.png" style="width: 36px; height: 36px; object-fit: contain;">
                        <div>
                            <strong>Meta da Reserva</strong>
                            <p class="text-muted small mb-0 mt-1">Você já cumpriu <strong>68%</strong> da meta da sua Reserva de Emergência. Mantendo o ritmo, atinge o total em 4 meses!</p>
                        </div>
                    </div>
                </div>
            </div>
            `
        );

        // Distribuição por Categoria: Previsto x Realizado
        let catHeaders = ["Categoria", "Previsto", "Realizado", "Diferença", "Progresso Orçamentário", "Situação"];
        let catRows = [
            [
                `<strong>Moradia</strong> <span class="text-muted small">(Aluguel, Energia, Água, Internet)</span>`,
                `R$ 2.400,00`,
                `R$ 2.352,00`,
                `<span class="text-success fw-bold">- R$ 48,00</span>`,
                KontabsUI.progress("p-moradia", 2352, 2400, "98% consumido", "success"),
                KontabsUI.status("efetivado", "Dentro do plano")
            ],
            [
                `<strong>Alimentação</strong> <span class="text-muted small">(Mercado, Feira, Delivery)</span>`,
                `R$ 1.800,00`,
                `R$ 2.030,00`,
                `<span class="text-danger fw-bold">+ R$ 230,00</span>`,
                KontabsUI.progress("p-alimentacao", 2030, 1800, "112% consumido", "warning"),
                `<span class="pill pill-warning"><i class="bi bi-exclamation-triangle"></i> Atenção</span>`
            ],
            [
                `<strong>Transporte</strong> <span class="text-muted small">(Combustível, IPVA, Manutenção)</span>`,
                `R$ 900,00`,
                `R$ 780,00`,
                `<span class="text-success fw-bold">- R$ 120,00</span>`,
                KontabsUI.progress("p-transporte", 780, 900, "86% consumido", "success"),
                KontabsUI.status("efetivado", "Dentro do plano")
            ],
            [
                `<strong>Reserva de Emergência</strong> <span class="text-muted small">(Aporte Mensal)</span>`,
                `R$ 2.000,00`,
                `R$ 2.000,00`,
                `<span class="text-muted fw-bold">R$ 0,00</span>`,
                KontabsUI.progress("p-reserva", 2000, 2000, "100% cumprido", "success"),
                `<span class="pill pill-efetivado"><i class="bi bi-star-fill text-warning"></i> Concluído</span>`
            ],
            [
                `<strong>Investimentos de Longo Prazo</strong>`,
                `R$ 800,00`,
                `R$ 800,00`,
                `<span class="text-muted fw-bold">R$ 0,00</span>`,
                KontabsUI.progress("p-invest", 800, 800, "100% cumprido", "success"),
                `<span class="pill pill-efetivado"><i class="bi bi-star-fill text-warning"></i> Concluído</span>`
            ]
        ];

        let catCard = KontabsUI.card(
            "Orçamento por Categoria — Previsto x Realizado",
            KontabsUI.table(catHeaders, catRows)
        );

        jQuery('.conteudo-interno').html(
            monthHeader +
            statsRow +
            `<div class="mb-4">${insightsCard}</div>` +
            catCard
        );
    }
}
