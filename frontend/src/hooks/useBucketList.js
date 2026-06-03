import { useEffect, useState } from 'react';
import { bucketListService } from '../services/bucketListService';
import { validateImageSize } from '../utils/fileValidator';
import { formatDateLong } from '../utils/dateFormatter';

export default function useBucketList(t, language, fileInputRef) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states (creating new goal)
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Completion modal states
  const [completingItem, setCompletingItem] = useState(null);
  const [completionFile, setCompletionFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    carregarDesejos();
  }, []);

  const carregarDesejos = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bucketListService.getBucketItems();
      setItems(data);
    } catch (err) {
      setError(t.bucket_error_load || 'Erro ao carregar a lista de desejos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert(t.bucket_input_title || 'O título do desejo é obrigatório!');
      return;
    }

    try {
      setCreating(true);
      setError('');
      const newItem = await bucketListService.createBucketItem({
        title: newTitle.trim(),
        description: newDescription.trim()
      });
      setItems([newItem, ...items]);
      setNewTitle('');
      setNewDescription('');
      setShowCreator(false);
      alert(t.bucket_success_created || 'Desejo adicionado!');
    } catch (err) {
      setError(t.bucket_error_save || 'Erro ao criar desejo.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleComplete = async (item) => {
    if (item.completed) {
      const confirmMsg = t.bucket_uncomplete_confirm || 'Queres marcar este desejo como não cumprido? (A foto associada será apagada)';
      if (!window.confirm(confirmMsg)) return;

      try {
        setError('');
        const updated = await bucketListService.completeBucketItem(item._id, { completed: false });
        setItems(items.map(i => i._id === item._id ? updated : i));
      } catch (err) {
        setError(t.bucket_error_complete || 'Erro ao atualizar desejo.');
      }
    } else {
      setCompletingItem(item);
      setCompletionFile(null);
    }
  };

  const handleConfirmCompletion = async (e) => {
    e.preventDefault();
    if (!completingItem) return;

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('completed', true);
      if (completionFile) {
        formData.append('image', completionFile);
      }

      const updated = await bucketListService.completeBucketItem(completingItem._id, formData);
      setItems(items.map(i => i._id === completingItem._id ? updated : i));
      setCompletingItem(null);
      setCompletionFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      setError(t.bucket_error_complete || 'Erro ao concluir desejo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    const confirmMsg = t.bucket_confirm_delete || 'Tens a certeza que queres eliminar este desejo?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setError('');
      await bucketListService.deleteBucketItem(id);
      setItems(items.filter(i => i._id !== id));
    } catch (err) {
      setError(t.bucket_error_delete || 'Erro ao eliminar desejo.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateImageSize(file, 5)) {
        alert(language === 'pt' ? 'O tamanho máximo da imagem é de 5MB.' : 'Maximum image size is 5MB.');
        fileInputRef.current.value = null;
        setCompletionFile(null);
        return;
      }
      setCompletionFile(file);
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const formatDate = (dateStr) => {
    return formatDateLong(dateStr, language === 'pt' ? 'pt' : 'en');
  };

  return {
    items,
    filter,
    setFilter,
    loading,
    error,
    setError,
    showCreator,
    setShowCreator,
    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    creating,
    completingItem,
    setCompletingItem,
    completionFile,
    setCompletionFile,
    uploading,
    handleCreateItem,
    handleToggleComplete,
    handleConfirmCompletion,
    handleDeleteItem,
    handleFileChange,
    filteredItems,
    formatDate
  };
}
