import React, { useState } from 'react';
import { authService } from '../services/auth/authService';

export default function LinkCoupleModal({ isOpen, onClose, coupleInfo, t }) {
  const [inviteTokenInput, setInviteTokenInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleLinkCouple = async (e) => {
    e.preventDefault();
    setLinkError('');
    setLinkSuccess('');

    if (!inviteTokenInput.trim()) {
      setLinkError('Por favor insere o código ou utilizador do parceiro.');
      return;
    }

    try {
      const res = await authService.linkCouple(inviteTokenInput);
      setLinkSuccess('Conectados com sucesso! ❤️');
      setInviteTokenInput('');
      
      if (res && res.coupleId) {
        localStorage.setItem('coupleId', res.coupleId);
      }
      
      // Dispatch events to notify other components and trigger auth recheck
      window.dispatchEvent(new Event('authChange'));
      window.dispatchEvent(new Event('refreshCoupleInfo'));
      
      setTimeout(() => {
        onClose();
        setLinkSuccess('');
      }, 1500);
    } catch (err) {
      setLinkError(err.message || 'Erro ao conectar. Tente novamente.');
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const inviteLinkUrl = `${window.location.origin}/registar?invite=${coupleInfo.coupleId}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel fade-in" 
        style={{ 
          padding: '30px', 
          width: '100%', 
          maxWidth: '480px', 
          textAlign: 'center',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          style={{
            position: 'absolute', top: '15px', right: '15px', 
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'
          }}
          onClick={onClose}
        >
          ✕
        </button>

        <h2 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>
          {t.connect_partner_title || 'Conectar Parceiro(a) ❤️'}
        </h2>
        <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Vincula o vosso cantinho privado com a tua namorada para poderem partilhar notas, fotografias, quizzes e o calendário!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginBottom: '25px' }}>
          <div>
            <label className="input-label">{t.your_couple_token || 'O teu código de casal'}</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <input 
                type="text" 
                readOnly 
                value={coupleInfo.coupleId} 
                className="input-control" 
                style={{ fontSize: '13px', background: 'rgba(0,0,0,0.05)', flex: 1 }}
              />
              <button 
                className="btn btn-dark" 
                style={{ padding: '10px 15px', fontSize: '13px' }}
                onClick={() => copyToClipboard(coupleInfo.coupleId, 'token')}
              >
                {copiedToken ? 'Copiado! ✔' : (t.copy_btn || 'Copiar')}
              </button>
            </div>
          </div>

          <div>
            <label className="input-label">{t.invite_link || 'Link de convite'}</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <input 
                type="text" 
                readOnly 
                value={inviteLinkUrl} 
                className="input-control" 
                style={{ fontSize: '12px', background: 'rgba(0,0,0,0.05)', flex: 1 }}
              />
              <button 
                className="btn btn-dark" 
                style={{ padding: '10px 15px', fontSize: '13px' }}
                onClick={() => copyToClipboard(inviteLinkUrl, 'link')}
              >
                {copiedLink ? 'Copiado! ✔' : (t.copy_btn || 'Copiar')}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleLinkCouple} style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '20px', textAlign: 'left' }}>
          <div className="form-group">
            <label className="input-label" htmlFor="partnerToken">
              {t.enter_partner_token || 'Já tens o código do teu parceiro?'}
            </label>
            <input 
              id="partnerToken"
              type="text"
              placeholder={t.partner_token_placeholder || 'Insere o código ou utilizador...'}
              value={inviteTokenInput}
              onChange={(e) => setInviteTokenInput(e.target.value)}
              className="input-control"
              style={{ marginTop: '5px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '5px' }}>
            {t.connect_now_btn || 'Conectar Agora 💑'}
          </button>
        </form>

        {linkError && (
          <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '13px', fontWeight: '600', margin: 0, textAlign: 'center' }}>{linkError}</p>
          </div>
        )}

        {linkSuccess && (
          <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: '#e6fffa', border: '1px solid #b2f5ea' }}>
            <p style={{ color: 'var(--success-color)', fontSize: '13px', fontWeight: '600', margin: 0, textAlign: 'center' }}>{linkSuccess}</p>
          </div>
        )}
      </div>
    </div>
  );
}
