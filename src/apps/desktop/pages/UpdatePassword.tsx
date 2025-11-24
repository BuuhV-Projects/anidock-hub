import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Label, Card } from '@anidock/shared-ui';
import { Cpu, Lock } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';
import { passwordSchema } from '@anidock/shared-utils';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar senhas
    try {
      passwordSchema.parse(password);
      passwordSchema.parse(confirmPassword);
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Senha inválida';
      toast.error(errorMessage);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Senha atualizada com sucesso!');
      navigate('/auth');
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
            Redefinir senha
          </p>
        </div>

        <Card className="glass p-8 border-border/50">
          <h2 className="text-2xl font-display font-bold mb-2 text-foreground">
            Nova Senha
          </h2>
          <p className="text-muted-foreground mb-6">
            Digite sua nova senha abaixo.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Nova Senha
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={100}
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Confirmar Senha
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                maxLength={100}
                className="bg-input border-border"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
              disabled={isLoading}
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePassword;