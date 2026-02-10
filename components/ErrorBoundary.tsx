
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle size={32} className="text-rose-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Ops! Algo deu errado.</h1>
                        <p className="text-slate-500 mb-6">
                            Desculpe, ocorreu um erro inesperado. Tente recarregar a página.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
                        >
                            Recarregar Página
                        </button>
                        {this.state.error && (
                            <div className="mt-8 p-4 bg-slate-100 rounded-lg text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-slate-600 whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
