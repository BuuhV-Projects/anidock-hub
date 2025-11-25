import { Button, Card, Input, Label } from '@anidock/shared-ui';
import { supabase } from '@anidock/shared-utils';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth/useAuth';

const EditDriver = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { driverId } = useParams();
  
  const [driver, setDriver] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectors, setSelectors] = useState({
    animeList: '',
    animeTitle: '',
    animeImage: '',
    animeSynopsis: '',
    animeUrl: '',
    animePageTitle: '',
    episodeList: '',
    episodeNumber: '',
    episodeTitle: '',
    episodeUrl: '',
  });

  useEffect(() => {
    if (driverId && user) {
      loadDriver();
    }
  }, [driverId, user]);

  const loadDriver = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('public_id', driverId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setDriver(data);
      
      const config = data.config as any;
      if (config?.selectors) {
        setSelectors(prev => ({
          ...prev,
          animeList: config.selectors.animeList || '',
          animeTitle: config.selectors.animeTitle || '',
          animeImage: config.selectors.animeImage || '',
          animeSynopsis: config.selectors.animeSynopsis || '',
          animeUrl: config.selectors.animeUrl || '',
          animePageTitle: config.selectors.animePageTitle || '',
          episodeList: config.selectors.episodeList || '',
          episodeNumber: config.selectors.episodeNumber || '',
          episodeTitle: config.selectors.episodeTitle || '',
          episodeUrl: config.selectors.episodeUrl || '',
        }));
      }
    } catch (error: any) {
      console.error('Error loading driver:', error);
      toast.error('Erro ao carregar driver');
      navigate('/drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!driver) return;

    setIsSaving(true);
    try {
      const config = driver.config as any;
      const updatedConfig = {
        ...config,
        selectors: {
          ...config.selectors,
          ...selectors,
        },
      };

      const { error } = await supabase
        .from('drivers')
        .update({
          config: updatedConfig,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driver.id);

      if (error) throw error;

      toast.success('Driver atualizado com sucesso!');
      navigate('/drivers');
    } catch (error: any) {
      console.error('Error saving driver:', error);
      toast.error('Erro ao salvar driver');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!driver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/drivers')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-2">
            Editar Driver
          </h1>
          <p className="text-muted-foreground mb-8">
            {driver.name} - {driver.domain}
          </p>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold mb-4">
                Seletores CSS
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Ajuste os seletores CSS para extrair dados corretamente do site.
                Use as ferramentas de desenvolvedor do navegador para encontrar os seletores corretos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="animeList">Lista de Animes</Label>
                <Input
                  id="animeList"
                  value={selectors.animeList}
                  onChange={(e) => setSelectors(prev => ({ ...prev, animeList: e.target.value }))}
                  placeholder=".anime-item"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Seletor para cada item de anime na lista (ex: .anime-card, .itemlistanime a)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animeTitle" className="text-primary">Título do Anime (na lista) *</Label>
                <Input
                  id="animeTitle"
                  value={selectors.animeTitle}
                  onChange={(e) => setSelectors(prev => ({ ...prev, animeTitle: e.target.value }))}
                  placeholder="h2, .title, .nome-anime"
                  className="border-primary/50"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Procure por tags h1-h6 ou classes com "title", "titulo", "name", "nome"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animeImage">Imagem do Anime</Label>
                <Input
                  id="animeImage"
                  value={selectors.animeImage}
                  onChange={(e) => setSelectors(prev => ({ ...prev, animeImage: e.target.value }))}
                  placeholder="img, img.cover"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Tag img dentro de cada item da lista
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animeSynopsis">Sinopse do Anime</Label>
                <Input
                  id="animeSynopsis"
                  value={selectors.animeSynopsis}
                  onChange={(e) => setSelectors(prev => ({ ...prev, animeSynopsis: e.target.value }))}
                  placeholder=".synopsis, .sinopse, .description"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Texto descritivo do anime (opcional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animeUrl">URL do Anime</Label>
                <Input
                  id="animeUrl"
                  value={selectors.animeUrl}
                  onChange={(e) => setSelectors(prev => ({ ...prev, animeUrl: e.target.value }))}
                  placeholder="a, a.link"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Deixe vazio se animeList já for o próprio link (&lt;a&gt;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animePageTitle" className="text-primary">Título na Página do Anime *</Label>
                <Input
                  id="animePageTitle"
                  value={selectors.animePageTitle}
                  onChange={(e) => setSelectors(prev => ({ ...prev, animePageTitle: e.target.value }))}
                  placeholder="h1.title, .anime-title, .nome-anime"
                  className="border-primary/50"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Título do anime na página individual (não na lista)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeList" className="text-accent">Lista de Episódios *</Label>
                <Input
                  id="episodeList"
                  value={selectors.episodeList}
                  onChange={(e) => setSelectors(prev => ({ ...prev, episodeList: e.target.value }))}
                  placeholder=".episode-item, .animepag_episodios_item"
                  className="border-accent/50"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Seletor para cada episódio na página do anime
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeNumber">Número do Episódio</Label>
                <Input
                  id="episodeNumber"
                  value={selectors.episodeNumber}
                  onChange={(e) => setSelectors(prev => ({ ...prev, episodeNumber: e.target.value }))}
                  placeholder=".episode-number, .ep-numero"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Tag com o número do episódio
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeTitle">Título do Episódio (Opcional)</Label>
                <Input
                  id="episodeTitle"
                  value={selectors.episodeTitle}
                  onChange={(e) => setSelectors(prev => ({ ...prev, episodeTitle: e.target.value }))}
                  placeholder=".episode-title, .ep-titulo"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Nome do episódio (se disponível)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeUrl">URL do Episódio</Label>
                <Input
                  id="episodeUrl"
                  value={selectors.episodeUrl}
                  onChange={(e) => setSelectors(prev => ({ ...prev, episodeUrl: e.target.value }))}
                  placeholder="a, a.episode-link"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Link para a página de player do episódio
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                💡 Dicas para encontrar seletores CSS:
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-medium mb-2">1. Abra o DevTools do navegador (F12 ou Ctrl+Shift+I)</p>
                  <p className="text-muted-foreground">Clique com o botão direito em um elemento → "Inspecionar"</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-medium mb-2">2. Para o título do anime:</p>
                  <p className="text-muted-foreground">
                    Procure por tags &lt;h1&gt;, &lt;h2&gt;, &lt;h3&gt;, etc.<br/>
                    Ou classes CSS que contenham: "title", "titulo", "name", "nome", "heading"
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-medium mb-2">3. Teste seus seletores:</p>
                  <p className="text-muted-foreground">
                    No Console do DevTools: <code className="bg-background px-2 py-1 rounded">document.querySelectorAll('SEU_SELETOR')</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-2">Exemplo completo (Anitube.vip):</h3>
              <div className="bg-muted/30 p-4 rounded-lg text-sm font-mono space-y-1">
                <div><span className="text-muted-foreground">animeList:</span> .ani_loop_item</div>
                <div><span className="text-muted-foreground">animeTitle:</span> .ani_loop_item_infos_nome</div>
                <div><span className="text-muted-foreground">animePageTitle:</span> h1.anime-title</div>
                <div><span className="text-muted-foreground">episodeList:</span> .animepag_episodios_item</div>
                <div><span className="text-muted-foreground">episodeNumber:</span> .animepag_episodios_item_numero</div>
                <div><span className="text-muted-foreground">episodeUrl:</span> a</div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditDriver;
