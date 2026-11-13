import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

const fillForm = async (user, data) => {
  const fields = {
    number: /número do cartão/i,
    name: /nome do titular/i,
    expiry: /data de validade/i,
    cvc: /cvc/i,
  };
  for (const [field, label] of Object.entries(fields)) {
    if (data[field]) await user.type(screen.getByLabelText(label), data[field]);
  }
};

const validCard = {
  number: '4111111111111111', name: 'José da Silva', expiry: '12/39', cvc: '123',
};

describe('Cadastro de cartão', () => {
  it('começa com o botão Cadastrar desabilitado', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeDisabled();
  });

  it('habilita o botão só quando todos os campos são válidos', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillForm(user, { ...validCard, cvc: '12' });
    const button = screen.getByRole('button', { name: /cadastrar/i });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/cvc/i), '3');
    expect(button).toBeEnabled();
  });

  it('BUG-12: aceita nome com acento', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/nome do titular/i), 'José da Silva');
    expect(screen.getByLabelText(/nome do titular/i)).toHaveAttribute('aria-invalid', 'false');
  });

  it('mostra mensagem de erro no campo inválido', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/número do cartão/i), '4111111111111112');
    const input = screen.getByLabelText(/número do cartão/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Número de cartão inválido.');
  });

  it('BUG-14: não habilita o botão com CVC "abc"', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillForm(user, { ...validCard, cvc: 'abc' });
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeDisabled();
  });

  it('cadastra o cartão, limpa o formulário e mostra o número mascarado', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillForm(user, validCard);
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Cartão cadastrado com sucesso!');
    expect(screen.getByLabelText(/número do cartão/i)).toHaveValue('');
    const list = screen.getByRole('list', { name: /cartões cadastrados/i });
    expect(within(list).getByText('•••• 1111 - José da Silva')).toBeInTheDocument();
  });

  it('a mensagem de sucesso some quando o usuário volta a digitar', async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillForm(user, validCard);
    await user.click(screen.getByRole('button', { name: /cadastrar/i }));
    await user.type(screen.getByLabelText(/cvc/i), '1');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('não cadastra se o formulário for enviado inválido (ex.: Enter)', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/cvc/i), '12{Enter}');
    expect(screen.queryByRole('list', { name: /cartões cadastrados/i })).not.toBeInTheDocument();
  });
});
