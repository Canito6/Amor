import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '../../components/shared/EmptyState';

describe('EmptyState component', () => {
  it('renders title and description correctly', () => {
    render(<EmptyState title="Nenhum item" description="Crie o seu primeiro item aqui." />);
    expect(screen.getByText('Nenhum item')).toBeInTheDocument();
    expect(screen.getByText('Crie o seu primeiro item aqui.')).toBeInTheDocument();
  });

  it('renders default icon when none is provided', () => {
    render(<EmptyState title="Test" description="Test" />);
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(<EmptyState icon="📷" title="Test" description="Test" />);
    expect(screen.getByText('📷')).toBeInTheDocument();
    expect(screen.queryByText('❤️')).not.toBeInTheDocument();
  });
});
