/**
 * ContasView — Gestão de Contas Financeiras e Cartões de Crédito
 * Regra: Transferência entre contas NÃO é receita nem despesa (é movimentação patrimonial).
 */
class ContasView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('Contas & Cartões');

        let header = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="font-display mb-1">Suas Contas e Cartões</h3>
                    <p class="text-muted mb-0">Controle saldos bancários, limites de cartões e transferências patrimoniais.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-kontabs-secondary" onclick="alert('Modal de transferência patrimonial')">
                        <i class="bi bi-arrow-left-right me-1"></i> Transferir Entre Contas
                    </button>
                    <button class="btn btn-kontabs-primary" onclick="alert('Cadastrar nova conta ou cartão')">
                        <i class="bi bi-plus-lg me-1"></i> Nova Conta / Cartão
                    </button>
                </div>
            </div>
        `;

        // Cartões Bancários e Contas
        let contasHtml = `
            <h5 class="fw-bold mb-3"><i class="bi bi-bank me-2 text-primary"></i>Contas Correntes e Carteiras</h5>
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="kontabs-card p-4 shadow-hover">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="badge bg-primary-subtle text-primary">Conta PJ</span>
                                <h5 class="fw-bold mt-1 mb-0">Banco Inter PJ</h5>
                            </div>
                            <i class="bi bi-shield-check text-success fs-4"></i>
                        </div>
                        <div class="kontabs-kpi-value text-success mt-2 mb-1">R$ 3.250,00</div>
                        <span class="text-muted small">Saldo disponível verificado</span>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="kontabs-card p-4 shadow-hover">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="badge bg-success-subtle text-success">Conta PF</span>
                                <h5 class="fw-bold mt-1 mb-0">Nubank Pessoal</h5>
                            </div>
                            <i class="bi bi-shield-check text-success fs-4"></i>
                        </div>
                        <div class="kontabs-kpi-value text-success mt-2 mb-1">R$ 1.530,00</div>
                        <span class="text-muted small">Saldo disponível verificado</span>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="kontabs-card p-4 shadow-hover">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="badge bg-info-subtle text-info">Investimento</span>
                                <h5 class="fw-bold mt-1 mb-0">XP Renda Fixa</h5>
                            </div>
                            <i class="bi bi-lock-fill text-muted fs-4"></i>
                        </div>
                        <div class="kontabs-kpi-value mt-2 mb-1">R$ 20.400,00</div>
                        <span class="text-muted small">Reserva de Emergência alocada</span>
                    </div>
                </div>
            </div>

            <h5 class="fw-bold mb-3"><i class="bi bi-credit-card-2-front me-2 text-warning"></i>Cartões de Crédito (Limite & Faturas)</h5>
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="kontabs-card p-4 shadow-hover">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 class="fw-bold mb-0">XP Visa Infinite</h5>
                                <span class="text-muted small">Fecha dia 15 • Vence dia 25</span>
                            </div>
                            <span class="pill pill-warning">Fatura Aberta</span>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between small fw-bold mb-1">
                                <span>Fatura Atual: R$ 2.450,00</span>
                                <span class="text-muted">Limite: R$ 15.000,00</span>
                            </div>
                            ${KontabsUI.progress("p-card-xp", 2450, 15000, "", "warning")}
                        </div>
                        <div class="d-flex justify-content-between align-items-center text-muted small pt-2 border-top">
                            <span>Limite Disponível: <strong>R$ 12.550,00</strong></span>
                            <button class="btn btn-sm btn-kontabs-outline">Ver Fatura</button>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="kontabs-card p-4 shadow-hover">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 class="fw-bold mb-0">Nubank Gold Mastercard</h5>
                                <span class="text-muted small">Fecha dia 03 • Vence dia 10</span>
                            </div>
                            <span class="pill pill-efetivado">Fatura Fechada / Paga</span>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between small fw-bold mb-1">
                                <span>Fatura Atual: R$ 600,00</span>
                                <span class="text-muted">Limite: R$ 5.000,00</span>
                            </div>
                            ${KontabsUI.progress("p-card-nu", 600, 5000, "", "success")}
                        </div>
                        <div class="d-flex justify-content-between align-items-center text-muted small pt-2 border-top">
                            <span>Limite Disponível: <strong>R$ 4.400,00</strong></span>
                            <button class="btn btn-sm btn-kontabs-outline">Ver Fatura</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery('.conteudo-interno').html(
            header +
            contasHtml
        );
    }
}
