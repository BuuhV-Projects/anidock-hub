import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, Trash2, Eye, Plus, Loader2, Database, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  getLocalIndexes,
  deleteLocalIndex,
  exportIndex,
  exportIndexData,
  type AnimeIndex,
} from '@/lib/localStorage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MyIndexes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cloudIndexes, setCloudIndexes] = useState<any[]>([]);
  const [localIndexes, setLocalIndexes] = useState<AnimeIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState<{ id: string; isLocal: boolean } | null>(null);

  useEffect(() => {
    loadIndexes();
  }, [user]);

  const loadIndexes = async () => {
    setIsLoading(true);
    try {
      // Load local indexes
      const local = getLocalIndexes();
      setLocalIndexes(local);

      // Load cloud indexes if user is logged in
      if (user) {
        const { data, error } = await supabase
          .from('indexes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCloudIndexes(data || []);
      }
    } catch (error: any) {
      console.error('Error loading indexes:', error);
      toast.error('Erro ao carregar indexações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (index: any, isLocal: boolean) => {
    try {
      if (isLocal) {
        exportIndex(index.id);
      } else {
        // Convert cloud index to AnimeIndex format
        const exportData: AnimeIndex = {
          id: index.public_id,
          driver_id: index.driver_id?.toString() || '',
          name: index.name,
          source_url: index.source_url,
          total_animes: index.total_animes,
          animes: index.index_data || [],
          created_at: index.created_at,
          updated_at: index.updated_at,
        };
        exportIndexData(exportData);
      }
      toast.success('Indexação exportada com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar indexação');
    }
  };

  const handleDeleteClick = (id: string, isLocal: boolean) => {
    setIndexToDelete({ id, isLocal });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!indexToDelete) return;

    try {
      if (indexToDelete.isLocal) {
        deleteLocalIndex(indexToDelete.id);
        setLocalIndexes(getLocalIndexes());
        toast.success('Indexação local removida');
      } else {
        const { error } = await supabase
          .from('indexes')
          .delete()
          .eq('public_id', indexToDelete.id);

        if (error) throw error;

        setCloudIndexes(cloudIndexes.filter(idx => idx.public_id !== indexToDelete.id));
        toast.success('Indexação removida da nuvem');
      }
    } catch (error: any) {
      console.error('Error deleting index:', error);
      toast.error('Erro ao remover indexação');
    } finally {
      setDeleteDialogOpen(false);
      setIndexToDelete(null);
    }
  };

  const totalIndexes = cloudIndexes.length + localIndexes.length;
  const totalAnimes = [
    ...cloudIndexes.map(idx => idx.total_animes),
    ...localIndexes.map(idx => idx.total_animes)
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Database className="h-8 w-8 text-primary animate-pulse-glow" />
            <h1 className="font-display text-2xl font-bold text-gradient-primary">
              Minhas Indexações
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="glass p-6 border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">
                  {isLoading ? '...' : totalIndexes}
                </p>
                <p className="text-sm text-muted-foreground">Total de Indexações</p>
              </div>
            </div>
          </Card>

          <Card className="glass p-6 border-border/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Eye className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">
                  {isLoading ? '...' : totalAnimes}
                </p>
                <p className="text-sm text-muted-foreground">Animes Indexados</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => navigate('/drivers')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan gap-2"
          >
            <Plus className="h-5 w-5" />
            Gerar Nova Indexação
          </Button>
          <Button
            onClick={() => navigate('/indexes/import')}
            variant="outline"
            className="border-primary/50 hover:bg-primary/10 gap-2"
          >
            <Download className="h-5 w-5" />
            Importar Indexação
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : totalIndexes === 0 ? (
          <Card className="glass p-12 text-center border-border/50">
            <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-display font-bold mb-2">
              Nenhuma Indexação Ainda
            </h3>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira indexação a partir de um driver
            </p>
            <Button
              onClick={() => navigate('/drivers')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-5 w-5 mr-2" />
              Começar
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Cloud Indexes */}
            {cloudIndexes.length > 0 && (
              <div>
                <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Indexações na Nuvem ({cloudIndexes.length})
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {cloudIndexes.map((index) => (
                    <Card key={index.public_id} className="glass p-6 border-border/50 hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-display font-bold text-lg mb-1">
                            {index.name}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {index.source_url}
                          </p>
                        </div>
                        {index.is_public && (
                          <Globe className="h-4 w-4 text-accent ml-2" />
                        )}
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Animes:</span>
                          <span className="font-bold ml-1 text-accent">{index.total_animes}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Criado em:</span>
                          <span className="ml-1">{new Date(index.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(index, false)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Exportar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(index.public_id, false)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Local Indexes */}
            {localIndexes.length > 0 && (
              <div>
                <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  Indexações Locais ({localIndexes.length})
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {localIndexes.map((index) => (
                    <Card key={index.id} className="glass p-6 border-border/50 hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-display font-bold text-lg mb-1">
                            {index.name}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {index.source_url}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Animes:</span>
                          <span className="font-bold ml-1 text-accent">{index.total_animes}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Criado em:</span>
                          <span className="ml-1">{new Date(index.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(index, true)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Exportar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(index.id, true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta indexação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyIndexes;
