const JarNote = require('../models/JarNote');

exports.getJarNotes = async (req, res) => {
  try {
    const notes = await JarNote.find({ coupleId: req.coupleId })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter os papelinhos.' });
  }
};

exports.getRandomJarNote = async (req, res) => {
  try {
    // Tenta obter um papelinho escrito pelo PARCEIRO (createdBy !== req.user.username)
    let count = await JarNote.countDocuments({
      coupleId: req.coupleId,
      createdBy: { $ne: req.user.username }
    });

    let notes;
    if (count > 0) {
      const randomOffset = Math.floor(Math.random() * count);
      notes = await JarNote.find({
        coupleId: req.coupleId,
        createdBy: { $ne: req.user.username }
      }).skip(randomOffset).limit(1);
    } else {
      // Se o parceiro ainda não escreveu nada, tenta obter qualquer papelinho do casal
      count = await JarNote.countDocuments({ coupleId: req.coupleId });
      if (count === 0) {
        return res.status(404).json({ error: 'O frasco está vazio! Escrevam algumas mensagens primeiro.' });
      }
      const randomOffset = Math.floor(Math.random() * count);
      notes = await JarNote.find({ coupleId: req.coupleId })
        .skip(randomOffset).limit(1);
    }

    res.json(notes[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao tirar papelinho do frasco.' });
  }
};

exports.createJarNote = async (req, res) => {
  try {
    const { content, category } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'O conteúdo da mensagem é obrigatório.' });
    }

    const newNote = new JarNote({
      content: content.trim(),
      category: category || 'miminho',
      coupleId: req.coupleId,
      createdBy: req.user.username
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao colocar papelinho no frasco.' });
  }
};

exports.deleteJarNote = async (req, res) => {
  try {
    const note = await JarNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Papelinho não encontrado.' });
    }

    if (note.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para eliminar este papelinho.' });
    }

    await JarNote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Papelinho eliminado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar papelinho.' });
  }
};
