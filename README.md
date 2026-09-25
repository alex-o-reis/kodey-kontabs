<div align="center">

# 🌿 Kodey Kontabs

### *Cada real com uma origem. Cada real com um destino.*

**Sistema de Gestão Financeira Doméstica e Empresarial Inteligente e Acolhedor**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Powered by Kore Framework](https://img.shields.io/badge/Powered%20by-Kore%20Framework-0F7A4A.svg)](https://kodey.com.br)
[![PHP Version](https://img.shields.io/badge/PHP-%3E%3D8.1-777bb4.svg?logo=php&logoColor=white)](https://www.php.net/)

*Um produto oficial da [Kodey Sistemas](https://kodey.com.br)*

</div>

---

## 💡 Sobre o Kodey Kontabs

O **Kodey Kontabs** não é apenas mais um software de fluxo de caixa ou cadastro estático de receitas e despesas. Ele foi projetado para transformar o controle financeiro — frequentemente visto como uma experiência pesada, burocrática e estressante — em uma jornada leve, amigável, visual e esclarecedora.

### 🎯 Princípio Central

> **TODO DINHEIRO DEVE TER UMA ORIGEM E UM DESTINO.**

O Kontabs apoia o usuário a:
1. **Entender de onde veio o dinheiro**: Salário, pró-labore, vendas, rendimentos ou até créditos/empréstimos.
2. **Entender para onde o dinheiro foi**: Gastos essenciais, estilo de vida, investimentos e parcelamentos.
3. **Decidir para onde o dinheiro disponível deverá ir**: Antes mesmo de ser gasto, através de envelopes e provisionamentos inteligentes.
4. **Prever problemas futuros**: Alertas proativos com projeções de caixa para 7 dias, 30 dias e até 12 meses.
5. **Controlar dívidas e cartões**: Rastreio do uso do limite sem dupla contabilização na fatura.
6. **Acompanhar a evolução real**: Metas, reservas de emergência e patrimônio consolidado.

---

## ✨ Diferenciais de Primeira Classe

- 🟢 **Dinheiro Sem Destino**: O sistema não exibe apenas saldo. Se sobram recursos após o planejamento do mês, ele informa amigavelmente: *"Você possui R$ 2.500 ainda sem destino. [Dar Destino ao Dinheiro]"*.
- 🔴 **Dinheiro Sem Origem**: Saldos negativos ou excessos de gastos demandam clareza imediata: *"Existem R$ 800 utilizados cuja origem ainda não foi informada. [Informar Origem]"* (cartão de crédito, cheque especial, empréstimo, reserva).
- ⚖️ **Previsto vs. Realizado**: Toda movimentação preserva o valor originalmente previsto e o valor efetivamente liquidado, permitindo análises precisas de desvios orçamentários.
- 📆 **Visão "Meu Mês"**: Painel gerencial mensal com linguagem acolhedora (*"Seu gasto com alimentação está R$ 230 acima do planejado"*, *"A energia ficou R$ 48 abaixo da média"*).
- ⏱️ **Check-up Semanal**: Uma experiência de apenas 3 a 5 minutos destacando exclusivamente os pontos prioritários de atenção financeira.
- 🤝 **Tom de Voz Humano e Positivo**: Mensagens focadas em orientar e ajudar, nunca em julgar ou penalizar o usuário.

---

## 🏗️ Arquitetura e Engenharia: Powered by Kore Framework

O projeto é desenvolvido estritamente sobre a arquitetura do **Kore Framework (Kodey Kore Framework - KKF)**:

```text
_kontabs/
├── kore-api/                           # 🛠️ Backend REST API (PHP 8.1+)
│   ├── kore/                           # Motor Nativo da API (ORM PDO, Router, Migrator, CLI)
│   └── app/                            # Código da Aplicação (Controllers, Models, Migrations)
│       └── config/database.php         # Configuração de Banco MySQL / SQLite
│
├── kore-front/                         # 🖥️ Frontend SPA MVC Reativo
│   ├── kore/                           # Motor Nativo SPA (UI Relay, Router, Style, Datatable)
│   ├── templates/                      # Templates Visuais
│   │   └── kontabs/                    # Template Oficial do Kontabs (Sidebar, Topbar, CSS)
│   └── app/                            # Userspace da Aplicação
│       ├── assets/                     # Assets Oficiais (Logos, Ilustrações 3D, Ícones de Alerta)
│       ├── config.js                   # Rotas, Menus e Metadados
│       ├── renderers/                  # KontabsRenderer & KontabsUI (Extensão UI Relay)
│       ├── controllers/                # Controladores do Frontend
│       └── views/                      # Telas construídas via KontabsUI
│
├── kodey-kontabs-brand-kit/            # 🎨 Identidade Visual e Brand Kit Oficial
├── composer.json                       # Configuração de dependências PHP
├── kore / kore.bat                     # CLI Unificada de Desenvolvimento
├── LICENSE                             # Licença de Código Aberto MIT
└── README.md                           # Documentação Oficial
```

### 🎨 Camada de Renderização Kontabs (`KontabsUI`)

Seguindo o padrão **UI Relay Engine** do Kore Framework, nenhuma tela escreve HTML solto ou CSS hardcoded. Todas as visualizações utilizam o `KontabsRenderer` através de componentes reutilizáveis baseados no Brand Kit:

- `KontabsUI.kpi()`: Cartões de KPI com variação, status e ícones oficiais.
- `KontabsUI.moneyInput()`: Campo monetário com formatação automática em R$.
- `KontabsUI.card()`: Cartões com bordas arredondadas e sombras suaves com tom esverdeado.
- `KontabsUI.alert()`: Alertas integrados aos ícones de atenção oficiais 3D.
- `KontabsUI.emptyState()`: Telas de boas-vindas e estados vazios com o mascote oficial.
- `KontabsUI.progress()`: Barras de progresso com gradiente institucional.
- `KontabsUI.status()`: Badges acessíveis de status financeiro (Previsto vs. Efetivado).
- `KontabsUI.table()`: Tabelas responsivas com padrões de leitura financeira.

---

## 🎨 Identidade Visual (Brand Kit)

A interface utiliza predominantemente fundo claro (`#FFF9EE` / `#FFFFFF`), baseando-se na **Regra 70 / 20 / 10**:
- **70% Neutros Claros**: Para respiro e leitura leve.
- **20% Verdes Oficiais**: `--kk-green-700` (`#0E5A4F`), `--kk-green-600` (`#0F7A4A`), `--kk-green-500` (`#22C55E`), `--kk-mint-100` (`#D1F2E0`).
- **10% Acentos Emocionais e Alertas**: Amarelo (`#FACC15`) e Coral (`#FF7A6B`).
- **Assets Gráficos Oficiais**:
  - Logos oficiais em PNG e SVG com símbolo da seta de crescimento.
  - Ilustrações 3D: `mascot-workspace`, `coin-happy`, `wallet-green`, `receipt-happy`, `chart-growth`.
  - Ícones de Alerta 3D: `alert-bill-due`, `alert-wallet-empty`, `alert-budget-piggy`, `alert-calendar-reminder`, `alert-chart-down`, `alert-fraud-check`, `alert-payment-failed`, `alert-payment-cards`.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **PHP >= 8.1** (com extensões `pdo`, `pdo_mysql` e/ou `pdo_sqlite`)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### 1. Inicializar o Ambiente
Abra o terminal na pasta do projeto e inicie o servidor:

```bash
# Iniciar o Frontend SPA na porta 3000
php -S localhost:3000 -t kore-front

# Ou utilizando a CLI do Kore Framework:
./kore dev
```

### 2. Acessar no Navegador
Acesse: **[http://localhost:3000](http://localhost:3000)**

Explore as principais seções navegáveis já ativas na Fase 1:
- `#/`: **Dashboard** completo com KPIs, Dinheiro Sem Destino e Sem Origem.
- `#/meu-mes`: Visão analítica de **Meu Mês** (Previsto x Realizado).
- `#/movimentacoes`: Núcleo de **Movimentações** com tabela dinâmica e filtros.
- `#/checkup`: Experiência do **Check-up Financeiro Semanal**.
- `#/showcase`: **UI Showcase & Kitchen Sink** demonstrando todos os 23+ componentes e tokens visuais.

---

## 🗺️ Roadmap de Desenvolvimento

- [x] **Fase 1 — Estrutura do Sistema, Layout e Camada de Renderização Kontabs**
- [x] **Fase 2 — Backend e Modelo de Dados Relacional MySQL (`db.opn1.net / kontabs`)**
- [x] **Fase 3 — Autenticação, Alternância Multi-Organização (PF/PJ) e Segurança**
- [x] **Fase 4 — Núcleo de Movimentações, Despesas Parceladas e Contas Financeiras**
- [x] **Fase 5 — Importação de Extratos Bancários (OFX / CSV) e Motor de Conciliação Inteligente**
- [x] **Fase 6 — Gestão de Cartões de Crédito, Limites e Fechamento de Faturas**
- [x] **Fase 7 — Planejamento Mensal, Provisionamentos e Envelopes de Gastos por Categoria**
- [x] **Fase 8 — Motor de Projeção Financeira e Fluxo de Caixa Futuro (7d, 30d, 90d, 12m)**
- [ ] **Fase 9 — Inteligência Financeira e Detecção Proativa de Padrões e Anomalias**

---

## 📜 Licença e Créditos

Distribuído sob a licença **MIT**. Consulte o arquivo [`LICENSE`](LICENSE) para obter mais informações.

- **Desenvolvido por**: [Kodey Sistemas](https://kodey.com.br) & [Alex Reis](https://github.com/alex-o-reis)
- **Tecnologia**: Powered by **Kore Framework (KKF)**
