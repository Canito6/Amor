

export default function CheckInForm({
  onSubmit,
  answerInput,
  setAnswerInput,
  submitting,
  error,
  success,
  t,
  isEdit = false,
  originalAnswer = ''
}) {
  return (
    <form onSubmit={onSubmit} className={isEdit ? "checkin-edit-form" : "checkin-form"}>
      {!isEdit && (
        <p className="checkin-instruction">
          {t.daily_check_subtitle || 'Responde para veres o que o teu amor escreveu!'}
        </p>
      )}
      <div className="textarea-wrapper">
        <textarea
          value={answerInput}
          onChange={(e) => setAnswerInput(e.target.value)}
          placeholder={
            isEdit
              ? (t.daily_checkin_placeholder || 'Atualiza a tua resposta...')
              : (t.daily_checkin_placeholder || 'Escreve aqui o teu carinho...')
          }
          maxLength={1000}
          required
          disabled={submitting}
        />
        {!isEdit && <span className="char-count">{answerInput.length}/1000</span>}
      </div>
      {success && <div className="checkin-success">{success}</div>}
      {error && <div className="checkin-error">{error}</div>}
      
      {isEdit ? (
        <button
          type="submit"
          className="btn btn-secondary checkin-update-btn"
          disabled={submitting || !answerInput.trim() || answerInput.trim() === originalAnswer}
        >
          {submitting ? 'A atualizar...' : 'Gravar Alteração 💾'}
        </button>
      ) : (
        <button
          type="submit"
          className="btn btn-primary checkin-submit-btn"
          disabled={submitting || !answerInput.trim()}
        >
          {submitting ? (t.daily_checkin_submitting || 'A enviar...') : (t.daily_checkin_submit || 'Enviar Resposta 💖')}
        </button>
      )}
    </form>
  );
}
