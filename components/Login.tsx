import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { Shield, Mail, Lock, ArrowRight, Wallet, AlertCircle, Phone, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'update-password';

const Login: React.FC = () => {
    const { isPasswordRecovery, setIsPasswordRecovery } = useAuth();
    const [authMode, setAuthMode] = useState<AuthMode>('signin');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isPasswordRecovery) {
            setAuthMode('update-password');
        }
    }, [isPasswordRecovery]);

    const maskCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (authMode === 'signup') {
                if (name.trim().length < 3) throw new Error('Insira seu nome completo.');
                if (cpf.replace(/\D/g, '').length !== 11) throw new Error('CPF deve ter 11 dígitos.');
                if (phone.replace(/\D/g, '').length < 10) throw new Error('Telefone inválido.');

                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                            avatar_url: '',
                            cpf: cpf.replace(/\D/g, ''),
                            phone: phone.replace(/\D/g, '')
                        }
                    }
                });
                if (error) throw error;

                if (data?.user && !data?.session) {
                    setMessage('Cadastro realizado! Verifique seu e-mail para confirmar sua conta antes de entrar.');
                } else {
                    setMessage('Cadastro realizado com sucesso!');
                }
            } else if (authMode === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else if (authMode === 'forgot-password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/`,
                });
                if (error) throw error;
                setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
            } else if (authMode === 'update-password') {
                if (password !== confirmPassword) throw new Error('As senhas não coincidem.');
                if (password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');

                const { error } = await supabase.auth.updateUser({
                    password,
                });
                if (error) throw error;

                setIsPasswordRecovery(false);
                setMessage('Senha atualizada com sucesso! Você já pode acessar o sistema.');
                setAuthMode('signin');
            }
        } catch (err: any) {
            console.error('Auth Error:', err);
            if (err.message?.includes('unique constraint') || err.code === '23505') {
                setError('CPF ou Telefone já cadastrados em outra conta.');
            } else if (err.status === 429 || err.message?.includes('rate limit')) {
                setError('Muitas tentativas. Por favor, aguarde alguns minutos.');
            } else if (err.message?.includes('User already registered') || err.message?.includes('already registered')) {
                setError('Este e-mail já possui cadastro. Tente fazer login.');
            } else if (err.message?.includes('Invalid login credentials') || err.status === 400) {
                setError('E-mail ou senha incorretos. Verifique também se confirmou seu e-mail.');
            } else {
                setError(err.message || 'Erro ao realizar operação. Verifique seus dados.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderTitle = () => {
        switch (authMode) {
            case 'signup': return 'Criar Nova Conta';
            case 'forgot-password': return 'Recuperar Senha';
            case 'update-password': return 'Nova Senha';
            default: return 'Acesse sua Conta';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-8 bg-gradient-to-br from-emerald-800 to-teal-900 text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                        <Wallet size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Finanza Pro</h1>
                    <p className="text-emerald-100/80 text-sm">Controle financeiro inteligente</p>
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        {authMode !== 'update-password' && <Shield className="text-emerald-600" size={24} />}
                        {renderTitle()}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm flex items-center gap-2">
                            <Shield size={16} />
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        {(authMode === 'signin' || authMode === 'signup' || authMode === 'forgot-password') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        disabled={loading}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>
                        )}

                        {authMode === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={cpf}
                                            onChange={(e) => setCpf(maskCPF(e.target.value))}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
                                            placeholder="000.000.000-00"
                                            maxLength={14}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Celular</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(maskPhone(e.target.value))}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {(authMode === 'signin' || authMode === 'signup' || authMode === 'update-password') && (
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Senha</label>
                                    {authMode === 'signin' && (
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode('forgot-password')}
                                            className="text-xs text-emerald-700 font-bold hover:underline"
                                        >
                                            Esqueceu sua senha?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        {authMode === 'update-password' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {authMode === 'signin' && 'Entrar'}
                                    {authMode === 'signup' && 'Cadastrar'}
                                    {authMode === 'forgot-password' && 'Enviar E-mail de Recuperação'}
                                    {authMode === 'update-password' && 'Redefinir Senha'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center space-y-3">
                        {authMode !== 'update-password' && (
                            <p className="text-slate-600 text-sm">
                                {authMode === 'signup' ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                                <button
                                    onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                                    className="ml-1 text-emerald-700 font-bold hover:underline"
                                >
                                    {authMode === 'signup' ? 'Fazer Login' : 'Cadastre-se'}
                                </button>
                            </p>
                        )}

                        {(authMode === 'forgot-password' || (authMode === 'signup' && !isPasswordRecovery)) && (
                            <button
                                onClick={() => setAuthMode('signin')}
                                className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors mx-auto"
                            >
                                <ArrowLeft size={16} /> Voltar para o login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
