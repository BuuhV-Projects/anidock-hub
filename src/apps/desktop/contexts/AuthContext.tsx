import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@anidock/shared-utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Note: useEmailService will need to be moved or recreated in desktop app
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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (nickname: string, email: string, password: string) => Promise<{ error: any; email: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { sendWelcomeEmail } = useEmailService();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
