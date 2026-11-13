// Regras de validação do formulário de cartão.
// Ficam em funções puras para poderem ser testadas com análise de valor limite
// e partição de equivalência, sem depender da interface.

export const onlyDigits = (value) => value.replace(/\D/g, '');

// Algoritmo de Luhn: detecta números de cartão digitados errado.
export const passesLuhn = (digits) => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

// BUG-11 (corrigido): o número do cartão não era validado.
export const isValidCardNumber = (number) => {
  if (/[^\d\s]/.test(number)) return false;
  const digits = onlyDigits(number);
  return digits.length >= 13 && digits.length <= 19 && passesLuhn(digits);
};

// BUG-12 (corrigido): a regex original /^[a-zA-Z]+(?:\s[a-zA-Z]+)+$/
// recusava nomes com acento ou apóstrofo, como "José da Silva" ou "Ana D'Ávila".
export const isValidHolderName = (name) => (
  /^\p{L}+(?:['-]\p{L}+)*(?:\s\p{L}+(?:['-]\p{L}+)*)+$/u.test(name.trim())
);

// BUG-13 (corrigido): a validade não era validada; "99/99" ou "abc" eram aceitos.
export const isValidExpiry = (expiry, today = new Date()) => {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
};

// BUG-14 (corrigido): só o tamanho era conferido, então "abc" passava como CVC.
export const isValidCvc = (cvc) => /^\d{3}$/.test(cvc);

export const validateCard = ({ number, name, expiry, cvc }, today = new Date()) => ({
  number: isValidCardNumber(number),
  name: isValidHolderName(name),
  expiry: isValidExpiry(expiry, today),
  cvc: isValidCvc(cvc),
});

export const isCardValid = (cardInfo, today) => (
  Object.values(validateCard(cardInfo, today)).every(Boolean)
);

export const maskCardNumber = (number) => `•••• ${onlyDigits(number).slice(-4)}`;
