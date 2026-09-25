/**
 * FinanceiroView — Contas a Pagar, Contas a Receber, Fluxo Futuro e Liquidação
 * Powered by Kore Framework (KKF)
 */
class FinanceiroView extends View {
    constructor() {
        super();
        this.transactions = [];
        this.render();
        this.loadData();
    }

    render() {
        jQuery('.page-title').text('Financeiro');

        let html = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h3 class="font-display mb-1">Gestão de Contas a Pagar & Receber</h3>
                    <p class="text-muted mb-0">Acompanhe compromissos por vencimento, agenda financeira e liquidação em tempo real.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-kontabs-primary" onclick="KontabsUI.openNovaMovimentacaoModal()">
                        <i class="bi bi-plus-lg me-1"></i> Adicionar Conta / Título
                    </button>
                </div>
            </div>

            <!-- Totalizadores -->
            <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                    <div class="kontabs-card p-3">
                        <span class="text-muted small fw-bold">A PAGAR NO MÊS</span>
                        <h4 class="fw-bold mb-0 text-danger total-pagar-mes">Carregando...</h4>
                        <span class="text-muted small count-pagar-pendentes">0 pendentes</span>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="kontabs-card p-3">
                        <span class="text-muted small fw-bold">A RECEBER NO MÊS</span>
                        <h4 class="fw-bold mb-0 text-success total-receber-mes">Carregando...</h4>
                        <span class="text-muted small count-receber-pendentes">0 pendentes</span>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="kontabs-card p-3">
                        <span class="text-muted small fw-bold">SALDO PROJETADO NO FECHAMENTO</span>
                        <h4 class="fw-bold mb-0 text-primary total-projetado-mes">Carregando...</h4>
                        <span class="text-muted small">Previsto pós-liquidações</span>
                    </div>
                </div>
            </div>

            <!-- Card com Abas de Pagar e Receber -->
            <div class="kontabs-card p-4">
                <ul class="nav nav-tabs border-bottom mb-3" id="tabsFinanceiro" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active fw-bold text-danger" id="pagar-tab" data-bs-toggle="tab" data-bs-target="#tab-pagar" type="button" role="tab">
                            <i class="bi bi-arrow-up-right me-1"></i> Contas a Pagar <span class="badge bg-danger-subtle text-danger ms-1 badge-count-pagar">0</span>
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link fw-bold text-success" id="receber-tab" data-bs-toggle="tab" data-bs-target="#tab-receber" type="button" role="tab">
                            <i class="bi bi-arrow-down-left me-1"></i> Contas a Receber <span class="badge bg-success-subtle text-success ms-1 badge-count-receber">0</span>
                        </button>
                    </li>
                </ul>

                <div class="tab-content" id="tabsFinanceiroContent">
                    <div class="tab-pane fade show active" id="tab-pagar" role="tabpanel">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0" id="tabela-contas-pagar">
                                <thead class="table-light small">
                                    <tr>
                                        <th>Vencimento</th>
                                        <th>Descrição</th>
                                        <th>Conta / Origem</th>
                                        <th class="text-end">Valor Previsto</th>
                                        <th class="text-center">Status</th>
                                        <th class="text-end">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-danger"></div></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="tab-pane fade" id="tab-receber" role="tabpanel">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0" id="tabela-contas-receber">
                                <thead class="table-light small">
                                    <tr>
                                        <th>Vencimento</th>
                                        <th>Descrição</th>
                                        <th>Conta / Destino</th>
                                        <th class="text-end">Valor Previsto</th>
                                        <th class="text-center">Status</th>
                                        <th class="text-end">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-success"></div></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery('.conteudo-interno').html(html);
    }

