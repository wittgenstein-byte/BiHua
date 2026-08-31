import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BiHua ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-6 select-none relative overflow-hidden transition-colors">
          {/* Ambient background glow */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg w-full glass-panel rounded-3xl p-8 text-center space-y-6 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
            {/* Warning Icon */}
            <div className="w-20 h-20 rounded-3xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-xl shadow-rose-950/20">
              <AlertTriangle className="w-10 h-10" />
            </div>

            {/* Error Messages */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black font-chinese text-slate-900 dark:text-white">
                เกิดข้อผิดพลาดในการแสดงผล
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                ระบบตรวจพบข้อผิดพลาดที่ไม่คาดคิด กรุณาลองรีเฟรชหน้าเว็บหรือกลับสู่หน้าหลัก
              </p>
            </div>

            {/* Technical error message (compact) */}
            {this.state.error?.message && (
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Error Details
                </div>
                <div className="text-xs font-mono text-rose-600 dark:text-rose-400 break-words line-clamp-3">
                  {this.state.error.message}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> รีเฟรชหน้านี้
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
              >
                <Home className="w-4 h-4" /> กลับหน้าหลัก
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
