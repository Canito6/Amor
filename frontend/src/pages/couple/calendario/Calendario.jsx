import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../../services/couple/eventService';
import { usePreferences } from '../../../context/PreferencesContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { translations } from '../../../services/common/translations';
import EventForm from '../../../components/calendar/EventForm';
import EventList from '../../../components/calendar/EventList';
import { formatDateLong } from '../../../utils/formatting/dateFormatter';
import { exportEventsToICal } from '../../../utils/icalExporter';
import useSocketUpdate from '../../../hooks/shared/useSocketUpdate';
import './Calendario.css';

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('outro');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  const { language } = usePreferences();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarEventos();
  }, [navigate]);

  useSocketUpdate(() => {
    carregarEventos();
  }, ['evento-']);

  const carregarEventos = async () => {
    try {
      setLoading(true);
      const dados = await eventService.getEvents();
      setEvents(dados);
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao carregar calendário.' : 'Error loading calendar.'));
    } finally {
      setLoading(false);
    }
  };

  const enviarEvento = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    try {
      setErro('');
      const novoEvt = await eventService.createEvent({ title, description, date, category });

      // Eleva a lista e ordena por data cronologicamente
      const novosEvts = [...events, novoEvt].sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(novosEvts);

      setTitle('');
      setDescription('');
      setDate('');
      setCategory('outro');
      showToast(t.calendar_success_alert, 'success');
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao guardar evento.' : 'Error saving event.'));
    }
  };

  const apagarEvento = async (id) => {
    const _ok = await confirm({ title: t.calendar_delete_confirm, message: t.calendar_delete_confirm, confirmText: t.delete || 'Apagar', cancelText: t.cancel || 'Cancelar' }); if (!_ok) return;

    try {
      setErro('');
      await eventService.deleteEvent(id);
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao apagar evento.' : 'Error deleting event.'));
    }
  };

  // Helper para formatar a data por extenso
  const formatarDataExtenso = (dataStr) => {
    return formatDateLong(dataStr, language === 'pt' ? 'pt' : 'en');
  };

  // Helper para calcular dias restantes até à data
  const obterDiasRestantes = (dataStr) => {
    const dataEvento = new Date(dataStr);
    // Zera horas para a comparação ser exata por dias
    dataEvento.setHours(0,0,0,0);
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    const diferencaMs = dataEvento.getTime() - hoje.getTime();
    const dias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
    return dias;
  };

  // Ícone por categoria
  const obterIconeCategoria = (cat) => {
    switch (cat) {
      case 'aniversario': return '🎂';
      case 'viagem': return '✈️';
      case 'jantar': return '🍽️';
      default: return '🌟';
    }
  };

  // Cor por categoria
  const obterCorCategoria = (cat) => {
    switch (cat) {
      case 'aniversario': return 'var(--primary-color)';
      case 'viagem': return 'var(--secondary-color)';
      case 'jantar': return '#2a9d8f';
      default: return '#f4a261';
    }
  };

  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  const eventosFuturos = events.filter(e => new Date(e.date).setHours(0,0,0,0) >= hoje.getTime());
  const eventosPassados = events.filter(e => new Date(e.date).setHours(0,0,0,0) < hoje.getTime());

  return (
    <div className="app-container fade-in">
      {/* Cabeçalho */}
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.calendar_title}</h1>
        <button 
          className="btn btn-secondary" 
          onClick={() => exportEventsToICal(events)}
          style={{ fontSize: '13px', padding: '6px 14px' }}
        >
          📅 {language === 'pt' ? 'Exportar (.ics)' : 'Export (.ics)'}
        </button>
      </div>

      {/* Formulário para Adicionar Evento */}
      <EventForm
        t={t}
        enviarEvento={enviarEvento}
        title={title}
        setTitle={setTitle}
        date={date}
        setDate={setDate}
        category={category}
        setCategory={setCategory}
        description={description}
        setDescription={setDescription}
        erro={erro}
      />

      <EventList
        t={t}
        loading={loading}
        eventosFuturos={eventosFuturos}
        eventosPassados={eventosPassados}
        obterDiasRestantes={obterDiasRestantes}
        meuNome={meuNome}
        minhaRole={minhaRole}
        obterCorCategoria={obterCorCategoria}
        obterIconeCategoria={obterIconeCategoria}
        formatarDataExtenso={formatarDataExtenso}
        apagarEvento={apagarEvento}
      />
    </div>
  );
}
