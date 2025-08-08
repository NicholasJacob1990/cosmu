'use client';

import React, { Component, ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface QueryErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Ops! Algo deu errado
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Ocorreu um erro ao carregar os dados. Tente novamente ou recarregue a página.
      </p>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mb-6 text-left bg-red-50 p-4 rounded-lg max-w-2xl">
          <summary className="cursor-pointer font-medium text-red-800 mb-2">
            Detalhes do erro (apenas em desenvolvimento)
          </summary>
          <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-auto">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
      
      <Button onClick={resetErrorBoundary} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<
  { children: ReactNode; onReset?: () => void; onError?: (error: Error, errorInfo: any) => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Query Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundaryClass onReset={reset}>
          {children}
        </ErrorBoundaryClass>
      )}
    </QueryErrorResetBoundary>
  );
}