const BucketItem = require('../../models/fun/bucketItemModel');
const storageService = require('../../services/common/storageService');
const eventBus = require('../../utils/eventBus');

// Obter todos os itens da bucket list do casal
exports.getBucketItems = async (req, res) => {
  try {
    const items = await BucketItem.find({ coupleId: req.coupleId })
      .sort({ completed: 1, createdAt: -1 }); // Pendentes primeiro, depois mais recentes
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter a lista de desejos.' });
  }
};

// Criar um novo item na bucket list
exports.createBucketItem = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título do desejo é obrigatório.' });
    }

    const newItem = new BucketItem({
      title: title.trim(),
      description: description ? description.trim() : '',
      coupleId: req.coupleId,
      createdBy: req.user.username
    });

    await newItem.save();

    eventBus.emit('socket:emit-update', {
      room: req.coupleId,
      type: 'bucket-created',
      user: req.user.username,
      value: newItem.title
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o desejo.' });
  }
};

// Concluir/Desmarcar item da bucket list
exports.completeBucketItem = async (req, res) => {
  try {
    const item = await BucketItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Desejo não encontrado.' });
    }

    if (item.coupleId !== req.coupleId) {
      return res.status(403).json({ error: 'Não tens permissão para alterar este item.' });
    }

    const { completed } = req.body;

    // Se completed for falso (desmarcar o item)
    if (completed === 'false' || completed === false) {
      // Se tinha imagem no Cloudinary, vamos tentar apagá-la
      if (item.imageUrl) {
        await storageService.deleteFile(item.imageUrl);
      }

      item.completed = false;
      item.completedBy = '';
      item.completedAt = null;
      item.imageUrl = '';
    } else {
      // Marcar como concluído
      item.completed = true;
      item.completedBy = req.user.username;
      item.completedAt = new Date();

      // Se houver upload de imagem
      if (req.file) {
        const resultado = await storageService.uploadFile(req.file.buffer);
        item.imageUrl = resultado.secure_url;
      }
    }

    await item.save();

    eventBus.emit('socket:emit-update', {
      room: req.coupleId,
      type: item.completed ? 'bucket-completed' : 'bucket-uncompleted',
      user: req.user.username,
      value: item.title
    });

    res.json(item);
  } catch (error) {
    console.error('Erro ao concluir item da bucket list:', error);
    res.status(500).json({ error: 'Erro ao atualizar o desejo.' });
  }
};

// Eliminar um item da bucket list
exports.deleteBucketItem = async (req, res) => {
  try {
    const item = await BucketItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Desejo não encontrado.' });
    }

    if (item.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para eliminar este item.' });
    }

    // Se tinha imagem no Cloudinary, vamos apagar
    if (item.imageUrl) {
      await storageService.deleteFile(item.imageUrl);
    }

    await BucketItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Desejo eliminado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar o desejo.' });
  }
};
