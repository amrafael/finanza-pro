
import React, { useState } from 'react';
import { CreditCard as CreditCardType, BankAccount } from '../types';
import { CreditCard as CardIcon, Calendar, Lock, Plus, Edit3, Trash2, X } from 'lucide-react';
import BankLogo from './BankLogo';

interface CreditCardsManagerProps {
  cards: CreditCardType[];
  bankAccounts: BankAccount[];
  onAdd: (card: CreditCardType) => void;
  onUpdate: (card: CreditCardType) => void;
  onDelete: (id: string) => void;
}

const CreditCardsManager: React.FC<CreditCardsManagerProps> = ({ cards, bankAccounts, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [limit, setLimit] = useState('');
  const [used, setUsed] = useState('');
  const [dueDate, setDueDate] = useState('15');
  const [color, setColor] = useState('bg-slate-900');
  const [bankAccountId, setBankAccountId] = useState('');

  const cardColors = [
    { label: 'Roxo', value: 'bg-purple-600' },
    { label: 'Preto', value: 'bg-slate-900' },
    { label: 'Laranja', value: 'bg-orange-600' },
    { label: 'Azul', value: 'bg-blue-600' },
    { label: 'Verde', value: 'bg-emerald-600' },
    { label: 'Dourado', value: 'bg-amber-500' },
  ];

  const handleOpenAdd = () => {
    setEditingCard(null);
    setName('');
    setLastFour('');
    setLimit('');
    setUsed('0');
    setDueDate('15');
    setColor('bg-slate-900');
    setBankAccountId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (card: CreditCardType) => {
    setEditingCard(card);
    setName(card.name);
    setLastFour(card.lastFour);
    setLimit(card.limit.toString());
    setUsed(card.used.toString());
    setDueDate(card.dueDate);
    setColor(card.color);
    setBankAccountId(card.bankAccountId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lastFour || !limit) return;

    const cardData: CreditCardType = {
      id: editingCard ? editingCard.id : Math.random().toString(36).substr(2, 9),
      name,
      lastFour: lastFour.slice(-4),
      limit: parseFloat(limit),
      used: parseFloat(used) || 0,
      dueDate,
      color,
      bankAccountId: bankAccountId || undefined
    };

    if (editingCard) onUpdate(cardData);
    else onAdd(cardData);
    setIsModalOpen(false);
  };

  const getLinkedAccount = (id?: string) => {
    return bankAccounts.find(acc => acc.id === id);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Cartões</h2>
          <p className="text-slate-500">Controle seus limites e faturas em um só lugar.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm font-bold"
        >
          <Plus size={18} />
          Novo Cartão
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {cards.map(card => {
          const usagePercent = (card.used / card.limit) * 100;
          const linkedAccount = getLinkedAccount(card.bankAccountId);

          return (
            <div key={card.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className={`p-8 ${card.color} text-white relative overflow-hidden transition-all group-hover:brightness-110`}>
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                  <CardIcon size={120} />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <CardIcon size={32} />
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-lg">•••• {card.lastFour}</span>
                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(card)}
                          className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(card.id)}
                          className="p-1.5 bg-rose-500/80 hover:bg-rose-600 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-70 mb-1 font-bold uppercase tracking-widest">Portador</p>
                      <p className="text-xl font-black uppercase tracking-widest">{card.name}</p>
                    </div>
                    {linkedAccount && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                        <BankLogo name={linkedAccount.name} size={14} />
                        <span className="text-[10px] font-bold uppercase">{linkedAccount.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Uso Atual</p>
                    <p className="text-xl font-bold text-slate-800">R$ {card.used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Limite Disponível</p>
                    <p className="text-xl font-bold text-emerald-600">R$ {(card.limit - card.used).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-tight">Limite Utilizado</span>
                    <span className="text-slate-700 font-black">{usagePercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-300" />
                    <span>Vencimento Dia {card.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-slate-300" />
                    <span>Seguro Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {cards.length === 0 && (
          <div
            onClick={handleOpenAdd}
            className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-slate-400 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all"
          >
            <CardIcon size={48} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest">Adicionar seu primeiro cartão</p>
            <p className="text-xs opacity-70">Acompanhe seus limites de crédito com clareza</p>
          </div>
        )}
      </div>

      {/* Modal de Cartão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingCard ? 'Editar Cartão' : 'Novo Cartão'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Nome do Cartão (ou Portador)</label>
                  <input autoFocus required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Nubank João" className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Últimos 4 Dígitos</label>
                  <input required type="text" maxLength={4} value={lastFour} onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ''))} placeholder="1234" className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Dia do Vencimento</label>
                  <input required type="number" min={1} max={31} value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Limite Total (R$)</label>
                  <input required type="number" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="5000" className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Uso Atual (R$)</label>
                  <input required type="number" step="0.01" value={used} onChange={(e) => setUsed(e.target.value)} placeholder="0" className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Vincular à Conta (Débito Automático)</label>
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none appearance-none"
                >
                  <option value="">Nenhuma conta vinculada</option>
                  {bankAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 text-center">Design do Cartão</label>
                <div className="flex flex-wrap justify-center gap-3">
                  {cardColors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-10 h-10 rounded-full ${c.value} border-4 transition-all ${color === c.value ? 'border-slate-300 scale-125 shadow-lg' : 'border-transparent hover:scale-110'}`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 shadow-xl transition-all hover:scale-[1.02] uppercase tracking-widest text-xs">Salvar Cartão</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardsManager;
