import { Button, Card, Skeleton } from '@anidock/shared-ui';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Plus, Database, Zap, Download, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/indexedDB';

const Dashboard = () => {
  const navigate = useNavigate();
  const [driversCount, setDriversCount] = useState(0);
  const [animesCount, setAnimesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Initialize IndexedDB
      await db.init();

      // Fetch drivers count
      const drivers = await db.getAllDrivers();
      setDriversCount(drivers.length);

      // Fetch indexes and count animes
      const indexes = await db.getAllIndexes();
      const totalAnimes = indexes.reduce((sum, index) => sum + index.totalAnimes, 0);
      setAnimesCount(totalAnimes);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erro ao carregar estatísticas');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="font-display text-3xl font-bold text-gradient-primary">AniDock</h1>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
          <p className="text-muted-foreground">
            Gerencie seus drivers e explore seu catálogo de animes
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Database className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold text-gradient-primary">{driversCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Drivers Instalados</p>
              </>
            )}
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-8 w-8 text-primary" />
                  <span className="text-3xl font-bold text-gradient-primary">{animesCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Animes Indexados</p>
              </>
            )}
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <Button 
              onClick={() => navigate('/drivers/create')}
              className="w-full"
            >
              Criar Novo Driver
            </Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/drivers')}
              >
                <Database className="h-4 w-4 mr-2" />
                Gerenciar Drivers
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/drivers/import')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Importar Driver
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/browse')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Explorar Catálogo
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/backup')}
              >
                <Download className="h-4 w-4 mr-2" />
                Backup e Restauração
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/settings')}
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">Sobre o AniDock</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AniDock é um indexador de animes 100% open source que funciona localmente no seu dispositivo.
              Todos os seus dados são armazenados localmente usando IndexedDB.
            </p>
            <p className="text-sm text-muted-foreground">
              Crie drivers personalizados ou use IA para gerar automaticamente usando sua própria API key.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
