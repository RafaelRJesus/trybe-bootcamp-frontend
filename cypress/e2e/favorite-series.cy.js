describe('Séries Favoritas', () => {
  beforeEach(() => cy.visit('apps/favorite-series/'));

  it('favorita uma série e atualiza o contador', () => {
    cy.get('[role="status"]').invoke('text').then((before) => {
      const count = Number(before.split(' ')[0]);
      cy.get('button[aria-label="Favoritar Breaking Bad"]')
        .should('have.attr', 'aria-pressed', 'false')
        .click()
        .should('have.attr', 'aria-pressed', 'true');
      cy.get('[role="status"]').should('contain.text', `${count + 1} de`);
    });
  });

  it('filtra só as favoritas', () => {
    cy.get('article').its('length').then((total) => {
      cy.contains('label', 'Mostrar só as favoritas').click();
      cy.get('article').its('length').should('be.lessThan', total);
      cy.get('button[aria-pressed="false"]').should('not.exist');
    });
  });

  it('não tem problemas de acessibilidade', () => {
    cy.checkAccessibility();
  });
});
