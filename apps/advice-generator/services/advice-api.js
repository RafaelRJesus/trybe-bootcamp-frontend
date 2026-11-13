const API_URL = 'https://api.adviceslip.com/advice';
export const REQUEST_TIMEOUT_MS = 8000;

export const fetchData = async () => {
  // A API guarda a resposta em cache por 2 segundos. "no-store" evita que o
  // navegador também reaproveite a resposta anterior.
  // O timeout evita que uma API lenta deixe a tela em "Loading..." para sempre.
  const response = await fetch(API_URL, {
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar dados da API');
  }
  return response.json();
};
