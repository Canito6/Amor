import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { useTabs } from '../../../context/TabContext';
import { translations } from '../../../services/common/translations';
import { useDashboard } from '../../../hooks/couple/useDashboard';
import WelcomeBanner from '../../../components/dashboard/widgets/WelcomeBanner';
import EventCountdown from '../../../components/dashboard/widgets/EventCountdown';
import MoodTracker from '../../../components/dashboard/widgets/MoodTracker';
import DailyCheckIn from '../../../components/dashboard/widgets/daily-check-in/DailyCheckIn';
import LoveCounter from '../../../components/dashboard/widgets/LoveCounter';
import AchievementsWidget from '../../../components/dashboard/widgets/AchievementsWidget';
import CoupleEditModal from '../../../components/dashboard/modals/CoupleEditModal';
import LayoutEditorBar from '../../../components/dashboard/layout/LayoutEditorBar';
import WidgetSlot from '../../../components/dashboard/layout/WidgetSlot';
import OnThisDay from '../../../components/dashboard/widgets/OnThisDay';
import PartnerCycleWidget from '../../../components/dashboard/widgets/PartnerCycleWidget';
import NavigationCards from '../../../components/dashboard/layout/NavigationCards';
import KissButtonWidget from '../../../components/dashboard/widgets/KissButtonWidget';
import { memoryService } from '../../../services/fun/memoryService';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import './Dashboard.css';

// Helper: friendly name for widget ids
function getWidgetFriendlyName(id, language) {
  const names = {
    welcome:    language === 'pt' ? 'Banner de Boas-vindas' : 'Welcome Banner',
    mood:       language === 'pt' ? 'Estado de Humor' : 'Mood Tracker',
    checkin:    language === 'pt' ? 'Check-in Diário' : 'Daily Check-in',
    love:       language === 'pt' ? 'Contador de Amor' : 'Love Counter',
    countdown:  language === 'pt' ? 'Contagem Decrescente' : 'Event Countdown',
    navigation: language === 'pt' ? 'Atalhos de Navegação' : 'Navigation Cards',
    achievements: language === 'pt' ? 'Nível & Conquistas' : 'Level & Achievements',
    kiss:         language === 'pt' ? 'Mandar Beijinho 💋' : 'Send a Kiss 💋',
  };
  return names[id] ?? id;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const { customTabs } = useTabs();
  const t = translations[language];
  // Nota: funcionalidade de "layoutStyle" configurável ainda não está exposta
  // nas preferências do utilizador; mantém-se o valor por omissão por agora.
  const layoutStyle = 'default';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const {
    nome, nextEvent, daysRemaining, coupleInfo, widgets, stats,
    isEditingLayout, setIsEditingLayout,
    selectedSidebarItems,
    isEditModalOpen, setIsEditModalOpen,
    editNames, setEditNames,
    editDate, setEditDate,
    editError, editSuccess,
    handleUpdateCoupleInfo,
    handleDragEnd,
    changeWidgetSize,
    handleToggleVisibility,
    handleToggleSidebarItem,
    handleAutoRemoveDuplicates,
    handleSaveLayout,
    handleResetLayout,
    loadCoupleInfo,
  } = useDashboard();

  const [memories, setMemories] = useState([]);

  useEffect(() => {
    memoryService.getMemories()
      .then(data => setMemories(data))
      .catch(err => console.error('Erro ao carregar memórias para OnThisDay:', err));
  }, []);

  // Render a widget by its id
  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'welcome':
        return (
          <WelcomeBanner 
            nome={nome} 
            relationshipDate={coupleInfo.relationshipDate} 
            language={language} 
            t={t}
            onCustomiseLayout={() => setIsEditingLayout(true)}
            onEditCouple={() => setIsEditModalOpen(true)}
            isEditingLayout={isEditingLayout}
          />
        );
      case 'mood':
        return <MoodTracker coupleInfo={coupleInfo} loadCoupleInfo={loadCoupleInfo} t={t} language={language} />;
      case 'checkin':
        return <DailyCheckIn t={t} language={language} />;
      case 'love':
        return <LoveCounter relationshipDate={coupleInfo.relationshipDate} language={language} t={t} streak={stats?.currentStreak || 0} />;
      case 'countdown':
        return <EventCountdown nextEvent={nextEvent} daysRemaining={daysRemaining} language={language} t={t} />;
      case 'navigation':
        return <NavigationCards layoutStyle={layoutStyle} customTabs={customTabs} t={t} language={language} />;
      case 'achievements':
        return <AchievementsWidget stats={stats} t={t} language={language} />;
      case 'kiss':
        return <KissButtonWidget language={language} partnerName={coupleInfo.partnerNames?.[0]} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container fade-in" style={{ textAlign: 'center', maxWidth: '1100px', paddingTop: '20px' }}>

      {/* Layout Customization Top Bar */}
      {isEditingLayout && (
        <LayoutEditorBar
          language={language}
          widgets={widgets}
          selectedSidebarItems={selectedSidebarItems}
          onSave={() => handleSaveLayout(language)}
          onReset={() => handleResetLayout(language)}
          onCancel={() => setIsEditingLayout(false)}
          onToggleVisibility={handleToggleVisibility}
          onToggleSidebarItem={handleToggleSidebarItem}
          onAutoRemoveDuplicates={handleAutoRemoveDuplicates}
          getWidgetFriendlyName={(id) => getWidgetFriendlyName(id, language)}
        />
      )}

      {/* Barra de Ações Rápidas do Cantinho */}
      <div className="quick-actions-bar">
        <button className="quick-action-btn" onClick={() => navigate('/mensagens')}>
          💌 <span>{language === 'pt' ? 'Mandar Mensagem' : 'Send Message'}</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/fotos')}>
          📸 <span>{language === 'pt' ? 'Adicionar Foto' : 'Add Photo'}</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/frasco')}>
          🏺 <span>{language === 'pt' ? 'Tirar Papelinho' : 'Draw Note'}</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/jogos')}>
          🎮 <span>{language === 'pt' ? 'Jogos & Diversão' : 'Games & Fun'}</span>
        </button>
      </div>

      {/* Partner Cycle Widget (discreet support card if enabled) */}
      <PartnerCycleWidget />

      {/* On This Day Widget */}
      <OnThisDay memories={memories} language={language} t={t} />

      {/* Widget Bento Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className={`widget-grid ${isEditingLayout ? 'editing-layout-active' : ''}`}>
            {widgets.map((widget, index) => {
              if (!widget.visible && !isEditingLayout) return null;
              return (
                <WidgetSlot
                  key={widget.id}
                  widget={widget}
                  index={index}
                  totalWidgets={widgets.length}
                  isEditingLayout={isEditingLayout}
                  language={language}
                  getWidgetFriendlyName={(id) => getWidgetFriendlyName(id, language)}
                  onChangeWidgetSize={changeWidgetSize}
                  onToggleVisibility={handleToggleVisibility}
                >
                  {renderWidget(widget.id)}
                </WidgetSlot>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit Couple Info Modal */}
      <CoupleEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateCoupleInfo}
        editNames={editNames}
        setEditNames={setEditNames}
        editDate={editDate}
        setEditDate={setEditDate}
        editError={editError}
        editSuccess={editSuccess}
        t={t}
      />
    </div>
  );
}