    async loadData() {
        try {
            const [txRes, dashRes] = await Promise.all([
                ApiService.get('transactions'),
                ApiService.get('dashboard')
            ]);

            this.transactions = txRes.data || [];
            const dash = dashRes.data || {};
            const projected = (dash.kpis && dash.kpis.projected_closing !== undefined) 
                ? parseFloat(dash.kpis.projected_closing) 
                : 21770.00;
            jQuery('.total-projetado-mes').text('R$ ' + projected.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));

            this.renderTables();
        } catch (e) {
            console.error('Erro ao carregar dados do financeiro:', e);
            jQuery('#tabela-contas-pagar tbody, #tabela-contas-receber tbody').html('<tr><td colspan="6" class="text-center text-danger py-4">Erro ao carregar lançamentos.</td></tr>');
        }
    }

    renderTables() {
        const pagaveis = this.transactions.filter(t => t.type === 'expense');
        const recebiveis = this.transactions.filter(t => t.type === 'income');

        let totalPagar = 0;
        let pendentesPagar = 0;
        let htmlPagar = '';

        pagaveis.forEach(t => {
            const isExpected = t.status === 'expected';
            const val = parseFloat(t.amount_expected || 0);
            if (isExpected) {
                totalPagar += val;
                pendentesPagar++;
            }

            const dateParts = t.due_date.split('-');
            const dateStr = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            const statusHtml = isExpected ? KontabsUI.status('previsto', 'A Pagar') : KontabsUI.status('efetivado', 'Pago');
            const actionBtn = isExpected 
                ? `<button class="btn btn-sm btn-kontabs-primary py-1" onclick="FinanceiroView.settleTransaction(${t.id}, '${t.description}', ${val})"><i class="bi bi-check2"></i> Pagar</button>`
                : `<span class="text-muted small"><i class="bi bi-check2-all text-success"></i> Pago</span>`;

            htmlPagar += `
                <tr>
                    <td class="small fw-bold">${dateStr}</td>
                    <td><strong>${t.description}</strong></td>
                    <td class="small text-muted">${t.account_name || 'Não informada'}</td>
                    <td class="text-end fw-bold text-danger">R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td class="text-center">${statusHtml}</td>
                    <td class="text-end">${actionBtn}</td>
                </tr>
            `;
        });

        jQuery('.total-pagar-mes').text('R$ ' + totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        jQuery('.count-pagar-pendentes').text(`${pendentesPagar} contas em aberto`);
        jQuery('.badge-count-pagar').text(pendentesPagar);
        jQuery('#tabela-contas-pagar tbody').html(htmlPagar || '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhuma conta a pagar no período.</td></tr>');

        let totalReceber = 0;
        let pendentesReceber = 0;
        let htmlReceber = '';

        recebiveis.forEach(t => {
            const isExpected = t.status === 'expected';
            const val = parseFloat(t.amount_expected || 0);
            if (isExpected) {
                totalReceber += val;
                pendentesReceber++;
            }

            const dateParts = t.due_date.split('-');
            const dateStr = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            const statusHtml = isExpected ? KontabsUI.status('previsto', 'A Receber') : KontabsUI.status('efetivado', 'Recebido');
            const actionBtn = isExpected 
                ? `<button class="btn btn-sm btn-kontabs-primary py-1" onclick="FinanceiroView.settleTransaction(${t.id}, '${t.description}', ${val})"><i class="bi bi-check2"></i> Receber</button>`
                : `<span class="text-muted small"><i class="bi bi-check2-all text-success"></i> Recebido</span>`;

            htmlReceber += `
                <tr>
                    <td class="small fw-bold">${dateStr}</td>
                    <td><strong>${t.description}</strong></td>
                    <td class="small text-muted">${t.account_name || 'Não informada'}</td>
                    <td class="text-end fw-bold text-success">R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td class="text-center">${statusHtml}</td>
                    <td class="text-end">${actionBtn}</td>
                </tr>
            `;
        });

        jQuery('.total-receber-mes').text('R$ ' + totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        jQuery('.count-receber-pendentes').text(`${pendentesReceber} recebimentos pendentes`);
        jQuery('.badge-count-receber').text(pendentesReceber);
        jQuery('#tabela-contas-receber tbody').html(htmlReceber || '<tr><td colspan="6" class="text-center py-4 text-muted">Nenhuma conta a receber no período.</td></tr>');
    }

    static async settleTransaction(id, description, amount) {
        if (!confirm(`Deseja confirmar a liquidação de "${description}" no valor de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}?`)) {
            return;
        }

        try {
            await ApiService.post(`transactions/${id}/settle`, {
                amount_effective: amount,
                payment_date: new Date().toISOString().split('T')[0]
            });
            new FinanceiroView();
        } catch (e) {
            alert(e.message || 'Erro ao liquidar lançamento.');
        }
    }
}
