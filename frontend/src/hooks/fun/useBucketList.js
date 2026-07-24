import { useEffect, useState } from 'react';
import { bucketListService } from '../../services/fun/bucketListService';
import { validateImageSize } from '../../utils/media/fileValidator';
import { formatDateLong } from '../../utils/formatting/dateFormatter';
import useSocketUpdate from '../shared/useSocketUpdate';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { triggerHeartConfetti } from '../../utils/confettiUtils';

export default function useBucketList(t, language, fileInputRef) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form states (creating new goal)
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Completion modal states
  const [completingItem, setCompletingItem] = useState(null);
  const [completionFile, setCompletionFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const carregarDesejos = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');
      const data = await bucketListService.getBucketItems(page, 10);
      
      // Tratar resposta paginada ou array legado
      if (data && data.data) {
        const novosItens = data.data || [];
        if (append) {
          setItems(prev => [...prev, ...novosItens]);
        } else {
          setItems(novosItens);
        }
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.pages || 1);
      } else {
        setItems(data || []);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch {
      setError(t.bucket_error_load || 'Erro ao carregar a lista de desejos.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    carregarDesejos();
  }, []);

  useSocketUpdate(() => {
    carregarDesejos();
  }, ['bucket-', 'desejo-']);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast(t.bucket_input_title || 'O título do desejo é obrigatório!', 'warning');
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
      showToast(t.bucket_success_created || 'Desejo adicionado! 🎉', 'success');
    } catch {
      setError(t.bucket_error_save || 'Erro ao criar desejo.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleComplete = async (item) => {
    if (item.completed) {
      const confirmMsg = t.bucket_uncomplete_confirm || 'Queres marcar este desejo como não cumprido? (A foto associada será apagada)';
      const accepted = await confirm({
        title: language === 'pt' ? 'Desmarcar Desejo' : 'Uncomplete Goal',
        message: confirmMsg,
        confirmText: language === 'pt' ? 'Desmarcar' : 'Uncomplete',
        cancelText: language === 'pt' ? 'Cancelar' : 'Cancel'
      });
      if (!accepted) return;

      try {
        setError('');
        const updated = await bucketListService.completeBucketItem(item._id, { completed: false });
        setItems(items.map(i => i._id === item._id ? updated : i));
      } catch {
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
      triggerHeartConfetti();
      showToast(language === 'pt' ? 'Conquista alcançada com sucesso! 🎉' : 'Achievement completed! 🎉', 'success');
    } catch {
      setError(t.bucket_error_complete || 'Erro ao concluir desejo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    const confirmMsg = t.bucket_confirm_delete || 'Tens a certeza que queres eliminar este desejo?';
    
    const accepted = await confirm({
      title: language === 'pt' ? 'Eliminar Desejo 🗑' : 'Delete Goal 🗑',
      message: confirmMsg,
      confirmText: language === 'pt' ? 'Eliminar' : 'Delete',
      cancelText: language === 'pt' ? 'Cancelar' : 'Cancel'
    });
    if (!accepted) return;

    try {
      setError('');
      await bucketListService.deleteBucketItem(id);
      setItems(items.filter(i => i._id !== id));
      showToast(language === 'pt' ? 'Desejo eliminado com sucesso!' : 'Goal deleted successfully!', 'success');
    } catch {
      setError(t.bucket_error_delete || 'Erro ao eliminar desejo.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateImageSize(file, 5)) {
        showToast(language === 'pt' ? 'O tamanho máximo da imagem é de 5MB.' : 'Maximum image size is 5MB.', 'warning');
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
    formatDate,
    currentPage,
    totalPages,
    loadingMore,
    carregarDesejos
  };
}
