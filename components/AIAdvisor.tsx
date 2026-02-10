
import React, { useState, useEffect, useCallback } from 'react';
import { BrainCircuit, Sparkles, RefreshCcw } from 'lucide-react';
import { Transaction, Investment, CreditCard } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface AIAdvisorProps {
  transactions: Transaction[];
  investments: Investment[];
  cards: CreditCard[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, investments, cards }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions, investments, cards);
    setAdvice(result || '');
    setLoading(false);
  }, [transactions, investments, cards]);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-full mb-4">
          <BrainCircuit size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">IA Advisor</h2>
        <p className="text-slate-500">Análise inteligente da sua vida financeira através de inteligência artificial.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Sparkles className="text-emerald-300" size={40} />
        </div>

        <div className="relative z-10">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            Insights Personalizados
            {loading && <RefreshCcw className="animate-spin text-slate-400" size={18} />}
          </h3>

          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
              {advice || "Não foi possível carregar os conselhos agora."}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100">
            <button
              onClick={fetchAdvice}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md"
            >
              <RefreshCcw size={18} />
              Atualizar Análise
            </button>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
        <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
          <Sparkles size={24} />
        </div>
        <div>
          <h4 className="font-bold text-emerald-900 mb-1">Como funciona?</h4>
          <p className="text-sm text-emerald-700">Utilizamos o modelo Gemini 3 para analisar seus padrões de gastos e rendimentos, cruzando com boas práticas de educação financeira para sugerir melhorias reais na sua carteira.</p>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
