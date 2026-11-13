# Relatório de defeitos

Defeitos encontrados na análise e nos testes das 5 aplicações. Todos foram corrigidos, e cada um tem pelo menos um teste de regressão com o ID no nome (por exemplo, `BUG-04: ...`). Assim, se o defeito voltar, o teste falha.

**Severidade:** 🔴 Alta (bloqueia uso, perde dados ou expõe segurança) · 🟠 Média (comportamento errado com contorno) · 🟡 Baixa (cosmético ou de usabilidade)

## Resumo

| ID | App | Defeito | Severidade | Tipo |
|----|-----|---------|------------|------|
| BUG-01 | Slideshow | Voltar a partir da 1ª imagem deixa o carrossel sem imagem | 🔴 Alta | Funcional |
| BUG-02 | Slideshow | Trocar de categoria acelera o autoplay | 🟠 Média | Funcional |
| BUG-03 | Slideshow | Chave da API exposta no código do front-end | 🔴 Alta | Segurança |
| BUG-04 | Lista de Filmes | Status "assistido" pula para outro filme após remover um item | 🟠 Média | Funcional |
| BUG-05 | Lista de Filmes | Aceita filme sem título ou só com espaços | 🟡 Baixa | Validação |
| BUG-06 | Lista de Filmes | Títulos repetidos são removidos ou editados juntos | 🟠 Média | Funcional |
| BUG-07 | Lista de Filmes | Salvar a edição vazia apaga o título | 🟠 Média | Validação |
| BUG-08 | Lista de Filmes | Ações não funcionam pelo teclado nem com leitor de tela | 🟠 Média | Acessibilidade |
| BUG-09 | Advice Generator | Falha na API deixa a tela presa em "Loading..." | 🔴 Alta | Tratamento de erro |
| BUG-10 | Advice Generator | Botão sem nome acessível, sem foco visível e clicável durante o carregamento | 🟡 Baixa | Acessibilidade |
| BUG-11 | Cartão de Crédito | Número do cartão não é validado | 🔴 Alta | Validação |
| BUG-12 | Cartão de Crédito | Nomes com acento são recusados ("José da Silva") | 🔴 Alta | Validação |
| BUG-13 | Cartão de Crédito | Validade não é validada ("13/99" é aceita) | 🔴 Alta | Validação |
| BUG-14 | Cartão de Crédito | CVC aceita letras ("abc") | 🟠 Média | Validação |
| BUG-15 | Séries Favoritas | Botão de favoritar sem nome acessível | 🟠 Média | Acessibilidade |
| BUG-16 | Séries Favoritas | Variáveis de cor usadas nos cards nunca foram definidas | 🟡 Baixa | Visual |
| BUG-17 | Slideshow | Falha na API deixa a tela presa em "Carregando..." | 🟠 Média | Tratamento de erro |
| BUG-18 | Vários | Contraste de cores abaixo do mínimo WCAG AA (4,5:1) | 🟠 Média | Acessibilidade |

---

## Detalhes

### BUG-01: Voltar a partir da primeira imagem deixa o carrossel vazio
- **Passos:** abrir o Slideshow → clicar em "‹" (imagem anterior) logo na primeira imagem.
- **Esperado:** ir para a última imagem.
- **Obtido:** a imagem some.
- **Causa:** `(0 - 1) % 5` é `-1` em JavaScript, e `images[-1]` é `undefined`.
- **Correção:** `(índice - 1 + total) % total`.

### BUG-02: Trocar de categoria acelera o autoplay
- **Passos:** trocar a categoria 3 vezes e esperar 4 segundos.
- **Esperado:** avançar 1 imagem a cada 4 s.
- **Obtido:** avança várias imagens de uma vez.
- **Causa:** cada busca criava um `setInterval` novo sem limpar o anterior.
- **Correção:** `clearInterval` antes de iniciar um novo autoplay.

### BUG-03: Chave da API exposta no front-end
- **Problema:** a chave da API do Pexels estava fixa no código JavaScript, e qualquer visitante podia copiá-la.
- **Correção:** troca para a API pública do Lorem Picsum, que não exige chave. O teste confirma que nenhuma requisição envia o cabeçalho `Authorization`.

### BUG-04: Status "assistido" pula para outro filme
- **Passos:** adicionar "Matrix" e "Duna" → marcar "Duna" como assistido → remover "Matrix".
- **Esperado:** "Duna (assistido)".
- **Obtido:** "Duna (desejo assistir)".
- **Causa:** a lista usava `key={index}`. Depois da remoção, o React reaproveitou o estado do item errado.
- **Correção:** cada filme ganhou um `id` único, usado como `key`.

