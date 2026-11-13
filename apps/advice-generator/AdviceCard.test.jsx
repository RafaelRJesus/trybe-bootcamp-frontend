import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { fetchData, REQUEST_TIMEOUT_MS } from './services/advice-api';

const adviceResponse = (id, advice) => ({
  ok: true,
  json: () => Promise.resolve({ slip: { id, advice } }),
});

const mockFetch = (...responses) => {
  const spy = vi.spyOn(globalThis, 'fetch');
  responses.forEach((response) => spy.mockResolvedValueOnce(response));
  return spy;
};

describe('Advice Generator', () => {
  it('mostra "Loading..." e depois o conselho com o número', async () => {
    mockFetch(adviceResponse(117, 'Ask questions.'));
    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: '"Ask questions."' })).toBeInTheDocument();
    expect(screen.getByText('advice #117')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('busca um novo conselho ao clicar no dado', async () => {
    const fetchSpy = mockFetch(
      adviceResponse(1, 'First advice.'),
      adviceResponse(2, 'Second advice.'),
    );
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('"First advice."');

    await user.click(screen.getByRole('button', { name: 'Gerar novo conselho' }));

    expect(await screen.findByText('"Second advice."')).toBeInTheDocument();
    expect(screen.getByText('advice #2')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('chama a API certa sem cache do navegador', async () => {
    const fetchSpy = mockFetch(adviceResponse(1, 'Ok.'));
    render(<App />);
    await screen.findByText('"Ok."');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.adviceslip.com/advice',
      expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) }),
    );
  });

  it('BUG-10: o botão fica desabilitado durante o carregamento', async () => {
    let resolveRequest;
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    render(<App />);
    const button = screen.getByRole('button', { name: 'Gerar novo conselho' });
    expect(button).toBeDisabled();

    resolveRequest(adviceResponse(1, 'Done.'));
    await screen.findByText('"Done."');
    expect(button).toBeEnabled();
  });

  it('BUG-09: mostra mensagem de erro quando a API responde com falha', async () => {
    mockFetch({ ok: false, json: vi.fn() });
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load an advice/i);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('BUG-09: mostra mensagem de erro quando não há conexão', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'));
    render(<App />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('BUG-09: depois de um erro, tentar de novo funciona', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(adviceResponse(5, 'Try again.'));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('alert');

    await user.click(screen.getByRole('button', { name: 'Gerar novo conselho' }));

    expect(await screen.findByText('"Try again."')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('não atualiza o estado se a tela for fechada antes da resposta', async () => {
    let resolveRequest;
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    const consoleError = vi.spyOn(console, 'error');
    const { unmount } = render(<App />);
    unmount();
    resolveRequest(adviceResponse(1, 'Late.'));
    await Promise.resolve();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('não atualiza o estado se a tela for fechada antes de um erro', async () => {
    let rejectRequest;
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise((_, reject) => {
      rejectRequest = reject;
    }));
    const consoleError = vi.spyOn(console, 'error');
    const { unmount } = render(<App />);
    unmount();
    rejectRequest(new Error('boom'));
    await Promise.resolve();
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('fetchData', () => {
  it('cancela a requisição depois de 8 segundos sem resposta', async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');
    mockFetch(adviceResponse(1, 'Ok.'));
    await fetchData();
    expect(timeoutSpy).toHaveBeenCalledWith(REQUEST_TIMEOUT_MS);
    expect(REQUEST_TIMEOUT_MS).toBe(8000);
  });

  it('lança erro quando a resposta não é ok', async () => {
    mockFetch({ ok: false });
    await expect(fetchData()).rejects.toThrow('Erro ao buscar dados da API');
  });
});
