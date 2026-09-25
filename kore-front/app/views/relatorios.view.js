/**
 * RelatoriosView — DRE Simplificado Gerencial, Fluxo de Caixa Diário e Inteligência Financeira
 * Powered by Kore Framework (KKF)
 */
class RelatoriosView extends View {
    constructor() {
        super();
        this.selectedMonth = '2026-09';
        this.dreData = null;
        this.cashflowData = null;
        this.chartInstance = null;
        this.render();
        this.loadData();
    }

    render() {
        jQuery('.page-title').text('Relatórios');

        let html = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h3 class="font-display mb-1">Relatórios & Inteligência Financeira</h3>
                    <p class="text-muted mb-0">Demonstrativo de Resultado do Exercício (DRE) simplificado e fluxo de caixa diário.</p>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <select class="form-select form-select-sm" id="relatorio-mes-select" onchange="RelatoriosView.changeMonth(this.value)" style="width: auto;">
                        <option value="2026-09" selected>Setembro / 2026</option>
                        <option value="2026-08">Agosto / 2026</option>
                        <option value="2026-07">Julho / 2026</option>
                    </select>
                    <button class="btn btn-kontabs-outline" onclick="window.print()">
                        <i class="bi bi-printer me-1"></i> Imprimir
                    </button>
                    <button class="btn btn-kontabs-secondary" onclick="RelatoriosView.exportCSV()">
                        <i class="bi bi-download me-1"></i> CSV
                    </button>
                </div>
            </div>

            <!-- KPIs Executivos do DRE -->
            <div class="row g-3 mb-4 dre-kpi-row">
                <div class="col-6 col-lg-3">
                    <div class="kontabs-card p-3">
                        <span class="text-muted small fw-bold">RECEITA BRUTA</span>
                        <h4 class="fw-bold mb-0 text-success kpi-dre-receita">R$ 0,00</h4>
                        <span class="text-muted small">Faturamento / Renda</span>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="kontabs-card p-3">
                        <span class="text-muted small fw-bold">DESPESAS TOTAIS</span>
                        <h4 class="fw-bold mb-0 text-danger kpi-dre-despesa">R$ 0,00</h4>
                        <span class="text-muted small">Operacionais + Variáveis</span>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="kontabs-card p-3">
                        <span class="text-muted small fw-bold">RESULTADO LÍQUIDO</span>
                        <h4 class="fw-bold mb-0 text-primary kpi-dre-liquido">R$ 0,00</h4>
                        <span class="text-muted small kpi-dre-margem">Margem: 0%</span>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="kontabs-card p-3">
                        <span class="text-muted small fw-bold">SUPERÁVIT EFETIVO</span>
                        <h4 class="fw-bold mb-0 text-success kpi-dre-superavit">R$ 0,00</h4>
                        <span class="text-muted small">Pós-aportes em reservas</span>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-4">
                <!-- Tabela de DRE Gerencial -->
                <div class="col-12 col-xl-7">
                    <div class="kontabs-card p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0 font-display">DRE Gerencial — Demonstrativo de Resultado</h5>
                            <span class="badge bg-light text-dark border">Competência Contábil</span>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0" id="tabela-dre">
                                <tbody>
                                    <tr><td colspan="2" class="text-center py-4"><div class="spinner-border text-success"></div></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Gráfico de Fluxo de Caixa Diário -->
                <div class="col-12 col-xl-5">
                    <div class="kontabs-card p-4 h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="fw-bold mb-0 font-display">Fluxo de Caixa Diário</h5>
                                <span class="badge bg-success-subtle text-success">Mês Atual</span>
                            </div>
                            <p class="text-muted small mb-3">Comparativo de entradas e saídas liquidadas ao longo dos dias do mês.</p>
                            <div style="height: 280px; position: relative;">
                                <canvas id="chart-fluxo-caixa"></canvas>
                            </div>
                        </div>
                        <div class="d-flex justify-content-around text-center pt-3 border-top mt-3">
                            <div>
                                <span class="small text-muted d-block">Entradas no Mês</span>
                                <strong class="text-success fluxo-total-entradas">R$ 0,00</strong>
                            </div>
                            <div class="border-start"></div>
                            <div>
                                <span class="small text-muted d-block">Saídas no Mês</span>
                                <strong class="text-danger fluxo-total-saidas">R$ 0,00</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery('.conteudo-interno').html(html);
    }

    async loadData() {
        try {
            const res = await ApiService.get(`reports?month=${this.selectedMonth}`);
            const data = res.data || {};
            this.dreData = data.dre || null;
            this.cashflowData = data.cashflow || null;

            this.renderKPIs();
            this.renderDRETable();
            this.renderCashflowChart();
        } catch (e) {
            console.error('Erro ao carregar relatórios:', e);
            jQuery('#tabela-dre tbody').html('<tr><td colspan="2" class="text-center text-danger py-4">Erro ao carregar dados do DRE.</td></tr>');
        }
    }

