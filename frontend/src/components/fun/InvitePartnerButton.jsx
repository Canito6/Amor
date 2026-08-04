import { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { triggerHapticFeedback } from '../../utils/hapticUtils';

export default function InvitePartnerButton({ gameName, gameRoute }) {
  const socket = useSocket();
  const { showToast } = useToast();
  const [inviting, setInviting] = useState(false);

  const meuNome = localStorage.getItem('nome') || '';

  const handleInvite = () => {
    if (!socket || inviting) return;

    try {
      setInviting(true);
      triggerHapticFeedback('medium');

      socket.emit('game-invite', {
        fromUser: meuNome,
        gameName,
        gameRoute
      });

      showToast(`Convite enviado ao parceiro para jogar ${gameName}! 📲`, 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setInviting(false), 3000);
    }
  };

  return (
    <button
      className="btn btn-dark"
      onClick={handleInvite}
      disabled={inviting}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.85rem',
        padding: '0.4rem 0.85rem',
        borderRadius: '14px',
        border: '1.5px solid rgba(255, 77, 141, 0.4)',
        color: '#ff4d8d'
      }}
    >
      <span>📲</span>
      <span>{inviting ? 'A enviar...' : 'Convidar Parceiro'}</span>
    </button>
  );
}
