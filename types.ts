
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum InvestmentType {
  STOCK = 'STOCK',
  FIXED_INCOME = 'FIXED_INCOME',
  CRYPTO = 'CRYPTO',
  REAL_ESTATE = 'REAL_ESTATE'
}

export enum ProfitabilityType {
  CDI = 'CDI',
  FIXED = 'FIXED',
  MANUAL = 'MANUAL'
}

export enum DaysType {
  BUSINESS = 'BUSINESS',
  CALENDAR = 'CALENDAR'
}

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'error';
  date: Date;
  read: boolean;
}

export interface FinancialMonthConfig {
  startDay: number;
  endDay: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  bankAccount?: string;
  paymentMethod?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  value: number; // Valor bruto atual
  initialValue?: number;
  startDate?: string;
  profitabilityType?: ProfitabilityType;
  profitabilityRate?: number; // Ex: 100 (para 100% CDI) ou 12.5 (para 12.5% a.a. fixo)
  daysType?: DaysType;
  yieldOnWeekends?: boolean;
  change: number;
  netValue?: number;
  taxes?: number;
  calendarDays?: number;
  businessDays?: number;
  annualizedNetYield?: number;
}

export interface CreditCard {
  id: string;
  name: string;
  lastFour: string;
  limit: number;
  used: number;
  dueDate: string;
  color: string;
  bankAccountId?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
  cpf: string | null;
  phone: string | null;
}

export type View = 'dashboard' | 'income' | 'expenses' | 'investments' | 'credit-cards' | 'bank-accounts' | 'ai-advisor' | 'settings';
