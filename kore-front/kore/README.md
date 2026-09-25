# ⚠️ AVISO: Diretório do Framework Kore (Frontend Engine)

Esta pasta (`kore/`) contém o motor central e os renderers nativos do **Kore Framework (Kodey Kore Framework - KKF)**.

## 🛑 NÃO ALTERE OS ARQUIVOS DESTA PASTA
A menos que você seja um **desenvolvedor contribuinte do projeto Kore Framework**, **NENHUM** arquivo dentro deste diretório deve ser modificado diretamente em sua aplicação.

### Por que não alterar?
- Quaisquer customizações feitas aqui serão **permanentemente sobrescritas e perdidas** quando o framework for atualizado.
- Todas as suas Views, Controllers, Models REST e Renderers customizados devem residir na pasta `app/`.
- Para criar novos renderers ou layouts, estenda `BaseRenderer` em `app/renderers/`.
