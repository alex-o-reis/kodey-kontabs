<?php

require_once __DIR__ . '/../../ModelGenerator.php';

class MakeCommand extends Command
{
    protected string $description = "Gerador de scaffolding e componentes do Kore Framework";

    /**
     * Gera ou atualiza Models e Traits a partir das tabelas do banco de dados
     */
    public function models(): void
    {
        $generator = new ModelGenerator(
            __DIR__ . '/../../../app/models',
            __DIR__ . '/../../../app/traits'
        );
        $generator->generate();
    }

    /**
     * Cria um novo arquivo de migracao timestamped
     */
    public function migration(?string $name = null): void
    {
        if (!$name) {
            $this->error("Erro: Forneca o nome da migracao. Ex: kore make:migration CreateClientsTable");
            return;
        }

        $filename = date('Ymd_His') . '_' . $name . '.php';
        $path = __DIR__ . '/../../../app/migrations/' . $filename;
        $content = "<?php\n\nrequire_once __DIR__ . '/../../kore/Migration.php';\nrequire_once __DIR__ . '/../../kore/Model.php';\n\nclass $name extends Migration\n{\n    public function up()\n    {\n        Model::query(\"CREATE TABLE IF NOT EXISTS `sample` (\n            `id` INT AUTO_INCREMENT PRIMARY KEY,\n            `name` VARCHAR(100) NOT NULL,\n            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\");\n    }\n\n    public function down()\n    {\n        Model::query(\"DROP TABLE IF EXISTS `sample`;\");\n    }\n}\n";

        file_put_contents($path, $content);
        $this->info("Migracao criada com sucesso: $filename");
    }

    /**
     * Cria um novo controller padrao no backend
     */
    public function controller(?string $name = null): void
    {
        if (!$name) {
            $this->error("Erro: Forneca o nome do controller. Ex: kore make:controller Products");
            return;
        }

        $className = ModelGenerator::studlyCase($name);
        $singular = ModelGenerator::studlyCase(ModelGenerator::singularize($name));
        $filename = strtolower($name) . '.php';
        $path = __DIR__ . '/../../../app/controllers/' . $filename;

        $content = "<?php\n\nrequire_once __DIR__ . '/../../kore/Controller.php';\nrequire_once __DIR__ . '/../models/{$singular}.php';\n\nclass {$className} extends Controller\n{\n    public function get(\$id = null)\n    {\n        if (\$id) {\n            \$item = new {$singular}();\n            if (!\$item->load(\$id)) {\n                return \$this->error('Registro não encontrado', 404);\n            }\n            return \$this->json(\$item);\n        }\n\n        \$items = {$singular}::loadAll();\n        return \$this->json(\$items);\n    }\n\n    public function post()\n    {\n        \$data = \$this->request->input();\n        \$item = new {$singular}();\n        \$item->loadFromRow(\$data);\n        \$item->save();\n\n        return \$this->json([\n            'message' => '{$singular} salvo com sucesso!',\n            'data' => \$item\n        ], 201);\n    }\n\n    public function delete(\$id = null)\n    {\n        if (!\$id) {\n            return \$this->error('ID não fornecido', 400);\n        }\n\n        \$item = new {$singular}();\n        if (!\$item->load(\$id)) {\n            return \$this->error('Registro não encontrado', 404);\n        }\n\n        \$item->save(true);\n        return \$this->json(['message' => '{$singular} removido com sucesso']);\n    }\n}\n";

        file_put_contents($path, $content);
        $this->info("Controller criado com sucesso: $filename (Classe: $className)");
    }

