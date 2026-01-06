
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface EBProps { 
    children?: ReactNode; 
    onError: (error: any, info: string) => void; 
}

interface EBState { 
    hasError: boolean; 
}

export class ErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any): EBState { return { hasError: true }; }
  
  componentDidCatch(error: any, errorInfo: ErrorInfo) { this.props.onError(error, errorInfo.componentStack || ''); }
  
  render() { 
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-10 bg-gray-50 text-center">
            <div className="max-w-md">
                <h1 className="text-4xl font-black text-red-600 mb-4 uppercase italic tracking-tighter">ERRO CRÍTICO</h1>
                <p className="text-gray-600 font-medium mb-6">O sistema encontrou uma falha inesperada. O relatório já foi capturado.</p>
                <button onClick={() => window.location.reload()} className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-lg">Recarregar Portal</button>
            </div>
        </div>
      );
    }
    return this.props.children; 
  }
}
