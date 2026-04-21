import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#fdf6f4] p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#e91e8c] mb-2">Đã xảy ra lỗi!</h1>
          <p className="text-gray-600 max-w-md mb-6">
            Rất tiếc, đã có sự cố xảy ra khi tải giao diện này. Vui lòng tải lại trang hoặc thử lại sau.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#e91e8c] text-white font-bold rounded-full hover:bg-[#c0114d] transition-colors shadow-lg"
          >
            Tải lại trang
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-red-50 text-red-700 text-xs text-left rounded-lg overflow-auto max-w-full">
              {this.state.error && this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
