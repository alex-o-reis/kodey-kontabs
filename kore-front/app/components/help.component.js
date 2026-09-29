/**
 * KontabsHelp — Sistema de Ajuda Integrado e Central de Conhecimento na Tela
 * Powered by Kore Framework (KKF)
 * Acesso instantâneo a FAQ, busca de conceitos, atalhos e canais de suporte oficiais Kodey
 */
class KontabsHelp {
    static isInitialized = false;

    static faqItems = [
        {
            category: "Conceitos Básicos",
            icon: "bi-lightbulb-fill",
            color: "text-warning",
            question: "O que é 'Dinheiro Sem Destino'?",
            answer: `
                No Kontabs, todo dinheiro que entra na sua conta deve ter uma finalidade planejada. 
                Quando seu saldo disponível ultrapassa a soma de despesas e contas previstas para o mês, o sistema alerta:
                <br><em>'Você possui R$ X ainda sem destino'</em>.
                <br>O objetivo é incentivar você a transferir essa sobra para suas <strong>Reservas de Emergência</strong>, metas ou investimentos, evitando que o dinheiro seja gasto por impulso.
            `
        },
        {
            category: "Conceitos Básicos",
            icon: "bi-exclamation-triangle-fill",
            color: "text-danger",
            question: "O que é 'Dinheiro Sem Origem'?",
            answer: `
                Ocorre quando você realizou pagamentos ou compras acima do saldo ou orçamento planejado. 
                O Kontabs alerta imediatamente: <em>'Existem R$ X utilizados cuja origem ainda não foi informada'</em>.
                <br>Basta indicar de onde o recurso saiu (reserva financeira, limite do cartão, cheque especial ou aporte de capital) para restaurar a transparência total do seu fluxo de caixa.
            `
        },
        {
            category: "Conceitos Básicos",
            icon: "bi-sliders",
            color: "text-primary",
            question: "Como funciona a regra 'Previsto vs. Realizado'?",
            answer: `
                Toda movimentação financeira preserva dois valores:
                <ul>
                    <li><strong>Valor Previsto:</strong> A expectativa ou orçamento estipulado no início do mês.</li>
                    <li><strong>Valor Realizado:</strong> O valor que efetivamente foi compensado ou pago no banco.</li>
                </ul>
                Dessa forma, o Kontabs consegue mostrar desvios orçamentários precisos (ex: <em>'Alimentação ficou R$ 120 acima do planejado'</em>), permitindo correções em tempo real.
            `
        },
        {
            category: "Contas & Cartões",
            icon: "bi-wallet2",
            color: "text-success",
            question: "Como cadastrar minhas contas bancárias e cartões?",
            answer: `
                Acesse a aba <strong>Contas & Cartões</strong> no menu lateral. 
                <br>Clique em <em>'+ Nova Conta'</em> para cadastrar contas correntes (Inter, Nubank, Itaú, Bradesco, etc.) ou dinheiro físico.
                <br>Em <em>'+ Novo Cartão'</em>, configure o limite de crédito, dia de fechamento e dia de vencimento da fatura.
            `
        },
        {
            category: "Contas & Cartões",
            icon: "bi-credit-card-2-front",
            color: "text-info",
            question: "O uso do limite do cartão duplica despesas na fatura?",
            answer: `
                Não! O Kontabs possui rastreamento inteligente de cartões: as despesas entram nas respectivas categorias (ex: Restaurante, Mercado) usando o limite do cartão, e no fechamento da fatura não ocorre dupla contabilização de despesas.
            `
        },
        {
            category: "Multi-Organização",
            icon: "bi-buildings",
            color: "text-success",
            question: "Como alternar entre Finanças Pessoais (PF) e da Minha Empresa (PJ)?",
            answer: `
                No topo da tela, clique no seletor onde aparece o nome da sua organização atual. 
                <br>Você verá todas as suas organizações cadastradas. Basta clicar na organização desejada para alternar na hora. 
                Você também pode criar uma nova organização a qualquer momento clicando em <em>'+ Nova Organização'</em>.
            `
        },
        {
            category: "Rotina Financeira",
            icon: "bi-shield-check",
            color: "text-primary",
            question: "O que é o 'Check-up Semanal' e quando devo fazer?",
            answer: `
                O <strong>Check-up Semanal</strong> é uma rotina de 3 a 5 minutos projetada para ser feita toda sexta-feira ou segunda-feira.
                <br>Em poucas telas acolhedoras você confirma movimentações liquidadas, antecipa contas que vencem nos próximos 7 dias e garante que seu caixa está saudável.
            `
        },
        {
            category: "Plataforma & Deploy",
            icon: "bi-cloud-check",
            color: "text-dark",
            question: "Como o sistema detecta se está rodando localmente ou online?",
            answer: `
                O Kontabs detecta automaticamente o domínio atual no navegador e no servidor PHP:
                <ul>
                    <li><strong>Online:</strong> Frontend em <code>kontabs.kodey.com.br</code> se conecta diretamente ao backend em <code>https://kontabsapi.kodey.com.br/</code> com CORS seguro e certificados SSL.</li>
                    <li><strong>Localmente:</strong> Quando acessado via <code>localhost</code> ou <code>127.0.0.1</code>, o sistema aponta automaticamente para a API local (porta 8000/8001), permitindo desenvolvimento ágil.</li>
                </ul>
            `
        }
    ];

