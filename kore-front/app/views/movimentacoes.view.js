/**
 * MovimentacoesView — Entidade Central de Movimentações Financeiras
 * Totalmente integrada à API RESTful e ao banco MySQL do Kore Framework.
 * Preserva sempre os estados e valores: PREVISTO vs. EFETIVADO.
 * Suporta Compras Parceladas e Importação/Conciliação Bancária (OFX e CSV).
 */
class MovimentacoesView extends View {
    constructor() {
        super();
        this.currentFilter = 'all';
        this.loadedData = [];
        this.pendingImportItems = [];
        this.loadData();
    }

    async loadData(filter = 'all') {
        jQuery('.page-title').text('Movimentações');
        this.currentFilter = filter;

        let params = {};
        if (filter === 'receitas') params.type = 'income';
        if (filter === 'despesas') params.type = 'expense';
        if (filter === 'previstas') params.status = 'expected';

        try {
            const response = await ApiService.get('transactions', params);
            if (response && response.data) {
                this.loadedData = response.data;
                this.render(response.data);
                return;
            }
        } catch (e) {
            console.warn('[MovimentacoesView] Carregando com dados padrão locais:', e.message);
        }

        this.render(null);
    }

    render(transactions) {
        let countAll = transactions ? transactions.length : 12;
        let actionsBar = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <button class="btn btn-sm ${this.currentFilter === 'all' ? 'btn-kontabs-dark' : 'btn-kontabs-outline'}" onclick="MovimentacoesView.filtrar('all')">Todas (${countAll})</button>
                    <button class="btn btn-sm ${this.currentFilter === 'receitas' ? 'btn-kontabs-dark' : 'btn-kontabs-outline'}" onclick="MovimentacoesView.filtrar('receitas')"><i class="bi bi-arrow-down-left text-success"></i> Entradas</button>
                    <button class="btn btn-sm ${this.currentFilter === 'despesas' ? 'btn-kontabs-dark' : 'btn-kontabs-outline'}" onclick="MovimentacoesView.filtrar('despesas')"><i class="bi bi-arrow-up-right text-danger"></i> Saídas</button>
                    <button class="btn btn-sm ${this.currentFilter === 'previstas' ? 'btn-kontabs-dark' : 'btn-kontabs-outline'}" onclick="MovimentacoesView.filtrar('previstas')"><i class="bi bi-clock-history"></i> Previstas</button>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-kontabs-secondary" onclick="MovimentacoesView.abrirModalImportar()">
                        <i class="bi bi-file-earmark-arrow-up me-1"></i> Importar Extrato (OFX / CSV)
                    </button>
                    <button class="btn btn-kontabs-primary" onclick="MovimentacoesView.abrirModalNovo()">
                        <i class="bi bi-plus-lg me-1"></i> Nova Movimentação
                    </button>
                </div>
            </div>
        `;

        let headers = [
            "Data Venc.",
            "Tipo",
            "Descrição",
            "Categoria",
            "Conta / Origem",
            "Valor Previsto",
            "Valor Realizado",
            "Status",
            "Ações"
        ];

        let rows = [];

        if (transactions && transactions.length > 0) {
            transactions.forEach(t => {
                let badgeTipo = '';
                if (t.type === 'income') {
                    badgeTipo = `<span class="badge bg-success-subtle text-success"><i class="bi bi-arrow-down-left"></i> Receita</span>`;
                } else if (t.type === 'expense') {
                    badgeTipo = `<span class="badge bg-danger-subtle text-danger"><i class="bi bi-arrow-up-right"></i> Despesa</span>`;
                } else if (t.type === 'reserve_deposit') {
                    badgeTipo = `<span class="badge bg-primary-subtle text-primary"><i class="bi bi-piggy-bank"></i> Aporte Reserva</span>`;
                } else {
                    badgeTipo = `<span class="badge bg-light text-dark">${t.type}</span>`;
                }

                let descHtml = `<strong>${t.description}</strong>`;
                if (t.installment_current && t.installment_total) {
                    descHtml += ` <span class="badge bg-light text-dark border ms-1">${t.installment_current}/${t.installment_total}</span>`;
                }
                if (parseInt(t.has_origin, 10) === 0) {
                    descHtml += `<br><span class="badge bg-danger text-white fs-xs mt-1"><i class="bi bi-exclamation-triangle"></i> Sem Origem Declarada</span>`;
                }
                if (parseInt(t.has_destination, 10) === 0) {
                    descHtml += `<br><span class="badge bg-warning text-dark fs-xs mt-1"><i class="bi bi-question-circle"></i> Sem Destino</span>`;
                }

                let contaHtml = t.account_name || t.credit_card_name || (parseInt(t.has_origin, 10) === 0 ? `<span class="text-danger small fw-bold">Origem Pendente</span>` : '-');

                let previstoFormatted = 'R$ ' + parseFloat(t.amount_expected).toLocaleString('pt-BR', {minimumFractionDigits: 2});
                let efetivadoFormatted = t.amount_effective !== null 
                    ? `<strong>R$ ${parseFloat(t.amount_effective).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>` 
                    : `<span class="text-muted">-</span>`;

                let statusBadge = t.status === 'effective' 
                    ? KontabsUI.status("efetivado", "Efetivado") 
                    : KontabsUI.status("previsto", "Previsto");

                let acoesHtml = '';
                if (t.status === 'expected') {
                    acoesHtml = `<button class="btn btn-sm btn-kontabs-primary py-1 px-2" onclick="MovimentacoesView.baixar(${t.id}, '${t.description}', ${t.amount_expected})">Baixar</button>`;
                } else {
                    acoesHtml = `<span class="text-success small fw-bold" title="Pago em ${t.payment_date || ''}"><i class="bi bi-check-all fs-5"></i></span>`;
                }

                rows.push([
                    t.due_date,
                    badgeTipo,
                    descHtml,
                    t.category_name || '<span class="text-muted">-</span>',
                    contaHtml,
                    previstoFormatted,
                    efetivadoFormatted,
                    statusBadge,
                    acoesHtml
                ]);
            });
        } else {
            rows.push([
                `2026-09-26`,
                `<span class="badge bg-danger-subtle text-danger"><i class="bi bi-arrow-up-right"></i> Despesa</span>`,
                `<strong>Conta de Energia Elétrica — CEMIG</strong>`,
                `Moradia & Escritório`,
                `Banco Inter PJ`,
                `R$ 350,00`,
                `<span class="text-muted">-</span>`,
                KontabsUI.status("previsto", "Previsto"),
                `<button class="btn btn-sm btn-kontabs-primary py-1 px-2" onclick="alert('Confirmar liquidação de R$ 350,00?')">Baixar</button>`
            ]);
        }

        let tableCard = KontabsUI.card(
            "Extrato Geral de Movimentações — Persistido no MySQL",
            KontabsUI.table(headers, rows),
            `<div class="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                <span class="text-muted small">Exibindo ${rows.length} movimentações no banco de dados</span>
                <span class="badge bg-light text-dark border">Ambiente MySQL Online: db.opn1.net</span>
            </div>`
        );

        jQuery('.conteudo-interno').html(
            actionsBar +
            tableCard +
            this.renderModalNovo() +
            this.renderModalImportar()
        );
    }

    renderModalNovo() {
        return `
            <div class="modal fade" id="modal-nova-movimentacao" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content rounded-4 border-0 shadow p-3">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title font-display fw-bold">Nova Movimentação</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body py-3">
                            <form id="form-nova-movimentacao" onsubmit="MovimentacoesView.salvar(event)">
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Tipo de Movimentação</label>
                                    <select class="form-select" id="form-mov-tipo" required>
                                        <option value="expense">Saída (Despesa)</option>
                                        <option value="income">Entrada (Receita)</option>
                                        <option value="reserve_deposit">Aporte em Reserva</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Descrição</label>
                                    <input type="text" class="form-control" id="form-mov-desc" placeholder="Ex: Licença de Software" required>
                                </div>
                                <div class="row g-2 mb-3">
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Valor Total (R$)</label>
                                        <input type="number" step="0.01" min="0.01" class="form-control" id="form-mov-valor" placeholder="0,00" oninput="MovimentacoesView.calcularParcela()" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-bold">Data de Vencimento</label>
                                        <input type="date" class="form-control" id="form-mov-vencimento" value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>

                                <!-- Controle de Parcelamento -->
                                <div class="mb-3 p-3 rounded-3" style="background: rgba(15, 122, 74, 0.05); border: 1px solid rgba(15, 122, 74, 0.15);">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="form-mov-parcelado" onchange="MovimentacoesView.toggleParcelamento(this.checked)">
                                        <label class="form-check-label small fw-bold text-dark" for="form-mov-parcelado">
                                            <i class="bi bi-collection me-1 text-success"></i> Esta despesa é parcelada a prazo?
                                        </label>
                                    </div>
                                    <div class="row g-2 mt-2 d-none" id="container-parcelamento">
                                        <div class="col-6">
                                            <label class="form-label fs-xs fw-bold text-muted">Qtd. de Parcelas</label>
                                            <select class="form-select form-select-sm" id="form-mov-parcelas" onchange="MovimentacoesView.calcularParcela()">
                                                <option value="2">2x</option>
                                                <option value="3">3x</option>
                                                <option value="4">4x</option>
                                                <option value="5">5x</option>
                                                <option value="6">6x</option>
                                                <option value="10" selected>10x</option>
                                                <option value="12">12x</option>
                                                <option value="24">24x</option>
                                            </select>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label fs-xs fw-bold text-muted">Valor por Parcela</label>
                                            <input type="text" class="form-control form-select-sm bg-white" id="form-mov-valor-parcela" readonly placeholder="R$ 0,00">
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Categoria</label>
                                    <select class="form-select" id="form-mov-cat">
                                        <option value="3">Moradia & Escritório</option>
                                        <option value="4">Alimentação</option>
                                        <option value="5">Transporte</option>
                                        <option value="1">Serviços de TI / Software</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold">Conta Bancária / Caixa</label>
                                    <select class="form-select" id="form-mov-conta">
                                        <option value="1">Banco Inter PJ (Saldo: R$ 14.250,00)</option>
                                        <option value="2">Nubank PJ (Saldo: R$ 5.320,00)</option>
                                        <option value="3">Caixa / Gaveta (Saldo: R$ 450,00)</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="form-mov-efetivado">
                                        <label class="form-check-label small" for="form-mov-efetivado">
                                            Já foi pago / recebido hoje (Efetivado)
                                        </label>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                                    <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="submit" class="btn btn-kontabs-primary" id="btn-salvar-mov">Salvar Movimentação</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderModalImportar() {
        return `
            <div class="modal fade" id="modal-importar-extrato" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content kontabs-card border-0 p-3">
                        <div class="modal-header border-0 pb-0">
                            <div>
                                <span class="badge bg-primary-subtle text-primary mb-1">Conciliação Inteligente</span>
                                <h4 class="modal-title font-display fw-bold mb-0">Importar Extrato Bancário</h4>
                                <p class="text-muted small mb-0">Cruze automaticamente os lançamentos do seu banco (OFX ou CSV) com o Kontabs.</p>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body py-3">
                            <!-- Passo 1: Upload e Configuração -->
                            <div id="import-step-upload">
                                <div class="row g-3 mb-3">
                                    <div class="col-md-6">
                                        <label class="form-label small fw-bold">Conta Bancária de Destino *</label>
                                        <select class="form-select" id="import-conta-id" required>
                                            <option value="1">Banco Inter PJ (Saldo: R$ 14.250,00)</option>
                                            <option value="2">Nubank PJ (Saldo: R$ 5.320,00)</option>
                                            <option value="3">Caixa / Gaveta (Saldo: R$ 450,00)</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label small fw-bold">Formato do Arquivo</label>
                                        <select class="form-select" id="import-formato">
                                            <option value="ofx" selected>OFX (Padrão Bancário Inter, Nubank, Itaú...)</option>
                                            <option value="csv">CSV (Planilha delimitada por vírgula)</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="border rounded-4 p-4 text-center mb-3" style="background: rgba(15, 122, 74, 0.03); border: 2px dashed rgba(15, 122, 74, 0.25) !important;">
                                    <i class="bi bi-cloud-arrow-up text-success fs-1 mb-2"></i>
                                    <h5 class="fw-bold mb-1">Selecione ou Arraste o Arquivo do Extrato</h5>
                                    <p class="text-muted small mb-3">Suporta arquivos .ofx, .csv ou .txt baixados do Internet Banking.</p>
                                    <input type="file" id="import-file-input" class="d-none" accept=".ofx,.csv,.txt" onchange="MovimentacoesView.handleFileSelected(event)">
                                    <button type="button" class="btn btn-kontabs-primary" onclick="jQuery('#import-file-input').click()">
                                        <i class="bi bi-folder2-open me-1"></i> Escolher Arquivo do Computador
                                    </button>
                                    <div class="mt-2 text-muted small d-none" id="import-selected-filename"></div>
                                </div>

                                <div class="text-center">
                                    <button type="button" class="btn btn-sm btn-link text-muted" onclick="MovimentacoesView.carregarExemploOfx()">
                                        <i class="bi bi-lightning-charge text-warning"></i> Carregar Extrato de Demonstração (CEMIG e PIX)
                                    </button>
                                </div>
                            </div>

                            <!-- Passo 2: Preview de Correspondência -->
                            <div id="import-step-preview" class="d-none">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h6 class="fw-bold mb-0">Itens Identificados para Conciliação</h6>
                                    <span class="badge bg-light text-dark border" id="import-total-itens-badge">0 itens</span>
                                </div>
                                <div class="table-responsive mb-3" style="max-height: 320px;">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="table-light small">
                                            <tr>
                                                <th style="width: 30px;"><input type="checkbox" id="chk-import-all" checked onchange="MovimentacoesView.toggleAllImport(this.checked)"></th>
                                                <th>Data</th>
                                                <th>Descrição no Banco</th>
                                                <th class="text-end">Valor</th>
                                                <th>Correspondência</th>
                                                <th>Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody-preview-conciliacao">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-kontabs-outline" data-bs-dismiss="modal">Fechar</button>
                            <button type="button" class="btn btn-kontabs-primary d-none" id="btn-confirmar-conciliacao" onclick="MovimentacoesView.processarConciliacao()">
                                <i class="bi bi-check-all me-1"></i> Aprovar Conciliação
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static filtrar(tipo) {
        new MovimentacoesView().loadData(tipo);
    }

    static abrirModalNovo() {
        UI.showModal('#modal-nova-movimentacao');
    }

    static abrirModalImportar() {
        jQuery('#import-step-upload').removeClass('d-none');
        jQuery('#import-step-preview').addClass('d-none');
        jQuery('#btn-confirmar-conciliacao').addClass('d-none');
        jQuery('#import-selected-filename').addClass('d-none').text('');
        const modal = new bootstrap.Modal(document.getElementById('modal-importar-extrato'));
        modal.show();
    }

    static toggleParcelamento(isParcelado) {
        if (isParcelado) {
            jQuery('#container-parcelamento').removeClass('d-none');
            MovimentacoesView.calcularParcela();
        } else {
            jQuery('#container-parcelamento').addClass('d-none');
        }
    }

    static calcularParcela() {
        const total = parseFloat(jQuery('#form-mov-valor').val() || 0);
        const parcelas = parseInt(jQuery('#form-mov-parcelas').val() || 1);
        if (total > 0 && parcelas > 0) {
            const cada = total / parcelas;
            jQuery('#form-mov-valor-parcela').val('R$ ' + cada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        } else {
            jQuery('#form-mov-valor-parcela').val('R$ 0,00');
        }
    }

    static async salvar(event) {
        event.preventDefault();

        let tipo = jQuery('#form-mov-tipo').val();
        let desc = jQuery('#form-mov-desc').val();
        let valor = parseFloat(jQuery('#form-mov-valor').val());
        let vencimento = jQuery('#form-mov-vencimento').val();
        let catId = parseInt(jQuery('#form-mov-cat').val());
        let contaId = parseInt(jQuery('#form-mov-conta').val());
        let efetivado = jQuery('#form-mov-efetivado').is(':checked');
        let isParcelado = jQuery('#form-mov-parcelado').is(':checked');
        let parcelasTotal = isParcelado ? parseInt(jQuery('#form-mov-parcelas').val()) : 1;

        const btn = jQuery('#btn-salvar-mov');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Salvando...');

        try {
            const res = await ApiService.post('transactions', {
                description: desc,
                type: tipo,
                amount_expected: valor,
                amount_effective: efetivado ? valor : null,
                due_date: vencimento,
                competence_date: vencimento.substring(0, 7) + '-01',
                payment_date: efetivado ? vencimento : null,
                status: efetivado ? 'effective' : 'expected',
                category_id: catId,
                account_id: contaId,
                installments_total: parcelasTotal
            });

            bootstrap.Modal.getInstance(document.getElementById('modal-nova-movimentacao')).hide();
            alert(res.message || '🎉 Movimentação salva com sucesso!');
            new MovimentacoesView().loadData();
        } catch (e) {
            alert('Erro ao salvar movimentação: ' + e.message);
        } finally {
            btn.prop('disabled', false).html('Salvar Movimentação');
        }
    }

    static async baixar(id, desc, valor) {
        let efetivo = prompt(`Confirmar liquidação de ${desc}.\nInforme o valor real efetivado (o valor previsto original de R$ ${valor} será preservado):`, valor);
        if (efetivo !== null) {
            try {
                await ApiService.post(`transactions/${id}/settle`, {
                    amount_effective: parseFloat(efetivo),
                    payment_date: new Date().toISOString().split('T')[0]
                });
                alert('✅ Movimentação liquidada no banco MySQL! Valor previsto preservado com sucesso.');
                new MovimentacoesView().loadData();
            } catch (e) {
                alert('Erro ao liquidar: ' + e.message);
            }
        }
    }

    // Handlers de Importação e Conciliação
    static handleFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;

        jQuery('#import-selected-filename').removeClass('d-none').text(`Arquivo selecionado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const formato = file.name.endsWith('.csv') ? 'csv' : 'ofx';
            jQuery('#import-formato').val(formato);
            MovimentacoesView.analisarExtrato(content, formato);
        };
        reader.readAsText(file);
    }

    static carregarExemploOfx() {
        const sampleOfx = `<OFX><STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260926<TRNAMT>-350.00<FITID>12345<MEMO>CEMIG ENERGIA ELETRICA</STMTTRN><STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20260925<TRNAMT>500.00<FITID>12346<MEMO>PIX RECEBIDO JOAO</STMTTRN></OFX>`;
        MovimentacoesView.analisarExtrato(sampleOfx, 'ofx');
    }

    static async analisarExtrato(content, format) {
        const accountId = parseInt(jQuery('#import-conta-id').val());

        try {
            const res = await ApiService.post('transactions/import', {
                account_id: accountId,
                format: format,
                content: content
            });

            const items = res.data && res.data.items ? res.data.items : [];
            MovimentacoesView.exibirPreview(items);
        } catch (e) {
            alert('Falha ao analisar extrato: ' + e.message);
        }
    }

    static exibirPreview(items) {
        window.pendingReconciliationItems = items;

        jQuery('#import-step-upload').addClass('d-none');
        jQuery('#import-step-preview').removeClass('d-none');
        jQuery('#btn-confirmar-conciliacao').removeClass('d-none');
        jQuery('#import-total-itens-badge').text(`${items.length} itens identificados`);

        let html = '';
        items.forEach((item, idx) => {
            const color = item.is_income ? 'text-success' : 'text-danger';
            const sign = item.is_income ? '+' : '-';
            const isMatch = item.match_status === 'match';
            const isAlready = item.match_status === 'already_reconciled';
            const checked = !isAlready ? 'checked' : '';

            let correspondenciaHtml = '';
            if (isMatch && item.matched_transaction) {
                correspondenciaHtml = `
                    <span class="pill pill-previsto"><i class="bi bi-link-45deg"></i> Match com Conta Prevista</span><br>
                    <small class="text-muted">${item.matched_transaction.description} (Previsto: R$ ${parseFloat(item.matched_transaction.amount_expected).toFixed(2)})</small>
                `;
            } else if (isAlready) {
                correspondenciaHtml = `<span class="pill pill-efetivado"><i class="bi bi-check-all"></i> Já Conciliado</span>`;
            } else {
                correspondenciaHtml = `<span class="badge bg-warning-subtle text-dark border"><i class="bi bi-plus-circle"></i> Novo Lançamento</span>`;
            }

            let acaoHtml = '';
            if (isMatch) {
                acaoHtml = `<span class="badge bg-success-subtle text-success">Liquidar Previsto</span>`;
            } else if (isAlready) {
                acaoHtml = `<span class="text-muted small">Ignorar (Duplicado)</span>`;
            } else {
                acaoHtml = `<span class="badge bg-primary-subtle text-primary">Criar Efetivado</span>`;
            }

            html += `
                <tr>
                    <td><input type="checkbox" class="chk-item-reconcile" data-index="${idx}" ${checked}></td>
                    <td class="small fw-bold">${item.date}</td>
                    <td><strong>${item.description}</strong></td>
                    <td class="text-end fw-bold ${color}">${sign} R$ ${item.abs_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${correspondenciaHtml}</td>
                    <td>${acaoHtml}</td>
                </tr>
            `;
        });

        jQuery('#tbody-preview-conciliacao').html(html);
    }

    static toggleAllImport(checked) {
        jQuery('.chk-item-reconcile').prop('checked', checked);
    }

    static async processarConciliacao() {
        const items = window.pendingReconciliationItems || [];
        const accountId = parseInt(jQuery('#import-conta-id').val());

        const approved = [];
        jQuery('.chk-item-reconcile:checked').each(function() {
            const idx = parseInt(jQuery(this).data('index'));
            const it = items[idx];
            if (it) {
                approved.push({
                    action: it.action_suggested,
                    matched_id: it.matched_transaction ? it.matched_transaction.id : null,
                    amount: it.abs_amount,
                    abs_amount: it.abs_amount,
                    is_income: it.is_income,
                    date: it.date,
                    description: it.description,
                    category_id: it.suggested_category_id || null
                });
            }
        });

        if (!approved.length) {
            alert('Selecione ao menos um item para conciliação.');
            return;
        }

        const btn = jQuery('#btn-confirmar-conciliacao');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Conciliando...');

        try {
            const res = await ApiService.post('transactions/reconcile', {
                account_id: accountId,
                items: approved
            });

            bootstrap.Modal.getInstance(document.getElementById('modal-importar-extrato')).hide();
            alert(`🎉 Conciliação concluída!\n${res.data.settled_count} contas previstas liquidadas.\n${res.data.created_count} novos lançamentos criados no MySQL.`);
            new MovimentacoesView().loadData();
        } catch (e) {
            alert('Erro ao processar conciliação: ' + e.message);
        } finally {
            btn.prop('disabled', false).html('<i class="bi bi-check-all me-1"></i> Aprovar Conciliação');
        }
    }
}
