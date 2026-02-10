
import { GoogleGenAI } from "@google/genai";
import { Transaction, Investment, CreditCard } from "../types";

export const getFinancialAdvice = async (
  transactions: Transaction[],
  investments: Investment[],
  cards: CreditCard[]
) => {
  // Always use process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = {
    totalIncome: transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0),
    totalExpense: transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0),
    investmentTotal: investments.reduce((acc, i) => acc + i.value, 0),
    cardDebt: cards.reduce((acc, c) => acc + c.used, 0)
  };

  const prompt = `
    Como um consultor financeiro pessoal expert, analise os seguintes dados financeiros:
    - Receitas Totais: R$ ${summary.totalIncome.toFixed(2)}
    - Despesas Totais: R$ ${summary.totalExpense.toFixed(2)}
    - Total Investido: R$ ${summary.investmentTotal.toFixed(2)}
    - Dívida em Cartões: R$ ${summary.cardDebt.toFixed(2)}

    Com base nisso, forneça 3 dicas práticas em português para melhorar a saúde financeira deste usuário. 
    Seja conciso e use um tom motivador.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Property .text is the correct way to get the text response.
    return response.text;
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Não foi possível obter conselhos no momento. Verifique sua conexão.";
  }
};
