
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WelcomeBanner from '../../components/dashboard/widgets/WelcomeBanner';

describe('WelcomeBanner component', () => {
  const t = {
    welcome: 'Bem-vindo(a)',
    what_to_do: 'O que queres fazer hoje?'
  };

  it('renders welcome message with user name', () => {
    render(<WelcomeBanner nome="Miguel" t={t} />);
    
    expect(screen.getByText(/Bem-vindo\(a\),/)).toBeInTheDocument();
    expect(screen.getByText('Miguel')).toBeInTheDocument();
    expect(screen.getByText('O que queres fazer hoje?')).toBeInTheDocument();
  });
});
