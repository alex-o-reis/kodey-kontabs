/**
 * CheckupView — Experiência Semanal de Revisão em Poucos Minutos
 * Não é uma tela densa ou pesada. Foco exclusivo nos pontos prioritários.
 */
class CheckupView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        jQuery('.page-title').text('Check-up Financeiro');

        let checkupHeader = `
            <div class="text-center py-4 mb-3" style="max-width: 680px; margin: 0 auto;">
                <img src="app/assets/illustrations/mascot-workspace.png" alt="Check-up" style="max-height: 140px; object-fit: contain;">
                <h2 class="mt-3 font-display">Seu Check-up Financeiro Semanal</h2>
                <p class="text-muted">Apenas 3 minutos para revisar o essencial, planejar sua semana e manter suas finanças no controle sem dor de cabeça.</p>
            </div>
        `;

        // Itens que Realmente Precisam de Atenção
        let itemsHtml = `
            <div style="max-width: 760px; margin: 0 auto;" class="d-flex flex-column gap-3">
                <!-- Item 1: Dinheiro Sem Destino -->
                <div class="kontabs-card shadow-hover p-4 d-flex flex-column flex-sm-row gap-3 align-items-sm-center border-warning">
                    <img src="app/assets/alerts/alert-budget-piggy.png" style="width: 48px; height: 48px; object-fit: contain;">
                    <div class="flex-grow-1">
                        <span class="badge bg-warning text-dark mb-1">Ação Recomendada</span>
                        <h5 class="mb-1 fw-bold">R$ 1.230,00 ainda estão sem destino este mês</h5>
                        <p class="text-muted small mb-0">Direcione este saldo para reservas, investimentos ou amortização de dívidas.</p>
                    </div>
                    <button class="btn btn-kontabs-primary text-nowrap" onclick="alert('Destinar saldo para Reserva de Emergência')">
                        Dar Destino
                    </button>
                </div>

                <!-- Item 2: Conta Vencendo -->
                <div class="kontabs-card shadow-hover p-4 d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
                    <img src="app/assets/alerts/alert-bill-due.png" style="width: 48px; height: 48px; object-fit: contain;">
                    <div class="flex-grow-1">
                        <span class="badge bg-danger-subtle text-danger mb-1">Vencimento Próximo</span>
                        <h5 class="mb-1 fw-bold">Conta de Energia vence amanhã</h5>
                        <p class="text-muted small mb-0">Valor previsto: <strong>R$ 350,00</strong> (CEMIG Distribuição).</p>
                    </div>
                    <button class="btn btn-kontabs-secondary text-nowrap" onclick="alert('Marcada como paga!')">
                        Confirmar Pagamento
                    </button>
                </div>

                <!-- Item 3: Categoria Acima do Previsto -->
                <div class="kontabs-card shadow-hover p-4 d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
                    <img src="app/assets/alerts/alert-chart-down.png" style="width: 48px; height: 48px; object-fit: contain;">
                    <div class="flex-grow-1">
                        <span class="badge bg-warning-subtle text-warning mb-1">Orçamento</span>
                        <h5 class="mb-1 fw-bold">Alimentação está 12% acima da meta quinzenal</h5>
                        <p class="text-muted small mb-0">Você gastou R$ 2.030 de R$ 1.800 previstos. Faltam 5 dias para o fechamento.</p>
                    </div>
                    <button class="btn btn-kontabs-outline text-nowrap" onclick="window.location.hash='#/meu-mes'">
                        Revisar Gastos
                    </button>
                </div>

                <!-- Item 4: Progresso Positivo da Reserva -->
                <div class="kontabs-card shadow-hover p-4 d-flex flex-column flex-sm-row gap-3 align-items-sm-center border-success">
                    <img src="app/assets/illustrations/coin-happy.png" style="width: 48px; height: 48px; object-fit: contain;">
                    <div class="flex-grow-1">
                        <span class="badge bg-success-subtle text-success mb-1">Parabéns!</span>
                        <h5 class="mb-1 fw-bold">Sua Reserva de Emergência recebeu R$ 2.000 este mês</h5>
                        <p class="text-muted small mb-0">Você alcançou <strong>68% da meta</strong> total (R$ 20.400 / R$ 30.000).</p>
                    </div>
                    <span class="pill pill-efetivado text-nowrap"><i class="bi bi-check-circle-fill"></i> Em dia</span>
                </div>

                <!-- Conclusão do Check-up -->
                <div class="text-center py-4">
                    <button class="btn btn-lg btn-kontabs-primary px-5 shadow-hover" onclick="alert('🎉 Check-up semanal concluído! Você está no controle das suas finanças.')">
                        <i class="bi bi-check-lg me-1"></i> Concluir Check-up Semanal
                    </button>
                </div>
            </div>
        `;

        jQuery('.conteudo-interno').html(
            checkupHeader +
            itemsHtml
        );
    }
}
