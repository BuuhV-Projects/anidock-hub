import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Cpu, 
  Globe, 
  Lock, 
  Download, 
  Trash2, 
  Plus,
  Eye,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Driver {
  id: number;
  public_id: string;
  name: string;
  domain: string;
  is_public: boolean;
  config: any;
  created_at: string;
}

const MyDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDriver, setDeleteDriver] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchDrivers();
  }, [user, navigate]);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDrivers(data || []);
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      toast.error('Erro ao carregar drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDriver) return;

    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', deleteDriver.id);

      if (error) throw error;

      toast.success('Driver excluído com sucesso!');
      setDrivers(drivers.filter(d => d.id !== deleteDriver.id));
      setDeleteDriver(null);
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast.error('Erro ao excluir driver');
    }
  };

  const handleExport = (driver: Driver) => {
    const exportData = {
      name: driver.name,
      domain: driver.domain,
      config: driver.config,
      version: '1.0',
      exported_at: new Date().toISOString()
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${driver.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Driver exportado!');
  };

  const togglePublic = async (driver: Driver) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_public: !driver.is_public })
        .eq('id', driver.id);

      if (error) throw error;

      toast.success(
        driver.is_public 
          ? 'Driver agora é privado' 
          : 'Driver agora é público'
      );
      
      setDrivers(drivers.map(d => 
        d.id === driver.id 
          ? { ...d, is_public: !d.is_public } 
          : d
      ));
    } catch (error: any) {
      console.error('Error updating driver:', error);
      toast.error('Erro ao atualizar driver');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="font-display text-2xl font-bold text-gradient-primary">
                Meus Drivers
              </h1>
            </div>
            <Button
              onClick={() => navigate('/drivers/create')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Novo
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : drivers.length === 0 ? (
          <Card className="glass p-12 border-border/50 text-center">
            <Cpu className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-display font-bold mb-2">
              Nenhum driver criado ainda
            </h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro driver para começar a indexar animes
            </p>
            <Button
              onClick={() => navigate('/drivers/create')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Driver
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => (
              <Card
                key={driver.id}
                className="glass p-6 border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg mb-1">
                      {driver.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {driver.domain}
                    </p>
                  </div>
                  <Badge
                    variant={driver.is_public ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {driver.is_public ? (
                      <>
                        <Globe className="h-3 w-3" />
                        Público
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" />
                        Privado
                      </>
                    )}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground mb-4">
                  Criado em {new Date(driver.created_at).toLocaleDateString('pt-BR')}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDriver(driver)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(driver)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePublic(driver)}
                  >
                    {driver.is_public ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteDriver(driver)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDriver} onOpenChange={() => setDeleteDriver(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Driver?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o driver "{deleteDriver?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Driver Dialog */}
      <AlertDialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              {selectedDriver?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Domínio:</p>
                  <p className="text-sm">{selectedDriver?.domain}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Visibilidade:</p>
                  <div className="flex items-center gap-2">
                    {selectedDriver?.is_public ? (
                      <>
                        <Globe className="h-4 w-4 text-accent" />
                        <span className="text-sm text-accent">Público</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">Privado</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Configuração:</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-64 text-xs">
                    {JSON.stringify(selectedDriver?.config, null, 2)}
                  </pre>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyDrivers;
