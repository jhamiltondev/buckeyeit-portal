import React from 'react';

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
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
              <p className="text-gray-600">We've encountered an error and are working to fix it.</p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <h2 className="font-semibold text-red-800 mb-2">Error Details:</h2>
              <div className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded overflow-auto max-h-32">
                {this.state.error && this.state.error.toString()}
              </div>
            </div>
            
            {this.state.errorInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h2 className="font-semibold text-gray-800 mb-2">Component Stack:</h2>
                <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded overflow-auto max-h-32">
                  {this.state.errorInfo.componentStack}
                </div>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Go Back
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