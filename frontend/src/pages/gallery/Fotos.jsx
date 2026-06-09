import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../services/common/translations';
import PhotoUploader from '../../components/photos/PhotoUploader';
import AlbumCreator from '../../components/photos/AlbumCreator';
import AlbumGrid from '../../components/photos/AlbumGrid';
import PhotoGrid from '../../components/photos/PhotoGrid';
import PhotoLightbox from '../../components/photos/PhotoLightbox';
import useGallery from '../../hooks/useGallery';
import './Fotos.css';

export default function Fotos() {
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  const { language } = usePreferences();
  const t = translations[language];

  const {
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
  } = useGallery(t, navigate);

  return (
    <div className="app-container fade-in">
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>{t.photos_title}</h1>
        <div style={{ width: '150px' }}></div>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '35px' }}>
        <button 
          className={`btn ${activeTab === 'albums' && !currentAlbum ? 'btn-primary' : 'btn-dark'}`}
          onClick={() => { setActiveTab('albums'); setCurrentAlbum(null); }}
        >
          {t.photos_tab_folders}
        </button>
        <button 
          className={`btn ${activeTab === 'todas' ? 'btn-primary' : 'btn-dark'}`}
          onClick={() => { setActiveTab('todas'); setCurrentAlbum(null); }}
        >
          {t.photos_tab_all}
        </button>
      </div>

      {/* Formulário de upload de fotos */}
      <PhotoUploader
        t={t}
        activeTab={activeTab}
        currentAlbum={currentAlbum}
        selectedAlbumId={selectedAlbumId}
        setSelectedAlbumId={setSelectedAlbumId}
        albums={albums}
        caption={caption}
        setCaption={setCaption}
        uploading={uploading}
        selectedFile={selectedFile}
        lidarComFicheiro={lidarComFicheiro}
        enviarFoto={enviarFoto}
        fileInputRef={fileInputRef}
        erro={erro}
      />

      {/* SECÇÃO DE ÁLBUNS */}
      {activeTab === 'albums' && !currentAlbum && (
        <div>
          {/* Formulário para Criar Novo Álbum */}
          <AlbumCreator
            t={t}
            newAlbumName={newAlbumName}
            setNewAlbumName={setNewAlbumName}
            newAlbumDesc={newAlbumDesc}
            setNewAlbumDesc={setNewAlbumDesc}
            creatingAlbum={creatingAlbum}
            criarAlbum={criarAlbum}
          />

          <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>{t.photos_album_title}</h2>
          
          <AlbumGrid
            t={t}
            loading={loading}
            albums={albums}
            generalPhotoCount={generalPhotoCount}
            setCurrentAlbum={setCurrentAlbum}
            meuNome={meuNome}
            minhaRole={minhaRole}
            apagarAlbum={apagarAlbum}
          />
        </div>
      )}

      {/* LISTAGEM DE FOTOS */}
      {(activeTab === 'todas' || currentAlbum) && (
        <PhotoGrid
          t={t}
          loadingPhotos={loadingPhotos}
          photos={photos}
          currentAlbum={currentAlbum}
          setCurrentAlbum={setCurrentAlbum}
          meuNome={meuNome}
          minhaRole={minhaRole}
          language={language}
          apagarFoto={apagarFoto}
          setSelectedPhoto={setSelectedPhoto}
          currentPage={currentPage}
          totalPages={totalPages}
          loadingMore={loadingMore}
          carregarFotos={carregarFotos}
        />
      )}

      {/* MODAL LIGHTBOX */}
      <PhotoLightbox
        t={t}
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={setSelectedPhoto}
        meuNome={meuNome}
        minhaRole={minhaRole}
        language={language}
        apagarFoto={apagarFoto}
      />
    </div>
  );
}
