import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GeneralSettings from '../../components/settings/GeneralSettings';

// Mock contexts
vi.mock('../../context/PreferencesContext', () => ({
  usePreferences: () => ({
    soundEnabled: true,
    toggleSound: vi.fn(),
  }),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('GeneralSettings component - Export Section', () => {
  const t = {
    language: 'Idioma',
    layout_style: 'Estilo do Layout',
    layout_sidebar: 'Barra Lateral',
    layout_stacked: 'Ficheiros Empilhados',
    global_theme: 'Tema Global',
    theme_light: 'Claro',
    theme_dark: 'Escuro',
    theme_system: 'Sistema',
  };

  it('renders JSON and PDF export buttons along with descriptive text', () => {
    render(
      <GeneralSettings
        t={t}
        language="pt"
        changeLanguage={vi.fn()}
        layoutStyle="sidebar"
        changeLayoutStyle={vi.fn()}
        globalTheme="light"
        changeGlobalTheme={vi.fn()}
        colorTheme="romance"
        changeColorTheme={vi.fn()}
      />
    );

    // Verify header and description
    expect(screen.getByText(/Cópia de Segurança e Exportação/i)).toBeInTheDocument();
    
    // Verify JSON and PDF export buttons
    expect(screen.getByText(/Exportar os meus dados \(JSON\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Exportar álbum de memórias \(PDF\)/i)).toBeInTheDocument();
    
    // Verify the safety note for PDF limits
    expect(screen.getByText(/O PDF inclui as últimas 150 memórias/i)).toBeInTheDocument();
  });
});
