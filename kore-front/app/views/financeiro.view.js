/**
 * FinanceiroView — Contas a Pagar, Contas a Receber, Fluxo Futuro e Calendário
 */
class FinanceiroView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('Financeiro');

        let header = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h3 class="font-display mb-1">Gestão de Contas a Pagar & Receber</h3>
                    <p class="text-muted mb-0">Acompanhe compromissos por vencimento, agenda financeira e projeções futuras.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-kontabs-outline" onclick="alert('Visão de Calendário')"><i class="bi bi-calendar3 me-1"></i> Calendário</button>
                    <button class="btn btn-kontabs-primary" onclick="KontabsUI.openNovaMovimentacaoModal()"><i class="bi bi-plus-lg me-1"></i> Adicionar Conta</button>
                </div>
            </div>
        `;

        // Abas Especializadas
        let pagarContent = `
            <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge bg-danger-subtle text-danger p-2 px-3 rounded-pill fw-bold">Vencidas (0)</span>
                <span class="badge bg-warning-subtle text-warning p-2 px-3 rounded-pill fw-bold">Vencendo Hoje (0)</span>
                <span class="badge bg-primary-subtle text-primary p-2 px-3 rounded-pill fw-bold">Próximos 7 dias (2)</span>
                <span class="badge bg-light text-dark p-2 px-3 rounded-pill fw-bold border">Próximos 30 dias (4)</span>
            </div>

            ${KontabsUI.table(
                ["Vencimento", "Descrição", "Favorecido", "Conta", "Previsto", "Realizado", "Ações"],
                [
                    [
                        `<span class="text-danger fw-bold">Amanhã (26/09)</span>`,
                        `<strong>Conta de Energia Elétrica</strong>`,
                        `CEMIG`,
                        `Banco Inter`,
                        `R$ 350,00`,
                        `<span class="text-muted">-</span>`,
                        `<button class="btn btn-sm btn-kontabs-primary py-1" onclick="alert('Efetivar pagamento')">Efetivar</button>`
                    ],
                    [
                        `28/09/2026`,
                        `<strong>Internet Fibra 600MB</strong>`,
                        `Provedor Telecom`,
                        `Nubank`,
                        `R$ 149,90`,
                        `<span class="text-muted">-</span>`,
                        `<button class="btn btn-sm btn-kontabs-primary py-1" onclick="alert('Efetivar pagamento')">Efetivar</button>`
                    ],
                    [
                        `05/10/2026`,
                        `<strong>Aluguel Imóvel / Condomínio</strong>`,
                        `Imobiliária Central`,
                        `Banco Inter`,
                        `R$ 2.400,00`,
                        `<span class="text-muted">-</span>`,
                        `<button class="btn btn-sm btn-kontabs-outline py-1" onclick="alert('Detalhes da conta')">Ver</button>`
                    ]
                ]
            )}
        `;

        let receberContent = `
            <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge bg-success-subtle text-success p-2 px-3 rounded-pill fw-bold">A Receber no Mês: R$ 2.100,00</span>
                <span class="badge bg-light text-dark p-2 px-3 rounded-pill fw-bold border">Realizados: R$ 12.400,00</span>
            </div>

            ${KontabsUI.table(
                ["Previsão", "Origem / Cliente", "Descrição", "Conta Destino", "Valor Previsto", "Status", "Ações"],
                [
                    [
                        `29/09/2026`,
                        `<strong>Tech Solutions Ltd</strong>`,
                        `Consultoria e Suporte Mensal`,
                        `Banco Inter PJ`,
                        `R$ 2.100,00`,
                        KontabsUI.status("previsto", "Aguardando"),
                        `<button class="btn btn-sm btn-kontabs-primary py-1" onclick="alert('Confirmar recebimento bancário')">Receber</button>`
                    ],
                    [
                        `24/09/2026`,
                        `<strong>Acme Corp</strong>`,
                        `Desenvolvimento de Módulos Kore`,
                        `Banco Inter PJ`,
                        `R$ 5.200,00`,
                        KontabsUI.status("efetivado", "Recebido"),
                        `<span class="text-success small fw-bold"><i class="bi bi-check2-all"></i> Concluído</span>`
                    ]
                ]
            )}
        `;

        let tabs = KontabsUI.tabs("tabs-financeiro", [
            { id: "pagar", title: `<i class="bi bi-arrow-up-right text-danger me-1"></i> Contas a Pagar (3)`, content: pagarContent },
            { id: "receber", title: `<i class="bi bi-arrow-down-left text-success me-1"></i> Contas a Receber (2)`, content: receberContent }
        ]);

        let cardFinanceiro = KontabsUI.card(
            "Obrigações e Recebimentos",
            tabs
        );

        jQuery('.conteudo-interno').html(
            header +
            cardFinanceiro
        );
    }
}
