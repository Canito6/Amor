import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/couple/eventService';
import { authService } from '../../services/auth/authService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

// Default widget configuration
export const DEFAULT_WIDGETS = [
  { id: 'welcome',   visible: true, size: 'stretched' },
  { id: 'love',      visible: true, size: 'wide' },
  { id: 'mood',      visible: true, size: 'normal' },
  { id: 'checkin',   visible: true, size: 'normal' },
  { id: 'countdown', visible: true, size: 'normal' },
  { id: 'spotify',   visible: true, size: 'normal' },
  { id: 'achievements', visible: true, size: 'wide' },
];

export function useDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [nome, setNome] = useState('');
  const [nextEvent, setNextEvent] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [stats, setStats] = useState(null);

  const [widgets, setWidgets] = useState([]);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [selectedSidebarItems, setSelectedSidebarItems] = useState(() => {
    const saved = localStorage.getItem('sidebar_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (err) {}
    }
    return ['/perfil-casal', '/mensagens', '/fotos', '/memorias', '/jogos', '/calendario', '/bucket-list', '/cartas', '/frasco'];
  });

  const [coupleInfo, setCoupleInfo] = useState({
    coupleId: '',
    names: '',
    partnerNames: [],
    relationshipDate: null,
    spotifyPlaylist: ''
  });

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNames, setEditNames] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSpotify, setEditSpotify] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const loadCoupleInfo = async () => {
    try {
      const info = await authService.getCoupleInfo();
      setCoupleInfo(info);
      if (info.names) {
        setNome(info.names);
      } else if (info.partnerNames && info.partnerNames.length > 0) {
        setNome(info.partnerNames.join(' & '));
      } else {
        setNome(localStorage.getItem('nome') || 'Amor');
      }

      if (info.coupleId) {
        const oldCoupleId = localStorage.getItem('coupleId');
        if (oldCoupleId !== info.coupleId) {
          localStorage.setItem('coupleId', info.coupleId);
          window.dispatchEvent(new Event('authChange'));
        }
      }

      setEditNames(info.names || '');
      setEditSpotify(info.spotifyPlaylist || '');
      if (info.relationshipDate) {
        const d = new Date(info.relationshipDate);
        setEditDate(d.toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar informações de casal:', err);
      setNome(localStorage.getItem('nome') || 'Amor');
    }
  };

  const loadStats = async () => {
    try {
      const data = await authService.getCoupleStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const carregarProximoEvento = async () => {
    try {
      const events = await eventService.getEvents();
      if (events.length > 0) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const futuros = events.filter(e => new Date(e.date).setHours(0, 0, 0, 0) >= hoje.getTime());
        if (futuros.length > 0) {
          const proximo = futuros.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
          setNextEvent(proximo);
          const dataEvt = new Date(proximo.date);
          dataEvt.setHours(0, 0, 0, 0);
          const dias = Math.ceil((dataEvt.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          setDaysRemaining(dias);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar próximo evento:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      loadCoupleInfo();
      loadStats();
      carregarProximoEvento();

      const saved = localStorage.getItem('dashboard_widgets');
      if (saved) {
        try {
          const parsed = JSON.parse(saved).filter(w => w.id !== 'navigation');
          setWidgets(parsed.length > 0 ? parsed : DEFAULT_WIDGETS);
        } catch (err) {
          setWidgets(DEFAULT_WIDGETS);
        }
      } else {
        setWidgets(DEFAULT_WIDGETS);
      }
    }

    const handleRefresh = () => loadCoupleInfo();
    window.addEventListener('refreshCoupleInfo', handleRefresh);
    return () => window.removeEventListener('refreshCoupleInfo', handleRefresh);
  }, [navigate]);

  const terminarSessao = () => {
    authService.logout().catch(err => console.error('Erro ao terminar sessão no backend:', err));
    localStorage.clear();
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const handleUpdateCoupleInfo = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    try {
      const data = {
        names: editNames.trim(),
        relationshipDate: editDate ? new Date(editDate) : null,
        spotifyPlaylist: editSpotify.trim()
      };
      const updated = await authService.updateCoupleInfo(data);
      setCoupleInfo(updated);
      if (updated.names) {
        setNome(updated.names);
      } else if (updated.partnerNames && updated.partnerNames.length > 0) {
        setNome(updated.partnerNames.join(' & '));
      }
      window.dispatchEvent(new Event('refreshCoupleInfo'));
      setEditSuccess('Informações atualizadas com sucesso! ❤️');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccess('');
      }, 1500);
    } catch (err) {
      setEditError(err.message || 'Erro ao guardar definições.');
    }
  };

  const moveWidget = (index, direction) => {
    const newWidgets = [...widgets];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newWidgets.length) return;
    const temp = newWidgets[index];
    newWidgets[index] = newWidgets[targetIndex];
    newWidgets[targetIndex] = temp;
    setWidgets(newWidgets);
  };

  const changeWidgetSize = (id, newSize) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, size: newSize } : w));
  };

  const handleToggleVisibility = (id) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const handleToggleSidebarItem = (path) => {
    setSelectedSidebarItems(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const handleAutoRemoveDuplicates = () => {
    const activeWidgetIds = widgets.filter(w => w.visible).map(w => w.id);
    const toRemove = [];
    if (activeWidgetIds.includes('love')) toRemove.push('/perfil-casal');
    if (activeWidgetIds.includes('countdown')) toRemove.push('/calendario');
    setSelectedSidebarItems(prev => prev.filter(p => !toRemove.includes(p)));
  };

  const handleSaveLayout = (language) => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(widgets));
    localStorage.setItem('sidebar_items', JSON.stringify(selectedSidebarItems));
    window.dispatchEvent(new Event('refreshSidebar'));
    setIsEditingLayout(false);
    showToast(language === 'pt' ? 'Layout do painel e atalhos guardados! 🎉' : 'Dashboard layout and shortcuts saved! 🎉', 'success');
  };

  const handleResetLayout = async (language) => {
    const ok = await confirm({
      title: language === 'pt' ? 'Repor Layout' : 'Reset Layout',
      message: language === 'pt' ? 'Tens a certeza que queres repor o layout original?' : 'Are you sure you want to reset to the original layout?',
      confirmText: language === 'pt' ? 'Repor' : 'Reset',
      cancelText: language === 'pt' ? 'Cancelar' : 'Cancel',
    });
    if (!ok) return;
    setWidgets(DEFAULT_WIDGETS);
    const defaultPaths = ['/perfil-casal', '/mensagens', '/fotos', '/memorias', '/jogos', '/calendario', '/bucket-list', '/cartas', '/frasco'];
    setSelectedSidebarItems(defaultPaths);
    localStorage.removeItem('dashboard_widgets');
    localStorage.removeItem('sidebar_items');
    window.dispatchEvent(new Event('refreshSidebar'));
    setIsEditingLayout(false);
  };

  return {
    // Data
    nome, nextEvent, daysRemaining, coupleInfo, widgets, stats,
    // Layout editing
    isEditingLayout, setIsEditingLayout,
    selectedSidebarItems,
    // Edit modal
    isEditModalOpen, setIsEditModalOpen,
    editNames, setEditNames,
    editDate, setEditDate,
    editSpotify, setEditSpotify,
    editError, editSuccess,
    // Handlers
    terminarSessao,
    handleUpdateCoupleInfo,
    moveWidget,
    changeWidgetSize,
    handleToggleVisibility,
    handleToggleSidebarItem,
    handleAutoRemoveDuplicates,
    handleSaveLayout,
    handleResetLayout,
    loadCoupleInfo,
  };
}
