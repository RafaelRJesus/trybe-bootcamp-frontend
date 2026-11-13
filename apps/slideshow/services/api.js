// BUG-03 (corrigido): a versão original chamava a API do Pexels com a chave
// de acesso fixa no código do front-end, visível para qualquer pessoa.
// Agora usamos a API pública do Lorem Picsum, que não exige chave.
const API_URL = 'https://picsum.photos/v2/list';
const IMAGES_PER_CATEGORY = 5;
export const REQUEST_TIMEOUT_MS = 8000;

export const CATEGORIES = ['natureza', 'cidade', 'praia', 'montanha'];

export const fetchImages = async (category) => {
  const page = CATEGORIES.indexOf(category) + 1 || 1;
  // Sem limite de tempo, uma API lenta deixava a tela em "Carregando..." indefinidamente.
  const response = await fetch(
    `${API_URL}?page=${page}&limit=${IMAGES_PER_CATEGORY}`,
    { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  );

  if (!response.ok) {
    throw new Error('Erro ao buscar as imagens');
  }

  const photos = await response.json();
  return photos.map(({ id, author }) => ({
    src: `https://picsum.photos/id/${id}/1280/720`,
    author,
  }));
};
