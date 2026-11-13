// Verifica acessibilidade (WCAG 2.1 níveis A e AA) com o axe-core.
// Cada violação é escrita no log do CI antes de o teste falhar.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

Cypress.Commands.add('checkAccessibility', ({ exclude = [] } = {}) => {
  cy.readFile('node_modules/axe-core/axe.min.js', { log: false }).then((axeSource) => {
    cy.window({ log: false }).then((win) => {
      win.eval(axeSource);
      const context = { include: [['html']], exclude };
      return win.axe.run(context, { runOnly: { type: 'tag', values: WCAG_TAGS } });
    }).then(({ violations }) => {
      const report = violations.map(({ id, impact, help, nodes }) => (
        `[a11y] ${impact} ${id}: ${help} -> ${nodes.map((node) => node.target.join(' ')).join(' | ')}`
      ));
      if (report.length) cy.task('log', report.join('\n'));
      expect(report, 'violações de acessibilidade').to.deep.equal([]);
    });
  });
});
