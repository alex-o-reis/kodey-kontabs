# ⚠️ AVISO: Traits Gerados Automaticamente

Esta pasta (`app/traits/`) contém **Traits PHP gerados automaticamente** pela ferramenta de engenharia reversa do banco de dados (`ModelGenerator`).

## 🛑 NÃO EDITE OS ARQUIVOS DESTA PASTA MANUALMENTE

### 🤖 Nota para Desenvolvedores e Agentes de IA:
- **Desencorajamos fortemente a edição manual dos arquivos nesta pasta.**
- Os Traits aqui presentes refletem as colunas, chaves e tipos exatos da tabela do banco de dados em propriedades públicas maiúsculas.
- Sempre que houver alterações nas tabelas do banco de dados (novas colunas, renomeações, remoções), **execute o gerador via CLI**:
  ```bash
  kore make:models
  # ou
  php kore-api/kore.php make:models
  ```
- O comando irá regenerar os Traits atualizados a partir do banco de dados, mantendo todo o código personalizado que você escreveu dentro dos arquivos em `app/models/` totalmente intacto.
