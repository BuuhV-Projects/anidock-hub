import React from 'react';
import { Button } from '@anidock/shared-ui';
import { useNavigate } from 'react-router-dom';
import { Cpu, Upload, Clock, LogOut, Settings } from 'lucide-react';
import { useElectronApi } from '../../hooks/useElectronApi';

type BrowseHeaderProps = {
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

export const BrowseHeader = ({ isDesktop }: BrowseHeaderProps) => {
  const navigate = useNavigate();

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
            <Button
              variant="ghost"
              onClick={() => navigate('/drivers')}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <Cpu className="h-4 w-4" />
              Meus Drivers
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
            {isDesktop && <DesktopCloseButton />}
          </div>
        </div>
      </div>
    </header>
  );
};
