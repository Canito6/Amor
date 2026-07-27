import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Registar from '../../pages/auth/Registar';
import { authService } from '../../services/auth/authService';

vi.mock('../../services/auth/authService', () => ({
  authService: {
    register: vi.fn()
  }
}));

describe('Registar Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('desativa o botão de registar enquanto o formulário estiver incompleto ou inválido', () => {
    render(
      <MemoryRouter>
        <Registar />
      </MemoryRouter>
    );

    const btnSubmit = screen.getByRole('button', { name: /Registar Conta/i });
    expect(btnSubmit).toBeDisabled();
  });

  it('mostra erro de correspondência quando a confirmação de password é diferente', async () => {
    render(
      <MemoryRouter>
        <Registar />
      </MemoryRouter>
    );

    const inputUser = screen.getByPlaceholderText(/O teu Nome/i);
    const inputEmail = screen.getByPlaceholderText(/exemplo@email.com/i);
    const inputPass = screen.getByPlaceholderText(/Mínimo 8 caracteres/i);
    const inputConfirm = screen.getByPlaceholderText(/Repete a tua password/i);

    fireEvent.change(inputUser, { target: { value: 'Maria' } });
    fireEvent.change(inputEmail, { target: { value: 'maria@teste.com' } });
    fireEvent.change(inputPass, { target: { value: 'Password123' } });
    fireEvent.change(inputConfirm, { target: { value: 'Diferente123' } });
    fireEvent.blur(inputConfirm);

    await waitFor(() => {
      expect(screen.getByText(/As passwords não coincidem/i)).toBeInTheDocument();
    });

    const btnSubmit = screen.getByRole('button', { name: /Registar Conta/i });
    expect(btnSubmit).toBeDisabled();
  });

  it('mostra erro se a password tiver menos de 8 caracteres ou não tiver letras e números', async () => {
    render(
      <MemoryRouter>
        <Registar />
      </MemoryRouter>
    );

    const inputPass = screen.getByPlaceholderText(/Mínimo 8 caracteres/i);

    // Teste < 8 chars
    fireEvent.change(inputPass, { target: { value: 'Pass1' } });
    fireEvent.blur(inputPass);

    await waitFor(() => {
      expect(screen.getByText(/A password deve ter pelo menos 8 caracteres/i)).toBeInTheDocument();
    });

    // Teste sem números
    fireEvent.change(inputPass, { target: { value: 'PasswordSemNumero' } });
    fireEvent.blur(inputPass);

    await waitFor(() => {
      expect(screen.getByText(/A password deve conter pelo menos 1 letra e 1 número/i)).toBeInTheDocument();
    });
  });

  it('habilita o botão e faz submit com sucesso quando todos os campos são válidos', async () => {
    authService.register.mockResolvedValue({ message: 'Conta criada com sucesso!' });

    render(
      <MemoryRouter>
        <Registar />
      </MemoryRouter>
    );

    const inputUser = screen.getByPlaceholderText(/O teu Nome/i);
    const inputEmail = screen.getByPlaceholderText(/exemplo@email.com/i);
    const inputPass = screen.getByPlaceholderText(/Mínimo 8 caracteres/i);
    const inputConfirm = screen.getByPlaceholderText(/Repete a tua password/i);

    fireEvent.change(inputUser, { target: { value: 'Maria' } });
    fireEvent.change(inputEmail, { target: { value: 'maria@teste.com' } });
    fireEvent.change(inputPass, { target: { value: 'Password123' } });
    fireEvent.change(inputConfirm, { target: { value: 'Password123' } });

    const btnSubmit = screen.getByRole('button', { name: /Registar Conta/i });
    expect(btnSubmit).not.toBeDisabled();

    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith(
        'Maria',
        'maria@teste.com',
        'Password123',
        'direct',
        ''
      );
    });
  });
});
