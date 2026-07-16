import React from 'react';
import { render, screen } from '@testing-library/react';
import PolaroidFrame, { getDeterministicRotation } from '../../components/shared/PolaroidFrame';
import { describe, it, expect } from 'vitest';

describe('PolaroidFrame component', () => {
  it('calculates deterministic rotation correctly', () => {
    const id = '507f1f77bcf86cd799439011';
    const rot1 = getDeterministicRotation(id);
    const rot2 = getDeterministicRotation(id);
    expect(rot1).toBe(rot2); // Same ID must output same angle
    expect(rot1).toBeGreaterThanOrEqual(-4);
    expect(rot1).toBeLessThanOrEqual(4);
    
    // Different IDs should produce deterministic values
    const otherRot = getDeterministicRotation('abc');
    expect(otherRot).toBeGreaterThanOrEqual(-4);
    expect(otherRot).toBeLessThanOrEqual(4);
  });

  it('renders illustration fallback when no imageUrl is provided', () => {
    render(<PolaroidFrame title="Moment text" date="16 de Julho" id="1" />);
    
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Moment text')).toBeInTheDocument();
    expect(screen.getByText('16 de Julho')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('renders correct image and alt tag when imageUrl is provided', () => {
    const testUrl = 'https://example.com/test-photo.jpg';
    render(<PolaroidFrame imageUrl={testUrl} title="Special trip" date="15 de Julho" id="2" />);
    
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', testUrl);
    expect(img).toHaveAttribute('alt', 'Special trip');
  });
});
