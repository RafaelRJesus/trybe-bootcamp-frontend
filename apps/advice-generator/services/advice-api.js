const API_URL = 'https://api.adviceslip.com/advice';

export const fetchData = async () => {
  // A API guarda a resposta em cache por 2 segundos. "no-store" evita que o
  // navegador também reaproveite a resposta anterior.
  const response = await fetch(API_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Erro ao buscar dados da API');
  }
  return response.json();
};