    /**
     * Cria scaffold completo de CRUD (API Controller, Front View e Controller)
     */
    public function crud(?string $name = null): void
    {
        if (!$name) {
            $this->error("Erro: Forneca o nome do recurso. Ex: kore make:crud Products");
            return;
        }

        $className = ModelGenerator::studlyCase($name);
        $singular = ModelGenerator::studlyCase(ModelGenerator::singularize($name));
        $plural = strtolower($name);
        $singularSlug = strtolower(ModelGenerator::singularize($name));

        $this->info("Gerando CRUD completo para o recurso: $className...");

        // 1. Controller API
        $this->controller($name);

        // 2. Front Controller
        $frontControllerPath = __DIR__ . '/../../../../kore-front/app/controllers/' . $plural . '.controller.js';
        $frontViewPath = __DIR__ . '/../../../../kore-front/app/views/' . $plural . '.view.js';

        $frontControllerContent = "/**\n * {$className}Controller — Gerencia a lógica do CRUD de {$className}\n */\nclass {$className}Controller extends Controller {\n    execute() {\n        this.view = new {$className}View(this);\n        this.carregarListagem();\n    }\n\n    carregarListagem() {\n        let self = this;\n        Model.get('{$plural}')\n            .done(function(data) {\n                self.view.renderizarTabela(data || []);\n            })\n            .fail(function(xhr) {\n                let erro = (xhr.responseJSON && xhr.responseJSON.error) || 'Erro ao carregar dados';\n                $(\"#alert-container-{$plural}\").html(UI.alert('danger', erro, true));\n            });\n    }\n\n    salvar(formData) {\n        let self = this;\n        Model.post('{$plural}', formData)\n            .done(function(res) {\n                $(\"#modal-form-{$singularSlug}\").modal('hide');\n                self.carregarListagem();\n                $(\"#alert-container-{$plural}\").html(UI.alert('success', res.message || 'Salvo com sucesso!'));\n            })\n            .fail(function(xhr) {\n                let erro = (xhr.responseJSON && xhr.responseJSON.error) || 'Erro ao salvar';\n                alert(erro);\n            });\n    }\n\n    excluir(id) {\n        let self = this;\n        if (confirm('Deseja realmente excluir este registro?')) {\n            Model.delete('{$plural}/' + id)\n                .done(function() {\n                    self.carregarListagem();\n                    $(\"#alert-container-{$plural}\").html(UI.alert('info', 'Registro excluído com sucesso!'));\n                })\n                .fail(function(xhr) {\n                    let erro = (xhr.responseJSON && xhr.responseJSON.error) || 'Erro ao excluir';\n                    alert(erro);\n                });\n        }\n    }\n}\n";
        file_put_contents($frontControllerPath, $frontControllerContent);
        $this->info("Frontend Controller criado: $plural.controller.js");

        // 3. Front View via UI Relay & Style Catalog
        $frontViewContent = "/**\n * {$className}View — Interface do CRUD de {$className} construída via UI Relay & Style\n */\nclass {$className}View extends View {\n    constructor(controller) {\n        super();\n        this.controller = controller;\n        this.render();\n    }\n\n    render() {\n        let self = this;\n        $(\".page-title\").text(\"Gerenciamento de {$className}\");\n\n        let headerRow = UI.div(\n            UI.classes(Style.dFlex(), Style.justifyBetween(), Style.alignCenter(), Style.mb(4)),\n            UI.h4(\"Listagem de {$className}\", UI.classes(Style.fwBold(), Style.mb(0))) +\n            UI.button(\n                \"btn-novo-{$singularSlug}\",\n                UI.icon('plus-lg', Style.me(1)) + \"Novo {$singular}\",\n                UI.classes(Style.btn('primary'), Style.shadowHover(), Style.roundedXl())\n            )\n        );\n\n        let cardTable = UI.card(\n            \"\",\n            \"<div id=\\\"alert-container-{$plural}\\\"></div>\" +\n            \"<div id=\\\"tabela-container-{$plural}\\\" class=\\\"table-responsive\\\">\" +\n            UI.skeleton('table', 5) +\n            \"</div>\",\n            \"\",\n            UI.classes(Style.shadowCard(), Style.roundedXl(), Style.border0())\n        );\n\n        // Modal de Formulário\n        let modalFormContent = UI.row(\n            UI.col(12, UI.input(\"text\", \"input-nome-{$singularSlug}\", true, \"Nome / Descrição\")) +\n            UI.col(12, UI.input(\"text\", \"input-status-{$singularSlug}\", false, \"Status\", \"ativo\"))\n        );\n\n        let modalFooter = UI.button(\n            \"btn-cancelar-{$singularSlug}\",\n            \"Cancelar\",\n            UI.classes(Style.btn('secondary'), Style.roundedXl()),\n            { \"data-bs-dismiss\": \"modal\" }\n        ) + UI.button(\n            \"btn-salvar-{$singularSlug}\",\n            UI.icon('check-lg', Style.me(1)) + \"Salvar Registro\",\n            UI.classes(Style.btn('primary'), Style.shadowHover(), Style.roundedXl())\n        );\n\n        let modalForm = UI.modal(\n            \"modal-form-{$singularSlug}\",\n            \"Cadastrar {$singular}\",\n            modalFormContent,\n            modalFooter\n        );\n\n        $(\".conteudo-interno\").html(headerRow + cardTable + modalForm);\n        this.bindEvents();\n    }\n\n    bindEvents() {\n        let self = this;\n\n        $(\"#btn-novo-{$singularSlug}\").on('click', function() {\n            $(\"#input-nome-{$singularSlug}\").val('');\n            UI.showModal('#modal-form-{$singularSlug}');\n        });\n\n        $(\"#btn-salvar-{$singularSlug}\").on('click', function() {\n            let nome = $(\"#input-nome-{$singularSlug}\").val();\n            if (!nome) {\n                alert('Por favor, preencha o campo nome.');\n                return;\n            }\n            self.controller.salvar({\n                name: nome,\n                status: $(\"#input-status-{$singularSlug}\").val()\n            });\n        });\n    }\n\n    renderizarTabela(dados) {\n        let self = this;\n        if (!dados || dados.length === 0) {\n            $(\"#tabela-container-{$plural}\").html(\n                UI.alert('info', 'Nenhum registro encontrado.', true)\n            );\n            return;\n        }\n\n        let thead = UI.thead(\n            UI.tr(\n                UI.th(\"#\", Style.fwBold()) +\n                UI.th(\"Nome\", Style.fwBold()) +\n                UI.th(\"Ações\", UI.classes(Style.fwBold(), Style.textEnd()))\n            )\n        );\n\n        let rows = '';\n        dados.forEach(function(item) {\n            let id = item.ID || item.id || '-';\n            let nome = item.NAME || item.name || item.NOME || item.nome || '-';\n\n            let btnExcluir = UI.button(\n                'btn-del-' + id,\n                UI.icon('trash'),\n                UI.classes(Style.btnOutline('danger'), Style.btnSm(), Style.roundedPill()),\n                { 'data-id': id, 'title': 'Excluir' }\n            );\n\n            rows += UI.tr(\n                UI.td(id) +\n                UI.td(UI.strong(nome)) +\n                UI.td(btnExcluir, Style.textEnd())\n            );\n        });\n\n        let tbody = UI.tbody(rows);\n        let tableHtml = UI.table(thead + tbody, UI.classes('table-hover', 'align-middle', Style.w100()));\n\n        $(\"#tabela-container-{$plural}\").html(tableHtml);\n\n        $(\"#tabela-container-{$plural} [id^=btn-del-]\").on('click', function() {\n            let id = $(this).data('id');\n            self.controller.excluir(id);\n        });\n    }\n}\n";
        file_put_contents($frontViewPath, $frontViewContent);
        $this->info("Frontend View (UI Relay & Style) criada: $plural.view.js");

        $this->info("Scaffolding do CRUD concluido com sucesso!");
    }
}