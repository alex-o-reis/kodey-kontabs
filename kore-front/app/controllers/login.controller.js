class LoginController extends Controller {
    execute() {
        const hash = window.location.hash || '';
        const initialTab = hash.includes('register') ? 'register' : 'login';
        new LoginView(initialTab);
    }
}