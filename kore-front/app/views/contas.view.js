/**
 * ContasView — Gestão Completa de Contas Financeiras e Cartões de Crédito
 * Powered by Kore Framework (KKF)
 * Regra: Transferência entre contas NÃO é receita nem despesa (é movimentação patrimonial).
 */
class ContasView extends View {
    constructor() {
        super();
        this.accounts = [];
        this.cards = [];
        this.totalBalance = 0;
        this.selectedAccountStatement = null;
        this.render();
        this.loadData();
    }

    render() {
        jQuery('.page-title').text('Contas & Cartões');

        let html = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h3 class="font-display mb-1">Suas Contas e Cartões</h3>
                    <p class="text-muted mb-0">Controle saldos bancários, limites de cartões e transferências patrimoniais.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-kontabs-secondary" onclick="ContasView.openTransferModal()">
                        <i class="bi bi-arrow-left-right me-1"></i> Transferir Entre Contas
                    </button>
                    <button class="btn btn-kontabs-primary" onclick="ContasView.openNewAccountModal()">
                        <i class="bi bi-plus-lg me-1"></i> Nova Conta / Cartão
                    </button>
                </div>
            </div>

            <!-- Totalizador Rápido -->
            <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                    <div class="kontabs-card p-3 d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; background: rgba(15, 122, 74, 0.1); color: var(--kk-green-700);">
                            <i class="bi bi-wallet2 fs-4"></i>
                        </div>
                        <div>
                            <span class="text-muted small fw-bold">SALDO TOTAL DISPONÍVEL</span>
                            <h4 class="fw-bold mb-0 text-success total-accounts-balance">Carregando...</h4>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="kontabs-card p-3 d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; background: rgba(255, 184, 0, 0.15); color: #B47800;">
                            <i class="bi bi-credit-card-2-front fs-4"></i>
                        </div>
                        <div>
                            <span class="text-muted small fw-bold">FATURAS ABERTAS</span>
                            <h4 class="fw-bold mb-0 text-warning total-open-invoices">Carregando...</h4>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="kontabs-card p-3 d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; background: rgba(34, 197, 94, 0.1); color: var(--kk-green-600);">
                            <i class="bi bi-shield-check fs-4"></i>
                        </div>
                        <div>
                            <span class="text-muted small fw-bold">STATUS PATRIMONIAL</span>
                            <h4 class="fw-bold mb-0 text-success">Conciliado</h4>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Seção de Contas Correntes -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0"><i class="bi bi-bank me-2 text-primary"></i>Contas Correntes e Caixas</h5>
                <span class="text-muted small count-accounts-label">Carregando contas...</span>
            </div>
            <div class="row g-3 mb-5 accounts-grid-container">
                <div class="col-12 text-center py-4">
                    <div class="spinner-border text-success" role="status"></div>
                </div>
            </div>

            <!-- Seção de Cartões de Crédito -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold mb-0"><i class="bi bi-credit-card-2-front-fill me-2 text-warning"></i>Cartões de Crédito (Limite & Faturas)</h5>
                <span class="text-muted small count-cards-label">Carregando cartões...</span>
            </div>
            <div class="row g-3 mb-4 cards-grid-container">
                <div class="col-12 text-center py-4">
                    <div class="spinner-border text-warning" role="status"></div>
                </div>
            </div>

            <!-- Modais de Ação -->
            ${this.renderModals()}
        `;

        jQuery('.conteudo-interno').html(html);
    }

    renderModals() {
        return `
            <!-- Modal de Transferência Entre Contas -->
            <div class="modal fade" id="modal-transferencia-contas" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content kontabs-card border-0 p-3">
                        <div class="modal-header border-0 pb-0">
                            <div>
                                <h5 class="modal-title font-display fw-bold mb-1">Transferência Entre Contas</h5>
                                <p class="text-muted small mb-0">Movimentação patrimonial interna (sem afetar receitas ou despesas).</p>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <form id="form-transferencia-contas" onsubmit="ContasView.submitTransfer(event)">
                            <div class="modal-body py-3">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Conta de Origem (Débito) *</label>
                                    <select class="form-select" id="transf-origem" required>
                                        <option value="">Selecione a conta...</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Conta de Destino (Crédito) *</label>
                                    <select class="form-select" id="transf-destino" required>
                                        <option value="">Selecione a conta...</option>
                                    </select>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Valor (R$) *</label>
                                        <input type="number" step="0.01" min="0.01" class="form-control" id="transf-valor" placeholder="0,00" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Data *</label>
                                        <input type="date" class="form-control" id="transf-data" value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small fw-bold">Observações / Motivo</label>
                                    <input type="text" class="form-control" id="transf-obs" placeholder="Ex: Transferência para reserva de emergência">
                                </div>
                            </div>
                            <div class="modal-footer border-0 pt-0">
                                <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-kontabs-primary" id="btn-salvar-transferencia">
                                    <i class="bi bi-arrow-left-right me-1"></i> Confirmar Transferência
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal de Extrato Detalhado da Conta -->
            <div class="modal fade" id="modal-extrato-conta" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content kontabs-card border-0 p-3">
                        <div class="modal-header border-0 pb-0">
                            <div>
                                <span class="badge bg-success-subtle text-success mb-1" id="extrato-tipo-badge">Extrato Bancário</span>
                                <h4 class="modal-title font-display fw-bold mb-0" id="extrato-conta-nome">Extrato da Conta</h4>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body py-3">
                            <div class="d-flex justify-content-between align-items-center p-3 mb-3 rounded" style="background: rgba(15, 122, 74, 0.05); border: 1px solid rgba(15, 122, 74, 0.15);">
                                <div>
                                    <span class="text-muted small">Saldo Atual em Caixa</span>
                                    <h3 class="fw-bold mb-0 text-success" id="extrato-saldo-atual">R$ 0,00</h3>
                                </div>
                                <div class="text-end">
                                    <span class="text-muted small">Mês de Competência</span>
                                    <div class="fw-bold text-dark" id="extrato-periodo">Setembro / 2026</div>
                                </div>
                            </div>
                            <div class="table-responsive" style="max-height: 380px;">
                                <table class="table table-hover align-middle mb-0">
                                    <thead class="table-light small">
                                        <tr>
                                            <th>Data</th>
                                            <th>Descrição</th>
                                            <th>Categoria</th>
                                            <th class="text-end">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody id="extrato-tabela-itens">
                                        <tr><td colspan="4" class="text-center py-3">Carregando movimentações...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Pagar Fatura -->
            <div class="modal fade" id="modal-pagar-fatura" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content kontabs-card border-0 p-3">
                        <div class="modal-header border-0 pb-0">
                            <div>
                                <h5 class="modal-title font-display fw-bold mb-1">Pagar Fatura do Cartão</h5>
                                <p class="text-muted small mb-0">O valor será debitado da sua conta e liquidará as despesas da fatura.</p>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <form id="form-pagar-fatura" onsubmit="ContasView.submitPayInvoice(event)">
                            <input type="hidden" id="pagar-fatura-card-id">
                            <div class="modal-body py-3">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Cartão de Crédito</label>
                                    <input type="text" class="form-control" id="pagar-fatura-card-nome" readonly>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Debitar da Conta Bancária *</label>
                                    <select class="form-select" id="pagar-fatura-conta-id" required>
                                        <option value="">Selecione a conta...</option>
                                    </select>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Valor do Pagamento (R$) *</label>
                                        <input type="number" step="0.01" min="0.01" class="form-control" id="pagar-fatura-valor" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Data do Pagamento *</label>
                                        <input type="date" class="form-control" id="pagar-fatura-data" value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer border-0 pt-0">
                                <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-kontabs-primary" id="btn-confirmar-pagamento-fatura">
                                    <i class="bi bi-check-circle me-1"></i> Liquidar Fatura
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            const [accRes, cardRes] = await Promise.all([
                ApiService.get('accounts'),
                ApiService.get('creditcards')
            ]);

            this.accounts = accRes.data || [];
            this.cards = cardRes.data || [];
            this.totalBalance = (accRes.meta && accRes.meta.total_balance) ? accRes.meta.total_balance : 0;

            this.renderAccounts();
            this.renderCards();
            this.updateSummary();
            this.populateSelects();
        } catch (e) {
            console.error('Erro ao carregar contas e cartões:', e);
            jQuery('.accounts-grid-container').html(`
                <div class="col-12">
                    <div class="alert alert-warning">Não foi possível carregar os dados das contas. Verifique se a API está ativa.</div>
                </div>
            `);
        }
    }

    renderAccounts() {
        if (!this.accounts.length) {
            jQuery('.accounts-grid-container').html(`
                <div class="col-12">
                    <div class="kontabs-card p-4 text-center text-muted">
                        <i class="bi bi-bank fs-1 mb-2"></i>
                        <p class="mb-0">Nenhuma conta cadastrada para esta organização.</p>
                    </div>
                </div>
            `);
            jQuery('.count-accounts-label').text('0 contas ativas');
            return;
        }

        jQuery('.count-accounts-label').text(`${this.accounts.length} contas cadastradas`);

        let html = '';
        this.accounts.forEach(acc => {
            const balance = parseFloat(acc.current_balance || 0);
            const formatted = balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const isNegative = balance < 0;
            const badgeClass = acc.type === 'checking' ? 'bg-primary-subtle text-primary' : (acc.type === 'cash' ? 'bg-warning-subtle text-warning' : 'bg-info-subtle text-info');
            const typeLabel = acc.type === 'checking' ? 'Conta Corrente' : (acc.type === 'cash' ? 'Caixa / Gaveta' : 'Investimento');

            html += `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="kontabs-card p-4 h-100 d-flex flex-column justify-content-between shadow-hover">
                        <div>
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <span class="badge ${badgeClass}">${typeLabel}</span>
                                    <h5 class="fw-bold mt-1 mb-0">${acc.name}</h5>
                                </div>
                                <div class="rounded-circle p-2" style="background: rgba(15, 122, 74, 0.08); color: ${acc.color || '#0F7A4A'};">
                                    <i class="bi ${acc.icon || 'bi-bank'} fs-4"></i>
                                </div>
                            </div>
                            <div class="kontabs-kpi-value ${isNegative ? 'text-danger' : 'text-success'} mt-2 mb-1">
                                ${formatted}
                            </div>
                            <span class="text-muted small">Saldo real atualizado</span>
                        </div>
                        <div class="pt-3 border-top mt-3 d-flex justify-content-between align-items-center">
                            <span class="text-muted small"><i class="bi bi-shield-check text-success me-1"></i>Conciliado</span>
                            <button class="btn btn-sm btn-kontabs-outline" onclick="ContasView.openStatementModal(${acc.id}, '${acc.name}')">
                                <i class="bi bi-list-ul me-1"></i> Extrato
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        jQuery('.accounts-grid-container').html(html);
    }

    renderCards() {
        if (!this.cards.length) {
            jQuery('.cards-grid-container').html(`
                <div class="col-12">
                    <div class="kontabs-card p-4 text-center text-muted">
                        <i class="bi bi-credit-card fs-1 mb-2"></i>
                        <p class="mb-0">Nenhum cartão cadastrado para esta organização.</p>
                    </div>
                </div>
            `);
            jQuery('.count-cards-label').text('0 cartões');
            return;
        }

        jQuery('.count-cards-label').text(`${this.cards.length} cartões ativos`);

        let html = '';
        this.cards.forEach(item => {
            const card = item.card || item;
            const limit = parseFloat(item.credit_limit || card.credit_limit || 0);
            const used = parseFloat(item.used_limit || 0);
            const openInvoice = parseFloat(item.open_invoice_total || 0);
            const available = parseFloat(item.available_limit || (limit - used));
            const percentage = item.used_percentage || (limit > 0 ? Math.round((used / limit) * 100) : 0);

            html += `
                <div class="col-12 col-lg-6">
                    <div class="kontabs-card p-4 shadow-hover h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rounded-3 p-3 text-white d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, ${card.color || '#103C35'} 0%, #164E45 100%); width: 60px; height: 42px; border-radius: 8px;">
                                    <i class="bi bi-sim text-warning fs-5"></i>
                                </div>
                                <div>
                                    <h5 class="fw-bold mb-0">${card.name}</h5>
                                    <span class="text-muted small">Fecha dia ${card.closing_day || 20} • Vence dia ${card.due_day || 28}</span>
                                </div>
                            </div>
                            <span class="pill pill-warning">Melhor dia: ${item.best_day_to_buy || 21}</span>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between small fw-bold mb-1">
                                <span>Fatura Atual: R$ ${openInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <span class="text-muted">Limite: R$ ${limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            ${KontabsUI.progress(`prog-card-${card.id}`, used, limit, "", percentage > 80 ? 'danger' : 'warning')}
                        </div>

                        <div class="d-flex justify-content-between align-items-center text-muted small pt-3 border-top">
                            <div>
                                Limite Disponível: <strong class="text-success">R$ ${available.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                            </div>
                            <button class="btn btn-sm btn-kontabs-secondary" onclick="ContasView.openPayInvoiceModal(${card.id}, '${card.name}', ${openInvoice})">
                                <i class="bi bi-credit-card me-1"></i> Pagar Fatura
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        jQuery('.cards-grid-container').html(html);
    }

    updateSummary() {
        const formattedTotal = this.totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        jQuery('.total-accounts-balance').text(formattedTotal);

        let totalInvoices = 0;
        this.cards.forEach(c => {
            totalInvoices += parseFloat(c.open_invoice_total || 0);
        });
        jQuery('.total-open-invoices').text(totalInvoices.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    }

    populateSelects() {
        let options = '<option value="">Selecione a conta...</option>';
        this.accounts.forEach(acc => {
            options += `<option value="${acc.id}">${acc.name} (R$ ${parseFloat(acc.current_balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</option>`;
        });
        jQuery('#transf-origem, #transf-destino, #pagar-fatura-conta-id').html(options);
    }

    // Handlers e Modais Estáticos
    static openTransferModal() {
        const modal = new bootstrap.Modal(document.getElementById('modal-transferencia-contas'));
        modal.show();
    }

    static openNewAccountModal() {
        alert("Para cadastrar nova conta ou cartão, utilize a central de parametrização.");
    }

    static async openStatementModal(accountId, accountName) {
        jQuery('#extrato-conta-nome').text(accountName);
        jQuery('#extrato-tabela-itens').html('<tr><td colspan="4" class="text-center py-3"><div class="spinner-border spinner-border-sm text-success"></div> Carregando...</td></tr>');
        
        const modal = new bootstrap.Modal(document.getElementById('modal-extrato-conta'));
        modal.show();

        try {
            const res = await ApiService.get(`accounts/${accountId}/statement`);
            const data = res.data;
            if (!data || !data.transactions) {
                jQuery('#extrato-tabela-itens').html('<tr><td colspan="4" class="text-center py-3 text-muted">Nenhuma movimentação neste período.</td></tr>');
                return;
            }

            jQuery('#extrato-saldo-atual').text('R$ ' + parseFloat(data.current_balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
            jQuery('#extrato-periodo').text(data.month);

            let rows = '';
            data.transactions.forEach(t => {
                const color = t.is_income ? 'text-success' : 'text-danger';
                const dateParts = (t.due_date || t.competence_date).split('-');
                const formattedDate = `${dateParts[2]}/${dateParts[1]}`;

                rows += `
                    <tr>
                        <td class="small text-muted">${formattedDate}</td>
                        <td class="fw-bold">${t.description}</td>
                        <td class="small"><span class="badge bg-light text-dark">${t.category_name || 'Sem Categoria'}</span></td>
                        <td class="text-end fw-bold ${color}">${t.formatted_amount}</td>
                    </tr>
                `;
            });

            jQuery('#extrato-tabela-itens').html(rows);
        } catch (e) {
            jQuery('#extrato-tabela-itens').html('<tr><td colspan="4" class="text-center py-3 text-danger">Erro ao obter extrato da conta.</td></tr>');
        }
    }

    static openPayInvoiceModal(cardId, cardName, invoiceAmount) {
        jQuery('#pagar-fatura-card-id').val(cardId);
        jQuery('#pagar-fatura-card-nome').val(cardName);
        jQuery('#pagar-fatura-valor').val(invoiceAmount > 0 ? invoiceAmount : '');
        const modal = new bootstrap.Modal(document.getElementById('modal-pagar-fatura'));
        modal.show();
    }

    static async submitTransfer(event) {
        event.preventDefault();
        const fromId = jQuery('#transf-origem').val();
        const toId = jQuery('#transf-destino').val();
        const amount = jQuery('#transf-valor').val();
        const date = jQuery('#transf-data').val();
        const notes = jQuery('#transf-obs').val();

        if (fromId === toId) {
            alert('A conta de origem e a conta de destino devem ser diferentes.');
            return;
        }

        try {
            const btn = jQuery('#btn-salvar-transferencia');
            btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Transferindo...');

            await ApiService.post('accounts/transfer', {
                from_account_id: fromId,
                to_account_id: toId,
                amount: parseFloat(amount),
                date: date,
                notes: notes
            });

            bootstrap.Modal.getInstance(document.getElementById('modal-transferencia-contas')).hide();
            router.navigate('#/contas');
            new ContasView();
        } catch (e) {
            alert(e.message || 'Erro ao realizar transferência.');
        } finally {
            jQuery('#btn-salvar-transferencia').prop('disabled', false).html('<i class="bi bi-arrow-left-right me-1"></i> Confirmar Transferência');
        }
    }

    static async submitPayInvoice(event) {
        event.preventDefault();
        const cardId = jQuery('#pagar-fatura-card-id').val();
        const accountId = jQuery('#pagar-fatura-conta-id').val();
        const amount = jQuery('#pagar-fatura-valor').val();
        const date = jQuery('#pagar-fatura-data').val();

        try {
            const btn = jQuery('#btn-confirmar-pagamento-fatura');
            btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Liquidando...');

            await ApiService.post(`creditcards/${cardId}/pay`, {
                account_id: accountId,
                amount: parseFloat(amount),
                date: date
            });

            bootstrap.Modal.getInstance(document.getElementById('modal-pagar-fatura')).hide();
            router.navigate('#/contas');
            new ContasView();
        } catch (e) {
            alert(e.message || 'Erro ao liquidar fatura.');
        } finally {
            jQuery('#btn-confirmar-pagamento-fatura').prop('disabled', false).html('<i class="bi bi-check-circle me-1"></i> Liquidar Fatura');
        }
    }
}
