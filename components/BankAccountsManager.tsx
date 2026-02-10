
import React, { useState } from 'react';
import { BankAccount, Transaction, TransactionType } from '../types';
import { Plus, Trash2, Edit3, X, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import BankLogo from './BankLogo';

interface BankAccountsManagerProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  onAdd: (account: BankAccount) => void;
  onUpdate: (account: BankAccount) => void;
  onDelete: (id: string) => void;
}

const BankAccountsManager: React.FC<BankAccountsManagerProps> = ({ accounts, transactions, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [viewingStatement, setViewingStatement] = useState<BankAccount | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('Corrente');
  const [color, setColor] = useState('bg-blue-500');

  const colors = [
    { label: 'Azul', value: 'bg-blue-500' },
    { label: 'Roxo', value: 'bg-purple-600' },
    { label: 'Laranja', value: 'bg-orange-500' },
    { label: 'Verde', value: 'bg-emerald-600' },
    { label: 'Cinza Escuro', value: 'bg-gray-800' },
    { label: 'Vermelho', value: 'bg-rose-500' },
  ];

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setType('Corrente');
    setColor('bg-blue-500');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, acc: BankAccount) => {
    e.stopPropagation();
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setColor(acc.color);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (editingAccount) onUpdate({ ...editingAccount, name, type, color });
    else onAdd({ id: Math.random().toString(36).substr(2, 9), name, type, color });
    setIsModalOpen(false);
  };

  const accountTransactions = viewingStatement
    ? transactions.filter(t => t.bankAccount === viewingStatement.name)
    : [];

  const accountBalance = accountTransactions.reduce((acc, t) => {
    return t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount;
  }, 0);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Minhas Contas</h2>
          <p className="text-slate-500">Clique para ver o extrato.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Nova Conta
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div
            key={acc.id}
            onClick={() => setViewingStatement(acc)}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
          >
            <div className={`h-1.5 ${acc.color}`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                  <BankLogo name={acc.name} size={32} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleOpenEdit(e, acc)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit3 size={16} /></button>
                  <button onClick={(e) => handleDelete(e, acc.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800">{acc.name}</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">{acc.type}</p>

              <div className="mt-4 flex items-center gap-2 text-emerald-600 font-medium">
                <FileText size={14} />
                <span className="text-xs uppercase tracking-wider font-bold">Ver Extrato</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Extrato Modal */}
      {viewingStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className={`p-6 text-white ${viewingStatement.color} flex justify-between items-center`}>
              <div className="flex items-center gap-4">
                <BankLogo name={viewingStatement.name} size={40} />
                <div>
                  <h3 className="text-xl font-bold">Extrato: {viewingStatement.name}</h3>
                  <p className="text-white/80 text-xs font-medium">Saldo: R$ {accountBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <button onClick={() => setViewingStatement(null)} className="p-2 hover:bg-white/20 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {accountTransactions.length > 0 ? accountTransactions.sort((a, b) => b.date.localeCompare(a.date)).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === TransactionType.INCOME ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t.description}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(t.date).toLocaleDateString('pt-BR')} • {t.category}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )) : <div className="py-12 text-center text-slate-400 text-sm">Nenhuma transação registrada.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Cadastro Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{editingAccount ? 'Editar Conta' : 'Nova Conta'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Banco</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Nubank" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                  <option value="Corrente">Corrente</option>
                  <option value="Poupança">Poupança</option>
                  <option value="Investimento">Investimento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button key={c.value} type="button" onClick={() => setColor(c.value)} className={`w-8 h-8 rounded-full ${c.value} border-2 ${color === c.value ? 'border-slate-800 scale-110' : 'border-transparent'}`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountsManager;
