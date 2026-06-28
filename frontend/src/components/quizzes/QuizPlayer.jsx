import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { useToast } from '../../context/ToastContext';

export default function QuizPlayer({
  t,
  activeQuiz,
  setActiveQuiz,
  currentGuesses,
  setCurrentGuesses,
  submeterRespostas
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const { language } = usePreferences();
  const { showToast } = useToast();

  const totalQuestions = activeQuiz.questions.length;
  const activeQuestion = activeQuiz.questions[currentStep];
  const progressPercent = ((currentStep + 1) / totalQuestions) * 100;

  const handleNext = () => {
    if (!currentGuesses[currentStep]) {
      showToast(language === 'pt' ? 'Por favor, responde a esta pergunta antes de avançar!' : 'Please answer this question before proceeding!', 'error');
      return;
    }
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOptionChange = (opt) => {
    const novosGuesses = [...currentGuesses];
    novosGuesses[currentStep] = opt;
    setCurrentGuesses(novosGuesses);
  };

  const isLastStep = currentStep === totalQuestions - 1;
  const currentGuess = currentGuesses[currentStep] || '';

  return (
    <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ color: 'var(--secondary-color)', fontSize: '20px', margin: 0 }}>
          {t.quizzes_playing_title.replace('{title}', activeQuiz.title)}
        </h2>
        <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
          {language === 'pt' ? `Pergunta ${currentStep + 1} de ${totalQuestions}` : `Question ${currentStep + 1} of ${totalQuestions}`}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', marginBottom: '25px', overflow: 'hidden' }}>
        <div 
          style={{ 
            width: `${progressPercent}%`, 
            height: '100%', 
            background: 'var(--primary-color)', 
            borderRadius: '4px',
            transition: 'width 0.3s ease-in-out' 
          }} 
        />
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '14px' }}>
        {t.quizzes_playing_desc.replace('{creator}', activeQuiz.createdBy)}
      </p>

      {/* Active Question Card */}
      <div 
        className="glass-panel fade-in" 
        key={currentStep} // forces re-render with animation when step changes!
        style={{ 
          padding: '25px', 
          background: 'rgba(255, 255, 255, 0.45)', 
          borderRadius: '16px', 
          borderLeft: '5px solid var(--primary-color)',
          marginBottom: '30px'
        }}
      >
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-main)' }}>
          {activeQuestion.questionText}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeQuestion.options.map((opt, oIndex) => (
            <label 
              key={oIndex} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '14px 18px', 
                background: currentGuess === opt ? 'rgba(255, 77, 109, 0.12)' : 'white',
                border: currentGuess === opt ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                borderRadius: '14px',
                cursor: 'pointer',
                fontWeight: currentGuess === opt ? '600' : 'normal',
                boxShadow: currentGuess === opt ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="radio"
                name={`question-${currentStep}`}
                value={opt}
                checked={currentGuess === opt}
                onChange={() => handleOptionChange(opt)}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '15px', color: 'var(--text-main)' }}>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="btn btn-dark" onClick={() => setActiveQuiz(null)}>
          {t.quizzes_button_giveup}
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {currentStep > 0 && (
            <button type="button" className="btn btn-dark" onClick={handlePrev}>
              {language === 'pt' ? '⬅ Anterior' : '⬅ Previous'}
            </button>
          )}
          
          {!isLastStep ? (
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              {language === 'pt' ? 'Seguinte ➡' : 'Next ➡'}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={submeterRespostas}>
              {t.quizzes_button_submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
