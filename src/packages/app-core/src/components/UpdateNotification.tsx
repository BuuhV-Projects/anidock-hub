import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@anidock/shared-ui';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePlataform } from '../contexts/plataform/usePlataform';

interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  description?: string;
  downloadUrl?: string;
  isCritical?: boolean;
}

export function UpdateNotification() {
  const [updateInfo, _setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { appVersion, isDesktop } = usePlataform();

  useEffect(() => {
    // Disabled: no backend to check for updates
    // In a future version, this could check a GitHub releases API
    return;
  }, [appVersion, isDesktop]);

  const handleDownload = () => {
    if (updateInfo?.downloadUrl) {
      window.open(updateInfo.downloadUrl, '_blank');
    }
    setIsOpen(false);
  };

  if (!updateInfo) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {updateInfo.isCritical ? 'Atualização Crítica Disponível!' : 'Nova Versão Disponível!'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Uma nova versão do AniDock está disponível.
            </p>
            <div className="text-sm">
              <p><strong>Versão Atual:</strong> {updateInfo.currentVersion}</p>
              <p><strong>Nova Versão:</strong> {updateInfo.latestVersion}</p>
            </div>
            {updateInfo.description && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm">{updateInfo.description}</p>
              </div>
            )}
            {updateInfo.isCritical && (
              <p className="text-destructive font-medium text-sm mt-2">
                Esta é uma atualização crítica e é recomendado atualizar o mais rápido possível.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!updateInfo.isCritical && (
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Lembrar Depois
            </button>
          )}
          <AlertDialogAction onClick={handleDownload}>
            {updateInfo.downloadUrl ? 'Baixar Atualização' : 'OK'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
