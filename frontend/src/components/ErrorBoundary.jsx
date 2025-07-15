import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error to an error reporting service here
    // console.error(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
          <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
          <p className="mb-6">An unexpected error occurred. Please try reloading the page.</p>
          <button onClick={this.handleReload} className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-bold shadow-lg">Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 