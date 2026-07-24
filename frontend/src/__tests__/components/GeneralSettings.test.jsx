
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeneralSettings from '../../components/settings/GeneralSettings';

// Mock contexts
vi.mock('../../context/PreferencesContext', () => ({
  usePreferences: () => ({
    soundEnabled: true,
    toggleSound: vi.fn(),
  }),
}));

const mockShowToast = vi.fn();
vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock('../../context/PWAContext', () => ({
  usePWA: () => ({
    isInstallable: false,
    updateAvailable: false,
    showIOSPrompt: false,
    setShowIOSPrompt: vi.fn(),
    installApp: vi.fn(),
    updateApp: vi.fn(),
    dismissIOSPrompt: vi.fn(),
    showIOSHelp: vi.fn(),
  }),
}));

const originalCreateElement = document.createElement.bind(document);

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

  let dummyAnchor;
  let clickSpy;

  let localStorageStore = {};

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock manual do LocalStorage
    localStorageStore = {};
    global.localStorage = {
      getItem: vi.fn((key) => localStorageStore[key] || null),
      setItem: vi.fn((key, val) => { localStorageStore[key] = String(val); }),
      clear: vi.fn(() => { localStorageStore = {}; }),
      removeItem: vi.fn((key) => { delete localStorageStore[key]; }),
    };
    
    // Mock das funções do URL
    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost:5173/mock-uuid');
    global.URL.revokeObjectURL = vi.fn();

    // Mock do document.createElement para intercetar o clique no link <a> dinâmico
    dummyAnchor = originalCreateElement('a');
    clickSpy = vi.spyOn(dummyAnchor, 'click').mockImplementation(() => {});
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return dummyAnchor;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders JSON and PDF export buttons along with descriptive text', () => {
    render(
      <GeneralSettings
        t={t}
        language="pt"
        changeLanguage={vi.fn()}
        globalTheme="light"
        changeGlobalTheme={vi.fn()}
        colorTheme="romance"
        changeColorTheme={vi.fn()}
      />
    );

    // Verificar cabeçalho e descrição
    expect(screen.getByText(/Cópia de Segurança e Exportação/i)).toBeInTheDocument();
    
    // Verificar botões de exportação
    const jsonBtn = screen.getByRole('button', { name: /Exportar os meus dados \(JSON\)/i });
    const pdfBtn = screen.getByRole('button', { name: /Exportar álbum de memórias \(PDF\)/i });
    expect(jsonBtn).toBeInTheDocument();
    expect(pdfBtn).toBeInTheDocument();
    expect(jsonBtn).not.toBeDisabled();
    expect(pdfBtn).not.toBeDisabled();
    
    // Verificar nota explicativa do limite
    expect(screen.getByText(/O PDF inclui as últimas 150 memórias/i)).toBeInTheDocument();
  });

  it('handles JSON export successfully', async () => {
    localStorage.setItem('token', 'token_123');
    
    const mockBlob = new Blob(['{}'], { type: 'application/json' });
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    render(
      <GeneralSettings
        t={t}
        language="pt"
        changeLanguage={vi.fn()}
        globalTheme="light"
        changeGlobalTheme={vi.fn()}
        colorTheme="romance"
        changeColorTheme={vi.fn()}
      />
    );

    const jsonBtn = screen.getByRole('button', { name: /Exportar os meus dados \(JSON\)/i });
    fireEvent.click(jsonBtn);

    // Verificar se entra no estado de loading/desabilitado
    expect(jsonBtn).toBeDisabled();
    expect(screen.getByText(/A exportar\.\.\./i)).toBeInTheDocument();

    // Aguardar conclusão com sucesso
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Dados exportados com sucesso!', 'success');
    });

    // Validar token no header e endpoint correto
    const fetchCallArgs = fetchMock.mock.calls[0];
    expect(fetchCallArgs[0]).toContain('/api/couple/export');
    expect(fetchCallArgs[1].headers['Authorization']).toEqual('Bearer token_123');

    // Verificar restauro de estado
    expect(jsonBtn).not.toBeDisabled();
    expect(jsonBtn).toHaveTextContent(/Exportar os meus dados \(JSON\)/i);
  });

  it('handles JSON export failure without getting stuck in loading', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Erro interno no servidor' }),
    });

    render(
      <GeneralSettings
        t={t}
        language="pt"
        changeLanguage={vi.fn()}
        globalTheme="light"
        changeGlobalTheme={vi.fn()}
        colorTheme="romance"
        changeColorTheme={vi.fn()}
      />
    );

    const jsonBtn = screen.getByRole('button', { name: /Exportar os meus dados \(JSON\)/i });
    fireEvent.click(jsonBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Erro interno no servidor', 'error');
    });

    // Verificar restauro de estado
    expect(jsonBtn).not.toBeDisabled();
    expect(jsonBtn).toHaveTextContent(/Exportar os meus dados \(JSON\)/i);
  });

  it('handles PDF export successfully', async () => {
    localStorage.setItem('token', 'token_456');
    
    const mockBlob = new Blob(['pdf-binary-data'], { type: 'application/pdf' });
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    render(
      <GeneralSettings
        t={t}
        language="pt"
        changeLanguage={vi.fn()}
        globalTheme="light"
        changeGlobalTheme={vi.fn()}
        colorTheme="romance"
        changeColorTheme={vi.fn()}
      />
    );

    const pdfBtn = screen.getByRole('button', { name: /Exportar álbum de memórias \(PDF\)/i });
    fireEvent.click(pdfBtn);

    // Verificar estado temporário de loading
    expect(pdfBtn).toBeDisabled();
    expect(screen.getByText(/A gerar álbum PDF\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Álbum de memórias exportado com sucesso!', 'success');
    });

    const fetchCallArgs = fetchMock.mock.calls[0];
    expect(fetchCallArgs[0]).toContain('/api/couple/export/pdf');
    expect(fetchCallArgs[1].headers['Authorization']).toEqual('Bearer token_456');

    // Verificar restauro
    expect(pdfBtn).not.toBeDisabled();
    expect(pdfBtn).toHaveTextContent(/Exportar álbum de memórias \(PDF\)/i);
  });

  it('handles PDF export delay and keeps loading state active until resolved', async () => {
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    
    const fetchMock = vi.spyOn(global, 'fetch').mockReturnValue(fetchPromise);

    render(
      <GeneralSettings
        t={t}
        language="pt"
        changeLanguage={vi.fn()}
        globalTheme="light"
        changeGlobalTheme={vi.fn()}
        colorTheme="romance"
        changeColorTheme={vi.fn()}
      />
    );

    const pdfBtn = screen.getByRole('button', { name: /Exportar álbum de memórias \(PDF\)/i });
    fireEvent.click(pdfBtn);

    // Botão deve ficar preso em loading e desabilitado imediatamente
    expect(pdfBtn).toBeDisabled();
    expect(pdfBtn).toHaveTextContent(/A gerar álbum PDF\.\.\./i);

    // Resolver a promessa de fetch posteriormente
    resolveFetch({
      ok: true,
      blob: () => Promise.resolve(new Blob(['pdf'], { type: 'application/pdf' })),
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(pdfBtn).not.toBeDisabled();
      expect(pdfBtn).toHaveTextContent(/Exportar álbum de memórias \(PDF\)/i);
    });
  });

  it('prevents multiple simultaneous clicks on export buttons', async () => {
    let resolveFetch;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    
    const fetchMock = vi.spyOn(global, 'fetch').mockReturnValue(fetchPromise);

    render(
      <GeneralSettings
        t={t}
        language="pt"
        changeLanguage={vi.fn()}
        globalTheme="light"
        changeGlobalTheme={vi.fn()}
        colorTheme="romance"
        changeColorTheme={vi.fn()}
      />
    );

    const jsonBtn = screen.getByRole('button', { name: /Exportar os meus dados \(JSON\)/i });
    
    // Disparar duplo clique
    fireEvent.click(jsonBtn);
    fireEvent.click(jsonBtn);

    // Validar que o fetch foi apenas evocado UMA vez (bloqueando cliques paralelos)
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Resolver para limpar estado
    resolveFetch({
      ok: true,
      blob: () => Promise.resolve(new Blob(['{}'], { type: 'application/json' })),
    });
    
    await waitFor(() => {
      expect(jsonBtn).not.toBeDisabled();
    });
  });

  it('handles generic network exception errors smoothly without hanging the button', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network connection lost'));

    render(
      <GeneralSettings
        t={t}
        language="pt"
        changeLanguage={vi.fn()}
        globalTheme="light"
        changeGlobalTheme={vi.fn()}
        colorTheme="romance"
        changeColorTheme={vi.fn()}
      />
    );

    const jsonBtn = screen.getByRole('button', { name: /Exportar os meus dados \(JSON\)/i });
    fireEvent.click(jsonBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Network connection lost', 'error');
    });

    // Validar que o botão foi devidamente reativado após a falha
    expect(jsonBtn).not.toBeDisabled();
  });
});
