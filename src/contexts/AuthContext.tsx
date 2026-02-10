import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '../../types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    isPasswordRecovery: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    setIsPasswordRecovery: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isPasswordRecovery: false,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    refreshProfile: async () => { },
    setIsPasswordRecovery: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
    const initialized = useRef(false);

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            console.log('Fetching profile for:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.warn('Profile not found for user:', userId);
                } else {
                    throw error;
                }
            }
            setProfile(data || null);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // Get initial session
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                if (mounted) {
                    setSession(initialSession);
                    setUser(initialSession?.user ?? null);

                    // Set loading false as soon as we have the user/session
                    setLoading(false);

                    if (initialSession?.user) {
                        fetchProfile(initialSession.user.id);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            console.log('Auth state change:', event);

            if (mounted) {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (event === 'PASSWORD_RECOVERY') {
                    setIsPasswordRecovery(true);
                }

                if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || (event === 'INITIAL_SESSION' && currentSession)) {
                    if (currentSession?.user) {
                        fetchProfile(currentSession.user.id);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setProfile(null);
                    setIsPasswordRecovery(false);
                }

                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            loading,
            isPasswordRecovery,
            signInWithGoogle,
            signOut,
            refreshProfile,
            setIsPasswordRecovery
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
