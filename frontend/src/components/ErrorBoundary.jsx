import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-900/90 border border-rose-500/50 rounded-2xl p-6 shadow-2xl backdrop-blur-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/40">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Component Render Warning</h3>
              <p className="text-xs text-slate-400 mt-1">
                A non-fatal rendering error occurred in the current view.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl inline-flex items-center space-x-2 transition-all shadow-lg shadow-cyan-600/20"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reload Prototype State</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
