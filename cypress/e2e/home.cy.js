describe('Página inicial do portfólio', () => {
  beforeEach(() => cy.visit('/'));

  it('lista as 5 aplicações testadas', () => {
    cy.get('article.card').should('have.length', 5);
  });

  it('cada link "Abrir app" leva a uma aplicação que carrega', () => {
    cy.get('article.card a').each(($link) => {
      cy.request($link.prop('href')).its('status').should('eq', 200);
    });
  });

  it('não tem problemas de acessibilidade', () => {
    cy.checkAccessibility();
  });
});
