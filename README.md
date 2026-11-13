# Portfólio de QA · Apps React

[![CI](https://github.com/RafaelRJesus/trybe-bootcamp-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/RafaelRJesus/trybe-bootcamp-frontend/actions/workflows/ci.yml)
![Testes](https://img.shields.io/badge/testes-132-success)
![Cobertura](https://img.shields.io/badge/cobertura-99%25-brightgreen)
![Defeitos corrigidos](https://img.shields.io/badge/defeitos%20corrigidos-18-blue)

**🔗 Ver online:** https://rafaelrjesus.github.io/trybe-bootcamp-frontend/

Projeto de **Quality Assurance** sobre 5 aplicações React estudadas no bootcamp de Desenvolvimento Web da [Trybe](https://www.betrybe.com/). Montei uma estratégia de testes em camadas para elas, encontrei **18 defeitos** (funcionais, de validação, segurança e acessibilidade), corrigi cada um e deixei um teste de regressão para garantir que não voltem.

> As aplicações partiram do código das aulas ao vivo da Trybe (Turma 31). O trabalho deste repositório é a análise de qualidade, os testes automatizados, as correções, o pipeline de CI e a documentação.

## O que tem aqui

| | |
|---|---|
| 🧪 **105 testes unitários e de integração** | Vitest + React Testing Library, com 99% de cobertura |
| 🌐 **27 testes E2E** | Cypress, rodando no app publicado e com as APIs simuladas |
| ♿ **Testes de acessibilidade** | axe-core (WCAG 2.1 AA) em todas as telas |
| 🐞 **[Relatório de defeitos](BUGS.md)** | 18 bugs com passos para reproduzir, causa, severidade e correção |
| ⚙️ **CI/CD** | GitHub Actions: testes → E2E → publicação no GitHub Pages |

## Aplicações testadas

| App | O que faz | Técnicas de teste em destaque |
|-----|-----------|-------------------------------|
| [Cadastro de Cartão](https://rafaelrjesus.github.io/trybe-bootcamp-frontend/apps/credit-card/) | Formulário com pré-visualização do cartão | Análise de valor limite, partição de equivalência, algoritmo de Luhn |
| [Lista de Filmes](https://rafaelrjesus.github.io/trybe-bootcamp-frontend/apps/to-watch/) | CRUD: adicionar, editar, marcar e remover | Fluxo E2E completo, navegação por teclado |
| [Advice Generator](https://rafaelrjesus.github.io/trybe-bootcamp-frontend/apps/advice-generator/) | Conselhos aleatórios via API (desafio Frontend Mentor) | Mock de API, erro HTTP 500, sem conexão, resposta lenta |
| [Slideshow](https://rafaelrjesus.github.io/trybe-bootcamp-frontend/apps/slideshow/) | Carrossel automático com troca de categoria | Timers falsos (`vi.useFakeTimers`, `cy.clock`), ciclo de vida |
| [Séries Favoritas](https://rafaelrjesus.github.io/trybe-bootcamp-frontend/apps/favorite-series/) | Lista de séries com favoritos e filtro | Acessibilidade (`aria-pressed`, nomes acessíveis) |

## Estratégia de testes

```
            ┌──────────────┐
            │   E2E (27)   │  Cypress: fluxos reais no navegador + axe
            ├──────────────┤
            │ Integração   │  React Testing Library: componentes como o usuário usa
            ├──────────────┤
            │ Unitários    │  Vitest: regras de negócio puras (ex.: validações do cartão)
            └──────────────┘
```

- **Testes do jeito que o usuário usa:** os elementos são buscados por papel e nome acessível (`getByRole('button', { name: 'Remover Matrix' })`), não por classes CSS. Um teste que encontra o botão por esse nome também prova que o botão é acessível.
- **Regras de negócio isoladas:** as validações do cartão ficam em [`validators.js`](apps/credit-card/validators.js) e são testadas com tabelas de casos (`it.each`) cobrindo limites: 12/13/19/20 dígitos, mês 00/01/12/13, mês atual e mês anterior.
- **Testes determinísticos:** as APIs externas são simuladas (`vi.spyOn(fetch)` e `cy.intercept`), as datas são fixas e os timers são controlados. Os testes não dependem da internet nem do relógio.
- **Rastreabilidade:** todo teste de regressão leva o ID do defeito no nome. Por exemplo, `BUG-12: aceita nome com acento` liga o teste ao item do [relatório](BUGS.md).

## Como rodar

```bash
npm install
npm run dev            # abre os apps em http://localhost:5173/trybe-bootcamp-frontend/
npm test               # testes unitários e de integração
npm run test:coverage  # com relatório de cobertura em coverage/index.html
npm run build && npm run e2e   # testes E2E no build de produção (Cypress)
npm run cy:open        # Cypress no modo interativo
```

## Estrutura

```
apps/
  credit-card/        validators.js + validators.test.js (unitários) + App.test.jsx
  to-watch/           components/ + App.test.jsx
  advice-generator/   services/ + AdviceCard.test.jsx
  slideshow/          services/ + Carousel.test.jsx
  favorite-series/    components/ + CardList.test.jsx
cypress/e2e/          um arquivo de testes E2E por app + página inicial
.github/workflows/    pipeline de CI/CD
BUGS.md               relatório de defeitos
```

## Tecnologias

React 18 · Vite · Vitest · React Testing Library · user-event · Cypress · axe-core · GitHub Actions · GitHub Pages

---

Feito por **Rafael Rocha de Jesus**, QA Sênior · [GitHub](https://github.com/RafaelRJesus)
