import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
      if (config.selectors) {
        setSelectors({
          animeList: config.selectors.animeList || '',
          animeTitle: config.selectors.animeTitle || '',
          animeImage: config.selectors.animeImage || '',
          animeSynopsis: config.selectors.animeSynopsis || '',
          animeUrl: config.selectors.animeUrl || '',
          episodeList: config.selectors.episodeList || '',
          episodeNumber: config.selectors.episodeNumber || '',
          episodeTitle: config.selectors.episodeTitle || '',
          episodeUrl: config.selectors.episodeUrl || '',
        });
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
                  onChange={(e) => setSelectors({ ...selectors, animeList: e.target.value })}
                  placeholder=".anime-item"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="animeTitle">Título do Anime</Label>
                <Input
                  id="animeTitle"
                  value={selectors.animeTitle}
                  onChange={(e) => setSelectors({ ...selectors, animeTitle: e.target.value })}
                  placeholder=".anime-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="animeImage">Imagem do Anime</Label>
                <Input
                  id="animeImage"
                  value={selectors.animeImage}
                  onChange={(e) => setSelectors({ ...selectors, animeImage: e.target.value })}
                  placeholder="img.anime-cover"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="animeSynopsis">Sinopse do Anime</Label>
                <Input
                  id="animeSynopsis"
                  value={selectors.animeSynopsis}
                  onChange={(e) => setSelectors({ ...selectors, animeSynopsis: e.target.value })}
                  placeholder=".anime-synopsis"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="animeUrl">URL do Anime</Label>
                <Input
                  id="animeUrl"
                  value={selectors.animeUrl}
                  onChange={(e) => setSelectors({ ...selectors, animeUrl: e.target.value })}
                  placeholder="a.anime-link"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeList" className="text-primary">Lista de Episódios *</Label>
                <Input
                  id="episodeList"
                  value={selectors.episodeList}
                  onChange={(e) => setSelectors({ ...selectors, episodeList: e.target.value })}
                  placeholder=".episode-item"
                  className="border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  Seletor para os itens de episódio na página do anime
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeNumber">Número do Episódio</Label>
                <Input
                  id="episodeNumber"
                  value={selectors.episodeNumber}
                  onChange={(e) => setSelectors({ ...selectors, episodeNumber: e.target.value })}
                  placeholder=".episode-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeTitle">Título do Episódio (Opcional)</Label>
                <Input
                  id="episodeTitle"
                  value={selectors.episodeTitle}
                  onChange={(e) => setSelectors({ ...selectors, episodeTitle: e.target.value })}
                  placeholder=".episode-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodeUrl">URL do Episódio</Label>
                <Input
                  id="episodeUrl"
                  value={selectors.episodeUrl}
                  onChange={(e) => setSelectors({ ...selectors, episodeUrl: e.target.value })}
                  placeholder="a.episode-link"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-2">Exemplo para Anitube.vip:</h3>
              <div className="bg-muted/30 p-4 rounded-lg text-sm font-mono space-y-1">
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
