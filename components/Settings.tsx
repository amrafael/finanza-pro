
import React, { useState, useRef, useEffect } from 'react';
import { User, Shield, Download, Upload, LogOut, Mail, Smartphone, Save, CheckCircle, Camera, Loader, Trash2 } from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/lib/supabase';

const Settings: React.FC = () => {
    const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    // Form State
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading) {
            if (profile) {
                setFullName(profile.full_name || '');
                setPhone(profile.phone || '');
                setCpf(profile.cpf || '');
                setProfilePhoto(profile.avatar_url || null);
            }
            setLoading(false);
        }
    }, [profile, authLoading]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB');
                return;
            }
            // In a real app we'd upload to Supabase Storage here
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setUpdating(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: phone,
                    cpf: cpf,
                    avatar_url: profilePhoto
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err: any) {
            if (err.message?.includes('unique constraint')) {
                setError('CPF ou Telefone já estão em uso por outra conta.');
            } else {
                setError('Erro ao atualizar perfil.');
            }
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const handleExport = () => {
        // Here we would ideally fetch all data from Supabase to export
        // For now, let's just alert that this feature needs backend implementation for full export
        // Or strictly stick to what's in local state if we had it, but mostly we want to export DB data.
        // Let's keep it simple and just show a message or valid export if possible.
        alert('Funcionalidade de exportação será atualizada para usar dados da nuvem em breve.');
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        alert('Funcionalidade de importação será atualizada para usar dados da nuvem em breve.');
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader className="animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
                <p className="text-slate-500">Gerencie seu perfil e preferências da conta</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
                    <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className="relative group">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-24 h-24 rounded-full mb-4 overflow-hidden focus:outline-none focus:ring-4 focus:ring-emerald-500/30 group"
                                title="Clique para alterar a foto"
                            >
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt="Foto de perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
                                        {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </button>

                            {profilePhoto && (
                                <button
                                    onClick={() => setProfilePhoto(null)}
                                    className="absolute -top-1 -right-1 p-1.5 bg-red-100 text-red-600 rounded-full border-2 border-white shadow-sm hover:bg-red-200 transition-colors z-10"
                                    title="Remover foto"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{fullName || 'Usuário'}</h2>
                        <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Shield size={12} />
                            {profile?.subscription_tier === 'premium' ? 'Plano Premium' : 'Plano Gratuito'}
                        </div>
                    </div>
                    <div className="pt-6 space-y-4">
                        <div className="flex items-center gap-3 text-slate-600">
                            <Mail size={18} className="text-emerald-500" />
                            <span className="text-sm">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Smartphone size={18} className="text-emerald-500" />
                            <span className="text-sm">{phone || 'Sem telefone'}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-full mt-8 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} /> Sair da conta
                    </button>
                </div>

                {/* Edit Profile Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <User size={20} className="text-indigo-500" />
                        Dados Pessoais
                    </h3>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                            <input
                                type="text"
                                value={cpf}
                                disabled
                                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-4">
                        {showSuccess && (
                            <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-right">
                                <CheckCircle size={18} />
                                <span className="text-sm font-bold">Alterações salvas!</span>
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={updating}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {updating ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                            Salvar Alterações
                        </button>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-3">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        Gerenciamento de Dados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={handleExport} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    <Download size={20} className="text-slate-600 group-hover:text-indigo-600" />
                                </div>
                                <h4 className="font-bold text-slate-700">Exportar Dados</h4>
                            </div>
                            <p className="text-sm text-slate-500">Baixe uma cópia completa de suas transações e dados em formato JSON.</p>
                        </button>

                        <input
                            type="file"
                            ref={importInputRef}
                            onChange={handleImport}
                            accept=".json"
                            className="hidden"
                        />
                        <button onClick={() => importInputRef.current?.click()} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                    <Upload size={20} className="text-slate-600 group-hover:text-indigo-600" />
                                </div>
                                <h4 className="font-bold text-slate-700">Importar Backup</h4>
                            </div>
                            <p className="text-sm text-slate-500">Restaure seus dados a partir de um arquivo de backup anterior.</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
