import React, { useState, useEffect } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@anidock/shared-ui';
import { useAuth } from '../../contexts/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { Cpu, Upload, User, LogOut, Clock, Crown, Settings } from 'lucide-react';
import { useElectronApi } from '../../hooks/useElectronApi';
import { supabase } from '@anidock/shared-utils';

type BrowseHeaderProps = {
  user: ReturnType<typeof useAuth>['user'];
  navigate: ReturnType<typeof useNavigate>;
  isDesktop: boolean;
};

const DesktopCloseButton = () => {
  const { closeWindow } = useElectronApi();

  return (
    <Button
      variant="outline"
      onClick={closeWindow}
      className="text-muted-foreground hover:text-foreground gap-2"
    >
      <LogOut className="h-4 w-4" />
      Fechar
    </Button>
  );
};

export const BrowseHeader = ({ user, navigate, isDesktop }: BrowseHeaderProps) => {
  const { signOut, subscriptionStatus } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(subscriptionStatus.role === 'premium');
  }, [subscriptionStatus]);

  return (
    <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
            <h1 className="font-display text-2xl font-bold text-gradient-primary">AniDock</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/drivers/import')}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar Driver
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/history')}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <Clock className="h-4 w-4" />
              Histórico
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10 gap-2"
                  >
                    <User className="h-4 w-4" />
                    Perfil
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  {isPremium ? (
                    <DropdownMenuItem onClick={() => navigate('/subscription')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Gerenciar Assinatura
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate('/premium')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Planos Premium
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-primary/50 hover:bg-primary/10 gap-2"
              >
                <User className="h-4 w-4" />
                Entrar
              </Button>
            )}
            {isDesktop && <DesktopCloseButton />}
          </div>
        </div>
      </div>
    </header>
  );
};

