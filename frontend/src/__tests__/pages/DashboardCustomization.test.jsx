import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { DEFAULT_WIDGETS } from '../../hooks/couple/useDashboard';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard Customization & Sidebar Navigation', () => {
  const t = {
    dashboard: 'Painel',
    profile_title: 'Perfil do Casal & Estatísticas 💖',
    messages: 'Mural de Notas',
    photos: 'Galeria de Fotos',
    memories: 'As Nossas Memórias',
    timeline: 'Linha do Tempo',
    games_title: 'Jogos do Amor 🎮',
    calendar: 'Calendário',
    bucket_title: 'Lista de Desejos',
    letter_title: 'Cartas Não Vi Quando ✉️',
    jar_title: 'Frasco dos Mimos 🏺',
    settings: 'Definições',
    logout: 'Sair'
  };

  let localStorageStore = {};

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageStore = {};
    global.localStorage = {
      getItem: vi.fn((key) => localStorageStore[key] || null),
      setItem: vi.fn((key, val) => { localStorageStore[key] = String(val); }),
      clear: vi.fn(() => { localStorageStore = {}; }),
      removeItem: vi.fn((key) => { delete localStorageStore[key]; }),
    };
  });

  // 1. Array Reordering Logic Unit Test
  it('reorders array of widgets correctly using the drag end index logic', () => {
    const widgets = [
      { id: 'welcome', visible: true },
      { id: 'love', visible: true },
      { id: 'countdown', visible: true }
    ];
    
    // Simulate active id 'welcome' dragged over over id 'countdown'
    const activeId = 'welcome';
    const overId = 'countdown';
    
    const oldIndex = widgets.findIndex((w) => w.id === activeId);
    const newIndex = widgets.findIndex((w) => w.id === overId);
    
    expect(oldIndex).toBe(0);
    expect(newIndex).toBe(2);
    
    const newWidgets = [...widgets];
    const [moved] = newWidgets.splice(oldIndex, 1);
    newWidgets.splice(newIndex, 0, moved);
    
    expect(newWidgets[0].id).toBe('love');
    expect(newWidgets[1].id).toBe('countdown');
    expect(newWidgets[2].id).toBe('welcome');
  });

  // 2. Toggle Visibility Logic Unit Test
  it('toggles visibility of a widget state correctly', () => {
    const widgets = [
      { id: 'welcome', visible: true },
      { id: 'love', visible: true }
    ];
    
    const targetId = 'welcome';
    const updatedWidgets = widgets.map(w => w.id === targetId ? { ...w, visible: !w.visible } : w);
    
    expect(updatedWidgets[0].visible).toBe(false);
    expect(updatedWidgets[1].visible).toBe(true);
  });

  // 3. Sidebar Rendering Test (verifies all pages are rendered)
  it('renders all pages in Sidebar', () => {
    render(
      <BrowserRouter>
        <Sidebar
          nome="Miguel & Inês"
          roleGuardado="user"
          customTabs={[]}
          currentPath="/dashboard"
          onOpenSettings={vi.fn()}
          onLogout={vi.fn()}
          t={t}
          isOpen={true}
          onClose={vi.fn()}
        />
      </BrowserRouter>
    );

    // Verify all pages exist in the sidebar
    expect(screen.getByText('Painel')).toBeInTheDocument();
    expect(screen.getByText('Perfil do Casal & Estatísticas')).toBeInTheDocument();
    expect(screen.getByText('Mural de Notas')).toBeInTheDocument();
    expect(screen.getByText('Galeria de Fotos')).toBeInTheDocument();
    expect(screen.getByText('As Nossas Memórias')).toBeInTheDocument();
    expect(screen.getByText('Linha do Tempo')).toBeInTheDocument();
    expect(screen.getByText('Jogos do Amor')).toBeInTheDocument();
    expect(screen.getByText('Calendário')).toBeInTheDocument();
    expect(screen.getByText('Lista de Desejos')).toBeInTheDocument();
    expect(screen.getByText('Cartas Não Vi Quando')).toBeInTheDocument();
    expect(screen.getByText('Frasco dos Mimos')).toBeInTheDocument();
  });

  // 4. Test preference migration from localStorage to backend
  it('migrates widgets preference from localStorage to backend if not present on backend', async () => {
    const mockGetDashboardWidgets = vi.fn().mockResolvedValue({ widgets: null });
    const mockSaveDashboardWidgets = vi.fn().mockResolvedValue({ success: true });
    
    const savedLayout = [
      { id: 'love', visible: true, size: 'normal' },
      { id: 'welcome', visible: false, size: 'stretched' }
    ];
    
    localStorage.setItem('dashboard_widgets', JSON.stringify(savedLayout));
    
    // Simulate Hook loading logic
    const fetchFromBackendAndMigrate = async () => {
      const res = await mockGetDashboardWidgets();
      if (res && res.widgets) {
        return res.widgets;
      } else {
        const saved = localStorage.getItem('dashboard_widgets');
        if (saved) {
          const parsed = JSON.parse(saved);
          await mockSaveDashboardWidgets(parsed);
          return parsed;
        }
      }
      return DEFAULT_WIDGETS;
    };
    
    const result = await fetchFromBackendAndMigrate();
    expect(mockGetDashboardWidgets).toHaveBeenCalled();
    expect(mockSaveDashboardWidgets).toHaveBeenCalledWith(savedLayout);
    expect(result).toEqual(savedLayout);
  });
});