    /**
     * Inicializa o botão flutuante e a estrutura do componente
     */
    static init() {
        if (KontabsHelp.isInitialized) return;
        KontabsHelp.isInitialized = true;

        // Injeta Botão Flutuante de Ajuda na tela
        const floatingBtn = `
            <div id="kontabs-floating-help-container">
                <button type="button" class="btn btn-kontabs-floating-help shadow-lg d-flex align-items-center gap-2" onclick="KontabsHelp.open()" title="Ajuda & Suporte (Ctrl + H)">
                    <span class="pulse-indicator"></span>
                    <i class="bi bi-question-circle-fill fs-5"></i>
                    <span class="d-none d-sm-inline fw-bold small">Ajuda & Dúvidas</span>
                </button>
            </div>
        `;

        if (!document.getElementById('kontabs-floating-help-container')) {
            jQuery('body').append(floatingBtn);
        }

        // Adiciona atalho de teclado global (Ctrl + H ou ?)
        jQuery(document).on('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                KontabsHelp.open();
            }
        });
    }

    /**
     * Abre a gaveta de ajuda (Offcanvas/Modal)
     */
    static open() {
        KontabsHelp.ensureDrawer();
        const offcanvasEl = document.getElementById('kontabs-help-offcanvas');
        if (offcanvasEl) {
            const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
            bsOffcanvas.show();
        }
        // Foca no campo de busca
        setTimeout(() => jQuery('#help-search-input').focus(), 300);
    }

    static ensureDrawer() {
        if (document.getElementById('kontabs-help-offcanvas')) return;

        const isLocal = window.KONTABS_IS_LOCAL;
        const apiUrl = ApiService.getBaseUrl();

        const drawerHtml = `
            <div class="offcanvas offcanvas-end border-0 shadow-lg" tabindex="-1" id="kontabs-help-offcanvas" style="width: 480px; max-width: 95vw; background: #FFFDF7;">
                <!-- Header da Central de Ajuda -->
                <div class="offcanvas-header border-bottom py-3 px-4" style="background: var(--kk-green-700); color: #ffffff;">
                    <div class="d-flex align-items-center gap-3">
                        <div class="bg-white p-2 rounded-3 text-success d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                            <i class="bi bi-question-circle-fill fs-5" style="color: var(--kk-green-600);"></i>
                        </div>
                        <div>
                            <h5 class="offcanvas-title font-display fw-bold mb-0 text-white">Central de Ajuda</h5>
                            <span class="text-white-50 small" style="font-size: 0.78rem;">Suporte e Orientações Kodey Kontabs</span>
                        </div>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
                </div>

                <!-- Corpo da Central de Ajuda -->
                <div class="offcanvas-body p-4">
                    <!-- Barra de Pesquisa Rápida -->
                    <div class="mb-4">
                        <div class="input-group shadow-sm rounded-pill overflow-hidden border">
                            <span class="input-group-text bg-white border-0 text-muted ps-3">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" class="form-control border-0 py-2" id="help-search-input" placeholder="Buscar dúvidas, conceitos ou funções..." oninput="KontabsHelp.filterFaq(this.value)">
                            <button class="btn btn-white text-muted border-0 pe-3" type="button" onclick="jQuery('#help-search-input').val(''); KontabsHelp.filterFaq('')">
                                <i class="bi bi-x-circle"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Pílulas de Ações Rápidas -->
                    <div class="mb-4">
                        <label class="form-label text-uppercase fw-bold text-muted" style="font-size: 0.72rem; letter-spacing: 0.05em;">Ações Recomendadas</label>
                        <div class="d-flex flex-wrap gap-2">
                            <button type="button" class="btn btn-sm btn-outline-success rounded-pill fw-semibold py-1 px-3 d-flex align-items-center gap-1" onclick="KontabsHelp.close(); KontabsTutorial.start();">
                                <i class="bi bi-mortarboard-fill"></i> Iniciar Tutorial do Sistema
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill fw-semibold py-1 px-3 d-flex align-items-center gap-1" onclick="KontabsHelp.close(); KontabsUI.openNovaMovimentacaoModal();">
                                <i class="bi bi-plus-circle"></i> Nova Movimentação
                            </button>
                            <a href="#/checkup" class="btn btn-sm btn-outline-secondary rounded-pill fw-semibold py-1 px-3 d-flex align-items-center gap-1" onclick="KontabsHelp.close();">
                                <i class="bi bi-shield-check"></i> Check-up Semanal
                            </a>
                        </div>
                    </div>

                    <!-- Lista de Perguntas Frequentes (FAQ) -->
                    <div class="mb-4">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="form-label text-uppercase fw-bold text-muted mb-0" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                                Dúvidas & Conceitos Principais
                            </label>
                            <span class="badge bg-light text-muted border" id="faq-counter">${KontabsHelp.faqItems.length} tópicos</span>
                        </div>
                        
                        <div class="accordion accordion-flush rounded-4 overflow-hidden border bg-white" id="accordionHelpFaq">
                            ${KontabsHelp.renderFaqItems(KontabsHelp.faqItems)}
                        </div>
                    </div>

                    <!-- Canais de Contato Direto Kodey -->
                    <div class="p-3 rounded-4 mb-4" style="background: var(--kk-mint-100); border: 1px solid rgba(15, 122, 74, 0.2);">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i class="bi bi-headset fs-5" style="color: var(--kk-green-700);"></i>
                            <strong class="text-dark">Precisa de Suporte Humano?</strong>
                        </div>
                        <p class="small text-muted mb-3">
                            Nossa equipe técnica da <strong>Kodey Sistemas</strong> está pronta para ajudar você ou sua empresa.
                        </p>
                        <div class="d-grid gap-2">
                            <a href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20Kodey%20Kontabs" target="_blank" class="btn btn-sm btn-success fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3 py-2">
                                <i class="bi bi-whatsapp"></i> Falar pelo WhatsApp
                            </a>
                            <a href="mailto:suporte@kodey.com.br?subject=Dúvida%20no%20Kodey%20Kontabs" class="btn btn-sm btn-outline-dark fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3 py-2">
                                <i class="bi bi-envelope"></i> Enviar E-mail (suporte@kodey.com.br)
                            </a>
                        </div>
                    </div>

                    <!-- Diagnóstico Técnico do Ambiente -->
                    <div class="p-3 bg-white rounded-4 border text-muted small" style="font-size: 0.78rem;">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-bold text-dark">Status da Conexão:</span>
                            <span class="badge ${isLocal ? 'bg-secondary' : 'bg-success'}">
                                ${isLocal ? 'Modo Local' : 'Online'}
                            </span>
                        </div>
                        <div class="text-truncate mb-1">
                            <strong>API:</strong> <code class="text-dark">${apiUrl}</code>
                        </div>
                        <div>
                            <strong>Versão:</strong> Kodey Kontabs v1.0.0 (Kore Framework)
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery('body').append(drawerHtml);
    }

    static renderFaqItems(items) {
        if (!items.length) {
            return `
                <div class="p-4 text-center text-muted small">
                    <i class="bi bi-search fs-4 d-block mb-2 text-secondary"></i>
                    Nenhum resultado encontrado para a sua busca.<br>Tente palavras-chave como <em>'destino'</em>, <em>'cartão'</em> ou <em>'previsto'</em>.
                </div>
            `;
        }

        return items.map((item, idx) => `
            <div class="accordion-item faq-item" data-search="${(item.question + ' ' + item.category + ' ' + item.answer).toLowerCase()}">
                <h2 class="accordion-header" id="headingHelp${idx}">
                    <button class="accordion-button collapsed py-3 small fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseHelp${idx}" aria-expanded="false" aria-controls="collapseHelp${idx}">
                        <i class="bi ${item.icon} ${item.color} me-2 fs-6"></i>
                        <span>${item.question}</span>
                    </button>
                </h2>
                <div id="collapseHelp${idx}" class="accordion-collapse collapse" aria-labelledby="headingHelp${idx}" data-bs-parent="#accordionHelpFaq">
                    <div class="accordion-body py-3 small text-secondary bg-light" style="line-height: 1.6;">
                        ${item.answer}
                    </div>
                </div>
            </div>
        `).join('');
    }

    static filterFaq(query) {
        const q = (query || '').toLowerCase().trim();
        const items = jQuery('.faq-item');

        if (!q) {
            items.removeClass('d-none');
            jQuery('#faq-counter').text(`${KontabsHelp.faqItems.length} tópicos`);
            return;
        }

        let visibleCount = 0;
        items.each(function() {
            const text = jQuery(this).attr('data-search') || '';
            if (text.includes(q)) {
                jQuery(this).removeClass('d-none');
                visibleCount++;
            } else {
                jQuery(this).addClass('d-none');
            }
        });

        jQuery('#faq-counter').text(`${visibleCount} encontrado(s)`);
    }

    static close() {
        const offcanvasEl = document.getElementById('kontabs-help-offcanvas');
        if (offcanvasEl) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            if (bsOffcanvas) bsOffcanvas.hide();
        }
    }
}
