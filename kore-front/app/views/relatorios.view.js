/**
 * RelatoriosView — Relatórios Financeiros, Previsto x Realizado e Evolução
 */
class RelatoriosView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('Relatórios');

        let header = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="font-display mb-1">Relatórios & Inteligência Financeira</h3>
                    <p class="text-muted mb-0">Comparações históricas, desvios orçamentários e evolução patrimonial.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-kontabs-outline" onclick="window.print()"><i class="bi bi-printer me-1"></i> Imprimir</button>
                    <button class="btn btn-kontabs-secondary" onclick="alert('Exportar relatório em CSV/PDF')"><i class="bi bi-download me-1"></i> Exportar</button>
                </div>
            </div>
        `;

        let chartsRow = UI.row(
            UI.col(6, KontabsUI.card(
                "Despesas por Categoria (Rosca)",
                UI.chart("chart-rel-cat", {
                    type: "doughnut",
                    labels: ["Moradia", "Alimentação", "Transporte", "Serviços", "Outros"],
                    showLegend: true,
                    series: [
                        { name: "Gastos", data: [2352, 2030, 780, 520, 410] }
                    ]
                })
            ), "col-12 col-lg-6 mb-4") +
            UI.col(6, KontabsUI.card(
                "Evolução Patrimonial (Últimos 6 meses)",
                UI.chart("chart-rel-patr", {
                    type: "line",
                    labels: ["Abr", "Mai", "Jun", "Jul", "Ago", "Set"],
                    showLegend: true,
                    series: [
                        { name: "Patrimônio Líquido", data: [28000, 31200, 33500, 35800, 38200, 42100] }
                    ]
                })
            ), "col-12 col-lg-6 mb-4")
        );

        jQuery('.conteudo-interno').html(
            header +
            chartsRow
        );
    }
}
