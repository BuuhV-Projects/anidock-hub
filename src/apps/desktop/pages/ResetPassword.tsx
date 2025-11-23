import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@anidock/shared-ui'button';
import { Input } from '@anidock/shared-ui'input';
import { Label } from '@anidock/shared-ui'label';
import { Card } from '@anidock/shared-ui'card';
import { Cpu, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';
import { resetPasswordSchema } from '@anidock/shared-utils';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar input
    try {
      resetPasswordSchema.parse({ email });
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Email inválido';
      toast.error(errorMessage);
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      setEmailSent(true);
      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
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
            Recuperação de senha
          </p>
        </div>

        <Card className="glass p-8 border-border/50">
          {!emailSent ? (
            <>
              <h2 className="text-2xl font-display font-bold mb-2 text-foreground">
                Esqueceu sua senha?
              </h2>
              <p className="text-muted-foreground mb-6">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input border-border"
                    maxLength={255}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Email Enviado!
              </h2>
              <p className="text-muted-foreground">
                Enviamos um link de recuperação para <strong>{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full border-primary/50 hover:bg-primary/10"
              >
                Voltar para Login
              </Button>
            </div>
          )}

          {!emailSent && (
            <div className="mt-6 text-center">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Login
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;