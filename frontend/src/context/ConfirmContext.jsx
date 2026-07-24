import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ConfirmContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ isOpen: false, title: '', message: '', confirmText: '', cancelText: '' });
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    setState({
      isOpen: true,
      title: options.title || 'Confirmar Ação',
      message: options.message || 'Tem a certeza que deseja prosseguir?',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar'
    });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) resolverRef.current(true);
  };

  const handleCancel = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) resolverRef.current(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.isOpen && (
        <div className="modal-backdrop" onClick={handleCancel}>
          <div className="confirm-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <h2>{state.title}</h2>
            <p>{state.message}</p>
            <div className="confirm-modal-actions">
              <button className="btn btn-dark" onClick={handleCancel}>
                {state.cancelText}
              </button>
              <button className="btn btn-danger" onClick={handleConfirm}>
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
