import { describe, expect, it } from 'vitest';
import {
  isCardValid, isValidCardNumber, isValidCvc, isValidExpiry, isValidHolderName,
  maskCardNumber, passesLuhn,
} from './validators';

// Data fixa para os testes de validade não quebrarem com o passar do tempo.
const TODAY = new Date(2026, 10, 13); // 13/11/2026

describe('Número do cartão', () => {
  it.each([
    ['4111 1111 1111 1111', 'Visa de teste com espaços'],
    ['4111111111111111', 'Visa de teste sem espaços'],
    ['5555555555554444', 'Mastercard de teste'],
    ['378282246310005', 'Amex de teste (15 dígitos)'],
    ['4222222222222', 'limite inferior: 13 dígitos'],
    ['6011000990139424', 'Discover de teste'],
  ])('aceita %s (%s)', (number) => {
    expect(isValidCardNumber(number)).toBe(true);
  });

  it.each([
    ['', 'vazio'],
    ['4111 1111 1111 1112', 'falha no algoritmo de Luhn'],
    ['411111111111', 'limite inferior - 1: 12 dígitos'],
    ['41111111111111111111', 'limite superior + 1: 20 dígitos'],
    ['4111-1111-1111-1111', 'com hífens'],
    ['4111 1111 1111 111a', 'com letra'],
  ])('recusa "%s" (%s) — BUG-11', (number) => {
    expect(isValidCardNumber(number)).toBe(false);
  });

  it('o algoritmo de Luhn identifica um dígito trocado', () => {
    expect(passesLuhn('79927398713')).toBe(true);
    expect(passesLuhn('79927398710')).toBe(false);
  });
});

describe('Nome do titular', () => {
  it.each([
    'Rafael Jesus',
    'José da Silva', // BUG-12: nomes com acento eram recusados
    'Ana D\'Ávila',
    'João Pedro Gonçalves',
    'Maria-Clara Souza',
    '  Rafael Jesus  ',
  ])('aceita "%s"', (name) => {
    expect(isValidHolderName(name)).toBe(true);
  });

  it.each([
    ['', 'vazio'],
    ['Rafael', 'só o primeiro nome'],
    ['Rafael  Jesus', 'dois espaços seguidos'],
    ['Rafael Jesus 2', 'com número'],
    ['Rafael @Jesus', 'com símbolo'],
  ])('recusa "%s" (%s)', (name) => {
    expect(isValidHolderName(name)).toBe(false);
  });
});

describe('Data de validade (hoje = 13/11/2026) — BUG-13', () => {
  it.each([
    ['11/26', 'mês atual (limite)'],
    ['12/26', 'próximo mês'],
    ['01/27', 'virada de ano'],
    ['12/99', 'ano distante'],
  ])('aceita %s (%s)', (expiry) => {
    expect(isValidExpiry(expiry, TODAY)).toBe(true);
  });

  it.each([
    ['10/26', 'mês anterior (vencido)'],
    ['12/25', 'ano anterior'],
    ['00/27', 'mês 00'],
    ['13/27', 'mês 13'],
    ['1/27', 'mês com um dígito'],
    ['11/2026', 'ano com 4 dígitos'],
    ['1127', 'sem barra'],
    ['', 'vazio'],
  ])('recusa "%s" (%s)', (expiry) => {
    expect(isValidExpiry(expiry, TODAY)).toBe(false);
  });

  it('usa a data atual quando nenhuma é informada', () => {
    expect(isValidExpiry('01/00')).toBe(false);
  });
});

describe('CVC — BUG-14', () => {
  it('aceita 3 números', () => {
    expect(isValidCvc('123')).toBe(true);
  });

  it.each([
    ['abc', 'letras com 3 caracteres (era aceito)'],
    ['12', '2 números'],
    ['1234', '4 números'],
    ['12a', 'número e letra'],
    ['', 'vazio'],
  ])('recusa "%s" (%s)', (cvc) => {
    expect(isValidCvc(cvc)).toBe(false);
  });
});

describe('Cartão completo', () => {
  const validCard = {
    number: '4111 1111 1111 1111', name: 'José da Silva', expiry: '12/30', cvc: '123',
  };

  it('é válido quando todos os campos são válidos', () => {
    expect(isCardValid(validCard, TODAY)).toBe(true);
  });

  it.each(['number', 'name', 'expiry', 'cvc'])('é inválido quando "%s" está vazio', (field) => {
    expect(isCardValid({ ...validCard, [field]: '' }, TODAY)).toBe(false);
  });

  it('mascara o número mostrando só os 4 últimos dígitos', () => {
    expect(maskCardNumber('4111 1111 1111 1234')).toBe('•••• 1234');
  });
});
