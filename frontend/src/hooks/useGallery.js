import { useEffect, useState, useRef } from 'react';
import { photoService } from '../services/gallery/photoService';
import { validateImageSize } from '../utils/fileValidator';

export default function useGallery(t, navigate) {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [generalPhotoCount, setGeneralPhotoCount] = useState(0);
  const [activeTab, setActiveTab] = useState('albums'); // 'albums' | 'todas'
  const [currentAlbum, setCurrentAlbum] = useState(null); // null ou objeto Álbum

  // Estados de formulário
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState('sem-album');
  
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');

  // Estados de carregamento/erros
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Lightbox

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    carregarGaleria();
  }, [navigate]);

  // Carregar fotos sempre que muda a aba ativa ou o álbum selecionado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && (activeTab === 'todas' || currentAlbum)) {
      carregarFotos(1, false);
    }
  }, [activeTab, currentAlbum]);

  const carregarGaleria = async () => {
    try {
      setLoading(true);
      const dadosAlbums = await photoService.getAlbums();
      setAlbums(dadosAlbums.albums || []);
      setGeneralPhotoCount(dadosAlbums.generalPhotoCount || 0);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar a galeria.');
    } finally {
      setLoading(false);
    }
  };

  const carregarFotos = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingPhotos(true);
      }
      setErro('');

      const albumParam = currentAlbum ? (currentAlbum === 'sem-album' ? 'sem-album' : currentAlbum._id) : null;
      const dados = await photoService.getPhotos(page, 12, albumParam);
      const novasFotos = dados.photos || [];

      if (append) {
        setPhotos(prev => [...prev, ...novasFotos]);
      } else {
        setPhotos(novasFotos);
      }

      setCurrentPage(dados.currentPage || 1);
      setTotalPages(dados.totalPages || 1);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar fotos.');
    } finally {
      setLoadingPhotos(false);
      setLoadingMore(false);
    }
  };

  const lidarComFicheiro = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateImageSize(file, 5)) {
        alert(t.photos_img_too_large);
        fileInputRef.current.value = null;
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const enviarFoto = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setErro('');

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption);
      
      const albumAlvo = currentAlbum ? currentAlbum._id : selectedAlbumId;
      if (albumAlvo && albumAlvo !== 'sem-album') {
        formData.append('albumId', albumAlvo);
      }

      const novaFoto = await photoService.uploadPhoto(formData);

      // Adicionar à lista atual de fotos exibidas se pertencer ao contexto
      const pertenceAoContexto = !currentAlbum 
        || (currentAlbum === 'sem-album' && !novaFoto.albumId)
        || (currentAlbum && currentAlbum._id === novaFoto.albumId);

      if (pertenceAoContexto) {
        setPhotos([novaFoto, ...photos]);
      }

      // Otimização: Atualizar contadores de fotos reativamente
      if (novaFoto.albumId) {
        setAlbums(albums.map(a => a._id === novaFoto.albumId ? { ...a, photoCount: (a.photoCount || 0) + 1 } : a));
      } else {
        setGeneralPhotoCount(prev => prev + 1);
      }

      setCaption('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      alert(t.photos_upload_success);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar foto.');
    } finally {
      setUploading(false);
    }
  };

  const criarAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    try {
      setCreatingAlbum(true);
      setErro('');
      const novo = await photoService.createAlbum(newAlbumName.trim(), newAlbumDesc.trim());
      // Inicializar com contagem zero de fotos
      const novoComContagem = { ...novo, photoCount: 0 };
      setAlbums([novoComContagem, ...albums]);
      setNewAlbumName('');
      setNewAlbumDesc('');
      alert(t.photos_create_album_success);
    } catch (err) {
      setErro(err.message || 'Erro ao criar álbum.');
    } finally {
      setCreatingAlbum(false);
    }
  };

  const apagarAlbum = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t.photos_delete_album_confirm)) return;

    try {
      setErro('');
      await photoService.deleteAlbum(id);
      
      const albumApagado = albums.find(a => a._id === id);
      const contagemFotos = albumApagado ? (albumApagado.photoCount || 0) : 0;

      setAlbums(albums.filter((a) => a._id !== id));
      // As fotos do álbum apagado voltam para o feed geral, então incrementamos o contador Geral
      setGeneralPhotoCount(prev => prev + contagemFotos);
      
      if (currentAlbum && currentAlbum._id === id) {
        setCurrentAlbum(null);
      }
    } catch (err) {
      setErro(err.message || 'Erro ao apagar álbum.');
    }
  };

  const apagarFoto = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t.photos_delete_photo_confirm)) return;

    try {
      setErro('');
      await photoService.deletePhoto(id);

      const fotoApagada = photos.find(p => p._id === id);
      setPhotos(photos.filter((p) => p._id !== id));

      if (fotoApagada) {
        if (fotoApagada.albumId) {
          setAlbums(albums.map(a => a._id === fotoApagada.albumId ? { ...a, photoCount: Math.max(0, (a.photoCount || 1) - 1) } : a));
        } else {
          setGeneralPhotoCount(prev => Math.max(0, prev - 1));
        }
      }

      if (selectedPhoto && selectedPhoto._id === id) {
        setSelectedPhoto(null);
      }
    } catch (err) {
      setErro(err.message || 'Erro ao apagar foto.');
    }
  };

  return {
    photos,
    albums,
    generalPhotoCount,
    activeTab,
    setActiveTab,
    currentAlbum,
    setCurrentAlbum,
    caption,
    setCaption,
    selectedFile,
    selectedAlbumId,
    setSelectedAlbumId,
    newAlbumName,
    setNewAlbumName,
    newAlbumDesc,
    setNewAlbumDesc,
    erro,
    loading,
    uploading,
    creatingAlbum,
    selectedPhoto,
    setSelectedPhoto,
    currentPage,
    totalPages,
    loadingPhotos,
    loadingMore,
    carregarFotos,
    lidarComFicheiro,
    enviarFoto,
    criarAlbum,
    apagarAlbum,
    apagarFoto,
    fileInputRef
  };
}
