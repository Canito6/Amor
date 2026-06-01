const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ coupleId: req.coupleId }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar eventos.' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'O título do evento é obrigatório.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'A data do evento é obrigatória.' });
    }

    const novoEvento = new Event({
      title: title.trim(),
      description: description ? description.trim() : '',
      date: new Date(date),
      category: category || 'outro',
      createdBy: req.user.username,
      coupleId: req.coupleId
    });

    await novoEvento.save();
    res.status(201).json(novoEvento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar evento.' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    if (event.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para apagar este evento.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evento apagado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar evento.' });
  }
};
