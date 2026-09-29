/**
 * KontabsTutorial — Tutorial Interativo e Onboarding do Kodey Kontabs
 * Powered by Kore Framework (KKF)
 * Apresenta a filosofia acolhedora "Cada real com uma origem. Cada real com um destino."
 */
class KontabsTutorial {
    static currentStep = 0;
    static totalSteps = 7;

    static steps = [
        {
            title: "Bem-vindo ao Kodey Kontabs! 🌿",
            subtitle: "Cada real com uma origem. Cada real com um destino.",
            badge: "Princípio Central",
            illustration: "app/assets/illustrations/mascot-workspace.png",
            content: `
                <p class="fs-6 text-secondary mb-3">
                    O <strong>Kontabs</strong> não é apenas mais um cadastro de receitas e despesas. Nós transformamos o controle financeiro em uma jornada <strong>leve, acolhedora e positiva</strong>.
                </p>
                <div class="p-3 rounded-4 bg-light border border-success-subtle mb-3">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <i class="bi bi-shield-check fs-5 text-success"></i>
                        <strong class="text-dark">A Regra de Ouro:</strong>
                    </div>
                    <p class="mb-0 small text-muted">
                        Todo dinheiro que entra deve ter uma <strong>origem declarada</strong> e, antes mesmo de ser gasto, um <strong>destino planejado</strong> (contas fixas, envelopes de estilo de vida, ou reservas).
                    </p>
                </div>
            `,
            tip: "Você nunca mais precisará se perguntar 'para onde foi o meu dinheiro?' no fim do mês."
        },
        {
            title: "Dinheiro Sem Destino & Sem Origem 🎯",
            subtitle: "Elimine a sensação de descontrole e dinheiro sumindo",
            badge: "Inteligência Proativa",
            illustration: "app/assets/illustrations/coin-happy.png",
            content: `
                <div class="row g-3 mb-3">
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded-4 h-100" style="background: rgba(34, 197, 94, 0.08); border-left: 4px solid var(--kk-green-500);">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="badge bg-success">🟢 Sem Destino</span>
                            </div>
                            <p class="small text-muted mb-0">
                                Se sobra saldo não alocado no mês, o sistema não deixa o dinheiro parado: ele sugere enviar para sua <strong>Reserva de Emergência</strong> ou metas.
                            </p>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded-4 h-100" style="background: rgba(255, 122, 107, 0.08); border-left: 4px solid var(--kk-coral);">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="badge bg-danger">🔴 Sem Origem</span>
                            </div>
                            <p class="small text-muted mb-0">
                                Gastou acima do previsto ou ficou negativo? O Kontabs ajuda você a declarar de onde cobrir (cartão, empréstimo ou reserva), sem sustos.
                            </p>
                        </div>
                    </div>
                </div>
            `,
            tip: "Tudo é apresentado com linguagem positiva e acolhedora, sem julgamento."
        },
        {
            title: "Previsto vs. Realizado ⚖️",
            subtitle: "Planeje primeiro, liquide quando o dinheiro se mover",
            badge: "Precisão Financeira",
            illustration: "app/assets/illustrations/chart-growth.png",
            content: `
                <p class="small text-secondary mb-3">
                    No Kontabs, todas as contas possuem duas etapas fundamentais:
                </p>
                <ul class="list-group list-group-flush small mb-3 border rounded-3">
                    <li class="list-group-item d-flex align-items-center justify-content-between py-2">
                        <span><i class="bi bi-clock-history me-2 text-warning"></i><strong>Previsto:</strong> O valor planejado ou agendado.</span>
                        <span class="badge bg-warning-subtle text-warning-emphasis">A Pagar / A Receber</span>
                    </li>
                    <li class="list-group-item d-flex align-items-center justify-content-between py-2">
                        <span><i class="bi bi-check2-circle me-2 text-success"></i><strong>Realizado:</strong> O valor que efetivamente saiu ou entrou na conta.</span>
                        <span class="badge bg-success-subtle text-success">Liquidado</span>
                    </li>
                </ul>
            `,
            tip: "Assim você descobre desvios orçamentários antes que o mês termine."
        },
        {
            title: "Lançando Novas Movimentações ➕",
            subtitle: "Rápido, intuitivo e com total clareza",
            badge: "No Topo da Tela",
            illustration: "app/assets/illustrations/receipt-happy.png",
            content: `
                <p class="small text-secondary mb-3">
                    No topo de qualquer tela, basta clicar no botão verde <strong>+ Nova Movimentação</strong> (ou usar o atalho <code>Ctrl + M</code>).
                </p>
                <div class="p-3 bg-light rounded-4 border mb-2 small text-muted">
                    <div class="mb-2"><strong>1. Escolha o tipo:</strong> Receita, Despesa ou Transferência entre contas.</div>
                    <div class="mb-2"><strong>2. Defina os valores:</strong> Valor previsto e se já foi pago/recebido.</div>
                    <div class="mb-0"><strong>3. Vincule a uma conta e categoria:</strong> O sistema cuida de todo o restante.</div>
                </div>
            `,
            tip: "Você também pode parcelar despesas em até 48x com cálculo de vencimentos automático."
        },
        {
            title: "Multi-Organizações: Pessoal & Empresa 🏢",
            subtitle: "Separe seu CPF do seu CNPJ sem precisar sair do sistema",
            badge: "Dupla Gestão",
            illustration: "app/assets/illustrations/wallet-green.png",
            content: `
                <p class="small text-secondary mb-3">
                    Uma das maiores causas de desorganização é misturar dinheiro pessoal com despesas do negócio. O Kontabs resolve isso na raiz:
                </p>
                <div class="d-flex align-items-center gap-3 p-3 rounded-4 bg-light border mb-2">
                    <div class="bg-success-subtle p-3 rounded-circle text-success fs-4">
                        <i class="bi bi-buildings"></i>
                    </div>
                    <div class="small">
                        <strong class="text-dark">Seletor no topo da tela:</strong>
                        <p class="mb-0 text-muted">Basta clicar no nome da organização para alternar instantaneamente entre sua <strong>Pessoa Física (PF)</strong> e sua <strong>Empresa (PJ)</strong>.</p>
                    </div>
                </div>
            `,
            tip: "Cada organização possui suas próprias contas bancárias, cartões e relatórios independentes."
        },
        {
            title: "O Check-up Semanal de 3 Minutos ⏱️",
            subtitle: "Paz de espírito toda sexta-feira",
            badge: "Hábito Poderoso",
            illustration: "app/assets/alerts/alert-fraud-check.png",
            content: `
                <p class="small text-secondary mb-3">
                    Não gaste horas do seu final de semana com conciliação. A experiência do <strong>Check-up Semanal</strong> guia você em 4 passos rápidos:
                </p>
                <ol class="small text-muted mb-3 ps-3">
                    <li class="mb-1">Confirmar movimentações pagas e recebidas nos últimos 7 dias.</li>
                    <li class="mb-1">Conferir contas a vencer na próxima semana.</li>
                    <li class="mb-1">Dar destino ao dinheiro livre ou apontar origem de desvios.</li>
                    <li class="mb-0">Acompanhar o crescimento da sua Reserva de Emergência.</li>
                </ol>
            `,
            tip: "Clique em 'Check-up Semanal' no menu lateral para fazer sua primeira conferência!"
        },
        {
            title: "Próximos Passos Recomendados 🚀",
            subtitle: "3 ações práticas para você começar com o pé direito",
            badge: "Comece Agora",
            illustration: "app/assets/illustrations/coin-happy.png",
            content: `
                <p class="small text-secondary mb-3">
                    Pronto! Agora que você conhece os princípios do Kontabs, recomendamos seguir estes <strong>3 primeiros passos</strong> para ter total controle do seu dinheiro:
                </p>
                <div class="d-flex flex-column gap-2 mb-3">
                    <div class="p-3 rounded-3 bg-light border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge rounded-circle bg-success text-white p-2" style="width: 26px; height: 26px; display: grid; place-items: center;">1</span>
                            <div>
                                <strong class="fs-xs d-block text-dark">Cadastrar Saldo Real da Conta</strong>
                                <span class="fs-xs text-muted">Informe quanto você tem no banco hoje para seu saldo bater 100%.</span>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-kontabs-outline text-nowrap" onclick="KontabsTutorial.goTo('#/contas')">
                            <i class="bi bi-wallet2 me-1"></i> Ir para Contas
                        </button>
                    </div>

                    <div class="p-3 rounded-3 bg-light border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge rounded-circle bg-primary text-white p-2" style="width: 26px; height: 26px; display: grid; place-items: center;">2</span>
                            <div>
                                <strong class="fs-xs d-block text-dark">Lançar Primeira Movimentação</strong>
                                <span class="fs-xs text-muted">Cadastre sua primeira conta a pagar ou receita prevista do mês.</span>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-kontabs-primary text-nowrap" onclick="KontabsTutorial.openNovaMovimentacao()">
                            <i class="bi bi-plus-lg me-1"></i> Lançar Agora
                        </button>
                    </div>

                    <div class="p-3 rounded-3 bg-light border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge rounded-circle bg-warning text-dark p-2" style="width: 26px; height: 26px; display: grid; place-items: center;">3</span>
                            <div>
                                <strong class="fs-xs d-block text-dark">Criar Meta ou Reserva</strong>
                                <span class="fs-xs text-muted">Defina uma meta para destinar seu dinheiro livre e criar segurança.</span>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-kontabs-outline text-nowrap" onclick="KontabsTutorial.goTo('#/planejamento')">
                            <i class="bi bi-piggy-bank me-1"></i> Ver Metas
                        </button>
                    </div>
                </div>
            `,
            tip: "Se precisar rever este tutorial a qualquer momento, clique em 'Como Usar' no topo da tela ou use a Central de Ajuda (Ctrl + H)."
        }
    ];

