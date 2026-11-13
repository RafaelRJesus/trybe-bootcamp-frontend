describe('Advice Generator', () => {
  const API = 'https://api.adviceslip.com/advice';

  it('mostra um conselho e busca outro ao clicar no dado', () => {
    cy.intercept('GET', API, { slip: { id: 117, advice: 'Ask questions.' } }).as('first');
    cy.visit('apps/advice-generator/');
    cy.wait('@first');
    cy.contains('advice #117');
    cy.contains('h1', '"Ask questions."');

    cy.intercept('GET', API, { slip: { id: 42, advice: 'Test everything.' } }).as('second');
    cy.get('button[aria-label="Gerar novo conselho"]').click();
    cy.wait('@second');
    cy.contains('advice #42');
    cy.contains('h1', '"Test everything."');
  });

  it('BUG-10: o botão fica desabilitado enquanto carrega', () => {
    cy.intercept('GET', API, { delay: 800, body: { slip: { id: 1, advice: 'Wait.' } } }).as('slow');
    cy.visit('apps/advice-generator/');
    cy.get('button[aria-label="Gerar novo conselho"]').should('be.disabled');
    cy.wait('@slow');
    cy.get('button[aria-label="Gerar novo conselho"]').should('be.enabled');
  });

  it('BUG-09: mostra erro quando a API falha e se recupera ao tentar de novo', () => {
    cy.intercept('GET', API, { statusCode: 500 }).as('error');
    cy.visit('apps/advice-generator/');
    cy.wait('@error');
    cy.get('[role="alert"]').should('contain.text', 'Could not load an advice');

    cy.intercept('GET', API, { slip: { id: 7, advice: 'Never give up.' } }).as('ok');
    cy.get('button[aria-label="Gerar novo conselho"]').click();
    cy.wait('@ok');
    cy.contains('h1', '"Never give up."');
    cy.get('[role="alert"]').should('not.exist');
  });

  it('BUG-09: mostra erro quando não há conexão', () => {
    cy.intercept('GET', API, { forceNetworkError: true });
    cy.visit('apps/advice-generator/');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('não tem problemas de acessibilidade', () => {
    cy.intercept('GET', API, { slip: { id: 1, advice: 'Be kind.' } });
    cy.visit('apps/advice-generator/');
    cy.contains('"Be kind."');
    cy.checkAccessibility();
  });

  it('layout mobile: o card cabe na tela', () => {
    cy.viewport(375, 667);
    cy.intercept('GET', API, { slip: { id: 1, advice: 'Mobile first.' } });
    cy.visit('apps/advice-generator/');
    cy.contains('"Mobile first."');
    cy.document().then((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.at.most(375);
    });
  });
});
