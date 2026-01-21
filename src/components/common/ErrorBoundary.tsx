
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
      // Retorna null pois o App.tsx vai detectar a mudança de estado no Controller
      // e renderizar a ErrorPage em tela cheia.
      return null;
    }
    return this.props.children;
  }
}
