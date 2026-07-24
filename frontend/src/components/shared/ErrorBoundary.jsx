import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🕵️ ErrorBoundary apanhou um erro:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: 'var(--bg-gradient)',
          fontFamily: 'var(--font-body)',
          textAlign: 'center'
        }}>
          <div className="glass-panel fade-in" style={{ padding: '40px', maxWidth: '500px', margin: '20px' }}>
            <span style={{ fontSize: '50px' }}>✨</span>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '24px', margin: '20px 0 10px 0' }}>
              Oops! Algo correu mal.
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '30px' }}>
              Ocorreu um momento inesperado nesta página. Não te preocupes, os teus dados estão 100% seguros!
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={this.handleRetry}>
                Tentar Novamente 🔄
              </button>
              <button className="btn btn-dark" onClick={this.handleReset}>
                Ir para o Painel 🏠
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
