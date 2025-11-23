import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendEmailParams {
  to: string;
  subject: string;
  type: 'welcome' | 'notification' | 'custom';
  data?: {
    name?: string;
    message?: string;
    html?: string;
  };
}

export const useEmailService = () => {
  const sendEmail = async ({ to, subject, type, data }: SendEmailParams) => {
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

  const sendNotificationEmail = async (email: string, message: string) => {
    return sendEmail({
      to: email,
      subject: 'Nova notificação - AniDock',
      type: 'notification',
      data: { message }
    });
  };

  return {
    sendEmail,
    sendWelcomeEmail,
    sendNotificationEmail
  };
};