import { Component, type ErrorInfo, type ReactNode } from 'react';


interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[House of Varsh Uncaught Error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#1E0005',
          color: '#F4E4BC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: "'Playfair Display', serif",
          textAlign: 'center',
        }}>
          <img src="/chinni_logo.png" alt="House of Varsh" style={{ height: '48px', marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#D4AF37' }}>Maison Experience Restoring</h1>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.95rem', maxWidth: '480px', lineHeight: '1.6', opacity: 0.85, marginBottom: '2rem' }}>
            We encountered a temporary viewing glitch. Click below to refresh your couture experience.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.85rem 2.2rem',
              backgroundColor: '#D4AF37',
              color: '#1A0205',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.8rem',
            }}
          >
            Reload Collection
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
