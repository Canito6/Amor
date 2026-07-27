import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CycleOnboardingModal from '../../components/cycle/CycleOnboardingModal';

describe('CycleOnboardingModal Component', () => {
  it('não renderiza nada quando isOpen é false', () => {
    const { container } = render(
      <CycleOnboardingModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza o Passo 1 e guarda a opção de género selecionada', async () => {
    const onSaveMock = vi.fn().mockResolvedValue({});
    const onCloseMock = vi.fn();

    render(
      <CycleOnboardingModal isOpen={true} onClose={onCloseMock} onSave={onSaveMock} />
    );

    expect(screen.getByText(/Passo 1: Identificação/i)).toBeInTheDocument();
    expect(screen.getByText(/És homem ou mulher\?/i)).toBeInTheDocument();

    // Selecionar Homem
    const btnHomem = screen.getByRole('button', { name: /Homem/i });
    fireEvent.click(btnHomem);

    // Deve avançar para o Passo 2
    expect(screen.getByText(/Passo 2: Partilha/i)).toBeInTheDocument();
  });

  it('se responder "Não" no Passo 2, conclui imediatamente com shareWithPartner: false', async () => {
    const onSaveMock = vi.fn().mockResolvedValue({});
    const onCloseMock = vi.fn();

    render(
      <CycleOnboardingModal isOpen={true} onClose={onCloseMock} onSave={onSaveMock} />
    );

    // Passo 1 -> Selecionar Mulher
    fireEvent.click(screen.getByRole('button', { name: /Mulher/i }));

    // Passo 2 -> Selecionar "Não, manter privado"
    const btnNao = screen.getByRole('button', { name: /Não, manter privado/i });
    fireEvent.click(btnNao);

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledWith({
        gender: 'mulher',
        shareWithPartner: false,
        partnerShareLevel: 'none',
        onboardingCompleted: true
      });
    });

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('se responder "Sim" no Passo 2, avança para o Passo 3 e guarda partnerShareLevel escolhido', async () => {
    const onSaveMock = vi.fn().mockResolvedValue({});
    const onCloseMock = vi.fn();

    render(
      <CycleOnboardingModal isOpen={true} onClose={onCloseMock} onSave={onSaveMock} />
    );

    // Passo 1 -> Selecionar Mulher
    fireEvent.click(screen.getByRole('button', { name: /Mulher/i }));

    // Passo 2 -> Selecionar "Sim, partilhar"
    fireEvent.click(screen.getByRole('button', { name: /Sim, partilhar/i }));

    // Passo 3 -> Deve estar no Passo 3
    expect(screen.getByText(/Passo 3: Nível de Partilha/i)).toBeInTheDocument();

    // Escolher "Tudo (Detalhado)"
    fireEvent.click(screen.getByRole('button', { name: /Tudo \(Detalhado\)/i }));

    // Clicar em Concluir Configuração
    fireEvent.click(screen.getByRole('button', { name: /Concluir Configuração/i }));

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledWith({
        gender: 'mulher',
        shareWithPartner: true,
        partnerShareLevel: 'detailed',
        onboardingCompleted: true
      });
    });

    expect(onCloseMock).toHaveBeenCalled();
  });
});
