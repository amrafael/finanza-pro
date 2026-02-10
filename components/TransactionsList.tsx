
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, BankAccount, Category } from '../types';
import { Plus, Search, Trash2, Edit3, Calendar, XCircle, Settings2, X, CreditCard, Landmark, PieChart as PieIcon, Check } from 'lucide-react';
import { PAYMENT_METHODS, CATEGORY_COLORS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import BankLogo from './BankLogo';

interface TransactionsListProps {
  type: TransactionType;
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  categories: Category[];
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddCategory: (name: string, type: TransactionType, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  type, transactions, bankAccounts, categories, onAdd, onUpdate, onDelete, onAddCategory, onDeleteCategory
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);

  // Form values
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [date, setDate] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Helper: Get today's date in YYYY-MM-DD format (local time)
  const getLocalToday = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Helper: Get first and last day of a specific month in YYYY-MM-DD
  const getMonthDateRange = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      start: `${firstDay.getFullYear()}-${pad(firstDay.getMonth() + 1)}-${pad(firstDay.getDate())}`,
      end: `${lastDay.getFullYear()}-${pad(lastDay.getMonth() + 1)}-${pad(lastDay.getDate())}`
    };
  };

  // Helper: Parse YYYY-MM-DD string into year/month/day without UTC issues
  const parseLocalDateString = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return { year, month: month - 1, day };
  };

  // Initial date range: current month
  const initialDateRange = useMemo(() => {
    const now = new Date();
    return getMonthDateRange(now.getFullYear(), now.getMonth());
  }, []);

  const [startDate, setStartDate] = useState(initialDateRange.start);
  const [endDate, setEndDate] = useState(initialDateRange.end);
  const [filterBankAccount, setFilterBankAccount] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== type) return false;
      if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      if (filterBankAccount && t.bankAccount !== filterBankAccount) return false;
      if (filterPaymentMethod && t.paymentMethod !== filterPaymentMethod) return false;
      return true;
    });
  }, [transactions, type, searchTerm, startDate, endDate, filterBankAccount, filterPaymentMethod]);

  const total = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);

  const chartData = useMemo(() => {
    const data: Record<string, { name: string, value: number, color: string }> = {};
    filteredTransactions.forEach(t => {
      if (!data[t.category]) {
        const catObj = categories.find(c => c.name === t.category);
        data[t.category] = { name: t.category, value: 0, color: catObj?.color || '#cbd5e1' };
      }
      data[t.category].value += t.amount;
    });
    return Object.values(data);
  }, [filteredTransactions, categories]);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setBankAccount(editingTransaction.bankAccount || (bankAccounts.length > 0 ? bankAccounts[0].name : ''));
      setPaymentMethod(editingTransaction.paymentMethod || PAYMENT_METHODS[0]);
      setDate(editingTransaction.date);
    } else {
      setDescription('');
      setAmount('');
      setCategory(filteredCategories.length > 0 ? filteredCategories[0].name : '');
      setBankAccount(bankAccounts.length > 0 ? bankAccounts[0].name : '');
      setPaymentMethod(PAYMENT_METHODS[0]);
      setDate(getLocalToday());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTransaction, type, bankAccounts, isModalOpen, filteredCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    const data = {
      description,
      amount: parseFloat(amount),
      category,
      date,
      type,
      bankAccount,
      paymentMethod
    };
    if (editingTransaction) onUpdate({ ...data, id: editingTransaction.id });
    else onAdd(data);
    setIsModalOpen(false);
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName) {
      onAddCategory(newCatName, type, newCatColor);
      setNewCatName('');
      setNewCatColor(CATEGORY_COLORS[0]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate(initialDateRange.start);
    setEndDate(initialDateRange.end);
    setFilterBankAccount('');
    setFilterPaymentMethod('');
  };

  const hasActiveFilters = !!(searchTerm || startDate !== initialDateRange.start || endDate !== initialDateRange.end || filterBankAccount || filterPaymentMethod);

  const getCategoryColor = (catName: string) => {
    return categories.find(c => c.name === catName)?.color || '#cbd5e1';
  };

  const getMonthName = (monthIndex: number) => {
    return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][monthIndex];
  };

  const selectedPeriodLabel = useMemo(() => {
    const startObj = parseLocalDateString(startDate);
    const endObj = parseLocalDateString(endDate);
    const lastDayOfMonth = new Date(startObj.year, startObj.month + 1, 0).getDate();

    if (startObj.day === 1 && endObj.day === lastDayOfMonth && startObj.month === endObj.month && startObj.year === endObj.year) {
      return `${getMonthName(startObj.month)} ${startObj.year}`;
    }
    return 'Período Personalizado';
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {type === TransactionType.INCOME ? 'Receitas' : 'Despesas'}
            </h2>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg tracking-widest border border-emerald-100/50 shadow-sm">{selectedPeriodLabel}</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total: <span className="text-slate-900 font-bold">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <Settings2 size={18} /> <span className="hidden sm:inline">Categorias</span>
          </button>
          <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-bold">
            <Plus size={20} /> Nova {type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
          </button>
        </div>
      </div>

      {/* Visual Summary Chart */}
      {type === TransactionType.EXPENSE && filteredTransactions.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <PieIcon size={20} className="text-rose-500" /> Distribuição de Gastos
            </h3>
            <p className="text-sm text-slate-500">Visualização proporcional das suas despesas por categoria no período selecionado.</p>
          </div>
          <div className="lg:col-span-2 h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <div className="flex items-center gap-1 flex-1">
              <select
                value={parseLocalDateString(startDate).month}
                onChange={(e) => {
                  const m = parseInt(e.target.value);
                  const y = parseLocalDateString(startDate).year;
                  const range = getMonthDateRange(y, m);
                  setStartDate(range.start);
                  setEndDate(range.end);
                }}
                className="p-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
              >
                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={parseLocalDateString(startDate).year}
                onChange={(e) => {
                  const y = parseInt(e.target.value);
                  const m = parseLocalDateString(startDate).month;
                  const range = getMonthDateRange(y, m);
                  setStartDate(range.start);
                  setEndDate(range.end);
                }}
                className="p-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Landmark size={16} className="text-slate-400" />
            <select
              value={filterBankAccount}
              onChange={(e) => setFilterBankAccount(e.target.value)}
              className="flex-1 p-2 bg-slate-50 border rounded-lg text-sm bg-white font-medium"
            >
              <option value="">Todas as Contas</option>
              {bankAccounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-slate-400" />
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="flex-1 p-2 bg-slate-50 border rounded-lg text-sm bg-white font-medium"
            >
              <option value="">Todos os Métodos</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-slate-100 pt-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            {showAdvancedFilters ? 'Ocultar Filtro de Data' : 'Personalizar Datas'}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[10px] text-rose-500 hover:text-rose-600 font-black uppercase tracking-widest flex items-center gap-1"
            >
              <XCircle size={14} /> Limpar filtros ativos
            </button>
          )}
        </div>

        {showAdvancedFilters && (
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2 flex-col sm:flex-row flex-1">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">Início</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 bg-white border rounded-lg text-xs font-bold" />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">Fim</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 bg-white border rounded-lg text-xs font-bold" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Conta</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length > 0 ? filteredTransactions.sort((a, b) => b.date.localeCompare(a.date)).map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{t.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(t.category) }}
                      />
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                        {t.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <BankLogo name={t.bankAccount || ''} size={14} /> {t.bankAccount || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 text-center">{t.paymentMethod || '-'}</td>
                  <td className={`px-6 py-4 text-right font-bold ${type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => { setEditingTransaction(t); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600" title="Editar"><Edit3 size={16} /></button>
                      <button onClick={() => onDelete(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600" title="Excluir"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    Nenhuma transação encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categoria CRUD Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Categorias de {type === TransactionType.INCOME ? 'Entrada' : 'Saída'}</h3>
              <button onClick={() => setIsCategoryModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCat} className="space-y-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <input
                required
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nova categoria..."
                className="w-full p-2 border rounded-lg text-sm bg-white"
              />
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCatColor(color)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white transition-all ${newCatColor === color ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  >
                    {newCatColor === color && <Check size={12} />}
                  </button>
                ))}
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 p-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">
                <Plus size={16} /> Adicionar Categoria
              </button>
            </form>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredCategories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg group">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <button onClick={() => onDeleteCategory(cat.id)} className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{editingTransaction ? 'Editar' : 'Nova'} {type === TransactionType.INCOME ? 'Receita' : 'Despesa'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input required type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Salário" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                  <input required type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500">
                  {filteredCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Conta</label>
                  <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">Sem conta</option>
                    {bankAccounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Método</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500">
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg font-medium hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
