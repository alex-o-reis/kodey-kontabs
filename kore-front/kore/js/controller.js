/**
 * Base Controller para o Frontend do Kore Framework
 */
class Controller {
    constructor(params = {}) {
        this.params = params;
    }

    execute() {
        // Implementar no Controller especifico
    }

    static route404() {
        $('.conteudo-interno, .conteudo').html(`
            <div class="container text-center py-5">
                <div class="display-1 text-muted mb-3"><i class="bi bi-exclamation-circle"></i> 404</div>
                <h2 class="mb-3">Página não encontrada</h2>
                <p class="text-secondary mb-4">A rota solicitada não existe ou não pôde ser carregada.</p>
                <a href="#/" class="btn btn-primary"><i class="bi bi-house-door me-2"></i>Voltar ao Início</a>
            </div>
        `);
    }
}