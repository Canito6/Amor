
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoveCounter from '../../components/dashboard/widgets/LoveCounter';

describe('LoveCounter component', () => {
  const t = {
    memories_counter_title: 'Contador do Amor'
  };

  it('renders prompt message when relationshipDate is not provided', () => {
    render(<LoveCounter relationshipDate={null} language="pt" t={t} />);
    expect(screen.getByText(/Define a vossa data de namoro/i)).toBeInTheDocument();
  });

  it('renders calculation correctly in Portuguese', () => {
    // Set a relationship start date in the past
    const relationDate = new Date();
    relationDate.setDate(relationDate.getDate() - 10); // 10 days ago

    render(<LoveCounter relationshipDate={relationDate.toISOString()} language="pt" t={t} />);
    
    expect(screen.getByText('Contador do Amor')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Dias')).toBeInTheDocument();
  });

  it('renders correct labels in English', () => {
    const relationDate = new Date();
    relationDate.setDate(relationDate.getDate() - 5); // 5 days ago

    render(<LoveCounter relationshipDate={relationDate.toISOString()} language="en" t={t} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
  });
});
