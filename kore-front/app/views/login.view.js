class LoginView extends View {
    constructor() {
        super();
        let templateLoader = new Template();
        templateLoader.getTemplate('login', 'templates/kore-default/login.html', function(html) {
            $('.conteudo-principal').html(html);

            $('#kore-login-form').on('submit', function(e) {
                e.preventDefault();
                let username = $('#login-username').val();
                let password = $('#login-password').val();

                Model.authenticate(username, password)
                    .done(function() {
                        window.location.hash = '#/';
                        window.location.reload();
                    })
                    .fail(function() {
                        alert('Usuário ou senha inválidos.');
                    });
            });
        });
    }
}