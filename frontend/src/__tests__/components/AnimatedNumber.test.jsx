
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import AnimatedNumber from '../../components/shared/AnimatedNumber';

describe('AnimatedNumber component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders fallback value directly if target value is not a number', () => {
    render(<AnimatedNumber value="ABC" isFirstLoad={true} />);
    expect(screen.getByText('ABC')).toBeInTheDocument();
  });

  it('handles zero value correctly', () => {
    render(<AnimatedNumber value="0" isFirstLoad={true} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles negative value correctly', () => {
    render(<AnimatedNumber value="-15" isFirstLoad={false} />);
    expect(screen.getByText('-15')).toBeInTheDocument();
  });

  it('animates from 0 to target value on first load', async () => {
    let frameCallback = null;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      frameCallback = cb;
      return 1;
    });

    render(<AnimatedNumber value="100" isFirstLoad={true} />);

    expect(screen.getByText('000')).toBeInTheDocument();

    if (frameCallback) {
      const startTime = performance.now();
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 600);
      
      act(() => {
        frameCallback(startTime + 600);
      });
      
      expect(screen.getByText('075')).toBeInTheDocument();
    }
  });

  it('renders target value directly when prefers-reduced-motion is true', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<AnimatedNumber value="100" isFirstLoad={true} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
