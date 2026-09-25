/**
 * LoginView — Tela de Autenticação Oficial Kodey Kontabs
 * Powered by Kore Framework (KKF)
 */
class LoginView extends View {
    constructor() {
        super();
        this.render();
    }

    render() {
        let html = `
            <div class="d-flex align-items-center justify-content-center min-vh-100" style="background: radial-gradient(circle at 10% 20%, #FFFDF7 0%, #F5FFF9 90%);">
                <div class="kontabs-card shadow-lg p-4 p-md-5" style="max-width: 440px; width: 100%; border-radius: 28px;">
                    <!-- Brand Header -->
                    <div class="text-center mb-4">
                        <img src="app/assets/logos/logo-horizontal.png" alt="Kodey Kontabs" style="max-height: 60px;" class="mb-3">
                        <h4 class="font-display fw-bold mb-1" style="color: var(--kk-green-700);">Acesse suas Finanças</h4>
                        <p class="text-muted small mb-0">Cada real com uma origem. Cada real com um destino.</p>
                    </div>

                    <!-- Mensagem de Erro / Alerta -->
                    <div id="login-error-alert" class="alert alert-danger py-2 small d-none" role="alert">
                        <i class="bi bi-exclamation-circle me-1"></i> <span id="login-error-text">Usuário ou senha incorretos.</span>
                    </div>

                    <!-- Formulário de Login -->
                    <form id="form-kontabs-login" onsubmit="LoginView.submitLogin(event)">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-dark">Usuário ou E-mail</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-person"></i></span>
                                <input type="text" class="form-control border-start-0" id="login-user" placeholder="alex@kodey.com.br" value="alex" required autocomplete="username">
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <label class="form-label small fw-bold text-dark mb-0">Senha de Acesso</label>
                                <a href="javascript:;" onclick="alert('Entre em contato com o suporte da Kodey Sistemas.')" class="text-muted small text-decoration-none">Esqueceu?</a>
                            </div>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-shield-lock"></i></span>
                                <input type="password" class="form-control border-start-0" id="login-pass" placeholder="••••••••" value="kontabs123" required autocomplete="current-password">
                            </div>
                        </div>

                        <div class="form-check mb-4">
                            <input class="form-check-input" type="checkbox" id="login-lembrar" checked>
                            <label class="form-check-label small text-muted" for="login-lembrar">
                                Lembrar de mim neste dispositivo
                            </label>
                        </div>

                        <button type="submit" class="btn btn-kontabs-primary w-100 py-2 fs-6 fw-bold" id="btn-login-submit">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Entrar no Kontabs
                        </button>
                    </form>

                    <!-- Assinatura Discreta -->
                    <div class="text-center mt-4 pt-3 border-top text-muted small" style="font-size: 0.78rem;">
                        <strong>Kodey Kontabs</strong> &copy; 2026. Um produto da <a href="https://kodey.com.br" target="_blank" class="fw-semibold text-decoration-none text-success">Kodey Sistemas</a>.<br>
                        <span class="text-muted opacity-75">⚙️ Powered by Kore Framework</span>
                    </div>
                </div>
            </div>
        `;

        jQuery('.conteudo-principal').html(html);
    }

    static async submitLogin(event) {
        event.preventDefault();
        const username = jQuery('#login-user').val().trim();
        const password = jQuery('#login-pass').val();
        const btn = jQuery('#btn-login-submit');
        const alertBox = jQuery('#login-error-alert');

        alertBox.addClass('d-none');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Entrando...');

        try {
            const res = await ApiService.post('auth/login', { username, password });
            
            if (res.token) {
                localStorage.setItem('kontabs_token', res.token);
                localStorage.setItem('kontabs_user', JSON.stringify(res.user));
                
                if (res.active_organization) {
                    ApiService.setActiveOrgId(res.active_organization.id, res.active_organization.name);
                }
                if (res.organizations) {
                    localStorage.setItem('kontabs_user_orgs', JSON.stringify(res.organizations));
                }

                // Recarrega aplicação dentro do template principal
                window.location.hash = '#/';
                window.location.reload();
            }
        } catch (e) {
            alertBox.removeClass('d-none');
            jQuery('#login-error-text').text(e.message || 'Usuário ou senha incorretos.');
            btn.prop('disabled', false).html('<i class="bi bi-box-arrow-in-right me-1"></i> Entrar no Kontabs');
        }
    }
}