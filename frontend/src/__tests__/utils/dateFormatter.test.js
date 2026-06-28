import { describe, it, expect } from 'vitest';
import { formatDateShort, formatDateLong, formatDateTime } from '../../utils/formatting/dateFormatter';

describe('dateFormatter utility functions', () => {
  const dateStr = '2026-06-28T12:34:56.789Z';

  describe('formatDateShort', () => {
    it('returns empty string if no date is provided', () => {
      expect(formatDateShort(null)).toBe('');
      expect(formatDateShort(undefined)).toBe('');
    });

    it('formats date to short locale string in Portuguese', () => {
      const formatted = formatDateShort(dateStr, 'pt');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('28');
    });

    it('formats date to short locale string in English', () => {
      const formatted = formatDateShort(dateStr, 'en');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('28');
    });
  });

  describe('formatDateLong', () => {
    it('returns empty string if no date is provided', () => {
      expect(formatDateLong(null)).toBe('');
    });

    it('formats date to long locale string in Portuguese', () => {
      const formatted = formatDateLong(dateStr, 'pt');
      expect(formatted.toLowerCase()).toContain('junho');
      expect(formatted).toContain('2026');
    });

    it('formats date to long locale string in English', () => {
      const formatted = formatDateLong(dateStr, 'en');
      expect(formatted.toLowerCase()).toContain('june');
      expect(formatted).toContain('2026');
    });
  });

  describe('formatDateTime', () => {
    it('returns empty string if no date is provided', () => {
      expect(formatDateTime(null)).toBe('');
    });

    it('formats date and time in Portuguese', () => {
      const formatted = formatDateTime(dateStr, 'pt');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('28');
    });
  });
});
