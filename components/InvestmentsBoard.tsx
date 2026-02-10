
import React, { useState, useMemo, useEffect } from 'react';
import { Investment, InvestmentType, ProfitabilityType, DaysType } from '../types';
import {
  Briefcase, TrendingUp, TrendingDown, Landmark, Coins, Building,
  Plus, Edit3, Trash2, X, Calculator, Calendar as CalendarIcon,
  ShieldCheck, RefreshCcw, ArrowRight, ReceiptText, LineChart as ChartIcon, History
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { getCDIRate } from '../services/marketDataService';

interface InvestmentsBoardProps {
  investments: Investment[];
  onAdd: (investment: Omit<Investment, 'id'>) => void;
  onUpdate: (investment: Investment) => void;
  onDelete: (id: string) => void;
}

interface HistoryPoint {
  date: string;
  fullDate: string;
  bruto: number;
  liquido: number;
  rendimento: number;
}

interface ExtendedInvestment extends Investment {
  history?: HistoryPoint[];
  taxDetails?: {
    iofValue: number;
    irValue: number;
    totalTaxes: number;
    irRate: number;
    iofRate: number;
  };
  netValue?: number;
  annualizedNetYield?: number;
}

const IOF_TABLE = [
  96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50, 46, 43, 40, 36, 33, 30, 26, 23, 20, 16, 13, 10, 6, 3, 0
];

const InvestmentsBoard: React.FC<InvestmentsBoardProps> = ({ investments, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<ExtendedInvestment | null>(null);
  const [cdiRate, setCdiRate] = useState<number>(11.15);
  const [loadingCDI, setLoadingCDI] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>(InvestmentType.FIXED_INCOME);
  const [manualValue, setManualValue] = useState('');
  const [change, setChange] = useState('');
  const [initialValue, setInitialValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [profitabilityType, setProfitabilityType] = useState<ProfitabilityType>(ProfitabilityType.MANUAL);
  const [profitabilityRate, setProfitabilityRate] = useState('');
  const [daysType, setDaysType] = useState<DaysType>(DaysType.BUSINESS);
  const [yieldOnWeekends, setYieldOnWeekends] = useState(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoadingCDI(true);
      const rate = await getCDIRate();
      setCdiRate(rate);
      setLoadingCDI(false);
    };
    fetchMarketData();
  }, []);

  const getBusinessDaysBetween = (start: Date, end: Date) => {
    let count = 0;
    const curDate = new Date(start.getTime());
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  const getCalendarDaysBetween = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTaxes = (profit: number, calendarDays: number) => {
    let iofRate = 0;
    if (calendarDays < 30) {
      iofRate = (IOF_TABLE[calendarDays] || 0) / 100;
    }
    const iofValue = profit * iofRate;
    const profitAfterIOF = profit - iofValue;

    let irRate = 0.225;
    if (calendarDays > 720) irRate = 0.15;
    else if (calendarDays > 360) irRate = 0.175;
    else if (calendarDays > 180) irRate = 0.20;

    const irValue = profitAfterIOF * irRate;
    return { iofValue, irValue, totalTaxes: iofValue + irValue, irRate: irRate * 100, iofRate: iofRate * 100 };
  };

  const generateHistory = (inv: Investment, currentCdi: number) => {
    if (!inv.startDate || !inv.initialValue) return [];

    const start = new Date(inv.startDate);
    const today = new Date();
    const totalDays = getCalendarDaysBetween(start, today);

    // Para não sobrecarregar, pegamos no máximo 60 pontos
    const step = Math.max(1, Math.ceil(totalDays / 60));
    const history = [];

    const totalDaysBase = inv.yieldOnWeekends ? 365 : 252;
    let annualFactor = 0;
    if (inv.profitabilityType === ProfitabilityType.CDI) {
      annualFactor = (currentCdi / 100) * ((inv.profitabilityRate || 100) / 100);
    } else if (inv.profitabilityType === ProfitabilityType.FIXED) {
      annualFactor = (inv.profitabilityRate || 0) / 100;
    }
    const dailyRate = Math.pow(1 + annualFactor, 1 / totalDaysBase) - 1;

    for (let i = 0; i <= totalDays; i += step) {
      const datePoint = new Date(start);
      datePoint.setDate(start.getDate() + i);

      const calendarDays = i;
      const businessDays = inv.yieldOnWeekends ? calendarDays : getBusinessDaysBetween(start, datePoint);
      const daysToConsider = inv.yieldOnWeekends ? calendarDays : businessDays;

      const gross = inv.initialValue * Math.pow(1 + dailyRate, daysToConsider);
      const profit = gross - inv.initialValue;
      const { totalTaxes } = calculateTaxes(profit, calendarDays);
      const net = gross - totalTaxes;

      history.push({
        date: datePoint.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: datePoint.toLocaleDateString('pt-BR'),
        bruto: Number(gross.toFixed(2)),
        liquido: Number(net.toFixed(2)),
        rendimento: Number(profit.toFixed(2))
      });
    }

    return history;
  };

  const processedInvestments = useMemo(() => {
    const today = new Date();

    return investments.map(inv => {
      if (inv.type === InvestmentType.FIXED_INCOME && inv.profitabilityType !== ProfitabilityType.MANUAL && inv.startDate && inv.initialValue) {
        const start = new Date(inv.startDate);
        if (start > today) return { ...inv, netValue: inv.initialValue, taxes: 0, calendarDays: 0, businessDays: 0 };

        const calendarDays = getCalendarDaysBetween(start, today);
        const businessDays = getBusinessDaysBetween(start, today);

        const daysToConsider = inv.yieldOnWeekends ? calendarDays : businessDays;
        const totalDaysBase = inv.yieldOnWeekends ? 365 : 252;

        let dailyRate = 0;
        if (inv.profitabilityType === ProfitabilityType.CDI) {
          const annualFactor = (cdiRate / 100) * ((inv.profitabilityRate || 100) / 100);
          dailyRate = Math.pow(1 + annualFactor, 1 / totalDaysBase) - 1;
        } else if (inv.profitabilityType === ProfitabilityType.FIXED) {
          const annualFactor = (inv.profitabilityRate || 0) / 100;
          dailyRate = Math.pow(1 + annualFactor, 1 / totalDaysBase) - 1;
        }

        const grossValue = inv.initialValue * Math.pow(1 + dailyRate, daysToConsider);
        const profit = grossValue - inv.initialValue;
        const taxDetails = calculateTaxes(profit, calendarDays);
        const netValue = grossValue - taxDetails.totalTaxes;

        let annualizedNetYield = 0;
        if (calendarDays > 0) {
          annualizedNetYield = (Math.pow(netValue / inv.initialValue, 365 / calendarDays) - 1) * 100;
        }

        return {
          ...inv,
          value: grossValue,
          netValue,
          taxes: taxDetails.totalTaxes,
          taxDetails,
          calendarDays,
          businessDays,
          annualizedNetYield: Number(annualizedNetYield.toFixed(2)),
          change: Number((((grossValue / inv.initialValue) - 1) * 100).toFixed(2))
        };
      }
      return { ...inv, netValue: inv.value, taxes: 0, calendarDays: 0, businessDays: 0, annualizedNetYield: 0 };
    });
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [investments, cdiRate]);

  const totalGross = processedInvestments.reduce((acc, i) => acc + i.value, 0);
  const totalNet = processedInvestments.reduce((acc, i) => acc + (i.netValue || i.value), 0);

  const getIcon = (type: InvestmentType) => {
    switch (type) {
      case InvestmentType.FIXED_INCOME: return <Landmark className="text-blue-500" />;
      case InvestmentType.STOCK: return <Briefcase className="text-emerald-500" />;
      case InvestmentType.CRYPTO: return <Coins className="text-amber-500" />;
      case InvestmentType.REAL_ESTATE: return <Building className="text-rose-500" />;
      default: return <Briefcase />;
    }
  };

  const handleOpenAdd = () => {
    setEditingInvestment(null);
    setName('');
    setType(InvestmentType.FIXED_INCOME);
    setManualValue('');
    setInitialValue('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setProfitabilityType(ProfitabilityType.CDI);
    setProfitabilityRate('100');
    setDaysType(DaysType.BUSINESS);
    setYieldOnWeekends(false);
    setChange('0');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inv: Investment) => {
    setEditingInvestment(inv);
    setName(inv.name);
    setType(inv.type);
    setManualValue(inv.value.toString());
    setInitialValue(inv.initialValue?.toString() || '');
    setStartDate(inv.startDate || '');
    setProfitabilityType(inv.profitabilityType || ProfitabilityType.MANUAL);
    setProfitabilityRate(inv.profitabilityRate?.toString() || '');
    setDaysType(inv.daysType || DaysType.BUSINESS);
    setYieldOnWeekends(inv.yieldOnWeekends || false);
    setChange(inv.change.toString());
    setIsModalOpen(true);
  };

  const handleOpenDetails = (inv: Investment) => {
    const history = generateHistory(inv, cdiRate);
    setSelectedInvestment({ ...inv, history } as ExtendedInvestment);
    setIsDetailsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const isFixedIncomeAuto = type === InvestmentType.FIXED_INCOME && profitabilityType !== ProfitabilityType.MANUAL;

    const investmentData = {
      name,
      type,
      value: isFixedIncomeAuto ? parseFloat(initialValue) : parseFloat(manualValue),
      initialValue: isFixedIncomeAuto ? parseFloat(initialValue) : undefined,
      startDate: isFixedIncomeAuto ? startDate : undefined,
      profitabilityType: type === InvestmentType.FIXED_INCOME ? profitabilityType : ProfitabilityType.MANUAL,
      profitabilityRate: type === InvestmentType.FIXED_INCOME ? parseFloat(profitabilityRate) : undefined,
      daysType: type === InvestmentType.FIXED_INCOME ? daysType : undefined,
      yieldOnWeekends: type === InvestmentType.FIXED_INCOME ? yieldOnWeekends : undefined,
      change: parseFloat(change) || 0,
    };

    if (editingInvestment) {
      onUpdate({ ...investmentData, id: editingInvestment.id } as Investment);
    } else {
      onAdd(investmentData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meus Investimentos</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-1">
            <p className="text-slate-500 text-sm">Patrimônio Bruto: <span className="font-bold text-slate-700">R$ {totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
            <p className="text-emerald-600 text-sm font-medium">Patrimônio Líquido: <span className="font-bold">R$ {totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-xs font-semibold">
            {loadingCDI ? <RefreshCcw className="animate-spin" size={12} /> : <TrendingUp size={14} />}
            CDI BC: {cdiRate}% a.a.
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-bold"
          >
            <Plus size={20} /> Novo Ativo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedInvestments.map(inv => (
          <div key={inv.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col cursor-default">
            {inv.taxes > 0 && (
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase rounded-bl-lg border-l border-b border-rose-100">
                Impostos Aplicados
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors duration-300 shadow-inner">{getIcon(inv.type)}</div>
              <div className="flex flex-col items-end">
                <div className={`flex items-center gap-1 text-sm font-bold ${inv.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {inv.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(inv.change)}%
                </div>
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={() => handleOpenEdit(inv)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => onDelete(inv.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">
                {inv.type === InvestmentType.FIXED_INCOME && inv.profitabilityType !== ProfitabilityType.MANUAL
                  ? `${inv.profitabilityType} • ${inv.profitabilityRate}${inv.profitabilityType === ProfitabilityType.CDI ? '%' : '% a.a.'}`
                  : inv.type.replace('_', ' ')}
              </p>
              <h3 className="text-lg font-bold text-slate-800 mb-4 truncate pr-10">{inv.name}</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Valor Bruto</span>
                  <span className="text-xl font-bold text-slate-900">R$ {inv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                {inv.type === InvestmentType.FIXED_INCOME && (
                  <>
                    <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">Valor Líquido</span>
                        <ShieldCheck size={12} className="text-emerald-500" />
                      </div>
                      <span className="text-xl font-bold text-emerald-600">R$ {inv.netValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {inv.annualizedNetYield !== 0 && (
                      <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl mt-2 border border-emerald-100/50">
                        <span className="text-[9px] text-emerald-700 font-bold uppercase">Rent. Anualizada (Líq.)</span>
                        <span className="text-sm font-black text-emerald-700">+{inv.annualizedNetYield}% a.a.</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                  <CalendarIcon size={12} />
                  {inv.startDate ? `${new Date(inv.startDate).toLocaleDateString('pt-BR')}` : 'Manual'}
                </div>
                {inv.yieldOnWeekends !== undefined && (
                  <span className={`text-[9px] font-bold uppercase ${inv.yieldOnWeekends ? 'text-blue-500' : 'text-slate-300'}`}>
                    {inv.yieldOnWeekends ? 'Rende Finais de Semana' : 'Apenas Dias Úteis'}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleOpenDetails(inv)}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group/btn px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all duration-300"
              >
                Detalhes <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}

        <div onClick={handleOpenAdd} className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-500 transition-all cursor-pointer min-h-[280px] shadow-sm hover:shadow-md">
          <Plus size={40} className="mb-4" />
          <p className="font-bold uppercase tracking-tight text-sm">Adicionar Ativo</p>
          <p className="text-xs opacity-70">Acompanhe seu rendimento diário</p>
        </div>
      </div>

      {/* Modal de Detalhes do Investimento */}
      {isDetailsOpen && selectedInvestment && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
            <div className="bg-slate-900 p-8 text-white relative">
              <button onClick={() => setIsDetailsOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                    {getIcon(selectedInvestment.type)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{selectedInvestment.name}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <CalendarIcon size={14} /> Aplicado em {selectedInvestment.startDate ? new Date(selectedInvestment.startDate).toLocaleDateString('pt-BR') : 'Data não informada'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Rentabilidade Líquida</p>
                    <p className="text-2xl font-black text-white">+{selectedInvestment.annualizedNetYield}% <span className="text-xs font-normal text-slate-400 uppercase">a.a.</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 bg-slate-50/30">

              {/* Gráfico de Evolução */}
              {selectedInvestment.history && selectedInvestment.history.length > 0 && (
                <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <ChartIcon size={18} className="text-blue-500" /> Evolução da Rentabilidade Líquida
                    </h4>
                    <div className="flex gap-4 text-[10px] uppercase font-bold text-slate-400">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Bruto</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Líquido</span>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedInvestment.history}>
                        <defs>
                          <linearGradient id="colorLiquido" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} hide />
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                        />
                        <Area type="monotone" dataKey="bruto" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} name="Bruto" />
                        <Area type="monotone" dataKey="liquido" stroke="#10b981" fill="url(#colorLiquido)" strokeWidth={3} name="Líquido" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Resumo de Rendimentos e Impostos */}
                <section>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ReceiptText size={18} className="text-emerald-500" /> Breakdown Financeiro
                  </h4>
                  <div className="space-y-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Capital Inicial</span>
                      <span className="font-bold text-slate-800">R$ {selectedInvestment.initialValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Rendimento Bruto</span>
                      <span className="font-bold text-emerald-600">+ R$ {(selectedInvestment.value - (selectedInvestment.initialValue || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-2" />

                    {/* Detalhe de IR */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-500 flex items-center gap-1">Imposto de Renda (IR)</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Alíquota Regressiva ({selectedInvestment.taxDetails?.irRate}%)</span>
                      </div>
                      <span className="font-bold text-rose-500">- R$ {selectedInvestment.taxDetails?.irValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* Detalhe de IOF */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-500 flex items-center gap-1">IOF</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedInvestment.taxDetails?.iofRate > 0 ? `Alíquota (${selectedInvestment.taxDetails?.iofRate}%)` : 'Isento (Acima de 30 dias)'}</span>
                      </div>
                      <span className="font-bold text-rose-500">- R$ {selectedInvestment.taxDetails?.iofValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="h-px bg-slate-100 my-2" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Valor Líquido de Resgate</span>
                        <span className="text-2xl font-black text-emerald-600">R$ {selectedInvestment.netValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Histórico de Pontos */}
                <section>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History size={18} className="text-blue-500" /> Histórico de Rendimento
                  </h4>
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[300px] flex flex-col">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Data</span>
                      <span className="text-center">Bruto</span>
                      <span className="text-right">Líquido</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                      {selectedInvestment.history?.slice().reverse().map((point, idx) => (
                        <div key={idx} className="p-4 grid grid-cols-3 text-xs items-center hover:bg-slate-50 transition-colors">
                          <span className="font-medium text-slate-500">{point.fullDate}</span>
                          <span className="text-center font-bold text-slate-800">R$ {point.bruto.toLocaleString('pt-BR')}</span>
                          <span className="text-right font-black text-emerald-600">R$ {point.liquido.toLocaleString('pt-BR')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all hover:scale-[1.02] shadow-xl shadow-slate-200"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingInvestment ? 'Editar Ativo' : 'Novo Investimento'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Nome do Ativo</label>
                  <input autoFocus required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: CDB PagBank 110% CDI" className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Tipo</label>
                  <select value={type} onChange={(e) => setType(e.target.value as InvestmentType)} className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value={InvestmentType.FIXED_INCOME}>Renda Fixa</option>
                    <option value={InvestmentType.STOCK}>Ações / FIIs</option>
                    <option value={InvestmentType.CRYPTO}>Criptoativos</option>
                    <option value={InvestmentType.REAL_ESTATE}>Imóveis</option>
                  </select>
                </div>
              </div>

              {type === InvestmentType.FIXED_INCOME ? (
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-5">
                  <div className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest mb-2">
                    <Calculator size={18} className="text-blue-500" /> Parâmetros de Rentabilidade
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Rentabilidade</label>
                      <select value={profitabilityType} onChange={(e) => setProfitabilityType(e.target.value as ProfitabilityType)} className="w-full p-2.5 border-none bg-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value={ProfitabilityType.CDI}>Pós-fixado (CDI)</option>
                        <option value={ProfitabilityType.FIXED}>Pré-fixado (% a.a.)</option>
                        <option value={ProfitabilityType.MANUAL}>Lançamento Manual</option>
                      </select>
                    </div>
                    {profitabilityType !== ProfitabilityType.MANUAL && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{profitabilityType === ProfitabilityType.CDI ? '% do CDI' : 'Taxa % a.a.'}</label>
                        <input required type="number" step="0.01" value={profitabilityRate} onChange={(e) => setProfitabilityRate(e.target.value)} placeholder="100" className="w-full p-2.5 border-none bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    )}
                  </div>

                  {profitabilityType !== ProfitabilityType.MANUAL && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Valor Aplicado (R$)</label>
                          <input required type="number" step="0.01" value={initialValue} onChange={(e) => setInitialValue(e.target.value)} className="w-full p-2.5 border-none bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Data da Aplicação</label>
                          <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2.5 border-none bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" checked={yieldOnWeekends} onChange={(e) => setYieldOnWeekends(e.target.checked)} className="w-5 h-5 text-emerald-600 border-none bg-white rounded-lg focus:ring-emerald-500 shadow-sm" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">Rendimento aos Finais de Semana</span>
                            <span className="text-[10px] font-medium text-slate-400">Ative para contas digitais ou liquidez diária total.</span>
                          </div>
                        </label>
                      </div>
                    </>
                  )}

                  {profitabilityType === ProfitabilityType.MANUAL && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Valor Atual (R$)</label>
                        <input required type="number" step="0.01" value={manualValue} onChange={(e) => setManualValue(e.target.value)} className="w-full p-2.5 border-none bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Variação Total (%)</label>
                        <input type="number" step="0.01" value={change} onChange={(e) => setChange(e.target.value)} className="w-full p-2.5 border-none bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Valor Atual (R$)</label>
                    <input required type="number" step="0.01" value={manualValue} onChange={(e) => setManualValue(e.target.value)} className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Variação (%)</label>
                    <input type="number" step="0.01" value={change} onChange={(e) => setChange(e.target.value)} placeholder="Ex: 2.30" className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all hover:scale-[1.02]">Salvar Ativo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentsBoard;
