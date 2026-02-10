
import { Transaction, TransactionType, Investment, InvestmentType, CreditCard, BankAccount, Category } from './types';

export const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#f43f5e', '#64748b'
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  { id: 'acc1', name: 'Nubank', type: 'Corrente', color: 'bg-purple-600' },
  { id: 'acc2', name: 'Itaú', type: 'Corrente', color: 'bg-orange-500' },
  { id: 'acc3', name: 'Inter', type: 'Digital', color: 'bg-orange-600' },
  { id: 'acc4', name: 'XP Investimentos', type: 'Investimento', color: 'bg-gray-900' },
  { id: 'acc5', name: 'Carteira', type: 'Dinheiro', color: 'bg-emerald-600' },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Income
  { id: 'c1', name: 'Trabalho', type: TransactionType.INCOME, color: '#10b981' },
  { id: 'c2', name: 'Extra', type: TransactionType.INCOME, color: '#3b82f6' },
  { id: 'c3', name: 'Dividendos', type: TransactionType.INCOME, color: '#f59e0b' },
  // Expenses
  { id: 'c4', name: 'Alimentação', type: TransactionType.EXPENSE, color: '#ef4444' },
  { id: 'c5', name: 'Moradia', type: TransactionType.EXPENSE, color: '#6366f1' },
  { id: 'c6', name: 'Transporte', type: TransactionType.EXPENSE, color: '#f97316' },
  { id: 'c7', name: 'Lazer', type: TransactionType.EXPENSE, color: '#d946ef' },
  { id: 'c8', name: 'Educação', type: TransactionType.EXPENSE, color: '#8b5cf6' },
  { id: 'c9', name: 'Saúde', type: TransactionType.EXPENSE, color: '#06b6d4' },
];

export const PAYMENT_METHODS = [
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'Boleto',
  'Transferência',
  'Outros'
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Salário Mensal', amount: 5500, date: '2023-11-05', category: 'Trabalho', type: TransactionType.INCOME, bankAccount: 'Itaú', paymentMethod: 'Transferência' },
  { id: '2', description: 'Freelance Design', amount: 1200, date: '2023-11-15', category: 'Extra', type: TransactionType.INCOME, bankAccount: 'Nubank', paymentMethod: 'PIX' },
  { id: '3', description: 'Aluguel', amount: 1800, date: '2023-11-10', category: 'Moradia', type: TransactionType.EXPENSE, bankAccount: 'Itaú', paymentMethod: 'Boleto' },
  { id: '4', description: 'Supermercado', amount: 850.40, date: '2023-11-12', category: 'Alimentação', type: TransactionType.EXPENSE, bankAccount: 'Nubank', paymentMethod: 'Cartão de Crédito' },
];

export const INITIAL_INVESTMENTS: Investment[] = [
  { id: '1', name: 'Tesouro Direto 2029', type: InvestmentType.FIXED_INCOME, value: 12500, change: 0.85 },
  { id: '2', name: 'ITUB4 - Itaú Unibanco', type: InvestmentType.STOCK, value: 4200, change: 2.3 },
  { id: '3', name: 'Bitcoin (BTC)', type: InvestmentType.CRYPTO, value: 8700, change: -1.2 },
];

export const INITIAL_CARDS: CreditCard[] = [
  { id: '1', name: 'Nubank Platinum', lastFour: '4452', limit: 5000, used: 1250.40, dueDate: '15', color: 'bg-purple-600', bankAccountId: 'acc1' },
  { id: '2', name: 'XP Visa Infinite', lastFour: '8890', limit: 12000, used: 3400.00, dueDate: '25', color: 'bg-gray-900', bankAccountId: 'acc4' },
];

export const BANK_LOGOS: Record<string, string> = {
  'Nubank': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/nubank.svg',
  'Itaú': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/itau.svg',
  'Inter': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/banco-inter.svg',
  'Bradesco': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/bradesco.svg',
  'Santander': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/santander.svg',
  'Brasil': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/bancodobrasil.svg',
  'XP': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/xp-investimentos.svg',
  'C6': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/c6-bank.svg',
  'BTG': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/btg-pactual.svg',
  'Caixa': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/caixa.svg',
  'Neon': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/neon.svg',
  'Original': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/original.svg',
  'PicPay': 'https://raw.githubusercontent.com/guilhermerodz/brazilian-banks-logos/master/logos/picpay.svg',
};
