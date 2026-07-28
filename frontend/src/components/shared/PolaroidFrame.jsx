
import './PolaroidFrame.css';
import { optimizeCloudinaryUrl } from '../../utils/media/cloudinaryUrl';

/**
 * Calculates a stable, deterministic rotation angle between -4 and 4 degrees
 * based on the character code sum of the provided ID.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const getDeterministicRotation = (id) => {
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Yields an integer between -4 and 4 inclusive
  return (hash % 9) - 4;
};

export default function PolaroidFrame({ imageUrl, title, date, id, children }) {
  const rotation = getDeterministicRotation(id);
  const hasImage = !!imageUrl;

  return (
    <div 
      className="polaroid-container" 
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="polaroid-inner">
        {hasImage ? (
          <div className="polaroid-image-wrapper">
            <img 
              src={optimizeCloudinaryUrl(imageUrl, { width: 500 })} 
              alt={title || 'Polaroid'} 
              className="polaroid-image" 
              loading="lazy"
            />
          </div>
        ) : (
          <div className="polaroid-placeholder-wrapper">
            <div className="polaroid-placeholder-gradient">
              <span className="polaroid-placeholder-heart">❤️</span>
            </div>
          </div>
        )}
        <div className="polaroid-caption">
          {title && <h4 className="polaroid-title">{title}</h4>}
          {date && <span className="polaroid-date">{date}</span>}
          {children}
        </div>
      </div>
    </div>
  );
}
