/**
 * LoginView — Tela de Autenticação e Registro Oficial Kodey Kontabs
 * Powered by Kore Framework (KKF)
 * Suporte a Login tradicional, Cadastro de nova conta e Registro/Login com Google
 */
class LoginView extends View {
    constructor(initialTab = 'login') {
        super();
        this.activeTab = initialTab;
        this.render();
        this.setupGoogleServices();
    }

    render() {
        const isRegister = this.activeTab === 'register';

        let html = `
            <div class="d-flex align-items-center justify-content-center min-vh-100 py-4 px-3" style="background: radial-gradient(circle at 10% 20%, #FFFDF7 0%, #F5FFF9 90%);">
                <div class="kontabs-card shadow-lg p-4 p-md-5 my-3" style="max-width: 480px; width: 100%; border-radius: 28px; background: #ffffff;">
                    <!-- Brand Header -->
                    <div class="text-center mb-3">
                        <img src="app/assets/logos/logo-horizontal.png" alt="Kodey Kontabs" style="max-height: 58px;" class="mb-2">
                        <h4 class="font-display fw-bold mb-1" style="color: var(--kk-green-700);" id="auth-main-title">
                            ${isRegister ? 'Crie sua Conta Gratuita' : 'Acesse suas Finanças'}
                        </h4>
                        <p class="text-muted small mb-0">Cada real com uma origem. Cada real com um destino.</p>
                    </div>

                    <!-- Abas de Alternância: Entrar vs Criar Conta -->
                    <div class="d-flex p-1 bg-light rounded-pill mb-4 border">
                        <button type="button" class="btn btn-sm flex-fill rounded-pill py-2 fw-bold ${!isRegister ? 'btn-kontabs-primary text-white shadow-sm' : 'btn-link text-muted text-decoration-none'}" id="tab-btn-login" onclick="LoginView.switchTab('login')">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Acessar Conta
                        </button>
                        <button type="button" class="btn btn-sm flex-fill rounded-pill py-2 fw-bold ${isRegister ? 'btn-kontabs-primary text-white shadow-sm' : 'btn-link text-muted text-decoration-none'}" id="tab-btn-register" onclick="LoginView.switchTab('register')">
                            <i class="bi bi-person-plus-fill me-1"></i> Criar Nova Conta
                        </button>
                    </div>

                    <!-- Mensagem de Alerta / Erro -->
                    <div id="auth-alert" class="alert alert-danger py-2 small d-none mb-3" role="alert">
                        <i class="bi bi-exclamation-circle me-1"></i> <span id="auth-alert-text"></span>
                    </div>

                    <!-- ============================================== -->
                    <!-- FORMULÁRIO 1: LOGIN -->
                    <!-- ============================================== -->
                    <form id="form-kontabs-login" class="${isRegister ? 'd-none' : ''}" onsubmit="LoginView.submitLogin(event)">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-dark">Usuário ou E-mail</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-person"></i></span>
                                <input type="text" class="form-control border-start-0" id="login-user" placeholder="Seu e-mail ou usuário" required autocomplete="username">
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <label class="form-label small fw-bold text-dark mb-0">Senha de Acesso</label>
                                <a href="javascript:;" onclick="LoginView.showForgotModal()" class="text-muted small text-decoration-none">Esqueceu?</a>
                            </div>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-shield-lock"></i></span>
                                <input type="password" class="form-control border-start-0" id="login-pass" placeholder="••••••••" required autocomplete="current-password">
                            </div>
                        </div>

                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="login-lembrar" checked>
                            <label class="form-check-label small text-muted" for="login-lembrar">
                                Lembrar de mim neste dispositivo
                            </label>
                        </div>

                        <button type="submit" class="btn btn-kontabs-primary w-100 py-2 fs-6 fw-bold mb-2 shadow-sm" id="btn-login-submit">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Entrar no Kontabs
                        </button>
                    </form>

                    <!-- ============================================== -->
                    <!-- FORMULÁRIO 2: REGISTRO / CADASTRO -->
                    <!-- ============================================== -->
                    <form id="form-kontabs-register" class="${!isRegister ? 'd-none' : ''}" onsubmit="LoginView.submitRegister(event)">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-dark">Nome Completo <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-person-badge"></i></span>
                                <input type="text" class="form-control border-start-0" id="reg-name" placeholder="Ex: Alex Oliveira" required autocomplete="name">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label small fw-bold text-dark">E-mail de Acesso <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-envelope"></i></span>
                                <input type="email" class="form-control border-start-0" id="reg-email" placeholder="seuemail@exemplo.com" required autocomplete="email">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label small fw-bold text-dark">Tipo de Finanças <span class="text-danger">*</span></label>
                            <div class="row g-2">
                                <div class="col-6">
                                    <input type="radio" class="btn-check" name="reg-org-type" id="org-type-pf" value="PF" checked>
                                    <label class="btn btn-outline-success w-100 small py-2 d-flex align-items-center justify-content-center gap-1" for="org-type-pf">
                                        <i class="bi bi-person-heart"></i>
                                        <span>Pessoal (PF)</span>
                                    </label>
                                </div>
                                <div class="col-6">
                                    <input type="radio" class="btn-check" name="reg-org-type" id="org-type-pj" value="PJ">
                                    <label class="btn btn-outline-success w-100 small py-2 d-flex align-items-center justify-content-center gap-1" for="org-type-pj">
                                        <i class="bi bi-buildings"></i>
                                        <span>Empresa (PJ)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="row g-2 mb-3">
                            <div class="col-sm-6">
                                <label class="form-label small fw-bold text-dark">Senha <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-key"></i></span>
                                    <input type="password" class="form-control border-start-0" id="reg-pass" placeholder="Mínimo 6 dígitos" minlength="6" required autocomplete="new-password">
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <label class="form-label small fw-bold text-dark">Confirmar Senha <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-check-circle"></i></span>
                                    <input type="password" class="form-control border-start-0" id="reg-pass-confirm" placeholder="Repita a senha" minlength="6" required autocomplete="new-password">
                                </div>
                            </div>
                        </div>

                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="reg-termos" checked required>
                            <label class="form-check-label small text-muted" for="reg-termos">
                                Concordo com os <a href="termos.php" target="_blank" class="text-success text-decoration-none fw-semibold">Termos de Uso</a> e a <a href="privacidade.php" target="_blank" class="text-success text-decoration-none fw-semibold">Política de Privacidade</a>.
                            </label>
                        </div>

                        <button type="submit" class="btn btn-kontabs-primary w-100 py-2 fs-6 fw-bold mb-2 shadow-sm" id="btn-reg-submit">
                            <i class="bi bi-sparkles me-1"></i> Criar Conta Gratuita
                        </button>
                    </form>

                    <!-- Divisor Visual Oficial -->
                    <div class="d-flex align-items-center my-3">
                        <hr class="flex-grow-1 my-0 text-muted opacity-25">
                        <span class="px-3 small text-muted fw-semibold" style="font-size: 0.8rem;">ou continue com</span>
                        <hr class="flex-grow-1 my-0 text-muted opacity-25">
                    </div>

                    <!-- Botão Oficial de Registro e Login com Google -->
                    <div id="google-auth-container" class="mb-3 text-center">
                        <div id="native-google-signin-btn" class="d-none justify-content-center"></div>
                        <button type="button" class="btn btn-outline-secondary w-100 py-2 d-flex align-items-center justify-content-center gap-2 bg-white shadow-sm rounded-3 hover-shadow" id="btn-google-auth" onclick="LoginView.triggerGoogleAuth()" style="border-color: #d1d5db; color: #374151; font-weight: 600;">
                            <!-- Google SVG Logo Oficial 4 Cores -->
                            <svg width="20" height="20" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                <path fill="none" d="M0 0h48v48H0z"/>
                            </svg>
                            <span id="google-btn-label">${isRegister ? 'Registrar com o Google' : 'Continuar com o Google'}</span>
                        </button>
                    </div>

                    <!-- Assinatura Institucional -->
                    <div class="text-center mt-4 pt-3 border-top text-muted small" style="font-size: 0.78rem;">
                        <strong>Kodey Kontabs</strong> &copy; 2026. Um produto oficial da <a href="https://kodey.com.br" target="_blank" class="fw-semibold text-decoration-none text-success">Kodey Sistemas</a>.<br>
                        <span class="text-muted opacity-75">
                            ⚙️ Powered by Kore Framework &bull; 
                            <span class="badge bg-success-subtle text-success py-0 px-1">
                                ${window.KONTABS_IS_LOCAL ? 'Ambiente Local' : 'Online'}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Modal Auxiliar: Assistente Google (Para ambiente sem Client ID ou teste local) -->
            <div class="modal fade" id="modal-google-assistant" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
                    <div class="modal-content border-0 shadow-lg rounded-4">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title font-display fw-bold d-flex align-items-center gap-2">
                                <svg width="22" height="22" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                    <path fill="none" d="M0 0h48v48H0z"/>
                                </svg>
                                <span>Registro & Login Google</span>
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div class="modal-body pt-2">
                            <p class="text-muted small">
                                O Kontabs suporta autenticação segura via <strong>Google Identity Services</strong>. Você pode simular sua conta ou conectar seu e-mail do Google:
                            </p>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Seu Nome no Google</label>
                                <input type="text" class="form-control form-control-sm" id="google-modal-name" value="Alex Reis" placeholder="Nome Completo">
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Seu E-mail Google (@gmail.com ou Workspace)</label>
                                <input type="email" class="form-control form-control-sm" id="google-modal-email" value="alex@kodey.com.br" placeholder="seu-email@gmail.com">
                            </div>
                            <div class="alert alert-info py-2 small mb-0">
                                <i class="bi bi-info-circle me-1"></i>
                                Para ativar o popup oficial nativo do Google em produção, configure a variável <code>GOOGLE_CLIENT_ID</code> no arquivo <code>.env</code>.
                            </div>
                        </div>
                        <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-sm btn-light" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-sm btn-kontabs-primary fw-bold" onclick="LoginView.confirmGoogleSimulation()">
                                <i class="bi bi-check2-circle me-1"></i> Conectar com esta Conta Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        jQuery('.conteudo-principal').html(html);
    }

    /**
     * Alterna visualmente entre Login e Registro
     */
    static switchTab(tab) {
        const isRegister = tab === 'register';
        window.location.hash = isRegister ? '#/register' : '#/login';

        if (isRegister) {
            jQuery('#tab-btn-register').addClass('btn-kontabs-primary text-white shadow-sm').removeClass('btn-link text-muted');
            jQuery('#tab-btn-login').removeClass('btn-kontabs-primary text-white shadow-sm').addClass('btn-link text-muted');
            jQuery('#form-kontabs-register').removeClass('d-none');
            jQuery('#form-kontabs-login').addClass('d-none');
            jQuery('#auth-main-title').text('Crie sua Conta Gratuita');
            jQuery('#google-btn-label').text('Registrar com o Google');
        } else {
            jQuery('#tab-btn-login').addClass('btn-kontabs-primary text-white shadow-sm').removeClass('btn-link text-muted');
            jQuery('#tab-btn-register').removeClass('btn-kontabs-primary text-white shadow-sm').addClass('btn-link text-muted');
            jQuery('#form-kontabs-login').removeClass('d-none');
            jQuery('#form-kontabs-register').addClass('d-none');
            jQuery('#auth-main-title').text('Acesse suas Finanças');
            jQuery('#google-btn-label').text('Continuar com o Google');
        }

        LoginView.renderGoogleButton(isRegister);
        jQuery('#auth-alert').addClass('d-none');
    }

    /**
     * Submissão do Formulário de Login
     */
    static async submitLogin(event) {
        event.preventDefault();
        const username = jQuery('#login-user').val().trim();
        const password = jQuery('#login-pass').val();
        const btn = jQuery('#btn-login-submit');

        LoginView.hideAlert();
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Entrando...');

        try {
            const res = await ApiService.login(username, password);
            LoginView.handleAuthSuccess(res);
        } catch (e) {
            LoginView.showAlert(e.message || 'Usuário ou senha incorretos.');
            btn.prop('disabled', false).html('<i class="bi bi-box-arrow-in-right me-1"></i> Entrar no Kontabs');
        }
    }

    /**
     * Submissão do Formulário de Registro
     */
    static async submitRegister(event) {
        event.preventDefault();
        const name = jQuery('#reg-name').val().trim();
        const email = jQuery('#reg-email').val().trim();
        const orgType = jQuery('input[name="reg-org-type"]:checked').val() || 'PF';
        const pass = jQuery('#reg-pass').val();
        const passConfirm = jQuery('#reg-pass-confirm').val();
        const btn = jQuery('#btn-reg-submit');

        if (pass !== passConfirm) {
            LoginView.showAlert('As senhas digitadas não coincidem. Verifique e tente novamente.');
            return;
        }

        LoginView.hideAlert();
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Criando sua conta...');

        try {
            const res = await ApiService.register({
                name,
                email,
                password: pass,
                org_type: orgType
            });
            // Marca flag para disparar tutorial acolhedor automaticamente
            localStorage.setItem('kontabs_first_access', '1');
            LoginView.handleAuthSuccess(res);
        } catch (e) {
            LoginView.showAlert(e.message || 'Erro ao realizar cadastro.');
            btn.prop('disabled', false).html('<i class="bi bi-sparkles me-1"></i> Criar Conta Gratuita');
        }
    }

    /**
     * Configura serviços de autenticação do Google (GIS)
     */
    setupGoogleServices() {
        const clientId = window.KONTABS_GOOGLE_CLIENT_ID;
        if (!clientId) return;

        const tryInit = () => {
            if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                LoginView.renderGoogleButton(this.activeTab === 'register');
                try {
                    google.accounts.id.prompt();
                } catch (e) {}
                return true;
            }
            return false;
        };

        if (!tryInit()) {
            let attempts = 0;
            const timer = setInterval(() => {
                attempts++;
                if (tryInit() || attempts > 25) {
                    clearInterval(timer);
                }
            }, 150);
        }
    }

    /**
     * Renderiza o botão oficial do Google Sign-In via Google Identity Services
     */
    static renderGoogleButton(isRegister = false) {
        const clientId = window.KONTABS_GOOGLE_CLIENT_ID;
        if (!clientId || typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
            return;
        }

        try {
            google.accounts.id.initialize({
                client_id: clientId,
                callback: LoginView.handleGoogleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            const btnContainer = document.getElementById('native-google-signin-btn');
            if (btnContainer) {
                btnContainer.innerHTML = '';
                const width = Math.min(380, Math.max(240, btnContainer.offsetWidth || 340));
                google.accounts.id.renderButton(btnContainer, {
                    theme: 'outline',
                    size: 'large',
                    type: 'standard',
                    shape: 'rectangular',
                    width: width,
                    text: isRegister ? 'signup_with' : 'continue_with',
                    logo_alignment: 'left'
                });
                jQuery('#native-google-signin-btn').removeClass('d-none').addClass('d-flex');
                jQuery('#btn-google-auth').addClass('d-none');
            }
        } catch (e) {
            console.warn('[Google GIS] renderButton avisou:', e);
        }
    }

    /**
     * Dispara o fluxo Google ao clicar no botão
     */
    static triggerGoogleAuth() {
        const clientId = window.KONTABS_GOOGLE_CLIENT_ID;
        if (clientId && typeof google !== 'undefined' && google.accounts && google.accounts.id) {
            try {
                google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        console.warn('[Google GIS] Not displayed / skipped:', notification.getNotDisplayedReason?.() || notification.getSkippedReason?.());
                        const modalEl = document.getElementById('modal-google-assistant');
                        if (modalEl) {
                            const modal = new bootstrap.Modal(modalEl);
                            modal.show();
                        }
                    }
                });
            } catch (e) {
                const modalEl = document.getElementById('modal-google-assistant');
                if (modalEl) {
                    const modal = new bootstrap.Modal(modalEl);
                    modal.show();
                }
            }
        } else {
            // Se Client ID ainda não configurado ou em ambiente de teste rápido, exibe diálogo interativo
            const modalEl = document.getElementById('modal-google-assistant');
            if (modalEl) {
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            } else {
                LoginView.confirmGoogleSimulation();
            }
        }
    }

    /**
     * Callback do Google GIS com JWT oficial
     */
    static async handleGoogleCredentialResponse(response) {
        if (!response || !response.credential) return;

        LoginView.hideAlert();
        const alertBox = jQuery('#auth-alert');
        alertBox.removeClass('d-none alert-danger').addClass('alert-info')
            .html('<div class="d-flex align-items-center gap-2"><span class="spinner-border spinner-border-sm"></span> Conectando com sua conta Google...</div>');

        try {
            const res = await ApiService.googleAuth(response.credential);
            if (res.is_new_user) {
                localStorage.setItem('kontabs_first_access', '1');
            }
            LoginView.handleAuthSuccess(res);
        } catch (e) {
            alertBox.removeClass('alert-info').addClass('alert-danger');
            LoginView.showAlert(e.message || 'Falha ao autenticar com o Google.');
        }
    }

    /**
     * Confirmação do diálogo Google (suporte a ambiente local e dev)
     */
    static async confirmGoogleSimulation() {
        const name = jQuery('#google-modal-name').val() || 'Alex Reis';
        const email = jQuery('#google-modal-email').val() || 'alex@kodey.com.br';

        // Fecha modal
        const modalEl = document.getElementById('modal-google-assistant');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }

        LoginView.hideAlert();
        const btn = jQuery('#btn-google-auth');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Conectando com Google...');

        try {
            const res = await ApiService.googleAuth('', {
                name,
                email,
                google_id: 'google_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
                avatar: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            });

            if (res.is_new_user) {
                localStorage.setItem('kontabs_first_access', '1');
            }
            LoginView.handleAuthSuccess(res);
        } catch (e) {
            LoginView.showAlert(e.message || 'Falha na conexão Google.');
            btn.prop('disabled', false).html('Continuar com o Google');
        }
    }

    /**
     * Sucesso na autenticação
     */
    static handleAuthSuccess(res) {
        if (res.token) {
            ApiService.setSession(res);

            // Redireciona para tela principal e recarrega template
            window.location.hash = '#/';
            window.location.reload();
        }
    }

    static showAlert(msg) {
        const alertBox = jQuery('#auth-alert');
        jQuery('#auth-alert-text').text(msg);
        alertBox.removeClass('d-none');
    }

    static hideAlert() {
        jQuery('#auth-alert').addClass('d-none');
    }

    static showForgotModal() {
        alert('Para recuperar seu acesso, solicite o reenvio ao administrador do sistema ou pelo e-mail suporte@kodey.com.br.');
    }

    static showTermsModal() {
        alert('Termos de Uso do Kodey Kontabs: Seus dados financeiros são confidenciais, protegidos por criptografia e jamais compartilhados com terceiros.');
    }
}