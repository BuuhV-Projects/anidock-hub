import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/indexedDB';
import { Button } from '@anidock/shared-ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@anidock/shared-ui';
import { toast } from '@anidock/shared-ui';
import { Download, Upload, Database, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';

const Backup = () => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [stats, setStats] = useState<{
    drivers: number;
    indexes: number;
    watchHistory: number;
  } | null>(null);

  const loadStats = async () => {
    try {
      await db.init();
      
      const [drivers, indexes, watchHistory] = await Promise.all([
        db.getAllDrivers(),
        db.getAllIndexes(),
        db.getWatchHistory(),
      ]);

      setStats({
        drivers: drivers.length,
        indexes: indexes.length,
        watchHistory: watchHistory.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: 'Erro ao carregar estatísticas',
        description: 'Não foi possível carregar as estatísticas da biblioteca.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await db.exportAllData();
      
      // Create JSON file and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anidock-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup criado com sucesso',
        description: `Exportados: ${data.drivers.length} drivers, ${data.indexes.length} índices, ${data.watchHistory.length} históricos`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível criar o backup. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate structure
      if (!data.drivers && !data.indexes && !data.watchHistory) {
        throw new Error('Arquivo de backup inválido');
      }

      await db.importAllData(data);
      await loadStats();

      toast({
        title: 'Backup restaurado com sucesso',
        description: `Importados: ${data.drivers?.length || 0} drivers, ${data.indexes?.length || 0} índices, ${data.watchHistory?.length || 0} históricos`,
      });
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: 'Erro ao importar',
        description: error instanceof Error ? error.message : 'Arquivo de backup inválido ou corrompido.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os seus dados localmente (drivers, animes, histórico). Esta ação não pode ser desfeita!\n\nTem certeza que deseja continuar?')) {
      return;
    }

    try {
      await db.clearAllData();
      await loadStats();
      toast({
        title: 'Dados apagados',
        description: 'Todos os dados locais foram removidos.',
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: 'Erro ao limpar dados',
        description: 'Não foi possível apagar os dados. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Backup e Restauração</h1>
          <p className="text-muted-foreground">
            Exporte ou importe toda sua biblioteca local em um único arquivo JSON
          </p>
        </div>

        {/* Statistics Card */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Biblioteca Atual
              </CardTitle>
              <CardDescription>
                Resumo dos dados armazenados localmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <div className="text-3xl font-bold text-primary">{stats.drivers}</div>
                  <div className="text-sm text-muted-foreground mt-1">Drivers</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/10">
                  <div className="text-3xl font-bold text-secondary">{stats.indexes}</div>
                  <div className="text-sm text-muted-foreground mt-1">Índices</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/10">
                  <div className="text-3xl font-bold text-accent">{stats.watchHistory}</div>
                  <div className="text-sm text-muted-foreground mt-1">Histórico</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Backup
            </CardTitle>
            <CardDescription>
              Crie um arquivo JSON com todos os seus dados locais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong>Seguro:</strong> Seus dados permanecem locais e privados. 
                O backup é criado apenas no seu computador.
              </div>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
              size="lg"
            >
              {isExporting ? (
                <>Exportando...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Biblioteca
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Backup
            </CardTitle>
            <CardDescription>
              Restaure seus dados de um arquivo de backup JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong>Mesclagem inteligente:</strong> Dados importados serão mesclados 
                com os existentes. Duplicatas serão substituídas.
              </div>
            </div>
            <div>
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button 
                  asChild
                  disabled={isImporting}
                  className="w-full cursor-pointer"
                  size="lg"
                  variant="secondary"
                >
                  <span>
                    {isImporting ? (
                      <>Importando...</>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Arquivo de Backup
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam todos os seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong>Atenção:</strong> Limpar todos os dados é permanente e não pode ser desfeito. 
                Faça um backup antes de continuar!
              </div>
            </div>
            <Button 
              onClick={handleClearAll}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Backup;
