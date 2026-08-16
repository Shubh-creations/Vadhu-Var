import React from 'react';
import { RotateCcw, AlertTriangle, Mail } from 'lucide-react';
import { captureError } from '../lib/sentry';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by boundary:', error, errorInfo);
    // Report uncaught React UI crashes to Sentry
    captureError(error, {
      tags: { boundary: 'RootErrorBoundary' },
      extra: { componentStack: errorInfo?.componentStack }
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-ground text-main flex items-center justify-center p-4">
          <div className="bg-surface-card radius-card border border-main max-w-md w-full p-8 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 radius-btn bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-xl font-bold text-main">
              Something went wrong
            </h2>
            <p className="text-xs text-sub leading-relaxed">
              An unexpected issue occurred while rendering the page. Reloading the application usually resolves this.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
            <div className="pt-3 border-t border-main">
              <p className="text-[11px] text-sub">
                Need assistance? Contact our support team:
              </p>
              <a
                href="mailto:vadhuvar.matrimonyapp@gmail.com"
                className="text-xs font-semibold text-sky-blue hover:underline inline-flex items-center gap-1 mt-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>vadhuvar.matrimonyapp@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