    /**
     * Verifica se deve abrir automaticamente (primeiro login desta conta)
     */
    static checkAutoStart() {
        try {
            const user = (typeof ApiService !== 'undefined') ? ApiService.getUser() : null;
            if (!user) return; // Só abre após autenticação confirmada

            const currentHash = window.location.hash || '';
            if (currentHash === '#/login' || currentHash === '#/register') return;

            const userId = user.id || user.username || user.email;
            const userKey = `kontabs_tutorial_seen_${userId}`;
            const seen = localStorage.getItem(userKey);

            if (!seen) {
                // Abre automaticamente com um delay suave para garantir montagem do DOM
                setTimeout(() => {
                    KontabsTutorial.start();
                }, 700);
            }
        } catch (e) {
            console.warn('[KontabsTutorial] checkAutoStart:', e);
        }
    }

    /**
     * Inicia ou reinicia o tutorial
     */
    static start(stepIndex = 0) {
        KontabsTutorial.currentStep = stepIndex;
        KontabsTutorial.ensureModal();
        KontabsTutorial.renderStep();
        const modalEl = document.getElementById('modal-kontabs-tutorial');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    }

    static ensureModal() {
        if (document.getElementById('modal-kontabs-tutorial')) return;

        const modalHtml = `
            <div class="modal fade" id="modal-kontabs-tutorial" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" style="max-width: 620px;">
                    <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style="background: #ffffff;">
                        <!-- Barra de Progresso Superior -->
                        <div class="progress" style="height: 5px; border-radius: 0;">
                            <div class="progress-bar" id="tutorial-progress-bar" role="progressbar" style="width: 14%; background-color: var(--kk-green-600); transition: width 0.3s ease;"></div>
                        </div>

                        <!-- Header com Badge de Etapa -->
                        <div class="modal-header border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                            <span class="badge rounded-pill px-3 py-2 text-uppercase fw-bold" id="tutorial-step-badge" style="background: var(--kk-mint-100); color: var(--kk-green-700); font-size: 0.72rem; letter-spacing: 0.05em;">
                                Passo 1 de 7
                            </span>
                            <button type="button" class="btn btn-sm btn-link text-muted text-decoration-none" onclick="KontabsTutorial.dismiss()" title="Pular Tutorial">
                                <i class="bi bi-x-lg fs-6"></i>
                            </button>
                        </div>

                        <!-- Corpo do Passo -->
                        <div class="modal-body px-4 py-3" id="tutorial-step-body">
                            <!-- Injetado dinamicamente -->
                        </div>

                        <!-- Footer com Navegação -->
                        <div class="modal-footer border-0 px-4 pb-4 pt-1 d-flex justify-content-between align-items-center bg-white">
                            <button type="button" class="btn btn-link text-muted text-decoration-none btn-sm fw-semibold" onclick="KontabsTutorial.dismiss()">
                                Pular Tutorial
                            </button>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn btn-light rounded-pill px-3 btn-sm fw-semibold" id="btn-tutorial-prev" onclick="KontabsTutorial.prev()">
                                    <i class="bi bi-arrow-left me-1"></i> Anterior
                                </button>
                                <button type="button" class="btn btn-kontabs-primary rounded-pill px-4 btn-sm fw-bold shadow-sm" id="btn-tutorial-next" onclick="KontabsTutorial.next()">
                                    Próximo <i class="bi bi-arrow-right ms-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery('body').append(modalHtml);
    }

    static renderStep() {
        const step = KontabsTutorial.steps[KontabsTutorial.currentStep];
        const stepNum = KontabsTutorial.currentStep + 1;
        const pct = Math.round((stepNum / KontabsTutorial.totalSteps) * 100);

        jQuery('#tutorial-progress-bar').css('width', `${pct}%`);
        jQuery('#tutorial-step-badge').text(`Passo ${stepNum} de ${KontabsTutorial.totalSteps} • ${step.badge}`);

        const bodyHtml = `
            <div class="text-center mb-3">
                <img src="${step.illustration}" alt="${step.title}" style="max-height: 110px; object-fit: contain;" class="mb-2">
                <h4 class="font-display fw-bold mb-1" style="color: var(--kk-green-700);">${step.title}</h4>
                <p class="text-muted small mb-0">${step.subtitle}</p>
            </div>
            <div class="tutorial-content-area">
                ${step.content}
            </div>
            ${step.tip ? `
                <div class="p-2 rounded-3 text-muted small d-flex align-items-center gap-2" style="background: #F8FAF9; font-size: 0.8rem;">
                    <i class="bi bi-lightbulb-fill text-warning fs-6"></i>
                    <span><strong>Dica Kontabs:</strong> ${step.tip}</span>
                </div>
            ` : ''}
        `;

        jQuery('#tutorial-step-body').html(bodyHtml);

        // Ajusta botões
        if (KontabsTutorial.currentStep === 0) {
            jQuery('#btn-tutorial-prev').addClass('invisible');
        } else {
            jQuery('#btn-tutorial-prev').removeClass('invisible');
        }

        if (KontabsTutorial.currentStep === KontabsTutorial.totalSteps - 1) {
            jQuery('#btn-tutorial-next').html('<i class="bi bi-rocket-takeoff-fill me-1"></i> Começar a Usar').removeClass('btn-kontabs-primary').addClass('btn-success');
        } else {
            jQuery('#btn-tutorial-next').html('Próximo <i class="bi bi-arrow-right ms-1"></i>').removeClass('btn-success').addClass('btn-kontabs-primary');
        }
    }

    static next() {
        if (KontabsTutorial.currentStep < KontabsTutorial.totalSteps - 1) {
            KontabsTutorial.currentStep++;
            KontabsTutorial.renderStep();
        } else {
            KontabsTutorial.finish();
        }
    }

    static prev() {
        if (KontabsTutorial.currentStep > 0) {
            KontabsTutorial.currentStep--;
            KontabsTutorial.renderStep();
        }
    }

    static finish() {
        KontabsTutorial.markSeen();
        const modalEl = document.getElementById('modal-kontabs-tutorial');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
    }

    static dismiss() {
        KontabsTutorial.markSeen();
        const modalEl = document.getElementById('modal-kontabs-tutorial');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }
    }

    static markSeen() {
        try {
            const user = (typeof ApiService !== 'undefined') ? ApiService.getUser() : null;
            if (user) {
                const userId = user.id || user.username || user.email;
                localStorage.setItem(`kontabs_tutorial_seen_${userId}`, '1');
            }
            localStorage.setItem('kontabs_tutorial_seen', '1');
        } catch (e) {}
    }

    static goTo(route) {
        KontabsTutorial.finish();
        window.location.hash = route;
    }

    static openNovaMovimentacao() {
        KontabsTutorial.finish();
        if (typeof KontabsUI !== 'undefined' && KontabsUI.openNovaMovimentacaoModal) {
            KontabsUI.openNovaMovimentacaoModal();
        } else {
            window.location.hash = '#/movimentacoes';
        }
    }
}
