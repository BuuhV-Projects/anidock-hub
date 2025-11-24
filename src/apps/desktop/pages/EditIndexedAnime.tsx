import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, Input, Label, Textarea } from '@anidock/shared-ui';
import { ArrowLeft, Plus, Trash2, Save, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@anidock/shared-ui';

interface EpisodeForm {
  id: string;
  url: string;
  episodeNumber: number | null;
  title: string;
  thumbnailUrl: string;
  videoPlayerSelector: string;
  hasEmbeddedPlayer: boolean | null;
  externalLinkSelector: string;
  isExtracting: boolean;
}

interface AnimeData {
  id: string;
  title: string;
  synopsis?: string;
  coverUrl?: string;
  sourceUrl: string;
  episodes: any[];
}

const EditIndexedAnime = () => {
  const { driverId } = useParams();
  const [searchParams] = useSearchParams();
  const animeId = searchParams.get('animeId');
  
  const [driver, setDriver] = useState<any>(null);
  const [index, setIndex] = useState<any>(null);
  const [animes, setAnimes] = useState<AnimeData[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>(animeId || '');
  const [selectedAnime, setSelectedAnime] = useState<AnimeData | null>(null);
  
  const [animeForm, setAnimeForm] = useState({
    title: '',
    synopsis: '',
    coverUrl: '',
    sourceUrl: ''
  });
  
  const [episodes, setEpisodes] = useState<EpisodeForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchDriverAndIndex();
  }, [user, driverId, navigate]);

  useEffect(() => {
    if (selectedAnimeId && animes.length > 0) {
      const anime = animes.find(a => a.id === selectedAnimeId);
      if (anime) {
        setSelectedAnime(anime);
        setAnimeForm({
          title: anime.title,
          synopsis: anime.synopsis || '',
          coverUrl: anime.coverUrl || '',
          sourceUrl: anime.sourceUrl
        });
        
        // Carregar episódios existentes ou criar formulário vazio
        if (anime.episodes && anime.episodes.length > 0) {
          setEpisodes(anime.episodes.map((ep: any) => ({
            id: ep.id || crypto.randomUUID(),
            url: ep.sourceUrl || '',
            episodeNumber: ep.episodeNumber,
            title: ep.title || '',
            thumbnailUrl: ep.thumbnailUrl || '',
            videoPlayerSelector: '',
            hasEmbeddedPlayer: null,
            externalLinkSelector: '',
            isExtracting: false
          })));
        } else {
          setEpisodes([{
            id: crypto.randomUUID(),
            url: '',
            episodeNumber: null,
            title: '',
            thumbnailUrl: '',
            videoPlayerSelector: '',
            hasEmbeddedPlayer: null,
            externalLinkSelector: '',
            isExtracting: false
          }]);
        }
      }
    }
  }, [selectedAnimeId, animes]);

  const fetchDriverAndIndex = async () => {
    try {
      setIsLoading(true);
      
      // Buscar driver
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('public_id', driverId)
        .eq('user_id', user?.id)
        .single();

      if (driverError) throw driverError;
      setDriver(driverData);

      // Buscar index
      const { data: indexData, error: indexError } = await supabase
        .from('indexes')
        .select('*')
        .eq('driver_id', driverData.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (indexError) throw indexError;
      
      if (indexData && indexData.index_data) {
        setIndex(indexData);
        const indexedAnimes = Array.isArray(indexData.index_data) ? indexData.index_data as any[] : [];
        setAnimes(indexedAnimes);
        
        // Se animeId foi passado via URL, selecionar automaticamente
        if (animeId && indexedAnimes.length > 0) {
          setSelectedAnimeId(animeId);
        }
      } else {
        toast.error('Nenhum anime indexado encontrado para este driver');
        navigate('/drivers');
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
      navigate('/drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const addEpisode = () => {
    setEpisodes([...episodes, {
      id: crypto.randomUUID(),
      url: '',
      episodeNumber: (episodes.length > 0 ? Math.max(...episodes.map(e => e.episodeNumber || 0)) + 1 : 1),
      title: '',
      thumbnailUrl: '',
      videoPlayerSelector: '',
      hasEmbeddedPlayer: null,
      externalLinkSelector: '',
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
        body: { 
          episode_url: episode.url,
          external_link_selector: driver?.config?.selectors?.externalLinkSelector
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const extracted = data.data;
      
      setEpisodes(episodes.map(e => 
        e.id === id 
          ? { 
              ...e, 
              episodeNumber: extracted.episodeNumber ?? e.episodeNumber,
              title: extracted.title || e.title,
              thumbnailUrl: extracted.thumbnailUrl || e.thumbnailUrl,
              videoPlayerSelector: extracted.videoSelector || e.videoPlayerSelector,
              hasEmbeddedPlayer: extracted.hasEmbeddedPlayer,
              externalLinkSelector: extracted.externalLinkSelector || e.externalLinkSelector,
              isExtracting: false
            } 
          : e
      ));

      const playerType = extracted.hasEmbeddedPlayer ? 'Player Embarcado' : 'Link Externo';
      toast.success(`Dados extraídos! Tipo: ${playerType}`);
    } catch (error: any) {
      console.error('Error extracting episode data:', error);
      toast.error('Erro ao extrair dados: ' + error.message);
      updateEpisode(id, 'isExtracting', false);
    }
  };

  const handleSave = async () => {
    if (!selectedAnime) {
      toast.error('Selecione um anime para editar');
      return;
    }

    // Validar episódios
    const validEpisodes = episodes.filter(e => 
      e.url.trim() && e.episodeNumber !== null
    );

    if (validEpisodes.length === 0) {
      toast.error('Adicione pelo menos um episódio com URL e número');
      return;
    }

    setIsSaving(true);

    try {
      // Formatar episódios
      const formattedEpisodes = validEpisodes.map(ep => ({
        id: ep.id,
        episodeNumber: ep.episodeNumber,
        title: ep.title || `Episódio ${ep.episodeNumber}`,
        sourceUrl: ep.url,
        thumbnailUrl: ep.thumbnailUrl || null,
        watched: false
      }));

      // Atualizar anime no index_data
      const updatedAnimes = animes.map(anime => 
        anime.id === selectedAnimeId 
          ? {
              ...anime,
              title: animeForm.title,
              synopsis: animeForm.synopsis || null,
              coverUrl: animeForm.coverUrl || null,
              sourceUrl: animeForm.sourceUrl,
              episodes: formattedEpisodes
            }
          : anime
      );

      // Atualizar index
      const { error } = await supabase
        .from('indexes')
        .update({
          index_data: updatedAnimes as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', index.id);

      if (error) throw error;

      toast.success(`Anime atualizado com ${formattedEpisodes.length} episódios!`);
      
      setTimeout(() => {
        navigate('/drivers');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving anime:', error);
      toast.error('Erro ao salvar anime');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
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
                Editar Anime Indexado
              </h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !selectedAnimeId}
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
                Selecione um anime para editar e adicionar episódios
              </p>
              
              <div>
                <Label htmlFor="anime-select">Selecionar Anime</Label>
                <Select value={selectedAnimeId} onValueChange={setSelectedAnimeId}>
                  <SelectTrigger id="anime-select" className="bg-input border-border">
                    <SelectValue placeholder="Escolha um anime..." />
                  </SelectTrigger>
                  <SelectContent>
                    {animes.map((anime) => (
                      <SelectItem key={anime.id} value={anime.id}>
                        {anime.title} {anime.episodes?.length > 0 ? `(${anime.episodes.length} eps)` : '(sem episódios)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {selectedAnime && (
              <>
                <Card className="glass p-6 border-border/50">
                  <h3 className="font-display font-bold text-lg mb-4">Informações do Anime</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
                      <Input
                        id="title"
                        value={animeForm.title}
                        onChange={(e) => setAnimeForm({ ...animeForm, title: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cover">URL da Capa</Label>
                      <Input
                        id="cover"
                        value={animeForm.coverUrl}
                        onChange={(e) => setAnimeForm({ ...animeForm, coverUrl: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="synopsis">Sinopse</Label>
                      <Textarea
                        id="synopsis"
                        value={animeForm.synopsis}
                        onChange={(e) => setAnimeForm({ ...animeForm, synopsis: e.target.value })}
                        className="bg-input border-border min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sourceUrl">URL Original</Label>
                      <Input
                        id="sourceUrl"
                        value={animeForm.sourceUrl}
                        onChange={(e) => setAnimeForm({ ...animeForm, sourceUrl: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="glass p-6 border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-lg">Episódios</h3>
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

                  <div className="space-y-6">
                    {episodes.map((episode, index) => (
                      <Card key={episode.id} className="glass p-4 border-border/30">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-display font-semibold">
                            Episódio #{episode.episodeNumber || index + 1}
                          </h4>
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
                              <Label htmlFor={`ep-url-${episode.id}`}>
                                URL do Episódio <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`ep-url-${episode.id}`}
                                value={episode.url}
                                onChange={(e) => updateEpisode(episode.id, 'url', e.target.value)}
                                placeholder="https://exemplo.com/anime/ep1"
                                className="bg-input border-border"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                onClick={() => extractEpisodeData(episode.id)}
                                disabled={episode.isExtracting || !episode.url}
                                className="gap-2"
                                size="sm"
                              >
                                {episode.isExtracting ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Extraindo...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4" />
                                    Extrair IA
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`ep-number-${episode.id}`}>
                                Número <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`ep-number-${episode.id}`}
                                type="number"
                                value={episode.episodeNumber || ''}
                                onChange={(e) => updateEpisode(episode.id, 'episodeNumber', parseInt(e.target.value) || null)}
                                className="bg-input border-border"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`ep-title-${episode.id}`}>Título</Label>
                              <Input
                                id={`ep-title-${episode.id}`}
                                value={episode.title}
                                onChange={(e) => updateEpisode(episode.id, 'title', e.target.value)}
                                placeholder="Título do episódio"
                                className="bg-input border-border"
                              />
                            </div>
                          </div>

                          {episode.hasEmbeddedPlayer !== null && (
                            <div className="bg-accent/10 p-3 rounded-md">
                              <p className="text-sm font-medium">
                                Tipo detectado: {episode.hasEmbeddedPlayer ? '🎬 Player Embarcado' : '🔗 Link Externo'}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EditIndexedAnime;
