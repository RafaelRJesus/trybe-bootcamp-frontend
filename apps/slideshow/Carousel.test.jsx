import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import Carousel, { SLIDE_INTERVAL_MS } from './components/Carousel';
import { fetchImages } from './services/api';

const photos = (count, offset = 0) => Array.from({ length: count }, (_, i) => ({
  id: String(i + offset),
  author: `Autor ${i + offset}`,
}));

const okResponse = (body) => ({ ok: true, json: () => Promise.resolve(body) });

const counter = () => screen.getByText(/^\d+ \/ \d+$/).textContent;

// Timers falsos controlam o autoplay; shouldAdvanceTime deixa as promises andarem.
const setup = async (fetchMock) => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock);
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<App />);
  await screen.findByTestId('carousel-image');
  return user;
};

describe('Slideshow', () => {
  it('mostra "Carregando..." e depois a primeira imagem', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse(photos(5)));
    render(<App />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    const image = await screen.findByTestId('carousel-image');
    expect(image).toHaveAttribute('src', 'https://picsum.photos/id/0/1280/720');
    expect(image).toHaveAttribute('alt', 'Foto de Autor 0');
    expect(counter()).toBe('1 / 5');
  });

  it('avança e volta pelos botões', async () => {
    const user = await setup(() => Promise.resolve(okResponse(photos(5))));
    await user.click(screen.getByRole('button', { name: 'Próxima imagem' }));
    expect(counter()).toBe('2 / 5');
    await user.click(screen.getByRole('button', { name: 'Imagem anterior' }));
    expect(counter()).toBe('1 / 5');
  });

  it('BUG-01: voltar a partir da primeira imagem vai para a última', async () => {
    const user = await setup(() => Promise.resolve(okResponse(photos(5))));
    await user.click(screen.getByRole('button', { name: 'Imagem anterior' }));
    expect(counter()).toBe('5 / 5');
    expect(screen.getByTestId('carousel-image')).toHaveAttribute('src', 'https://picsum.photos/id/4/1280/720');
  });

  it('avançar a partir da última imagem volta para a primeira', async () => {
    const user = await setup(() => Promise.resolve(okResponse(photos(2))));
    await user.click(screen.getByRole('button', { name: 'Próxima imagem' }));
    await user.click(screen.getByRole('button', { name: 'Próxima imagem' }));
    expect(counter()).toBe('1 / 2');
  });

  it('troca de imagem sozinha a cada 4 segundos', async () => {
    await setup(() => Promise.resolve(okResponse(photos(5))));
    // Margem de 200 ms porque shouldAdvanceTime também deixa o relógio real andar.
    act(() => vi.advanceTimersByTime(SLIDE_INTERVAL_MS - 200));
    expect(counter()).toBe('1 / 5');
    act(() => vi.advanceTimersByTime(200));
    expect(counter()).toBe('2 / 5');
  });

  it('a navegação manual reinicia a contagem do autoplay', async () => {
    const user = await setup(() => Promise.resolve(okResponse(photos(5))));
    act(() => vi.advanceTimersByTime(3000));
    await user.click(screen.getByRole('button', { name: 'Próxima imagem' }));
    expect(counter()).toBe('2 / 5');
    act(() => vi.advanceTimersByTime(3000));
    expect(counter()).toBe('2 / 5');
  });

  it('BUG-02: trocar de categoria não acelera o autoplay', async () => {
    const user = await setup((url) => {
      const page = Number(new URL(url).searchParams.get('page'));
      return Promise.resolve(okResponse(photos(5, page * 10)));
    });
    await user.selectOptions(screen.getByLabelText(/categoria/i), 'cidade');
    await screen.findByAltText('Foto de Autor 20');
    await user.selectOptions(screen.getByLabelText(/categoria/i), 'praia');
    await screen.findByAltText('Foto de Autor 30');

    act(() => vi.advanceTimersByTime(SLIDE_INTERVAL_MS));
    // Com o bug, 3 intervalos estariam ativos e a imagem avançaria 3 vezes.
    expect(counter()).toBe('2 / 5');
  });

  it('busca a página da API de acordo com a categoria', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse(photos(5)));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByTestId('carousel-image');
    await user.selectOptions(screen.getByLabelText(/categoria/i), 'montanha');
    expect(fetchSpy).toHaveBeenLastCalledWith('https://picsum.photos/v2/list?page=4&limit=5');
  });

  it('BUG-03: a requisição não envia nenhuma chave de API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse(photos(5)));
    render(<App />);
    await screen.findByTestId('carousel-image');
    expect(fetchSpy.mock.calls[0]).toHaveLength(1);
  });

  it('oculta e mostra o carrossel', async () => {
    const user = await setup(() => Promise.resolve(okResponse(photos(5))));
    await user.click(screen.getByRole('button', { name: 'Ocultar carrossel' }));
    expect(screen.queryByTestId('carousel-image')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mostrar carrossel' }));
    expect(await screen.findByTestId('carousel-image')).toBeInTheDocument();
  });

  it('para o autoplay quando o carrossel é ocultado', async () => {
    const user = await setup(() => Promise.resolve(okResponse(photos(5))));
    await user.click(screen.getByRole('button', { name: 'Ocultar carrossel' }));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('BUG-17: mostra erro e permite tentar de novo quando a API falha', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce(okResponse(photos(3)));
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar as imagens.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByTestId('carousel-image')).toBeInTheDocument();
    expect(counter()).toBe('1 / 3');
  });

  it('não atualiza o estado se for fechado antes da resposta', async () => {
    vi.useFakeTimers();
    let resolveRequest;
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    const { unmount } = render(<Carousel category="natureza" />);
    unmount();
    resolveRequest(okResponse(photos(5)));
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('não atualiza o estado se for fechado antes de um erro', async () => {
    let rejectRequest;
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(new Promise((_, reject) => {
      rejectRequest = reject;
    }));
    const consoleError = vi.spyOn(console, 'error');
    const { unmount } = render(<Carousel category="natureza" />);
    unmount();
    rejectRequest(new Error('offline'));
    await Promise.resolve();
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('fetchImages', () => {
  it('usa a página 1 para uma categoria desconhecida', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okResponse([]));
    await fetchImages('desconhecida');
    expect(fetchSpy).toHaveBeenCalledWith('https://picsum.photos/v2/list?page=1&limit=5');
  });
});
