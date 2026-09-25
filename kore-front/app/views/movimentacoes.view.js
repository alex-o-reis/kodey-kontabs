/**
 * MovimentacoesView — Entidade Central de Movimentações Financeiras
 * Base para receitas, despesas, transferências e provisionamentos.
 * Preserva sempre os estados e valores: PREVISTO vs. EFETIVADO.
 */
class MovimentacoesView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('Movimentações');

        // Barra de Ações e Filtros
        let actionsBar = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <button class="btn btn-sm btn-kontabs-dark filter-btn active" data-filter="all">Todas (12)</button>
                    <button class="btn btn-sm btn-kontabs-outline filter-btn" data-filter="receitas"><i class="bi bi-arrow-down-left text-success"></i> Entradas</button>
                    <button class="btn btn-sm btn-kontabs-outline filter-btn" data-filter="despesas"><i class="bi bi-arrow-up-right text-danger"></i> Saídas</button>
                    <button class="btn btn-sm btn-kontabs-outline filter-btn" data-filter="transferencias"><i class="bi bi-arrow-left-right text-primary"></i> Transferências</button>
                    <button class="btn btn-sm btn-kontabs-outline filter-btn" data-filter="previstas"><i class="bi bi-clock-history"></i> Previstas (3)</button>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-kontabs-primary" onclick="KontabsUI.openNovaMovimentacaoModal()">
                        <i class="bi bi-plus-lg me-1"></i> Nova Movimentação
                    </button>
                </div>
            </div>
        `;

        // Tabela Completa de Movimentações (Central Entity)
        let headers = [
            "Data",
            "Tipo",
            "Descrição / Favorecido",
            "Categoria",
            "Conta / Cartão",
            "Valor Previsto",
            "Valor Realizado",
            "Status",
            "Ações"
        ];

        let rows = [
            [
                `26/09/2026`,
                `<span class="badge bg-danger-subtle text-danger"><i class="bi bi-arrow-up-right"></i> Despesa</span>`,
                `<strong>Conta de Energia Elétrica</strong><br><span class="text-muted small">CEMIG Distribuição</span>`,
                `Moradia > Energia`,
                `Banco Inter`,
                `R$ 350,00`,
                `<span class="text-muted">-</span>`,
                KontabsUI.status("previsto", "Previsto"),
                `<button class="btn btn-sm btn-kontabs-primary py-1 px-2" onclick="alert('Confirmar liquidação de R$ 350,00?')">Baixar</button>`
            ],
            [
                `24/09/2026`,
                `<span class="badge bg-success-subtle text-success"><i class="bi bi-arrow-down-left"></i> Receita</span>`,
                `<strong>Consultoria de Software</strong><br><span class="text-muted small">Acme Corp</span>`,
                `Receitas > Serviços PJ`,
                `Banco Inter PJ`,
                `R$ 5.200,00`,
                `<strong>R$ 5.200,00</strong>`,
                KontabsUI.status("efetivado", "Efetivado"),
                `<span class="text-success small fw-bold"><i class="bi bi-check-all fs-5"></i></span>`
            ],
            [
                `22/09/2026`,
                `<span class="badge bg-primary-subtle text-primary"><i class="bi bi-arrow-left-right"></i> Transf.</span>`,
                `<strong>Aporte Reserva de Emergência</strong><br><span class="text-muted small">Inter -> XP Renda Fixa</span>`,
                `Patrimônio > Transferência`,
                `Inter ➔ XP Renda Fixa`,
                `R$ 1.000,00`,
                `<strong>R$ 1.000,00</strong>`,
                KontabsUI.status("efetivado", "Efetivado"),
                `<span class="text-success small fw-bold"><i class="bi bi-check-all fs-5"></i></span>`
            ],
            [
                `20/09/2026`,
                `<span class="badge bg-danger-subtle text-danger"><i class="bi bi-arrow-up-right"></i> Despesa</span>`,
                `<strong>Supermercado Mensal</strong><br><span class="text-muted small">Pão de Açúcar</span>`,
                `Alimentação > Mercado`,
                `Cartão XP Infinite`,
                `R$ 600,00`,
                `<strong class="text-danger">R$ 642,10</strong>`,
                KontabsUI.status("efetivado", "Efetivado"),
                `<span class="text-muted small" title="Diferença de R$ 42,10 preservada">+R$ 42,10</span>`
            ],
            [
                `18/09/2026`,
                `<span class="badge bg-danger-subtle text-danger"><i class="bi bi-arrow-up-right"></i> Despesa</span>`,
                `<strong>Notebook Dell XPS (Parcela 3/10)</strong><br><span class="text-muted small">Dell Computadores</span>`,
                `Equipamentos > Hardware`,
                `Cartão Nubank`,
                `R$ 600,00`,
                `<strong>R$ 600,00</strong>`,
                KontabsUI.status("efetivado", "Efetivado"),
                `<span class="text-success small fw-bold"><i class="bi bi-check-all fs-5"></i></span>`
            ],
            [
                `15/09/2026`,
                `<span class="badge bg-success-subtle text-success"><i class="bi bi-arrow-down-left"></i> Receita</span>`,
                `<strong>Pró-labore Alex Reis</strong><br><span class="text-muted small">Kodey Sistemas</span>`,
                `Receitas > Pró-labore`,
                `Banco Inter`,
                `R$ 6.500,00`,
                `<strong>R$ 6.500,00</strong>`,
                KontabsUI.status("efetivado", "Efetivado"),
                `<span class="text-success small fw-bold"><i class="bi bi-check-all fs-5"></i></span>`
            ]
        ];

        let tableCard = KontabsUI.card(
            "Extrato Geral de Movimentações",
            KontabsUI.table(headers, rows),
            `<div class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                <span class="text-muted small">Exibindo 6 de 12 movimentações registradas</span>
                <div class="btn-group">
                    <button class="btn btn-sm btn-kontabs-outline disabled">Anterior</button>
                    <button class="btn btn-sm btn-kontabs-dark">1</button>
                    <button class="btn btn-sm btn-kontabs-outline">2</button>
                    <button class="btn btn-sm btn-kontabs-outline">Próxima</button>
                </div>
            </div>`
        );

        jQuery('.conteudo-interno').html(
            actionsBar +
            tableCard
        );
    }
}
