describe('Slideshow de imagens', () => {
  const photos = (page) => Array.from({ length: 5 }, (_, i) => ({
    id: String(page * 10 + i),
    author: `Autor ${page * 10 + i}`,
  }));

  // cy.clock() congela os timers da página para controlar o autoplay com cy.tick().
  const visitSlideshow = ({ freezeClock = false } = {}) => {
    if (freezeClock) cy.clock();
    cy.intercept('GET', 'https://picsum.photos/v2/list*', (req) => {
      const page = Number(new URL(req.url).searchParams.get('page'));
      req.reply(photos(page));
    }).as('list');
    cy.intercept('GET', 'https://picsum.photos/id/**', { fixture: 'photo.png' });
    cy.visit('apps/slideshow/');
    cy.wait('@list');
    cy.get('[data-testid="carousel-image"]').should('be.visible');
  };

  const counter = () => cy.get('.carousel-counter');

  it('BUG-01: voltar a partir da primeira imagem vai para a última', () => {
    visitSlideshow({ freezeClock: true });
    counter().should('have.text', '1 / 5');
    cy.get('button[aria-label="Imagem anterior"]').click();
    counter().should('have.text', '5 / 5');
    cy.get('[data-testid="carousel-image"]').should('have.attr', 'alt', 'Foto de Autor 14');
  });

  it('avança sozinho a cada 4 segundos', () => {
    visitSlideshow({ freezeClock: true });
    cy.tick(4000);
    counter().should('have.text', '2 / 5');
    cy.tick(4000);
    counter().should('have.text', '3 / 5');
  });

  it('BUG-02: trocar de categoria várias vezes não acelera o autoplay', () => {
    visitSlideshow({ freezeClock: true });
    cy.get('#category').select('cidade');
    cy.wait('@list');
    cy.get('#category').select('praia');
    cy.wait('@list');
    cy.get('[data-testid="carousel-image"]').should('have.attr', 'alt', 'Foto de Autor 30');
    cy.tick(4000);
    counter().should('have.text', '2 / 5');
  });

  it('BUG-03: nenhuma requisição envia chave de API', () => {
    visitSlideshow();
    cy.get('#category').select('montanha');
    cy.wait('@list').its('request.headers').should('not.have.property', 'authorization');
  });

  it('oculta e mostra o carrossel', () => {
    visitSlideshow();
    cy.contains('button', 'Ocultar carrossel').click();
    cy.get('[data-testid="carousel-image"]').should('not.exist');
    cy.contains('button', 'Mostrar carrossel').click();
    cy.wait('@list');
    cy.get('[data-testid="carousel-image"]').should('be.visible');
  });

  it('não tem problemas de acessibilidade', () => {
    visitSlideshow();
    cy.checkAccessibility();
  });
});

describe('Slideshow com a API fora do ar', () => {
  it('BUG-17: mostra erro e permite tentar de novo', () => {
    cy.intercept('GET', 'https://picsum.photos/v2/list*', { statusCode: 503 }).as('down');
    cy.intercept('GET', 'https://picsum.photos/id/**', { fixture: 'photo.png' });
    cy.visit('apps/slideshow/');
    cy.wait('@down');
    cy.get('[role="alert"]').should('contain.text', 'Não foi possível carregar as imagens.');

    cy.intercept('GET', 'https://picsum.photos/v2/list*', [{ id: '1', author: 'Autor 1' }]).as('up');
    cy.contains('button', 'Tentar novamente').click();
    cy.wait('@up');
    cy.get('.carousel-counter').should('have.text', '1 / 1');
  });
});
