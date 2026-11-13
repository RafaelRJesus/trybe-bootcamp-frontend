describe('Minha Lista de Filmes', () => {
  beforeEach(() => {
    cy.visit('apps/to-watch/');
    cy.contains('Carregando...').should('not.exist');
  });

  const addMovie = (title) => {
    cy.get('#movie-title').type(`${title}{enter}`);
  };

  const items = () => cy.get('ul[aria-label="Lista de filmes"] li');

  it('fluxo completo: adicionar, marcar, editar e remover', () => {
    addMovie('Matrix');
    addMovie('Duna');
    items().should('have.length', 2);

    items().eq(0).contains('button', '(desejo assistir)').click();
    items().eq(0).contains('button', '(assistido)');

    items().eq(1).contains('button', 'Duna').click();
    cy.get('input[aria-label="Novo título para Duna"]').clear().type('Duna: Parte 2{enter}');
    items().eq(1).should('contain.text', 'Duna: Parte 2');

    cy.get('button[aria-label="Remover Matrix"]').click();
    items().should('have.length', 1).first().should('contain.text', 'Duna: Parte 2');
  });

  it('BUG-04: o status "assistido" não pula para outro filme após remover', () => {
    addMovie('Matrix');
    addMovie('Duna');
    items().eq(1).contains('button', '(desejo assistir)').click();
    cy.get('button[aria-label="Remover Matrix"]').click();
    items().first().should('contain.text', 'Duna').and('contain.text', '(assistido)');
  });

  it('BUG-05: não aceita título vazio', () => {
    cy.get('#movie-title').type('   {enter}');
    cy.get('[role="alert"]').should('have.text', 'Digite o título do filme.');
    items().should('not.exist');
  });

  it('não tem problemas de acessibilidade', () => {
    addMovie('Matrix');
    cy.checkAccessibility();
  });
});
