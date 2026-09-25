/**
 * PlanejamentoView — Orçamento, Provisionamentos, Reservas e Metas
 * Princípio Central: ENTRADAS - SAÍDAS - PROVISIONAMENTOS = 0
 * "Todo dinheiro deve ter um destino."
 */
class PlanejamentoView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('Planejamento & Metas');

        let header = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h3 class="font-display mb-1">Planejamento & Destino do Dinheiro</h3>
                    <p class="text-muted mb-0">Cada real que entra deve possuir um propósito claro: despesa, reserva, investimento ou meta.</p>
                </div>
                <div>
                    <button class="btn btn-kontabs-primary" onclick="alert('Criar nova meta ou reserva financeira')">
                        <i class="bi bi-plus-circle me-1"></i> Nova Reserva / Meta
                    </button>
                </div>
            </div>
        `;

        // Equação Orçamentária Visual
        let equationCard = `
            <div class="kontabs-card p-4 mb-4" style="background: linear-gradient(135deg, #FFFFFF 0%, #F5FFF9 100%);">
                <div class="row align-items-center text-center g-3">
                    <div class="col-6 col-md-3">
                        <span class="text-muted small fw-bold">1. RECEITAS TOTAIS</span>
                        <div class="fs-3 fw-bold text-success mt-1">R$ 10.400,00</div>
                    </div>
                    <div class="col-12 col-md-1 d-none d-md-block fs-3 text-muted">-</div>
                    <div class="col-6 col-md-2">
                        <span class="text-muted small fw-bold">2. DESPESAS FIXAS</span>
                        <div class="fs-3 fw-bold text-danger mt-1">R$ 6.370,00</div>
                    </div>
                    <div class="col-12 col-md-1 d-none d-md-block fs-3 text-muted">-</div>
                    <div class="col-6 col-md-2">
                        <span class="text-muted small fw-bold">3. PROVISIONADO</span>
                        <div class="fs-3 fw-bold text-primary mt-1">R$ 2.800,00</div>
                    </div>
                    <div class="col-12 col-md-1 d-none d-md-block fs-3 text-muted">=</div>
                    <div class="col-6 col-md-2">
                        <span class="text-muted small fw-bold">SEM DESTINO</span>
                        <div class="fs-3 fw-bold text-warning mt-1">R$ 1.230,00</div>
                    </div>
                </div>
            </div>
        `;

        // Alerta Acolhedor de Provisionamento
        let alertProvisionamento = KontabsUI.alert(
            'warning',
            'R$ 1.230,00 ainda estão livres para este mês!',
            'Para fechar a meta do mês com orçamento zero (tudo com propósito), direcione esses recursos para os fundos abaixo.',
            'Distribuir Saldo Automaticamente',
            'alert("Distribuindo saldo proporcionalmente entre Reserva de Emergência e Viagem!")',
            'app/assets/illustrations/coin-happy.png'
        );

        // Metas e Fundos Financeiros
        let metasGrid = `
            <h4 class="fw-bold mb-3 font-display">Seus Fundos e Reservas Ativas</h4>
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="kontabs-card p-4 shadow-hover h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-success-subtle text-success">Prioridade Máxima</span>
                                <span class="pill pill-efetivado">Aporte em dia</span>
                            </div>
                            <h5 class="fw-bold mb-1">Reserva de Emergência</h5>
                            <p class="text-muted small mb-3">6 meses de custo fixo para tranquilidade e segurança.</p>
                            <div class="d-flex justify-content-between small fw-bold mb-1">
                                <span>Atual: R$ 20.400,00</span>
                                <span class="text-muted">Meta: R$ 30.000</span>
                            </div>
                            ${KontabsUI.progress("meta-1", 20400, 30000, "", "success")}
                        </div>
                        <div class="pt-3 border-top mt-3 text-muted small">
                            <i class="bi bi-info-circle me-1"></i> No ritmo atual, você atingirá a meta em <strong>Fevereiro de 2027</strong>.
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="kontabs-card p-4 shadow-hover h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-warning-subtle text-warning">Sonhos & Lazer</span>
                                <span class="pill pill-warning">Aporte parcial</span>
                            </div>
                            <h5 class="fw-bold mb-1">Férias & Viagem 2027</h5>
                            <p class="text-muted small mb-3">Passagens, hospedagem e despesas para a família.</p>
                            <div class="d-flex justify-content-between small fw-bold mb-1">
                                <span>Atual: R$ 4.200,00</span>
                                <span class="text-muted">Meta: R$ 10.000</span>
                            </div>
                            ${KontabsUI.progress("meta-2", 4200, 10000, "", "warning")}
                        </div>
                        <div class="pt-3 border-top mt-3 text-muted small">
                            <i class="bi bi-info-circle me-1"></i> Faltam R$ 5.800 para atingir a meta no prazo.
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="kontabs-card p-4 shadow-hover h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-primary-subtle text-primary">Empresarial</span>
                                <span class="pill pill-efetivado"><i class="bi bi-star-fill text-warning"></i> Concluída</span>
                            </div>
                            <h5 class="fw-bold mb-1">Capital de Giro</h5>
                            <p class="text-muted small mb-3">Fundo de operação e fluxo para a Kodey Sistemas.</p>
                            <div class="d-flex justify-content-between small fw-bold mb-1">
                                <span>Atual: R$ 15.000,00</span>
                                <span class="text-muted">Meta: R$ 15.000</span>
                            </div>
                            ${KontabsUI.progress("meta-3", 15000, 15000, "", "success")}
                        </div>
                        <div class="pt-3 border-top mt-3 text-success small fw-bold">
                            <i class="bi bi-check-circle-fill me-1"></i> Meta de capital de giro 100% atingida!
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery('.conteudo-interno').html(
            header +
            equationCard +
            alertProvisionamento +
            metasGrid
        );
    }
}
