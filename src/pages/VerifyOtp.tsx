import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Cpu, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      toast.error('Email não encontrado');
      navigate('/auth');
    }
  }, [email, navigate]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Digite o código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.verifyOtp({
      email: email!,
      token: otp,
      type: 'signup'
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error('Código inválido ou expirado');
    } else {
      toast.success('Conta verificada com sucesso!');
      navigate('/');
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email!,
    });
    
    setIsResending(false);
    
    if (error) {
      toast.error('Erro ao reenviar código');
    } else {
      toast.success('Novo código enviado para seu email!');
      setOtp('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
            <h1 className="font-display text-3xl font-bold text-gradient-primary">
              AniDock
            </h1>
          </div>
          <p className="text-muted-foreground">
            Verificação de conta
          </p>
        </div>

        <Card className="glass p-8 border-border/50">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2 text-foreground">
              Verifique seu Email
            </h2>
            <p className="text-muted-foreground">
              Enviamos um código de 6 dígitos para
            </p>
            <p className="text-primary font-semibold mt-1">
              {email}
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-center block">
                Digite o código
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="gap-2"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="border-border bg-input" />
                    <InputOTPSlot index={1} className="border-border bg-input" />
                    <InputOTPSlot index={2} className="border-border bg-input" />
                    <InputOTPSlot index={3} className="border-border bg-input" />
                    <InputOTPSlot index={4} className="border-border bg-input" />
                    <InputOTPSlot index={5} className="border-border bg-input" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                O código expira em 60 minutos
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Não recebeu o código?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-primary hover:text-primary/80"
              >
                {isResending ? 'Enviando...' : 'Reenviar código'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOtp;