# ⚠️ AVISO: Diretório do Framework Kore (Core)

Esta pasta (`kore/`) contém o código-fonte nativo e imutável do **Kore Framework (Kodey Kore Framework - KKF)**.

## 🛑 NÃO ALTERE OS ARQUIVOS DESTA PASTA
A menos que você seja um **desenvolvedor contribuinte do projeto Kore Framework**, **NENHUM** arquivo dentro deste diretório deve ser modificado diretamente em sua aplicação.

### Por que não alterar?
- Quaisquer customizações feitas aqui serão **permanentemente sobrescritas e perdidas** quando o framework for atualizado.
- Toda a lógica de negócio, controllers, models, migrations, middlewares e comandos da sua aplicação devem ser criados exclusivamente dentro da pasta `app/`.
- Para estender comportamentos do framework, crie classes em `app/` herdando das classes base (`extends Model`, `extends Controller`, `extends Command`, etc.).
