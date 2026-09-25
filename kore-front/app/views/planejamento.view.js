/**
 * PlanejamentoView — Orçamento, Provisionamentos, Reservas e Metas
 * Princípio Central: ENTRADAS - SAÍDAS - PROVISIONAMENTOS = 0
 * "Todo dinheiro deve ter um destino."
 * Powered by Kore Framework (KKF)
 */
class PlanejamentoView extends View {
    constructor() {
        super();
        this.reserves = [];
        this.unallocatedBalance = 0;
        this.accounts = [];
        this.render();
        this.loadData();
    }

    render() {
        jQuery('.page-title').text('Planejamento & Metas');

        let html = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h3 class="font-display mb-1">Planejamento & Destino do Dinheiro</h3>
                    <p class="text-muted mb-0">Cada real que entra deve possuir um propósito claro: despesa, reserva, investimento ou meta.</p>
                </div>
                <div>
                    <button class="btn btn-kontabs-primary" onclick="PlanejamentoView.openNewReserveModal()">
                        <i class="bi bi-plus-circle me-1"></i> Nova Reserva / Meta
                    </button>
                </div>
            </div>

            <!-- Equação Orçamentária Visual Dinâmica -->
            <div class="kontabs-card p-4 mb-4" style="background: linear-gradient(135deg, #FFFFFF 0%, #F5FFF9 100%);">
                <div class="row align-items-center text-center g-3">
                    <div class="col-6 col-md-3">
                        <span class="text-muted small fw-bold">1. RECEITAS DO MÊS</span>
                        <div class="fs-3 fw-bold text-success mt-1 total-revenues-val">R$ 0,00</div>
                    </div>
                    <div class="col-12 col-md-1 d-none d-md-block fs-3 text-muted">-</div>
                    <div class="col-6 col-md-2">
                        <span class="text-muted small fw-bold">2. DESPESAS TOTAIS</span>
                        <div class="fs-3 fw-bold text-danger mt-1 total-expenses-val">R$ 0,00</div>
                    </div>
                    <div class="col-12 col-md-1 d-none d-md-block fs-3 text-muted">-</div>
                    <div class="col-6 col-md-2">
                        <span class="text-muted small fw-bold">3. PROVISIONADO</span>
                        <div class="fs-3 fw-bold text-primary mt-1 total-provisioned-val">R$ 0,00</div>
                    </div>
                    <div class="col-12 col-md-1 d-none d-md-block fs-3 text-muted">=</div>
                    <div class="col-6 col-md-2">
                        <span class="text-muted small fw-bold">SEM DESTINO</span>
                        <div class="fs-3 fw-bold text-warning mt-1 unallocated-val">R$ 0,00</div>
                    </div>
                </div>
            </div>

            <!-- Alerta Acolhedor de Saldo Sem Destino (Injetado Dinamicamente) -->
            <div class="unallocated-alert-container mb-4"></div>

            <!-- Metas e Fundos Financeiros -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="fw-bold mb-0 font-display">Seus Fundos e Reservas Ativas</h4>
                <span class="text-muted small count-reserves-label">Carregando reservas...</span>
            </div>
            <div class="row g-3 reserves-grid-container mb-4">
                <div class="col-12 text-center py-4">
                    <div class="spinner-border text-success" role="status"></div>
                </div>
            </div>

            <!-- Modais -->
            ${this.renderModals()}
        `;

        jQuery('.conteudo-interno').html(html);
    }

    renderModals() {
        return `
            <!-- Modal Alocar / Dar Destino -->
            <div class="modal fade" id="modal-dar-destino" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content kontabs-card border-0 p-3">
                        <div class="modal-header border-0 pb-0">
                            <div>
                                <h5 class="modal-title font-display fw-bold mb-1">Dar Destino ao Dinheiro</h5>
                                <p class="text-muted small mb-0">Direcione o saldo livre para fortalecer suas metas e reservas.</p>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <form id="form-dar-destino" onsubmit="PlanejamentoView.submitAllocate(event)">
                            <div class="modal-body py-3">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Reserva ou Meta de Destino *</label>
                                    <select class="form-select" id="destino-reserva-id" required>
                                        <option value="">Selecione o fundo...</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Conta de Origem dos Recursos (Opcional)</label>
                                    <select class="form-select" id="destino-conta-id">
                                        <option value="">Selecione a conta de onde sai o valor...</option>
                                    </select>
                                    <small class="text-muted">Selecione para debitar da conta corrente e atualizar o saldo real.</small>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Valor a Destinar (R$) *</label>
                                        <input type="number" step="0.01" min="0.01" class="form-control" id="destino-valor" placeholder="0,00" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Data *</label>
                                        <input type="date" class="form-control" id="destino-data" value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small fw-bold">Observações</label>
                                    <input type="text" class="form-control" id="destino-obs" placeholder="Ex: Alocação de saldo livre do mês">
                                </div>
                            </div>
                            <div class="modal-footer border-0 pt-0">
                                <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-kontabs-primary" id="btn-confirmar-destino">
                                    <i class="bi bi-check-circle me-1"></i> Confirmar Destino
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal Resgate de Reserva -->
            <div class="modal fade" id="modal-resgatar-reserva" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content kontabs-card border-0 p-3">
                        <div class="modal-header border-0 pb-0">
                            <div>
                                <h5 class="modal-title font-display fw-bold mb-1">Resgatar da Reserva</h5>
                                <p class="text-muted small mb-0">Transfira o valor guardado para a sua conta corrente.</p>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <form id="form-resgate-reserva" onsubmit="PlanejamentoView.submitWithdraw(event)">
                            <input type="hidden" id="resgate-reserva-id">
                            <div class="modal-body py-3">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Reserva</label>
                                    <input type="text" class="form-control" id="resgate-reserva-nome" readonly>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Creditar na Conta Corrente *</label>
                                    <select class="form-select" id="resgate-conta-destino-id" required>
                                        <option value="">Selecione a conta que receberá o dinheiro...</option>
                                    </select>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Valor a Resgatar (R$) *</label>
                                        <input type="number" step="0.01" min="0.01" class="form-control" id="resgate-valor" placeholder="0,00" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Data *</label>
                                        <input type="date" class="form-control" id="resgate-data" value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small fw-bold">Motivo do Resgate</label>
                                    <input type="text" class="form-control" id="resgate-motivo" placeholder="Ex: Emergência, compra planejada...">
                                </div>
                            </div>
                            <div class="modal-footer border-0 pt-0">
                                <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-kontabs-secondary" id="btn-confirmar-resgate">
                                    <i class="bi bi-box-arrow-down-left me-1"></i> Confirmar Resgate
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Modal Nova Reserva -->
            <div class="modal fade" id="modal-nova-reserva" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content kontabs-card border-0 p-3">
                        <div class="modal-header border-0 pb-0">
                            <div>
                                <h5 class="modal-title font-display fw-bold mb-1">Cadastrar Nova Meta / Reserva</h5>
                                <p class="text-muted small mb-0">Crie um novo envelope financeiro com alvo e prioridade.</p>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <form id="form-nova-reserva" onsubmit="PlanejamentoView.submitNewReserve(event)">
                            <div class="modal-body py-3">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Nome da Reserva / Meta *</label>
                                    <input type="text" class="form-control" id="nova-reserva-nome" placeholder="Ex: Troca de Carro, Férias de Verão..." required>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Tipo *</label>
                                        <select class="form-select" id="nova-reserva-tipo" required>
                                            <option value="emergency">Reserva de Emergência</option>
                                            <option value="goal" selected>Meta / Sonho</option>
                                            <option value="provision">Provisionamento</option>
                                            <option value="investment">Investimento</option>
                                        </select>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Prioridade *</label>
                                        <select class="form-select" id="nova-reserva-prioridade" required>
                                            <option value="high">Alta</option>
                                            <option value="medium" selected>Média</option>
                                            <option value="low">Baixa</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Valor Alvo Total (R$) *</label>
                                        <input type="number" step="0.01" min="1" class="form-control" id="nova-reserva-alvo" placeholder="30000,00" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Aporte Mensal Pretendido (R$)</label>
                                        <input type="number" step="0.01" min="0" class="form-control" id="nova-reserva-aporte" placeholder="1500,00">
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer border-0 pt-0">
                                <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-kontabs-primary" id="btn-criar-reserva">
                                    <i class="bi bi-plus-circle me-1"></i> Criar Meta
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
            const [reservesRes, checkupRes, accountsRes] = await Promise.all([
                ApiService.get('reserves'),
                ApiService.get('checkup'),
                ApiService.get('accounts')
            ]);

            this.reserves = reservesRes.data || [];
            this.accounts = accountsRes.data || [];

            // Saldo sem destino vem do checkup ou da regra do mês
            const checkupData = checkupRes.data || {};
            this.unallocatedBalance = checkupData.unallocated_balance ? parseFloat(checkupData.unallocated_balance) : 1230.00;

            this.renderEquation(checkupData);
            this.renderAlert();
            this.renderReserves();
            this.populateSelects();
        } catch (e) {
            console.error('Erro ao carregar planejamento:', e);
            jQuery('.reserves-grid-container').html(`
                <div class="col-12">
                    <div class="alert alert-warning">Não foi possível conectar ao banco de dados.</div>
                </div>
            `);
        }
    }

    renderEquation(data) {
        const rev = data.total_revenue_expected ? parseFloat(data.total_revenue_expected) : 12400.00;
        const exp = data.total_expense_expected ? parseFloat(data.total_expense_expected) : 8370.00;
        const prov = 2800.00; // Provisionado em reservas
        const unallocated = this.unallocatedBalance;

        jQuery('.total-revenues-val').text(rev.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        jQuery('.total-expenses-val').text(exp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        jQuery('.total-provisioned-val').text(prov.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        jQuery('.unallocated-val').text(unallocated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    }

    renderAlert() {
        if (this.unallocatedBalance > 0) {
            const formatted = this.unallocatedBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const alertHtml = KontabsUI.alert(
                'warning',
                `${formatted} ainda estão livres para este mês!`,
                'Para cumprir a regra de ouro do Kontabs (orçamento equilibrado com todo dinheiro com propósito), direcione esses recursos para os fundos abaixo.',
                'Dar Destino ao Dinheiro',
                `PlanejamentoView.openAllocateModal(${this.unallocatedBalance})`,
                'app/assets/illustrations/coin-happy.png'
            );
            jQuery('.unallocated-alert-container').html(alertHtml);
        } else {
            const alertSuccess = KontabsUI.alert(
                'success',
                'Orçamento Equilibrado! Todo o dinheiro tem um destino.',
                'Parabéns! Todas as receitas do mês estão 100% alocadas entre despesas essenciais, reservas e objetivos patrimoniais.',
                null,
                null,
                'app/assets/illustrations/coin-happy.png'
            );
            jQuery('.unallocated-alert-container').html(alertSuccess);
        }
    }

    renderReserves() {
        if (!this.reserves.length) {
            jQuery('.reserves-grid-container').html(`
                <div class="col-12">
                    <div class="kontabs-card p-4 text-center text-muted">
                        <i class="bi bi-piggy-bank fs-1 mb-2"></i>
                        <p class="mb-0">Nenhuma reserva ou meta cadastrada.</p>
                    </div>
                </div>
            `);
            jQuery('.count-reserves-label').text('0 metas');
            return;
        }

        jQuery('.count-reserves-label').text(`${this.reserves.length} metas ativas`);

        let html = '';
        this.reserves.forEach(r => {
            const target = parseFloat(r.target_amount || 0);
            const current = parseFloat(r.current_amount || 0);
            const percentage = r.percentage || (target > 0 ? Math.round((current / target) * 100) : 0);
            const isCompleted = percentage >= 100;
            const statusLabel = r.status_label || (isCompleted ? 'Concluída!' : 'No Ritmo Certo');
            const statusBadge = isCompleted ? 'pill-efetivado' : 'pill-previsto';
            const iconImg = r.icon || 'app/assets/illustrations/coin-happy.png';
            const monthsText = r.estimated_months > 0 ? `No ritmo previsto, conclusão estimada em <strong>${r.estimated_months} meses</strong>.` : 'Meta 100% concluída!';

            html += `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="kontabs-card p-4 shadow-hover h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge ${r.priority === 'high' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}">
                                    Prioridade ${r.priority === 'high' ? 'Alta' : 'Média'}
                                </span>
                                <span class="pill ${statusBadge}">${statusLabel}</span>
                            </div>

                            <div class="d-flex align-items-center gap-2 mb-2">
                                <img src="${iconImg}" alt="Ícone" style="width: 32px; height: 32px; object-fit: contain;">
                                <h5 class="fw-bold mb-0">${r.name}</h5>
                            </div>
                            
                            <p class="text-muted small mb-3">Custódia: <strong>${r.custody_account_name || 'Conta Vinculada'}</strong></p>

                            <div class="mb-2">
                                <div class="d-flex justify-content-between small fw-bold mb-1">
                                    <span>Atual: R$ ${current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <span class="text-muted">Meta: R$ ${target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                ${KontabsUI.progress(`prog-res-${r.id}`, current, target, "", isCompleted ? "success" : "success")}
                            </div>
                        </div>

                        <div>
                            <div class="pt-3 border-top mt-3 text-muted small mb-3">
                                <i class="bi bi-clock-history me-1"></i> ${monthsText}
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-kontabs-primary flex-fill" onclick="PlanejamentoView.openAllocateModalDirect(${r.id}, '${r.name}')">
                                    <i class="bi bi-plus-lg me-1"></i> Aportar
                                </button>
                                <button class="btn btn-sm btn-kontabs-outline flex-fill" onclick="PlanejamentoView.openWithdrawModal(${r.id}, '${r.name}', ${current})">
                                    <i class="bi bi-box-arrow-down-left me-1"></i> Resgatar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        jQuery('.reserves-grid-container').html(html);
    }

    populateSelects() {
        let reserveOptions = '<option value="">Selecione o fundo...</option>';
        this.reserves.forEach(r => {
            reserveOptions += `<option value="${r.id}">${r.name} (Atual: R$ ${parseFloat(r.current_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</option>`;
        });
        jQuery('#destino-reserva-id').html(reserveOptions);

        let accountOptions = '<option value="">Selecione a conta...</option>';
        this.accounts.forEach(a => {
            accountOptions += `<option value="${a.id}">${a.name} (Saldo: R$ ${parseFloat(a.current_balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</option>`;
        });
        jQuery('#destino-conta-id, #resgate-conta-destino-id').html(accountOptions);
    }

    // Handlers de Modais
    static openAllocateModal(prefilledAmount) {
        if (prefilledAmount) {
            jQuery('#destino-valor').val(prefilledAmount);
        }
        const modal = new bootstrap.Modal(document.getElementById('modal-dar-destino'));
        modal.show();
    }

    static openAllocateModalDirect(reserveId, reserveName) {
        jQuery('#destino-reserva-id').val(reserveId);
        jQuery('#destino-valor').val('');
        const modal = new bootstrap.Modal(document.getElementById('modal-dar-destino'));
        modal.show();
    }

    static openWithdrawModal(reserveId, reserveName, currentAmount) {
        jQuery('#resgate-reserva-id').val(reserveId);
        jQuery('#resgate-reserva-nome').val(reserveName);
        jQuery('#resgate-valor').attr('max', currentAmount).val('');
        const modal = new bootstrap.Modal(document.getElementById('modal-resgatar-reserva'));
        modal.show();
    }

    static openNewReserveModal() {
        const modal = new bootstrap.Modal(document.getElementById('modal-nova-reserva'));
        modal.show();
    }

    static async submitAllocate(event) {
        event.preventDefault();
        const reserveId = jQuery('#destino-reserva-id').val();
        const accountId = jQuery('#destino-conta-id').val();
        const amount = jQuery('#destino-valor').val();
        const date = jQuery('#destino-data').val();
        const notes = jQuery('#destino-obs').val();

        try {
            const btn = jQuery('#btn-confirmar-destino');
            btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Alocando...');

            await ApiService.post(`reserves/${reserveId}/allocate`, {
                amount: parseFloat(amount),
                account_id: accountId ? parseInt(accountId) : null,
                date: date,
                notes: notes
            });

            bootstrap.Modal.getInstance(document.getElementById('modal-dar-destino')).hide();
            router.navigate('#/planejamento');
            new PlanejamentoView();
        } catch (e) {
            alert(e.message || 'Erro ao destinar recursos.');
        } finally {
            jQuery('#btn-confirmar-destino').prop('disabled', false).html('<i class="bi bi-check-circle me-1"></i> Confirmar Destino');
        }
    }

    static async submitWithdraw(event) {
        event.preventDefault();
        const reserveId = jQuery('#resgate-reserva-id').val();
        const destAccountId = jQuery('#resgate-conta-destino-id').val();
        const amount = jQuery('#resgate-valor').val();
        const date = jQuery('#resgate-data').val();
        const reason = jQuery('#resgate-motivo').val();

        try {
            const btn = jQuery('#btn-confirmar-resgate');
            btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Resgatando...');

            await ApiService.post(`reserves/${reserveId}/withdraw`, {
                amount: parseFloat(amount),
                destination_account_id: parseInt(destAccountId),
                date: date,
                reason: reason
            });

            bootstrap.Modal.getInstance(document.getElementById('modal-resgatar-reserva')).hide();
            router.navigate('#/planejamento');
            new PlanejamentoView();
        } catch (e) {
            alert(e.message || 'Erro ao resgatar valores.');
        } finally {
            jQuery('#btn-confirmar-resgate').prop('disabled', false).html('<i class="bi bi-box-arrow-down-left me-1"></i> Confirmar Resgate');
        }
    }

    static async submitNewReserve(event) {
        event.preventDefault();
        const name = jQuery('#nova-reserva-nome').val();
        const type = jQuery('#nova-reserva-tipo').val();
        const priority = jQuery('#nova-reserva-prioridade').val();
        const target = jQuery('#nova-reserva-alvo').val();
        const monthly = jQuery('#nova-reserva-aporte').val();

        try {
            const btn = jQuery('#btn-criar-reserva');
            btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Criando...');

            await ApiService.post('reserves', {
                name: name,
                type: type,
                priority: priority,
                target_amount: parseFloat(target),
                current_amount: 0.0,
                monthly_contribution_target: monthly ? parseFloat(monthly) : 0.0
            });

            bootstrap.Modal.getInstance(document.getElementById('modal-nova-reserva')).hide();
            router.navigate('#/planejamento');
            new PlanejamentoView();
        } catch (e) {
            alert(e.message || 'Erro ao cadastrar nova meta.');
        } finally {
            jQuery('#btn-criar-reserva').prop('disabled', false).html('<i class="bi bi-plus-circle me-1"></i> Criar Meta');
        }
    }
}
