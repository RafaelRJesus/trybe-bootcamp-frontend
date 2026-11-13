import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import series from './data';

const initialFavorites = series.filter((serie) => serie.favorite).length;

describe('Séries Favoritas', () => {
  it('mostra um card para cada série', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Minhas Séries Favoritas' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(series.length);
  });

  it('mostra ano, gênero, nota e personagens da série', () => {
    render(<App />);
    const card = screen.getByRole('article', { name: 'Breaking Bad' });
    expect(within(card).getByText('2008')).toBeInTheDocument();
    expect(within(card).getByText('Drama')).toBeInTheDocument();
    expect(within(card).getByLabelText('Nota 5 de 5')).toBeInTheDocument();
    expect(within(card).getAllByRole('listitem').map((li) => li.textContent))
      .toEqual(['Jesse', 'Heisenberg']);
  });

  it('BUG-15: cada botão de favoritar tem nome acessível e estado', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: 'Favoritar Suits' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Favoritar Breaking Bad' }))
      .toHaveAttribute('aria-pressed', 'false');
  });

  it('marca e desmarca uma série e atualiza o contador', async () => {
    const user = userEvent.setup();
    render(<App />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(`${initialFavorites} de ${series.length} séries favoritadas`);

    const button = screen.getByRole('button', { name: 'Favoritar Breaking Bad' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(status).toHaveTextContent(`${initialFavorites + 1} de ${series.length}`);

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(status).toHaveTextContent(`${initialFavorites} de ${series.length}`);
  });

  it('favoritar uma série não altera as outras', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Favoritar Breaking Bad' }));
    expect(screen.getByRole('button', { name: 'Favoritar Band of Brothers' }))
      .toHaveAttribute('aria-pressed', 'false');
  });

  it('filtra só as favoritas e reflete mudanças na hora', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText(/mostrar só as favoritas/i));
    expect(screen.getAllByRole('article')).toHaveLength(initialFavorites);
    expect(screen.queryByRole('article', { name: 'Breaking Bad' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Favoritar Suits' }));
    expect(screen.queryByRole('article', { name: 'Suits' })).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/mostrar só as favoritas/i));
    expect(screen.getAllByRole('article')).toHaveLength(series.length);
  });

  it('BUG-16: as variáveis de cor usadas nos cards estão definidas', async () => {
    const css = await import('./index.css?raw');
    expect(css.default).toMatch(/--primary:/);
    expect(css.default).toMatch(/--accent:/);
  });
});

describe('Séries Favoritas pelo teclado', () => {
  it('BUG-15: dá para favoritar com Tab + Espaço', async () => {
    const user = userEvent.setup();
    render(<App />);
    screen.getByLabelText(/mostrar só as favoritas/i).focus();
    await user.tab();
    const firstButton = screen.getByRole('button', { name: 'Favoritar Supernatural' });
    expect(firstButton).toHaveFocus();
    await user.keyboard(' ');
    expect(firstButton).toHaveAttribute('aria-pressed', 'false');
  });
});
