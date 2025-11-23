import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AnimeForm {
  id: string;
  title: string;
  synopsis: string;
  coverUrl: string;
  sourceUrl: string;
}

const IndexManual = () => {
  const { driverId } = useParams();
  const [driver, setDriver] = useState<any>(null);
  const [animes, setAnimes] = useState<AnimeForm[]>([{
    id: crypto.randomUUID(),
    title: '',
    synopsis: '',
    coverUrl: '',
    sourceUrl: ''
  }]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchDriver();
  }, [user, driverId, navigate]);

  const fetchDriver = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('public_id', driverId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setDriver(data);

      // Se já tem animes indexados, carregar
      if (data.indexed_data && Array.isArray(data.indexed_data)) {
        setAnimes(data.indexed_data.map((anime: any) => ({
          id: anime.id || crypto.randomUUID(),
          title: anime.title || '',
          synopsis: anime.synopsis || '',
          coverUrl: anime.coverUrl || '',
          sourceUrl: anime.sourceUrl || ''
        })));
      }
    } catch (error: any) {
      console.error('Error fetching driver:', error);
      toast.error('Erro ao carregar driver');
      navigate('/drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const addAnime = () => {
    setAnimes([...animes, {
      id: crypto.randomUUID(),
      title: '',
      synopsis: '',
      coverUrl: '',
      sourceUrl: ''
    }]);
  };

  const removeAnime = (id: string) => {
    if (animes.length === 1) {
      toast.error('É necessário ter pelo menos um anime');
      return;
    }
    setAnimes(animes.filter(a => a.id !== id));
  };

  const updateAnime = (id: string, field: keyof AnimeForm, value: string) => {
    setAnimes(animes.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const handleSave = async () => {
    // Validar animes
    const validAnimes = animes.filter(a => a.title.trim() && a.sourceUrl.trim());
    
    if (validAnimes.length === 0) {
      toast.error('Adicione pelo menos um anime com título e URL');
      return;
    }

    setIsSaving(true);

    try {
      // Formatar animes no formato esperado
      const formattedAnimes = validAnimes.map(anime => ({
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        driverId: driver.public_id,
        title: anime.title,
        synopsis: anime.synopsis || null,
        coverUrl: anime.coverUrl || null,
        sourceUrl: anime.sourceUrl,
        episodes: [],
        metadata: {
          crawledAt: new Date().toISOString(),
          manuallyAdded: true
        }
      }));

      // Atualizar driver com os animes
      const { error } = await supabase
        .from('drivers')
        .update({
          indexed_data: formattedAnimes,
          source_url: driver.source_url,
          total_animes: formattedAnimes.length,
          last_indexed_at: new Date().toISOString(),
        })
        .eq('id', driver.id);

      if (error) throw error;

      toast.success(`${formattedAnimes.length} animes adicionados com sucesso!`);
      
      // Redirecionar após 1 segundo
      setTimeout(() => {
        navigate('/drivers');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving animes:', error);
      toast.error('Erro ao salvar animes');
    } finally {
      setIsSaving(false);
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
                onClick={() => navigate('/drivers')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-display text-2xl font-bold text-gradient-primary">
                Adicionar Animes Manualmente
              </h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="glass p-6 border-border/50">
              <h2 className="font-display font-bold text-lg mb-2">
                {driver?.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione os animes manualmente seguindo a estrutura do driver
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {animes.length} anime{animes.length !== 1 ? 's' : ''} adicionado{animes.length !== 1 ? 's' : ''}
                </p>
                <Button
                  onClick={addAnime}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Anime
                </Button>
              </div>
            </Card>

            {animes.map((anime, index) => (
              <Card key={anime.id} className="glass p-6 border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold">
                    Anime #{index + 1}
                  </h3>
                  {animes.length > 1 && (
                    <Button
                      onClick={() => removeAnime(anime.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`title-${anime.id}`}>
                      Título <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`title-${anime.id}`}
                      value={anime.title}
                      onChange={(e) => updateAnime(anime.id, 'title', e.target.value)}
                      placeholder="Nome do anime"
                      className="bg-input border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`url-${anime.id}`}>
                      URL da Página <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`url-${anime.id}`}
                      value={anime.sourceUrl}
                      onChange={(e) => updateAnime(anime.id, 'sourceUrl', e.target.value)}
                      placeholder="https://exemplo.com/anime/nome-do-anime"
                      className="bg-input border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`cover-${anime.id}`}>URL da Capa (opcional)</Label>
                    <Input
                      id={`cover-${anime.id}`}
                      value={anime.coverUrl}
                      onChange={(e) => updateAnime(anime.id, 'coverUrl', e.target.value)}
                      placeholder="https://exemplo.com/imagens/capa.jpg"
                      className="bg-input border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`synopsis-${anime.id}`}>Sinopse (opcional)</Label>
                    <Textarea
                      id={`synopsis-${anime.id}`}
                      value={anime.synopsis}
                      onChange={(e) => updateAnime(anime.id, 'synopsis', e.target.value)}
                      placeholder="Descrição do anime..."
                      className="bg-input border-border min-h-[100px]"
                    />
                  </div>
                </div>
              </Card>
            ))}

            <Card className="glass p-6 border-border/50 bg-muted/20">
              <p className="text-sm text-muted-foreground">
                <strong>Dica:</strong> Todos os animes adicionados devem seguir a mesma estrutura 
                de páginas do site {driver?.domain}. O driver irá tentar extrair os episódios 
                automaticamente quando você acessar cada anime.
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default IndexManual;
