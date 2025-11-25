import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (nickname: string, email: string, password: string) => Promise<{ error: any; email: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  subscriptionStatus: {
    subscribed: boolean;
    role: 'free' | 'premium';
    productId: string | null;
    subscriptionEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
  checkSubscription: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

