
import JarBottle from './JarBottle';

export default function JarWorkspace({
  notes,
  isShaking,
  language,
  handleDrawNote,
  drawingError,
  setShowCreator,
  t
}) {
  return (
    <div className="jar-workspace">
      <div className="jar-bottle-stage">
        {/* O FRASCO VIRTUAL */}
        <JarBottle
          notes={notes}
          isShaking={isShaking}
          language={language}
          onDraw={handleDrawNote}
        />

        <div className="jar-action-buttons">
          <button 
            className="btn btn-primary btn-shake-jar" 
            onClick={handleDrawNote}
            disabled={isShaking || notes.length === 0}
          >
            {isShaking ? '...' : (t.jar_shake_btn || 'Agitar e Tirar!')}
          </button>
          
          <button 
            className="btn btn-dark btn-write-jar" 
            onClick={() => setShowCreator(true)}
            disabled={isShaking}
          >
            ✍️ {language === 'pt' ? 'Colocar Papelinho' : 'Add Note'}
          </button>
        </div>

        {drawingError && (
          <p className="jar-drawing-error">{drawingError}</p>
        )}
      </div>
    </div>
  );
}
