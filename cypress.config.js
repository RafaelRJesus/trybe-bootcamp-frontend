import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173/trybe-bootcamp-frontend/',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    retries: { runMode: 1, openMode: 0 },
    setupNodeEvents(on) {
      // Mostra no terminal do CI as violações de acessibilidade encontradas pelo axe.
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
});
