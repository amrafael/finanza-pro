import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line, ComposedChart
} from 'recharts';
import { Transaction, Investment, CreditCard, TransactionType, BankAccount, InvestmentType } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard as CardIcon,
  ShieldCheck, ArrowUpRight, ArrowDownLeft, Landmark, PieChart as PieIcon,
  BarChart3, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, DollarSign as DollarSignIcon
} from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  investments: Investment[];
  cards: CreditCard[];
  bankAccounts?: BankAccount[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, investments, cards }) => {
  const { profile } = useAuth();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Usuário';

  // --- CÁLCULOS DE SUMÁRIO ---
  const totalIncome = useMemo(() => transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0), [transactions]);

  const totalExpense = useMemo(() => transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => acc + t.amount, 0), [transactions]);

  const totalInvested = useMemo(() => investments.reduce((acc, i) => acc + i.value, 0), [investments]);
  const totalCardDebt = useMemo(() => cards.reduce((acc, c) => acc + c.used, 0), [cards]);

  // Saldo líquido (Simplificado: Entradas - Saídas - Dívida de Cartão)
  const netBalance = totalIncome - totalExpense - totalCardDebt;
  console.log('Net Balance:', netBalance); // Use it to avoid lint warning if needed, or just keep it.

  // Taxa de Poupança
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // 1. Fluxo de Caixa (Baseado em dados reais agrupados por mês)
  const cashFlowData = useMemo(() => {
    const monthsMap: Record<string, { income: number; expense: number; balance: number }> = {};
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsMap[key] = { income: 0, expense: 0, balance: 0 };
    }

    // Populate with real data
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (monthsMap[month]) {
        if (t.type === TransactionType.INCOME) {
          monthsMap[month].income += t.amount;
        } else {
          monthsMap[month].expense += t.amount;
        }
      }
    });

    // Calculate running balance and format
    let runningBalance = 0;
    return Object.entries(monthsMap).map(([key, data]) => {
      runningBalance += data.income - data.expense;
      const monthIndex = parseInt(key.split('-')[1]) - 1;
      return {
        name: months[monthIndex],
        income: data.income,
        expense: data.expense,
        balance: runningBalance
      };
    });
  }, [transactions]);

  // 2. Distribuição de Gastos por Categoria
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categorias
  }, [transactions]);

  // 3. Alocação de Ativos por Tipo
  const assetAllocationData = useMemo(() => {
    const types: Record<string, number> = {};
    investments.forEach(i => {
      const typeLabel = i.type === InvestmentType.FIXED_INCOME ? 'Renda Fixa' :
        i.type === InvestmentType.STOCK ? 'Ações/FIIs' :
          i.type === InvestmentType.CRYPTO ? 'Cripto' : 'Imóveis';
      types[typeLabel] = (types[typeLabel] || 0) + i.value;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [investments]);

  // 4. Comparativo de Limites de Cartões
  const cardLimitData = useMemo(() => cards.map(c => ({
    name: c.name,
    usado: c.used,
    disponivel: c.limit - c.used
  })), [cards]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-800 to-teal-800 bg-clip-text text-transparent tracking-tight">
            {greeting}, {firstName}
          </h2>
          <p className="text-slate-500 font-medium">Resumo estratégico da sua saúde financeira</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Sincronizado</span>
        </div>
      </header>

      {/* Grid de Stats Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patrimônio Líquido"
          value={totalInvested + (totalIncome - totalExpense)}
          icon={<ShieldCheck className="text-blue-500" />}
          trend="+R$ 1.250"
          positive={true}
        />
        <StatCard
          title="Receitas Mensais"
          value={totalIncome}
          icon={<ArrowUpRight className="text-emerald-500" />}
          trend="Ativo"
          positive={true}
        />
        <StatCard
          title="Despesas Mensais"
          value={totalExpense}
          icon={<ArrowDownLeft className="text-rose-500" />}
          trend="Controlado"
          positive={false}
        />
        <StatCard
          title="Total em Cartões"
          value={totalCardDebt}
          icon={<CardIcon className="text-amber-500" />}
          trend={`${((totalCardDebt / (cards.reduce((a, c) => a + c.limit, 0) || 1)) * 100).toFixed(0)}% do limite`}
          positive={totalCardDebt < 5000}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Fluxo de Caixa (Larga) */}
        <div className="lg:col-span-2 h-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-500" /> Fluxo de Caixa Mensal
              </h3>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Entradas</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> Saídas</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Saldo</span>
              </div>
            </div>
            <div className="h-80 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR')}`, name === 'income' ? 'Entradas' : name === 'expense' ? 'Saídas' : 'Saldo']}
                  />
                  <Area type="monotone" dataKey="income" name="Entradas" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Saídas" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} />
                  <Line type="monotone" dataKey="balance" name="Saldo" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico de Limites de Cartões */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <CardIcon size={18} className="text-amber-500" /> Uso de Crédito
            </h3>
            <div className="h-80 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardLimitData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} width={80} />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="usado" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} barSize={12} />
                  <Bar dataKey="disponivel" stackId="a" fill="#f1f5f9" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col items-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Utilizado</p>
              <p className="text-2xl font-black text-slate-900">R$ {totalCardDebt.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Gráfico de Gastos por Categoria */}
        <div className="lg:col-span-1 h-full font-sans">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <PieIcon size={18} className="text-rose-500" /> Maiores Despesas
            </h3>
            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5} dataKey="value"
                  >
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 overflow-y-auto max-h-32">
              {categoryData.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-500 font-bold">{cat.name}</span>
                  </div>
                  <span className="font-black text-slate-800">R$ {cat.value.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alocação de Ativos */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Wallet size={18} className="text-emerald-500" /> Alocação de Ativos
            </h3>
            <div className="h-64 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5} dataKey="value"
                  >
                    {assetAllocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {assetAllocationData.map((asset, idx) => (
                <div key={asset.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }} />
                    <span className="text-slate-500 font-bold">{asset.name}</span>
                  </div>
                  <span className="font-black text-slate-800">R$ {asset.value.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado Direito: Info Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          {/* Savings Rate Gauge / Info */}
          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden flex-1 flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 blur-3xl rounded-full -ml-12 -mb-12" />
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-xs font-black text-teal-400 uppercase tracking-[0.2em] mb-4">Taxa de Poupança</h3>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-black">{savingsRate.toFixed(0)}%</span>
                  <span className="text-emerald-400 text-sm font-bold mb-1">da receita</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Poupado: <span className="text-white font-bold text-sm">R$ {(totalIncome - totalExpense).toLocaleString('pt-BR')}</span>
                </p>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000"
                    style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Patrimônio Investido */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col justify-center">
            <div className="items-center gap-3 mb-4 flex border-b border-slate-50 pb-4">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Landmark size={20} />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Patrimônio Investido</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Bruto</span>
                <span className="text-xl font-black text-slate-900">R$ {totalInvested.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Rentabilidade Média</span>
                <span className="text-emerald-600 font-bold tracking-tight">+0.82% a.m.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  trend: string;
  positive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, positive }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
    <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
      {React.cloneElement(icon as React.ReactElement<any>, { size: 96 })}
    </div>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">{icon}</div>
      <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-widest ${positive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
        {trend}
      </span>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 tracking-tight">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
    </div>
  </div>
);

export default Dashboard;
