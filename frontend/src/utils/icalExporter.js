/**
 * Gerador de ficheiros iCalendar (.ics) para exportação de eventos do casal
 * 
 * @param {Array} events - Lista de eventos do casal [{ title, date, description, ... }]
 * @param {string} coupleName - Nome do casal para o ficheiro
 */
export function exportEventsToICal(events = [], coupleName = 'Nosso_Cantinho') {
  if (!events || events.length === 0) {
    alert('Não existem eventos no calendário para exportar.');
    return;
  }

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const seconds = String(d.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//O Nosso Cantinho//Agenda do Casal//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach((evt) => {
    const dtStart = formatDate(evt.date || evt.startDate || new Date());
    const dtStamp = formatDate(new Date());
    const uid = evt._id || `evt_${Math.random().toString(36).substring(2, 11)}`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}@nossocantinho.app`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `SUMMARY:${evt.title || evt.titulo || 'Encontro do Casal ❤️'}`,
      `DESCRIPTION:${(evt.description || evt.descricao || '').replace(/\n/g, '\\n')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Agenda_${coupleName}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
