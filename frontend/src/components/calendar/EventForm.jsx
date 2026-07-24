

export default function EventForm({
  t,
  enviarEvento,
  title,
  setTitle,
  date,
  setDate,
  category,
  setCategory,
  description,
  setDescription,
  erro
}) {
  return (
    <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
      <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>{t.calendar_add_title}</h2>
      <form onSubmit={enviarEvento} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label className="input-label">{t.calendar_input_title}</label>
            <input
              type="text"
              placeholder={t.calendar_placeholder_title}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-control"
            />
          </div>
          <div className="form-group">
            <label className="input-label">{t.calendar_input_date}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="input-control"
            />
          </div>
          <div className="form-group">
            <label className="input-label">{t.calendar_input_category}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-control"
              style={{ appearance: 'auto' }}
            >
              <option value="aniversario">{t.calendar_category_anniversary}</option>
              <option value="viagem">{t.calendar_category_trip}</option>
              <option value="jantar">{t.calendar_category_dinner}</option>
              <option value="outro">{t.calendar_category_other}</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="input-label">{t.calendar_input_desc}</label>
          <textarea
            placeholder={t.calendar_input_desc_placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            className="input-control"
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
          <button type="submit" className="btn btn-primary">
            {t.calendar_submit}
          </button>
        </div>
      </form>
      {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
    </div>
  );
}
