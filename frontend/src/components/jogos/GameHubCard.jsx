
import styles from './GameHubCard.module.css';

export default function GameHubCard({
  game,
  loading,
  language,
  onClick
}) {
  return (
    <div
      className={`glass-panel ${styles.gameHubCard}`}
      onClick={onClick}
      style={{ '--game-accent': game.accentColor }}
    >
      {!loading && game.count > 0 && (
        <span className={styles.gameCardCounterBadge}>
          {game.countLabel}
        </span>
      )}
      <div className={styles.gameCardBadge} style={{ backgroundColor: game.accentColor }}>
        {game.icon}
      </div>
      <div className={styles.gameCardContent}>
        <h3>{game.title}</h3>
        <p>{game.desc}</p>
      </div>
      <div className={styles.gameCardFooter}>
        <span className={styles.gamePlayBtn} style={{ color: game.accentColor }}>
          {language === 'pt' ? 'Jogar' : 'Play'} ➔
        </span>
      </div>
    </div>
  );
}
