import React from 'react';
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard, BrainCircuit, Menu, X, Landmark, Bell, User } from 'lucide-react';
import { View, AppNotification } from '../types';
import { useAuth } from '../src/contexts/AuthContext';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  notifications: AppNotification[];
  onShowNotifications: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, notifications, onShowNotifications }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { profile } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bank-accounts', label: 'Contas', icon: Landmark },
    { id: 'income', label: 'Entradas', icon: ArrowUpCircle },
    { id: 'expenses', label: 'Saídas', icon: ArrowDownCircle },
    { id: 'investments', label: 'Investimentos', icon: Wallet },
    { id: 'credit-cards', label: 'Cartões', icon: CreditCard },
    { id: 'ai-advisor', label: 'AI Advisor', icon: BrainCircuit },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-900/30">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                Finanza Pro
              </h1>
            </div>
            <button
              onClick={onShowNotifications}
              className="relative p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${currentView === item.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={() => {
                setCurrentView('settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || 'Usuário'} className="w-full h-full object-cover" />
                ) : (
                  getInitials(profile?.full_name || null)
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{profile?.full_name || 'Usuário'}</p>
                <p className="text-xs text-slate-500 truncate">
                  {profile?.subscription_tier === 'premium' ? 'Plano Premium' : 'Plano Gratuito'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
