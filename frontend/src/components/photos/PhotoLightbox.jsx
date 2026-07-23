import React, { useState, useEffect, useCallback } from 'react';
import LightboxControls from './LightboxControls';
import LightboxImageArea from './LightboxImageArea';
import LightboxMetadata from './LightboxMetadata';

export default function PhotoLightbox({
  t,
  photos = [],
  selectedPhoto,
  setSelectedPhoto,
  meuNome,
  minhaRole,
  language,
  apagarFoto
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Reset slideshow play state when closed
    if (!selectedPhoto) {
      setIsPlaying(false);
    }
  }, [selectedPhoto]);

  const currentIndex = selectedPhoto ? photos.findIndex(p => p._id === selectedPhoto._id) : -1;

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (photos.length <= 1 || currentIndex === -1) return;
    if (currentIndex > 0) {
      setSelectedPhoto(photos[currentIndex - 1]);
    } else {
      setSelectedPhoto(photos[photos.length - 1]);
    }
  }, [currentIndex, photos, setSelectedPhoto]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (photos.length <= 1 || currentIndex === -1) return;
    if (currentIndex < photos.length - 1) {
      setSelectedPhoto(photos[currentIndex + 1]);
    } else {
      setSelectedPhoto(photos[0]);
    }
  }, [currentIndex, photos, setSelectedPhoto]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, handlePrev, handleNext, setSelectedPhoto]);

  // Slideshow autoplay
  useEffect(() => {
    if (!selectedPhoto || !isPlaying) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3000); // 3 seconds transition
    return () => clearInterval(interval);
  }, [selectedPhoto, isPlaying, handleNext]);

  if (!selectedPhoto) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.93)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        backdropFilter: 'blur(10px)'
      }}
      onClick={() => setSelectedPhoto(null)}
    >
      <LightboxControls 
        currentIndex={currentIndex}
        totalPhotos={photos.length}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onClose={() => setSelectedPhoto(null)}
      />

      <LightboxImageArea 
        url={selectedPhoto.url}
        caption={selectedPhoto.caption}
        showArrows={photos.length > 1}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <LightboxMetadata 
        selectedPhoto={selectedPhoto}
        meuNome={meuNome}
        minhaRole={minhaRole}
        language={language}
        apagarFoto={apagarFoto}
        t={t}
      />
    </div>
  );
}
