import { useState } from 'react';

export default function CycleOnboardingModal({ isOpen, onClose, onSave, initialPreferences = {} }) {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState(initialPreferences.gender || 'mulher');
  const [shareWithPartner, setShareWithPartner] = useState(initialPreferences.shareWithPartner ?? false);
  const [partnerShareLevel, setPartnerShareLevel] = useState(initialPreferences.partnerShareLevel || 'basic');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleNextStep1 = (selectedGender) => {
    setGender(selectedGender);
    setStep(2);
  };

  const handleNextStep2 = (shouldShare) => {
    setShareWithPartner(shouldShare);
    if (shouldShare) {
      setStep(3);
    } else {
      // Se não quiser partilhar, conclui diretamente
      finishOnboarding(gender, false, 'none');
    }
  };

  const finishOnboarding = async (g = gender, share = shareWithPartner, level = partnerShareLevel) => {
    setSaving(true);
    try {
      await onSave({
        gender: g,
        shareWithPartner: share,
        partnerShareLevel: share ? level : 'none',
        onboardingCompleted: true
      });
      setSaving(false);
      onClose();
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="modal-content glass-panel fade-in" 
        style={{ 
          maxWidth: '480px', 
          width: '90%', 
          padding: '30px 24px', 
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)' 
        }}
      >
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                height: '6px',
                flex: 1,
                borderRadius: '4px',
                backgroundColor: step >= s ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* PASSO 1: IDENTIFICAÇÃO */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌸</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
              Configuração Inicial do Ciclo
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
              <strong>Passo 1: Identificação</strong>
              <br />
              És homem ou mulher?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button
                type="button"
                className={`btn ${gender === 'mulher' ? 'btn-primary' : 'btn-dark'}`}
                onClick={() => handleNextStep1('mulher')}
                style={{ padding: '16px', fontSize: '16px', justifyContent: 'flex-start' }}
              >
                🙋‍♀️ <strong>Mulher</strong>
                <span style={{ fontSize: '12px', opacity: 0.85, marginLeft: 'auto' }}>
                  Registar o meu próprio ciclo
                </span>
              </button>

              <button
                type="button"
                className={`btn ${gender === 'homem' ? 'btn-primary' : 'btn-dark'}`}
                onClick={() => handleNextStep1('homem')}
                style={{ padding: '16px', fontSize: '16px', justifyContent: 'flex-start' }}
              >
                🙋‍♂️ <strong>Homem</strong>
                <span style={{ fontSize: '12px', opacity: 0.85, marginLeft: 'auto' }}>
                  Acompanhar o ciclo da parceira
                </span>
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: PARTILHA COM O PARCEIRO */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤝</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
              Partilha de Informação
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
              <strong>Passo 2: Partilha</strong>
              <br />
              Queres partilhar esta informação com o teu parceiro/parceira?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleNextStep2(true)}
                disabled={saving}
                style={{ padding: '16px', fontSize: '16px', justifyContent: 'flex-start' }}
              >
                💖 <strong>Sim, partilhar</strong>
                <span style={{ fontSize: '12px', opacity: 0.85, marginLeft: 'auto' }}>
                  Permitir visão no casal
                </span>
              </button>

              <button
                type="button"
                className="btn btn-dark"
                onClick={() => handleNextStep2(false)}
                disabled={saving}
                style={{ padding: '16px', fontSize: '16px', justifyContent: 'flex-start' }}
              >
                🔒 <strong>Não, manter privado</strong>
                <span style={{ fontSize: '12px', opacity: 0.85, marginLeft: 'auto' }}>
                  Apenas visível para mim
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                marginTop: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              ← Voltar ao Passo 1
            </button>
          </div>
        )}

        {/* PASSO 3: NÍVEL DE PARTILHA */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚙️</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
              Nível de Detalhe da Partilha
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
              <strong>Passo 3: Nível de Partilha</strong>
              <br />
              O que queres partilhar com o teu parceiro/parceira?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button
                type="button"
                className={`btn ${partnerShareLevel === 'detailed' ? 'btn-primary' : 'btn-dark'}`}
                onClick={() => setPartnerShareLevel('detailed')}
                style={{ padding: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <span>🌟 <strong>Tudo (Detalhado)</strong></span>
                  {partnerShareLevel === 'detailed' && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </div>
                <small style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px', textAlign: 'left' }}>
                  Datas do ciclo, sintomas, previsões de fertilidade, humor e notas.
                </small>
              </button>

              <button
                type="button"
                className={`btn ${partnerShareLevel === 'basic' ? 'btn-primary' : 'btn-dark'}`}
                onClick={() => setPartnerShareLevel('basic')}
                style={{ padding: '14px', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <span>🌸 <strong>Só o Essencial (Básico)</strong></span>
                  {partnerShareLevel === 'basic' && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </div>
                <small style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px', textAlign: 'left' }}>
                  Apenas datas de início/fim do período e próxima previsão (sem sintomas nem notas).
                </small>
              </button>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => setStep(2)}
                disabled={saving}
                style={{ flex: 1 }}
              >
                ← Voltar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => finishOnboarding(gender, true, partnerShareLevel)}
                disabled={saving}
                style={{ flex: 1.5 }}
              >
                {saving ? 'A guardar...' : 'Concluir Configuração ✨'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
