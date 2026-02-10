
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionsList from './components/TransactionsList';
import InvestmentsBoard from './components/InvestmentsBoard';
import CreditCardsManager from './components/CreditCardsManager';
import BankAccountsManager from './components/BankAccountsManager';
import AIAdvisor from './components/AIAdvisor';
import { View, Transaction, TransactionType, BankAccount, Category, AppNotification, Investment, CreditCard } from './types';
import { INITIAL_CATEGORIES } from './constants'; // Fallback only
import { X, Bell, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import Settings from './components/Settings';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Login from './components/Login';

// Services
import { transactionService } from './src/services/transactionService';
import { accountService } from './src/services/accountService';
import { categoryService } from './src/services/categoryService';
import { investmentService } from './src/services/investmentService';
import { seedService } from './src/services/seedService';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);

  // UI State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    try {
      let [txs, accs, cats, invs, crds] = await Promise.all([
        transactionService.fetchAll(),
        accountService.fetchAccounts(),
        categoryService.fetchAll(),
        investmentService.fetchAll(),
        accountService.fetchCards()
      ]);

      // Seed data for new users
      if (!cats || cats.length === 0) {
        await seedService.seedInitialData();
        // Refetch seeded data
        [accs, cats] = await Promise.all([
          accountService.fetchAccounts(),
          categoryService.fetchAll()
        ]);
      }

      setTransactions(txs || []);
      setBankAccounts(accs || []);
      setCategories(cats || []);
      setInvestments(invs || []);
      setCards(crds || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Falha ao carregar dados. Tente novamente.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  const checkUpcomingPayments = useCallback(() => {
    const alerts: AppNotification[] = [];
    const today = new Date();
    const currentDay = today.getDate();

    // Check Credit Cards
    cards.forEach(card => {
      // Safely handle potentially missing dueDate
      if (!card.dueDate) return;
      const due = parseInt(card.dueDate);
      const diff = due - currentDay;
      if (diff >= 0 && diff <= 3) {
        alerts.push({
          id: `card-${card.id}-${today.getTime()}`,
          title: `Vencimento Próximo: ${card.name}`,
          message: `Sua fatura de R$ ${(card.used || 0).toLocaleString()} vence em ${diff === 0 ? 'hoje' : diff + ' dias'}.`,
          type: 'warning',
          date: new Date(),
          read: false
        });
      }
    });

    // Check Upcoming Expense Transactions
    transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
      const txDate = new Date(t.date);
      const diffTime = txDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3) {
        alerts.push({
          id: `tx-${t.id}-${today.getTime()}`,
          title: `Conta a pagar: ${t.description}`,
          message: `Pagamento de R$ ${t.amount.toLocaleString()} agendado para ${diffDays === 0 ? 'hoje' : 'daqui a ' + diffDays + ' dias'}.`,
          type: 'info',
          date: new Date(),
          read: false
        });
      }
    });

    setNotifications(alerts);
  }, [cards, transactions]);

  useEffect(() => {
    if (user) {
      setCurrentView('dashboard');
      fetchData();
    }
  }, [user, fetchData]);

  useEffect(() => {
    if (user && transactions.length > 0) {
      checkUpcomingPayments();
    }
  }, [transactions, cards, user, checkUpcomingPayments]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // --- Handlers ---

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    try {
      const created = await transactionService.create(newTx);
      setTransactions(prev => [created, ...prev]);
    } catch (e) {
      alert('Erro ao criar transação');
    }
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    try {
      const updated = await transactionService.update(updatedTx);
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (e) {
      alert('Erro ao atualizar transação');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert('Erro ao deletar transação');
    }
  };

  const handleAddCategory = async (name: string, type: TransactionType, color: string) => {
    try {
      const created = await categoryService.create({ name, type, color, is_default: false } as any);
      setCategories(prev => [...prev, created]);
    } catch (e) {
      alert('Erro ao criar categoria');
    }
  };

  const handleUpdateCategory = async (updatedCat: Category) => {
    try {
      const updated = await categoryService.update(updatedCat);
      setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (e) {
      alert('Erro ao atualizar categoria');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert('Erro ao deletar categoria');
    }
  };

  const handleAddBankAccount = async (acc: BankAccount) => {
    try {
      const { id, ...rest } = acc;
      // If ID is pseudo-random from UI, drop it to let DB generate UUID
      const created = await accountService.createAccount(rest);
      setBankAccounts(prev => [...prev, created]);
    } catch (e) {
      alert('Erro ao criar conta bancária');
    }
  };

  const handleUpdateBankAccount = async (updatedAcc: BankAccount) => {
    try {
      const updated = await accountService.updateAccount(updatedAcc);
      setBankAccounts(prev => prev.map(acc => acc.id === updated.id ? updated : acc));
    } catch (e) {
      alert('Erro ao atualizar conta');
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    try {
      await accountService.deleteAccount(id);
      setBankAccounts(prev => prev.filter(acc => acc.id !== id));
      // Update cards that might reference this account
      setCards(prev => prev.map(card => card.bankAccountId === id ? { ...card, bankAccountId: undefined } : card));
    } catch (e) {
      alert('Erro ao deletar conta');
    }
  };

  const handleAddInvestment = async (newInv: Omit<Investment, 'id'>) => {
    try {
      const created = await investmentService.create(newInv);
      setInvestments(prev => [...prev, created]);
    } catch (e) {
      alert('Erro ao criar investimento');
    }
  };

  const handleUpdateInvestment = async (updatedInv: Investment) => {
    try {
      const updated = await investmentService.update(updatedInv);
      setInvestments(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    } catch (e) {
      alert('Erro ao atualizar investimento');
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    try {
      await investmentService.delete(id);
      setInvestments(prev => prev.filter(inv => inv.id !== id));
    } catch (e) {
      alert('Erro ao deletar investimento');
    }
  };

  const handleAddCard = async (card: CreditCard) => {
    try {
      const { id, ...rest } = card;
      const created = await accountService.createCard(rest);
      setCards(prev => [...prev, created]);
    } catch (e) {
      alert('Erro ao criar cartão');
    }
  };

  const handleUpdateCard = async (updatedCard: CreditCard) => {
    try {
      const updated = await accountService.updateCard(updatedCard);
      setCards(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (e) {
      alert('Erro ao atualizar cartão');
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await accountService.deleteCard(id);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert('Erro ao deletar cartão');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} investments={investments} cards={cards} />;
      case 'bank-accounts':
        return <BankAccountsManager accounts={bankAccounts} transactions={transactions} onAdd={handleAddBankAccount} onUpdate={handleUpdateBankAccount} onDelete={handleDeleteBankAccount} />;
      case 'income':
        return <TransactionsList type={TransactionType.INCOME} transactions={transactions} bankAccounts={bankAccounts} categories={categories} onAdd={handleAddTransaction} onUpdate={handleUpdateTransaction} onDelete={handleDeleteTransaction} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />;
      case 'expenses':
        return <TransactionsList type={TransactionType.EXPENSE} transactions={transactions} bankAccounts={bankAccounts} categories={categories} onAdd={handleAddTransaction} onUpdate={handleUpdateTransaction} onDelete={handleDeleteTransaction} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />;
      case 'investments':
        return <InvestmentsBoard investments={investments} onAdd={handleAddInvestment} onUpdate={handleUpdateInvestment} onDelete={handleDeleteInvestment} />;
      case 'credit-cards':
        return <CreditCardsManager cards={cards} bankAccounts={bankAccounts} onAdd={handleAddCard} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} />;
      case 'ai-advisor':
        return <AIAdvisor transactions={transactions} investments={investments} cards={cards} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard transactions={transactions} investments={investments} cards={cards} />;
    }
  };

  // Show loading screen only if we're initializing auth without a user yet, or if data is actively loading
  if ((authLoading && !user) || dataLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Carregando seus dados...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        notifications={notifications}
        onShowNotifications={() => setShowNotificationCenter(true)}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
              <AlertTriangle size={20} />
              {error}
              <button onClick={fetchData} className="ml-auto p-1 hover:bg-red-100 rounded-full"><RefreshCw size={18} /></button>
            </div>
          )}
          {renderContent()}
        </div>
      </main>

      {/* Notification Center UI */}
      {showNotificationCenter && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Bell size={24} className="text-indigo-500" /> Alertas e Notificações
              </h3>
              <button onClick={() => setShowNotificationCenter(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.length > 0 ? (
                notifications.sort((a, b) => b.date.getTime() - a.date.getTime()).map(n => (
                  <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white border-slate-100 opacity-60' : 'bg-slate-50 border-indigo-100 shadow-sm'}`}>
                    <div className="flex gap-3">
                      <div className={`mt-1 p-2 rounded-lg ${n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {n.type === 'warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-800 text-sm">{n.title}</p>
                          {!n.read && <button onClick={() => markAsRead(n.id)} className="text-[10px] text-indigo-600 font-bold uppercase hover:underline">Lido</button>}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{n.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Bell size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Tudo em dia!</p>
                  <p className="text-sm">Você não possui notificações importantes no momento.</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShowNotificationCenter(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Fechar Centro de Alertas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
