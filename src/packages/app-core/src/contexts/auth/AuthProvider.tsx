import { supabase } from '@anidock/shared-utils';
import { Session, User } from '@supabase/supabase-js';
import React, { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AuthContext } from './auth-context';

// Note: useEmailService will need to be moved or recreated in web app
// For now, we'll create a simple version here
const useEmailService = () => {
    const sendEmail = async ({ to, subject, type, data }: any) => {
        try {
            const { data: result, error } = await supabase.functions.invoke('send-email', {
                body: { to, subject, type, data }
            });

            if (error) throw error;

            if (result?.success) {
                console.log('Email enviado com sucesso:', result.id);
                return { success: true, id: result.id };
            } else {
                throw new Error(result?.error || 'Erro ao enviar email');
            }
        } catch (error: any) {
            console.error('Erro ao enviar email:', error);
            toast.error('Erro ao enviar email: ' + error.message);
            return { success: false, error: error.message };
        }
    };

    const sendWelcomeEmail = async (email: string, name?: string) => {
        return sendEmail({
            to: email,
            subject: 'Bem-vindo ao AniDock! 🎌',
            type: 'welcome',
            data: { name }
        });
    };

    return {
        sendEmail,
        sendWelcomeEmail
    };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState({
        subscribed: false,
        role: 'free' as 'free' | 'premium',
        productId: null as string | null,
        subscriptionEnd: null as string | null
    });
    const { sendWelcomeEmail } = useEmailService();

    const checkSubscription = async () => {
        if (!user) return;
        
        try {
            const { data, error } = await supabase.functions.invoke('check-subscription');
            
            if (error) {
                console.error('Error checking subscription:', error);
                return;
            }
            
            if (data) {
                setSubscriptionStatus({
                    subscribed: data.subscribed || false,
                    role: data.role || 'free',
                    productId: data.product_id || null,
                    subscriptionEnd: data.subscription_end || null
                });
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    useEffect(() => {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
                
                // Check subscription when auth state changes
                if (session?.user) {
                    checkSubscription();
                }
            }
        );

        // THEN check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            
            // Check subscription on initial load
            if (session?.user) {
                checkSubscription();
            }
        });

        return () => subscription.unsubscribe();
    }, []);
    
    // Auto-refresh subscription every 60 seconds
    useEffect(() => {
        if (!user) return;
        
        const interval = setInterval(() => {
            checkSubscription();
        }, 60000);
        
        return () => clearInterval(interval);
    }, [user]);

    const signUp = async (nickname: string, email: string, password: string) => {
        // First create the auth user without email confirmation
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth`
            }
        });

        if (error) {
            return { error, email: null };
        }

        // Create profile with nickname
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    user_id: user.id,
                    nickname,
                    display_name: nickname
                });

            if (profileError) {
                console.error('Error creating profile:', profileError);
            } else {
                // Send welcome email
                await sendWelcomeEmail(email, nickname);
            }
        }

        return { error: null, email };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            session, 
            signUp, 
            signIn, 
            signOut, 
            loading,
            subscriptionStatus,
            checkSubscription
        }}>
            {children}
        </AuthContext.Provider>
    );
};
