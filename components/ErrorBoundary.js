import React from 'react';
import styles from '../styles/ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            
            <h2 className={styles.errorTitle}>
              {this.props.title || 'Bir şeyler ters gitti'}
            </h2>
            
            <p className={styles.errorMessage}>
              {this.props.message || 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Hata Detayları (Geliştirici Modu)</summary>
                <pre className={styles.errorStack}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className={styles.errorActions}>
              <button 
                className={styles.retryButton}
                onClick={this.handleRetry}
              >
                Tekrar Dene
              </button>
              
              <button 
                className={styles.reloadButton}
                onClick={() => window.location.reload()}
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Functional error component for specific error states
export const ErrorMessage = ({ 
  title = 'Hata', 
  message = 'Bir hata oluştu', 
  onRetry = null,
  type = 'error' // error, warning, info
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'info':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
    }
  };

  return (
    <div className={`${styles.errorMessage} ${styles[type]}`}>
      <div className={styles.errorMessageIcon}>
        {getIcon()}
      </div>
      
      <div className={styles.errorMessageContent}>
        <h4 className={styles.errorMessageTitle}>{title}</h4>
        <p className={styles.errorMessageText}>{message}</p>
        
        {onRetry && (
          <button 
            className={styles.errorMessageButton}
            onClick={onRetry}
          >
            Tekrar Dene
          </button>
        )}
      </div>
    </div>
  );
};

// Network error component
export const NetworkError = ({ onRetry }) => {
  return (
    <ErrorMessage
      title="Bağlantı Hatası"
      message="İnternet bağlantınızı kontrol edin ve tekrar deneyin."
      onRetry={onRetry}
      type="warning"
    />
  );
};

// Not found component
export const NotFound = ({ message = 'Aradığınız sayfa bulunamadı.' }) => {
  return (
    <div className={styles.notFound}>
      <div className={styles.notFoundIcon}>
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      
      <h2 className={styles.notFoundTitle}>404</h2>
      <p className={styles.notFoundMessage}>{message}</p>
      
      <button 
        className={styles.notFoundButton}
        onClick={() => window.history.back()}
      >
        Geri Dön
      </button>
    </div>
  );
};

// Empty state component
export const EmptyState = ({ 
  title = 'Henüz veri yok', 
  message = 'Burası şu anda boş görünüyor.',
  actionText = null,
  onAction = null 
}) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6m6-6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      
      <h3 className={styles.emptyStateTitle}>{title}</h3>
      <p className={styles.emptyStateMessage}>{message}</p>
      
      {actionText && onAction && (
        <button 
          className={styles.emptyStateButton}
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};