### BUG-05: Filme sem título
- **Passos:** clicar em "Adicionar Filme" com o campo vazio ou só com espaços.
- **Correção:** o título passa por `trim()` e o formulário mostra a mensagem "Digite o título do filme.".

### BUG-06: Títulos repetidos removidos ou editados juntos
- **Passos:** adicionar "Matrix" duas vezes → remover uma.
- **Obtido:** as duas somem.
- **Causa:** remoção e edição filtravam pelo título.
- **Correção:** as operações usam o `id` do filme.

### BUG-07: Edição vazia apaga o título
- **Passos:** clicar no título → apagar o texto → "Salvar".
- **Obtido:** o filme fica sem nome.
- **Correção:** se o novo título estiver vazio, mantém o anterior.

### BUG-08: Lista de filmes inacessível pelo teclado
- **Problema:** título, status e lixeira eram `<span>` e `<svg>` com `onClick` e `aria-hidden`. Não recebiam foco e ficavam escondidos do leitor de tela.
- **Correção:** viraram `<button>` com nomes acessíveis ("Remover Matrix") e `aria-pressed` no status.

### BUG-09: Advice Generator preso em "Loading..."
- **Passos:** abrir o app com a API fora do ar ou sem internet.
- **Obtido:** "Loading..." para sempre e erro não tratado no console.
- **Correção:** `try/catch`, mensagem de erro e possibilidade de tentar de novo pelo botão.

### BUG-10: Botão do dado
- **Problema:** o botão não tinha nome acessível, tinha `outline: none` (sem indicação de foco no teclado) e aceitava cliques repetidos durante o carregamento.
- **Correção:** `aria-label`, `:focus-visible` e `disabled` enquanto carrega.

### BUG-11: Número do cartão não validado
- **Problema:** o botão "Cadastrar" habilitava com o campo de número vazio.
- **Correção:** de 13 a 19 dígitos e validação pelo [algoritmo de Luhn](https://pt.wikipedia.org/wiki/Algoritmo_de_Luhn).

### BUG-12: Nomes com acento recusados
- **Passos:** digitar "José da Silva".
- **Obtido:** o botão continua desabilitado.
- **Causa:** a regex `/^[a-zA-Z]+(?:\s[a-zA-Z]+)+$/` só aceita letras sem acento.
- **Impacto:** grande parte dos nomes brasileiros não conseguia cadastrar cartão.
- **Correção:** regex Unicode (`\p{L}`) que aceita acentos, apóstrofo e hífen.

### BUG-13: Validade não validada
- **Problema:** "13/99", "00/30" e datas vencidas eram aceitas.
- **Correção:** formato MM/AA, mês de 01 a 12 e data igual ou posterior ao mês atual.

### BUG-14: CVC aceita letras
- **Problema:** só o tamanho (3 caracteres) era conferido.
- **Correção:** exige exatamente 3 números.

### BUG-15: Favoritar sem nome acessível
- **Problema:** o botão tinha só um ícone, e o leitor de tela anunciava apenas "botão".
- **Correção:** `aria-label="Favoritar <série>"` e `aria-pressed`.

### BUG-16: Variáveis CSS inexistentes
- **Problema:** os cards usavam `var(--primary)` e `var(--accent)`, que não existiam, e as cores caíam no padrão do navegador.
- **Correção:** variáveis definidas no `:root`.

### BUG-17: Slideshow preso em "Carregando..."
- **Problema:** com a API fora do ar, o erro só ia para o console.
- **Correção:** mensagem de erro e botão "Tentar novamente". As requisições dos dois apps com API também ganharam limite de 8 segundos (`AbortSignal.timeout`), para que uma API lenta não deixe a tela carregando indefinidamente.

### BUG-18: Contraste insuficiente
Encontrado na verificação automática com o axe-core.

| App | Cor original | Contraste | Cor nova | Contraste |
|-----|--------------|-----------|----------|-----------|
| Cartão de Crédito | botão `#1DB702` com texto branco | 2,7:1 | `#137a0b` | 5,5:1 |
| Lista de Filmes | botão `#e91e63` com texto branco | 4,4:1 | `#c2185b` | 5,9:1 |
| Séries Favoritas | texto `#7B7B7B` sobre `#E5E5E5` | 3,4:1 | `#595959` | 5,6:1 |
| Séries Favoritas | texto `#789A13` sobre branco | 3,3:1 | `#4d6410` | 6,7:1 |

## Limitação conhecida (não é defeito do app)
- **Advice Generator:** a API Advice Slip guarda a resposta em cache por 2 segundos. Se o dado for clicado várias vezes nesse intervalo, o mesmo conselho pode se repetir. O app usa `cache: 'no-store'` para evitar cache no navegador, mas o cache do servidor não é controlável.
