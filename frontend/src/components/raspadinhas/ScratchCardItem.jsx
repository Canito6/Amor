
import { formatDateShort } from '../../utils/formatting/dateFormatter';

export default function ScratchCardItem({ card, activeTab, t, language, onScratch, onDelete }) {
  if (activeTab === 'pending') {
    return (
      <div className="glass-panel scratch-card-item pending">
        <div className="scratch-card-icon">🎫</div>
        <h3>{card.title}</h3>
        <p className="scratch-card-info">
          {t.scratch_card_from} <strong>{card.createdBy}</strong>
        </p>
        <button className="btn btn-primary btn-scratch-action" onClick={() => onScratch(card)}>
          ✨ Raspar Surpresa!
        </button>
      </div>
    );
  }

  if (activeTab === 'scratched') {
    return (
      <div className="glass-panel scratch-card-item revealed">
        <div className="scratch-card-icon">🔓</div>
        <h3>{card.title}</h3>
        <div className="scratch-reward-box-revealed">
          <p className="scratch-reward-text">"{card.reward}"</p>
        </div>
        <p className="scratch-card-info">
          {t.scratch_card_from} <strong>{card.createdBy}</strong>
          <br />
          <span className="scratch-date">
            {t.scratch_card_scratched_on.replace('{date}', formatDateShort(card.scratchedAt, language === 'pt' ? 'pt' : 'en'))}
          </span>
        </p>
      </div>
    );
  }

  if (activeTab === 'created') {
    return (
      <div className={`glass-panel scratch-card-item ${card.isScratched ? 'revealed' : 'created-pending'}`}>
        <div className="scratch-card-icon">{card.isScratched ? '🔓' : '🔒'}</div>
        <h3>{card.title}</h3>
        <div className="scratch-reward-box-created">
          <span className="reward-label">{language === 'pt' ? 'Segredo guardado:' : 'Secret saved:'}</span>
          <p className="scratch-reward-text">"{card.reward}"</p>
        </div>
        <div className="scratch-created-footer">
          <p className="scratch-card-info">
            Status: <strong>{card.isScratched ? (language === 'pt' ? 'Já Raspada!' : 'Scratched!') : (language === 'pt' ? 'Por Raspar' : 'Unscratched')}</strong>
            <br />
            <span className="scratch-date">
              {t.scratch_card_created_on.replace('{date}', formatDateShort(card.createdAt, language === 'pt' ? 'pt' : 'en'))}
            </span>
          </p>
          <button className="scratch-delete-btn" onClick={() => onDelete(card._id)} title={language === 'pt' ? 'Apagar Raspadinha' : 'Delete Scratch Card'}>
            🗑️
          </button>
        </div>
      </div>
    );
  }

  return null;
}