    renderKPIs() {
        if (!this.dreData || !this.dreData.summary) return;
        const s = this.dreData.summary;

        const totalExpenses = s.operating_expenses + s.variable_expenses + s.financial_expenses;

        jQuery('.kpi-dre-receita').text(s.gross_revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        jQuery('.kpi-dre-despesa').text(totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        jQuery('.kpi-dre-liquido').text(s.net_result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        jQuery('.kpi-dre-margem').text(`Margem Líquida: ${s.net_margin_percentage}%`);
        jQuery('.kpi-dre-superavit').text(s.effective_free_balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    }

    renderDRETable() {
        if (!this.dreData || !this.dreData.summary) return;
        const s = this.dreData.summary;

        const fmt = val => Math.abs(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        let html = `
            <tr class="table-light">
                <td class="fw-bold text-success py-2"><i class="bi bi-plus-circle me-2"></i>1. (+) RECEITA OPERACIONAL BRUTA</td>
                <td class="text-end fw-bold text-success py-2">+ ${fmt(s.gross_revenue)}</td>
            </tr>
        `;

        if (this.dreData.details && this.dreData.details.revenues) {
            for (let [cat, val] of Object.entries(this.dreData.details.revenues)) {
                html += `
                    <tr>
                        <td class="ps-4 small text-muted">• ${cat}</td>
                        <td class="text-end small text-muted">${fmt(val)}</td>
                    </tr>
                `;
            }
        }

        html += `
            <tr class="table-light">
                <td class="fw-bold text-danger py-2"><i class="bi bi-dash-circle me-2"></i>2. (-) DESPESAS OPERACIONAIS / FIXAS</td>
                <td class="text-end fw-bold text-danger py-2">- ${fmt(s.operating_expenses)}</td>
            </tr>
        `;

        if (this.dreData.details && this.dreData.details.operating) {
            for (let [cat, val] of Object.entries(this.dreData.details.operating)) {
                html += `
                    <tr>
                        <td class="ps-4 small text-muted">• ${cat}</td>
                        <td class="text-end small text-muted">${fmt(val)}</td>
                    </tr>
                `;
            }
        }

        html += `
            <tr style="background: rgba(15, 122, 74, 0.06);">
                <td class="fw-bold text-primary py-2">= RESULTADO OPERACIONAL BRUTO</td>
                <td class="text-end fw-bold text-primary py-2">${fmt(s.operating_result)}</td>
            </tr>
            <tr class="table-light">
                <td class="fw-bold text-danger py-2"><i class="bi bi-dash-circle me-2"></i>3. (-) DESPESAS VARIÁVEIS / ESTILO DE VIDA</td>
                <td class="text-end fw-bold text-danger py-2">- ${fmt(s.variable_expenses)}</td>
            </tr>
        `;

        if (this.dreData.details && this.dreData.details.variable) {
            for (let [cat, val] of Object.entries(this.dreData.details.variable)) {
                html += `
                    <tr>
                        <td class="ps-4 small text-muted">• ${cat}</td>
                        <td class="text-end small text-muted">${fmt(val)}</td>
                    </tr>
                `;
            }
        }

        html += `
            <tr class="table-light">
                <td class="fw-bold text-danger py-2"><i class="bi bi-dash-circle me-2"></i>4. (-) DESPESAS FINANCEIRAS & TARIFAS</td>
                <td class="text-end fw-bold text-danger py-2">- ${fmt(s.financial_expenses)}</td>
            </tr>
            <tr style="background: rgba(16, 60, 53, 0.08); border-top: 2px solid #103C35;">
                <td class="fw-bold text-dark py-3">= RESULTADO LÍQUIDO DO PERÍODO</td>
                <td class="text-end fw-bold text-dark py-3 fs-5">${fmt(s.net_result)}</td>
            </tr>
            <tr class="table-light">
                <td class="fw-bold text-info py-2"><i class="bi bi-piggy-bank me-2"></i>5. (-) APORTES EM RESERVAS & METAS</td>
                <td class="text-end fw-bold text-info py-2">- ${fmt(s.reserve_deposits)}</td>
            </tr>
            <tr style="background: rgba(34, 197, 94, 0.12); border-top: 2px solid #22C55E;">
                <td class="fw-bold text-success py-3">= SUPERÁVIT LIVRE EFETIVO</td>
                <td class="text-end fw-bold text-success py-3 fs-5">${fmt(s.effective_free_balance)}</td>
            </tr>
        `;

        jQuery('#tabela-dre tbody').html(html);
    }

    renderCashflowChart() {
        if (!this.cashflowData) return;
        const ctx = document.getElementById('chart-fluxo-caixa');
        if (!ctx) return;

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const labels = this.cashflowData.labels.slice(0, 15); // Primeiros 15 dias para visualização limpa
        const incomes = this.cashflowData.incomes.slice(0, 15);
        const expenses = this.cashflowData.expenses.slice(0, 15);

        let totalIn = this.cashflowData.incomes.reduce((a, b) => a + b, 0);
        let totalOut = this.cashflowData.expenses.reduce((a, b) => a + b, 0);

        jQuery('.fluxo-total-entradas').text(totalIn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        jQuery('.fluxo-total-saidas').text(totalOut.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Entradas (R$)',
                        data: incomes,
                        backgroundColor: '#22C55E',
                        borderRadius: 4
                    },
                    {
                        label: 'Saídas (R$)',
                        data: expenses,
                        backgroundColor: '#FF7A6B',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { boxWidth: 12 }
                    },
                    datalabels: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    static changeMonth(month) {
        const view = new RelatoriosView();
        view.selectedMonth = month;
        view.loadData();
    }

    static exportCSV() {
        alert("Exportando dados contábeis em formato CSV...");
    }
}
