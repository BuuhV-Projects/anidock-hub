import React from 'react';
import { Button } from '@anidock/shared-ui';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Cpu, LayoutDashboard, Library as LibraryIcon, LogOut } from 'lucide-react';
import { useElectronApi } from '../../hooks/useElectronApi';
import { LanguageSelector } from '../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

type BrowseHeaderProps = {
  isDesktop: boolean;
};

const DesktopCloseButton = () => {
  const { closeWindow } = useElectronApi();
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      onClick={closeWindow}
      className="text-muted-foreground hover:text-foreground gap-2"
    >
      <LogOut className="h-4 w-4" />
      {t('common.back')}
    </Button>
  );
};

export const BrowseHeader = ({ isDesktop }: BrowseHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
            <h1 className="font-display text-2xl font-bold text-gradient-primary">AniDock</h1>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Button
              variant="ghost"
              onClick={() => navigate('/library')}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LibraryIcon className="h-4 w-4" />
              Biblioteca
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/stats')}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('dashboard.title')}
            </Button>
            {isDesktop && <DesktopCloseButton />}
          </div>
        </div>
      </div>
    </header>
  );
};
