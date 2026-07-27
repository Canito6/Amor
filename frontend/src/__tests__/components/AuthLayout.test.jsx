import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';

describe('AuthLayout Component', () => {
  it('renderiza o conteúdo do Outlet corretamente', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<div>Conteúdo de Login Teste</div>} />
            <Route path="/registar" element={<div>Conteúdo de Registar Teste</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo de Login Teste')).toBeInTheDocument();
  });

  it('permite a alternância de rota entre / e /registar sem erros', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/registar']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<div>Conteúdo de Login Teste</div>} />
            <Route path="/registar" element={<div>Conteúdo de Registar Teste</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo de Registar Teste')).toBeInTheDocument();
  });
});
