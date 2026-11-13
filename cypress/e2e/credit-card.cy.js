describe('Cadastro de cartão de crédito', () => {
  const nextYear = String((new Date().getFullYear() + 1) % 100).padStart(2, '0');

  beforeEach(() => cy.visit('apps/credit-card/'));

  const fill = ({ number, name, expiry, cvc }) => {
    if (number) cy.get('#number').type(number);
    if (name) cy.get('#name').type(name);
    if (expiry) cy.get('#expiry').type(expiry);
    if (cvc) cy.get('#cvc').type(cvc);
  };

  it('cadastra um cartão válido com nome acentuado (BUG-12)', () => {
    fill({ number: '4111111111111111', name: 'José da Silva', expiry: `12/${nextYear}`, cvc: '123' });
    cy.contains('button', 'Cadastrar').should('be.enabled').click();

    cy.get('[role="status"]').should('have.text', 'Cartão cadastrado com sucesso!');
    cy.get('ul[aria-label="Cartões cadastrados"] li')
      .should('have.length', 1)
      .and('have.text', '•••• 1111 - José da Silva');
    cy.get('#number').should('have.value', '');
  });

  it('a pré-visualização acompanha o que é digitado', () => {
    fill({ number: '4111111111111111', name: 'Ana Souza' });
    cy.get('.rccs__number').should('contain.text', '4111');
    cy.get('.rccs__name').should('have.text', 'Ana Souza');
  });

  it('mantém o botão desabilitado e mostra erro para dados inválidos', () => {
    fill({ number: '4111111111111112', name: 'Rafael', expiry: '13/30', cvc: 'abc' });
    cy.contains('button', 'Cadastrar').should('be.disabled');
    cy.get('[aria-invalid="true"]').should('have.length', 4);
    cy.contains('Número de cartão inválido.');
    cy.contains('Informe nome e sobrenome.');
    cy.contains('Use MM/AA com uma data futura.');
    cy.contains('O CVC tem 3 números.');
  });

  it('não tem problemas de acessibilidade', () => {
    fill({ number: '4111111111111112' });
    // .rccs é a pré-visualização da biblioteca react-credit-cards-2 (componente de terceiros).
    cy.checkAccessibility({ exclude: [['.rccs']] });
  });
});
