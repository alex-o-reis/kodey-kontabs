/**
 * CheckupView — Experiência Semanal de Revisão em Poucos Minutos
 * Layout compacto: cabe integralmente na tela do computador sem rolagem.
 */
class CheckupView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('Check-up Financeiro');

        // Banner compacto no topo (imagem alinhada na horizontal, título e botão de conclusão)
        let checkupHeader = `
            <div class="kontabs-card p-3 mb-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white">
                <div class="d-flex align-items-center gap-3">
                    <img src="app/assets/illustrations/mascot-workspace.png" alt="Check-up" style="height: 52px; width: 52px; object-fit: contain;">
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <h5 class="mb-0 font-display fw-bold">Check-up Semanal</h5>
                            <span class="badge bg-primary-subtle text-primary"><i class="bi bi-stopwatch"></i> 3 min</span>
                        </div>
                        <p class="text-muted small mb-0">Revise os 4 pontos prioritários da sua semana para manter suas contas no azul.</p>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-kontabs-primary text-nowrap shadow-sm" onclick="alert('🎉 Check-up semanal concluído! Você está no controle das suas finanças.')">
                        <i class="bi bi-check2-circle me-1"></i> Concluir Check-up
                    </button>
                </div>
            </div>
        `;

        // Grade 2x2 compacta com os 4 itens essenciais
        let itemsHtml = `
            <div class="row g-3">
                <!-- Item 1: Dinheiro Sem Destino -->
                <div class="col-12 col-lg-6">
                    <div class="kontabs-card shadow-hover p-3 h-100 d-flex flex-column justify-content-between border-start border-4 border-warning">
                        <div class="d-flex align-items-start gap-3">
                            <img src="app/assets/alerts/alert-budget-piggy.png" style="width: 42px; height: 42px; object-fit: contain;" alt="Alerta">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="badge bg-warning text-dark fs-xs">Ação Recomendada</span>
                                    <span class="text-muted fs-xs">Planejamento</span>
                                </div>
                                <h6 class="mb-1 fw-bold text-dark">R$ 1.230,00 sem destino este mês</h6>
                                <p class="text-muted small mb-0">Direcione este saldo para reservas, investimentos ou quitação de dívidas.</p>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end align-items-center mt-3 pt-2 border-top">
                            <button class="btn btn-sm btn-kontabs-primary text-nowrap px-3" onclick="alert('Destinar saldo para Reserva de Emergência')">
                                <i class="bi bi-arrow-right-circle me-1"></i> Dar Destino
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Item 2: Conta Vencendo -->
                <div class="col-12 col-lg-6">
                    <div class="kontabs-card shadow-hover p-3 h-100 d-flex flex-column justify-content-between border-start border-4 border-danger">
                        <div class="d-flex align-items-start gap-3">
                            <img src="app/assets/alerts/alert-bill-due.png" style="width: 42px; height: 42px; object-fit: contain;" alt="Vencimento">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="badge bg-danger-subtle text-danger fs-xs">Vencimento Próximo</span>
                                    <span class="text-danger small fw-bold"><i class="bi bi-clock-history"></i> Vence amanhã</span>
                                </div>
                                <h6 class="mb-1 fw-bold text-dark">Conta de Energia — CEMIG</h6>
                                <p class="text-muted small mb-0">Valor previsto: <strong>R$ 350,00</strong>. Evite juros confirmando o pagamento.</p>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end align-items-center mt-3 pt-2 border-top">
                            <button class="btn btn-sm btn-kontabs-secondary text-nowrap px-3" onclick="alert('Marcada como paga!')">
                                <i class="bi bi-check2 me-1"></i> Confirmar Pagamento
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Item 3: Categoria Acima do Previsto -->
                <div class="col-12 col-lg-6">
                    <div class="kontabs-card shadow-hover p-3 h-100 d-flex flex-column justify-content-between border-start border-4 border-warning">
                        <div class="d-flex align-items-start gap-3">
                            <img src="app/assets/alerts/alert-chart-down.png" style="width: 42px; height: 42px; object-fit: contain;" alt="Atenção">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="badge bg-warning-subtle text-warning fs-xs">Atenção ao Teto</span>
                                    <span class="text-muted fs-xs">Alimentação</span>
                                </div>
                                <h6 class="mb-1 fw-bold text-dark">Alimentação está 12% acima da meta</h6>
                                <p class="text-muted small mb-0">Gasto R$ 2.030 de R$ 1.800 previstos. Faltam 5 dias para o fechamento.</p>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end align-items-center mt-3 pt-2 border-top">
                            <button class="btn btn-sm btn-kontabs-outline text-nowrap px-3" onclick="window.location.hash='#/meu-mes'">
                                <i class="bi bi-sliders me-1"></i> Revisar Gastos
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Item 4: Progresso Positivo da Reserva -->
                <div class="col-12 col-lg-6">
                    <div class="kontabs-card shadow-hover p-3 h-100 d-flex flex-column justify-content-between border-start border-4 border-success">
                        <div class="d-flex align-items-start gap-3">
                            <img src="app/assets/illustrations/coin-happy.png" style="width: 42px; height: 42px; object-fit: contain;" alt="Sucesso">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="badge bg-success-subtle text-success fs-xs">Conquista</span>
                                    <span class="pill pill-efetivado py-0 px-2 fs-xs"><i class="bi bi-check-circle-fill"></i> Em dia</span>
                                </div>
                                <h6 class="mb-1 fw-bold text-dark">Reserva de Emergência +R$ 2.000</h6>
                                <p class="text-muted small mb-0">Você atingiu <strong>68% da meta</strong> total (R$ 20.400 / R$ 30.000 acumulados).</p>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                            <span class="text-muted fs-xs">Ritmo excelente este mês</span>
                            <button class="btn btn-sm btn-link text-decoration-none p-0 text-kontabs-primary fw-bold" onclick="window.location.hash='#/patrimonio'">
                                Ver Reserva <i class="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery('.conteudo-interno').html(
            checkupHeader +
            itemsHtml
        );
    }
}
