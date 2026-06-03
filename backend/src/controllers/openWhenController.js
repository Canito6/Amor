const OpenWhenLetter = require('../models/OpenWhenLetter');
const User = require('../models/User');

exports.getLetters = async (req, res) => {
  try {
    const letters = await OpenWhenLetter.find({ coupleId: req.coupleId })
      .sort({ createdAt: -1 });

    // Ofuscar o conteúdo das cartas não abertas criadas pelo parceiro
    const parsedLetters = letters.map(letter => {
      const isCreator = letter.createdBy === req.user.username;
      
      if (!isCreator && !letter.isOpened) {
        // Clonamos o objeto e ocultamos o conteúdo
        const letterObj = letter.toObject();
        letterObj.content = ''; // Ocultar o texto para evitar trapaças no inspecionar elemento
        return letterObj;
      }
      return letter;
    });

    res.json(parsedLetters);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter as cartas.' });
  }
};

exports.createLetter = async (req, res) => {
  try {
    const { title, content, conditionType, conditionValue } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
    }

    const newLetter = new OpenWhenLetter({
      title: title.trim(),
      content: content.trim(),
      conditionType: conditionType || 'instant',
      conditionValue: conditionValue || '',
      coupleId: req.coupleId,
      createdBy: req.user.username
    });

    await newLetter.save();
    res.status(201).json(newLetter);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar a carta.' });
  }
};

exports.openLetter = async (req, res) => {
  try {
    const letter = await OpenWhenLetter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ error: 'Carta não encontrada.' });
    }

    if (letter.coupleId !== req.coupleId) {
      return res.status(403).json({ error: 'Não tens permissão para aceder a esta carta.' });
    }

    // Se já estiver aberta, apenas retorna
    if (letter.isOpened) {
      return res.json(letter);
    }

    // Verificar se quem está a abrir é o destinatário (o parceiro que não a criou)
    const isCreator = letter.createdBy === req.user.username;
    if (isCreator) {
      return res.status(400).json({ error: 'Não podes abrir a tua própria carta surpresa. Deixa o teu parceiro abri-la!' });
    }

    // Validar condições
    if (letter.conditionType === 'date') {
      const now = new Date();
      const targetDate = new Date(letter.conditionValue);
      if (now < targetDate) {
        return res.status(400).json({ error: 'Ainda não chegou o dia correto para abrir esta carta!' });
      }
    } else if (letter.conditionType === 'mood') {
      // Obter humor atual do utilizador que tenta abrir
      const user = await User.findById(req.user.id);
      if (!user || user.moodEmoji !== letter.conditionValue) {
        return res.status(400).json({ error: 'O teu humor atual não coincide com o humor exigido por esta carta!' });
      }
    }

    // Passou todas as validações, vamos abrir!
    letter.isOpened = true;
    letter.openedAt = new Date();
    await letter.save();

    res.json(letter);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao abrir a carta.' });
  }
};

exports.deleteLetter = async (req, res) => {
  try {
    const letter = await OpenWhenLetter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ error: 'Carta não encontrada.' });
    }

    if (letter.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para eliminar esta carta.' });
    }

    await OpenWhenLetter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Carta eliminada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar a carta.' });
  }
};
