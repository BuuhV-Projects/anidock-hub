import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@anidock/shared-ui';
import {
  ArrowLeft,
  ChevronDown,
  Cpu,
  Download,
  Eye,
  FileEdit,
  Loader2,
  Plus,
  Settings,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { db, Driver as IDBDriver, AnimeIndex } from '../lib/indexedDB';

const MyDrivers = () => {
  const [drivers, setDrivers] = useState<IDBDriver[]>([]);
  const [indexes, setIndexes] = useState<Record<string, AnimeIndex>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDriver, setDeleteDriver] = useState<IDBDriver | null>(null);
  const navigate = useNavigate();

  const fetchDrivers = useCallback(async () => {
    try {
      setIsLoading(true);
      await db.init();
      
      const driversList = await db.getAllDrivers();
      setDrivers(driversList);

      // Load indexes for each driver
      const indexesData: Record<string, AnimeIndex> = {};
      for (const driver of driversList) {
        const driverIndexes = await db.getIndexesByDriver(driver.id);
        if (driverIndexes.length > 0) {
          indexesData[driver.id] = driverIndexes[0]; // Use first index
        }
      }
      setIndexes(indexesData);
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      toast.error('Erro ao carregar drivers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleDelete = async () => {
    if (!deleteDriver) return;

    try {
      await db.init();
      
      // Delete associated indexes
      const driverIndexes = await db.getIndexesByDriver(deleteDriver.id);
      for (const index of driverIndexes) {
        await db.deleteIndex(index.id);
      }
      
      // Delete driver
      await db.deleteDriver(deleteDriver.id);

      toast.success('Driver excluído com sucesso!');
      setDrivers(drivers.filter(d => d.id !== deleteDriver.id));
      setDeleteDriver(null);
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast.error('Erro ao excluir driver');
    }
  };

  const handleExport = async (driver: IDBDriver) => {
    try {
      // Get index data for this driver
      const driverIndexes = await db.getIndexesByDriver(driver.id);
      const driverWithIndex = {
        ...driver,
        indexedData: driverIndexes.length > 0 ? driverIndexes[0].animes : [],
      };

      const json = JSON.stringify(driverWithIndex, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${driver.name.replace(/\s+/g, '-').toLowerCase()}-driver.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Driver exportado!');
    } catch (error: any) {
      console.error('Error exporting driver:', error);
      toast.error('Erro ao exportar driver');
    }
  };

  const handleViewIndexedAnimes = (driver: IDBDriver) => {
    const index = indexes[driver.id];
    if (!index) {
      toast.error('Este driver não tem indexações');
      return;
    }
    navigate(`/drivers/${driver.id}/edit-anime`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/browse')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="font-display text-2xl font-bold text-gradient-primary">
                Meus Drivers
              </h1>
            </div>
            <Button onClick={() => navigate('/drivers/create')} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Driver
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {drivers.length === 0 ? (
          <div className="text-center py-20">
            <Cpu className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nenhum driver encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Crie ou importe um driver para começar
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/drivers/create')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Criar com IA
              </Button>
              <Button variant="outline" onClick={() => navigate('/drivers/import')}>
                <Plus className="h-4 w-4 mr-2" />
                Importar Driver
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {drivers.map((driver) => {
              const index = indexes[driver.id];
              const totalAnimes = index?.totalAnimes || 0;

              return (
                <Card key={driver.id} className="p-6 border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{driver.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{driver.domain}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {totalAnimes} animes indexados
                        </span>
                        <span className="text-muted-foreground">
                          v{driver.version}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport(driver)}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/drivers/${driver.id}/edit`)}>
                          <FileEdit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {totalAnimes > 0 && (
                          <DropdownMenuItem onClick={() => handleViewIndexedAnimes(driver)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Animes
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setDeleteDriver(driver)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteDriver} onOpenChange={() => setDeleteDriver(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o driver "{deleteDriver?.name}"? 
              Esta ação não pode ser desfeita e todos os dados indexados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyDrivers;
