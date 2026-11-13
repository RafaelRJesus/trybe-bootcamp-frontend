import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { LOADING_DELAY_MS } from './components/MovieList';

const renderLoaded = () => {
  vi.useFakeTimers();
  const view = render(<App />);
  act(() => vi.advanceTimersByTime(LOADING_DELAY_MS));
  vi.useRealTimers();
  return { user: userEvent.setup(), ...view };
};

const addMovie = async (user, title) => {
  await user.clear(screen.getByLabelText(/título do filme/i));
  await user.type(screen.getByLabelText(/título do filme/i), title);
  await user.click(screen.getByRole('button', { name: /adicionar filme/i }));
};

const movieItems = () => within(screen.getByRole('list', { name: /lista de filmes/i }))
  .queryAllByRole('listitem');

describe('Minha Lista de Filmes', () => {
  it('mostra "Carregando..." até os dados carregarem', () => {
    vi.useFakeTimers();
    render(<App />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(LOADING_DELAY_MS - 1));
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    expect(screen.getByText(/nenhum filme na lista/i)).toBeInTheDocument();
  });

  it('adiciona um filme e limpa o campo', async () => {
    const { user } = renderLoaded();
    await addMovie(user, 'Matrix');
    expect(movieItems()).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Matrix' })).toBeInTheDocument();
    expect(screen.getByLabelText(/título do filme/i)).toHaveValue('');
  });

  it('remove espaços extras do título', async () => {
    const { user } = renderLoaded();
    await addMovie(user, '   Matrix   ');
    expect(screen.getByRole('button', { name: 'Matrix' })).toBeInTheDocument();
  });

  it.each(['', '   '])('BUG-05: não adiciona filme com título "%s"', async (title) => {
    const { user } = renderLoaded();
    if (title) await user.type(screen.getByLabelText(/título do filme/i), title);
    await user.click(screen.getByRole('button', { name: /adicionar filme/i }));
    expect(movieItems()).toHaveLength(0);
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o título do filme.');
  });

  it('a mensagem de erro some quando o usuário digita', async () => {
    const { user } = renderLoaded();
    await user.click(screen.getByRole('button', { name: /adicionar filme/i }));
    await user.type(screen.getByLabelText(/título do filme/i), 'M');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('alterna o status entre "desejo assistir" e "assistido"', async () => {
    const { user } = renderLoaded();
    await addMovie(user, 'Matrix');
    const status = screen.getByRole('button', { name: '(desejo assistir)' });
    await user.click(status);
    expect(status).toHaveTextContent('(assistido)');
    expect(status).toHaveAttribute('aria-pressed', 'true');
    await user.click(status);
    expect(status).toHaveTextContent('(desejo assistir)');
  });

  it('remove um filme', async () => {
    const { user } = renderLoaded();
    await addMovie(user, 'Matrix');
    await user.click(screen.getByRole('button', { name: 'Remover Matrix' }));
    expect(movieItems()).toHaveLength(0);
  });

  it('BUG-04: o status "assistido" continua no filme certo após uma remoção', async () => {
    const { user } = renderLoaded();
    await addMovie(user, 'Matrix');
    await addMovie(user, 'Duna');
    const [, duna] = movieItems();
    await user.click(within(duna).getByRole('button', { name: '(desejo assistir)' }));

    await user.click(screen.getByRole('button', { name: 'Remover Matrix' }));

    const [remaining] = movieItems();
    expect(remaining).toHaveTextContent('Duna');
    expect(remaining).toHaveTextContent('(assistido)');
  });

  it('BUG-06: com títulos repetidos, remove só o filme clicado', async () => {
    const { user } = renderLoaded();
    await addMovie(user, 'Matrix');
    await addMovie(user, 'Matrix');
    await user.click(screen.getAllByRole('button', { name: 'Remover Matrix' })[0]);
    expect(movieItems()).toHaveLength(1);
  });

  it('BUG-06: com títulos repetidos, edita só o filme clicado', async () => {
    const { user } = renderLoaded();
    await addMovie(user, 'Matrix');
    await addMovie(user, 'Matrix');
    await user.click(screen.getAllByRole('button', { name: 'Matrix' })[1]);
    const input = screen.getByLabelText('Novo título para Matrix');
    await user.clear(input);
    await user.type(input, 'Matrix Reloaded');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    const [first, second] = movieItems();
    expect(first).toHaveTextContent('Matrix(desejo assistir)');
    expect(second).toHaveTextContent('Matrix Reloaded');
  });

  it('edita o título pressionando Enter', async () => {
    const { user } = renderLoaded();
    await addMovie(user, 'Matrx');
    await user.click(screen.getByRole('button', { name: 'Matrx' }));
    const input = screen.getByLabelText('Novo título para Matrx');
    await user.clear(input);
    await user.type(input, 'Matrix{Enter}');
    expect(screen.getByRole('button', { name: 'Matrix' })).toBeInTheDocument();
  });

  it('BUG-07: salvar a edição vazia mantém o título original', async () => {
    const { user } = renderLoaded();
    await addMovie(user, 'Matrix');
    await user.click(screen.getByRole('button', { name: 'Matrix' }));
    await user.clear(screen.getByLabelText('Novo título para Matrix'));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByRole('button', { name: 'Matrix' })).toBeInTheDocument();
  });

  it('BUG-08: dá para usar a lista só com o teclado', async () => {
    const { user } = renderLoaded();
    await addMovie(user, 'Matrix');
    screen.getByRole('button', { name: 'Matrix' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: '(desejo assistir)' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: '(assistido)' })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remover Matrix' })).toHaveFocus();
    await user.keyboard(' ');
    expect(movieItems()).toHaveLength(0);
  });

  it('não gera erro se a tela for fechada durante o carregamento', () => {
    vi.useFakeTimers();
    const { unmount } = render(<App />);
    unmount();
    expect(() => vi.runAllTimers()).not.toThrow();
  });
});
