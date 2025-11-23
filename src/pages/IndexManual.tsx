import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Save, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnimeForm {
  id: string;
  title: string;
  synopsis: string;
  coverUrl: string;
  sourceUrl: string;
}

interface EpisodeForm {
  id: string;
  url: string;
  episodeNumber: number | null;
  title: string;
  thumbnailUrl: string;
  videoPlayerSelector: string;
  isExtracting: boolean;
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
  const [episodes, setEpisodes] = useState<EpisodeForm[]>([{
    id: crypto.randomUUID(),
    url: '',
    episodeNumber: null,
    title: '',
    thumbnailUrl: '',
    videoPlayerSelector: '',
    isExtracting: false
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

  const addEpisode = () => {
    setEpisodes([...episodes, {
      id: crypto.randomUUID(),
      url: '',
      episodeNumber: null,
      title: '',
      thumbnailUrl: '',
      videoPlayerSelector: '',
      isExtracting: false
    }]);
  };

  const removeEpisode = (id: string) => {
    if (episodes.length === 1) {
      toast.error('É necessário ter pelo menos um episódio');
      return;
    }
    setEpisodes(episodes.filter(e => e.id !== id));
  };

  const updateEpisode = (id: string, field: keyof EpisodeForm, value: any) => {
    setEpisodes(episodes.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const extractEpisodeData = async (id: string) => {
    const episode = episodes.find(e => e.id === id);
    if (!episode?.url) {
      toast.error('Insira a URL do episódio primeiro');
      return;
    }

    updateEpisode(id, 'isExtracting', true);

    try {
      const { data, error } = await supabase.functions.invoke('extract-video-data', {
        body: { url: episode.url, driver }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const extracted = data.data;
      
      updateEpisode(id, 'episodeNumber', extracted.episodeNumber);
      updateEpisode(id, 'title', extracted.title || '');
      updateEpisode(id, 'thumbnailUrl', extracted.thumbnailUrl || '');
      updateEpisode(id, 'videoPlayerSelector', extracted.videoPlayerSelector || '');

      toast.success('Dados extraídos com sucesso!');
    } catch (error: any) {
      console.error('Error extracting episode data:', error);
      toast.error('Erro ao extrair dados: ' + error.message);
    } finally {
      updateEpisode(id, 'isExtracting', false);
    }
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
          <Tabs defaultValue="animes" className="space-y-6">
            <Card className="glass p-6 border-border/50">
              <h2 className="font-display font-bold text-lg mb-2">
                {driver?.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione conteúdo manualmente ou use IA para extrair dados
              </p>
              
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="animes">Animes</TabsTrigger>
                <TabsTrigger value="videos">Episódios/Vídeos</TabsTrigger>
              </TabsList>
            </Card>

            <TabsContent value="animes" className="space-y-6">
              <Card className="glass p-6 border-border/50">
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
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
              <Card className="glass p-6 border-border/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {episodes.length} episódio{episodes.length !== 1 ? 's' : ''} adicionado{episodes.length !== 1 ? 's' : ''}
                  </p>
                  <Button
                    onClick={addEpisode}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Episódio
                  </Button>
                </div>
              </Card>

              {episodes.map((episode, index) => (
                <Card key={episode.id} className="glass p-6 border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold">
                      Episódio #{index + 1}
                    </h3>
                    {episodes.length > 1 && (
                      <Button
                        onClick={() => removeEpisode(episode.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`url-${episode.id}`}>
                          URL do Episódio <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`url-${episode.id}`}
                          value={episode.url}
                          onChange={(e) => updateEpisode(episode.id, 'url', e.target.value)}
                          placeholder="https://exemplo.com/anime/nome/episodio-1"
                          className="bg-input border-border"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => extractEpisodeData(episode.id)}
                          disabled={episode.isExtracting || !episode.url}
                          className="gap-2"
                        >
                          {episode.isExtracting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Extraindo...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Extrair com IA
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`number-${episode.id}`}>Número do Episódio</Label>
                        <Input
                          id={`number-${episode.id}`}
                          type="number"
                          value={episode.episodeNumber || ''}
                          onChange={(e) => updateEpisode(episode.id, 'episodeNumber', parseInt(e.target.value))}
                          placeholder="1"
                          className="bg-input border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`title-${episode.id}`}>Título (opcional)</Label>
                        <Input
                          id={`title-${episode.id}`}
                          value={episode.title}
                          onChange={(e) => updateEpisode(episode.id, 'title', e.target.value)}
                          placeholder="Nome do episódio"
                          className="bg-input border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`thumb-${episode.id}`}>URL da Thumbnail (opcional)</Label>
                      <Input
                        id={`thumb-${episode.id}`}
                        value={episode.thumbnailUrl}
                        onChange={(e) => updateEpisode(episode.id, 'thumbnailUrl', e.target.value)}
                        placeholder="https://exemplo.com/thumb.jpg"
                        className="bg-input border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`player-${episode.id}`}>
                        Seletor CSS do Player de Vídeo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`player-${episode.id}`}
                        value={episode.videoPlayerSelector}
                        onChange={(e) => updateEpisode(episode.id, 'videoPlayerSelector', e.target.value)}
                        placeholder="iframe, .video-player, #player"
                        className="bg-input border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Seletor CSS para encontrar o iframe/vídeo na página
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

              <Card className="glass p-6 border-border/50 bg-muted/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Dica:</strong> Cole a URL de um episódio e clique em "Extrair com IA" 
                  para que o sistema detecte automaticamente os dados. Os seletores do driver 
                  são usados como referência, mas você pode ajustar o seletor do player manualmente.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default IndexManual;
