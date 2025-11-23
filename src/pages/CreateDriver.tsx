import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { crawlWithDriver } from '@/lib/crawler';
import { saveLocalDriver, type Driver } from '@/lib/localStorage';

const CreateDriver = () => {
  const [searchParams] = useSearchParams();
  const existingDriverId = searchParams.get('driver');
  const [url, setUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [indexStatus, setIndexStatus] = useState('');
  const [generatedDriver, setGeneratedDriver] = useState<any>(null);
  const [totalAnimes, setTotalAnimes] = useState(0);
  const [existingDriver, setExistingDriver] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (existingDriverId && user) {
      loadExistingDriver();
    }
  }, [existingDriverId, user]);

  const loadExistingDriver = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('public_id', existingDriverId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      setExistingDriver(data);
      setUrl(data.source_url || '');
      setIsPublic(data.is_public || false);
      setGeneratedDriver(data);
    } catch (error: any) {
      console.error('Error loading driver:', error);
      toast.error('Erro ao carregar driver');
    }
  };

  const handleReindex = async () => {
    if (!existingDriver) return;

    if (!existingDriver.source_url) {
      toast.error('Este driver não tem uma URL configurada');
      return;
    }

    setIsIndexing(true);
    await generateIndexFromDriver(existingDriver);
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      toast.error('Cole a URL do site de anime');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado para criar drivers');
      navigate('/auth');
      return;
    }

    setIsGenerating(true);
    setGeneratedDriver(null);
    let createdDriver: any = null;

    try {
      const { data, error } = await supabase.functions.invoke('generate-driver', {
        body: { url, is_public: isPublic }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.success) {
        createdDriver = data.driver;
        setGeneratedDriver(data.driver);
        
        // Automaticamente gerar indexação
        await generateIndexFromDriver(data.driver);
      }
    } catch (error: any) {
      console.error('Erro ao gerar driver:', error);
      
      // Se criou o driver mas falhou, deletar o driver
      if (createdDriver) {
        try {
          await supabase
            .from('drivers')
            .delete()
            .eq('id', createdDriver.id);
          console.log('Driver deletado após falha na indexação');
        } catch (deleteError) {
          console.error('Erro ao deletar driver:', deleteError);
        }
      }
      
      toast.error('Erro ao gerar driver. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateIndexFromDriver = async (driver: any) => {
    setIsIndexing(true);
    setIndexProgress(0);
    setIndexStatus('Iniciando indexação...');

    // Usar a source_url do driver se estiver re-indexando
    const sourceUrl = driver.source_url || url;

    try {
      setIndexStatus('Acessando site...');
      
      // Normalizar config do driver para o crawler
      const baseUrl = (driver.config as any)?.baseUrl || new URL(sourceUrl).origin;
      const selectors = (driver.config as any)?.selectors || driver.config;

      // Crawl website
      const crawlResult = await crawlWithDriver(
        sourceUrl,
        {
          id: driver.public_id,
          name: driver.name,
          domain: driver.domain,
          version: '1.0',
          config: { baseUrl, selectors },
          isLocal: false,
          createdAt: driver.created_at,
          updatedAt: driver.updated_at,
        },
        (statusMsg, progressVal) => {
          setIndexStatus(statusMsg);
          setIndexProgress(20 + (progressVal * 60));
        }
      );

      const hasAnimes = crawlResult.animes && crawlResult.animes.length > 0;

      setIndexProgress(85);
      setIndexStatus(hasAnimes ? 'Salvando indexação no driver...' : 'Salvando driver sem indexação...');

      // Update driver with indexed data (can be empty)
      if (user) {
        const { error: updateError } = await supabase
          .from('drivers')
          .update({
            indexed_data: hasAnimes ? (crawlResult.animes as any) : null,
            source_url: url,
            total_animes: hasAnimes ? crawlResult.animes.length : 0,
            last_indexed_at: hasAnimes ? new Date().toISOString() : null,
          })
          .eq('id', driver.id);

        if (updateError) throw updateError;
      } else {
        // Update local driver
        const localDriver: Driver = {
          id: driver.public_id,
          name: driver.name,
          domain: driver.domain,
          version: '1.0',
          config: driver.config,
          isLocal: true,
          createdAt: driver.created_at,
          updatedAt: new Date().toISOString(),
          indexedData: hasAnimes ? crawlResult.animes : [],
          sourceUrl: url,
          totalAnimes: hasAnimes ? crawlResult.animes.length : 0,
          lastIndexedAt: hasAnimes ? new Date().toISOString() : undefined,
        };
        saveLocalDriver(localDriver);
      }

      setIndexProgress(100);
      setIndexStatus(hasAnimes ? 'Indexação concluída!' : 'Driver criado!');
      setTotalAnimes(hasAnimes ? crawlResult.animes.length : 0);
      
      if (hasAnimes) {
        toast.success(existingDriver 
          ? `Driver re-indexado! ${crawlResult.animes.length} animes encontrados.`
          : `Driver criado e ${crawlResult.animes.length} animes indexados!`
        );
      } else {
        toast.warning(existingDriver
          ? 'Re-indexação concluída, mas nenhum anime foi encontrado. Verifique os seletores.'
          : 'Driver criado, mas nenhum anime foi encontrado. Verifique os seletores ou tente outro site.'
        );
      }

      // Redirecionar para a tela de drivers após 2 segundos
      setTimeout(() => {
        navigate('/drivers');
      }, 2000);
    } catch (err: any) {
      console.error('Error generating index:', err);
      
      // Apenas deletar se houve erro real (não apenas ausência de animes)
      if (driver && user && err.message && !err.message.includes('anime')) {
        try {
          await supabase
            .from('drivers')
            .delete()
            .eq('id', driver.id);
          console.log('Driver deletado após erro crítico');
        } catch (deleteError) {
          console.error('Erro ao deletar driver:', deleteError);
        }
        
        setGeneratedDriver(null);
        toast.error(err?.message || 'Erro ao processar driver. Tente novamente.');
      } else {
        // Erro não crítico, manter o driver
        toast.error(err?.message || 'Erro ao indexar. Driver criado mas sem animes.');
      }
    } finally {
      setIsIndexing(false);
    }
  };

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
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="font-display text-2xl font-bold text-gradient-primary">
                {existingDriver ? 'Re-indexar Driver com IA' : 'Criar Driver com IA'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-3">
            {existingDriver ? 'Re-indexar Driver' : 'Gere um Driver Automaticamente'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {existingDriver 
              ? 'A IA irá analisar novamente o site usando a configuração já existente do driver.'
              : 'Cole a URL de um site de anime e nossa IA irá analisar a estrutura e criar um driver personalizado para você.'
            }
          </p>
        </div>

        <Card className="glass p-8 border-border/50 mb-6">
          <div className="space-y-6">
            {existingDriver && (
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <p className="text-sm font-medium mb-1">Driver: {existingDriver.name}</p>
                <p className="text-xs text-muted-foreground">Domínio: {existingDriver.domain}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                URL do Site de Anime
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo-anime.com/lista"
                className="bg-input border-border"
                disabled={isGenerating || isIndexing || !!existingDriver}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {existingDriver 
                  ? 'URL configurada no driver'
                  : 'Cole a URL da página que lista os animes'
                }
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="h-5 w-5 text-accent" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="public-toggle" className="font-medium cursor-pointer">
                    Driver Público
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isPublic 
                      ? 'Outros usuários poderão ver e usar este driver'
                      : 'Apenas você poderá usar este driver'}
                  </p>
                </div>
              </div>
              <Switch
                id="public-toggle"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                disabled={isGenerating || isIndexing || !!existingDriver}
              />
            </div>

            {(isIndexing) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {indexStatus}
                </div>
                <Progress value={indexProgress} />
              </div>
            )}

            <Button
              onClick={existingDriver ? handleReindex : handleGenerate}
              disabled={isGenerating || isIndexing || (!existingDriver && !url.trim())}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Gerando Driver...
                </>
              ) : isIndexing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Indexando...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  {existingDriver ? 'Re-indexar com IA' : 'Gerar Driver'}
                </>
              )}
            </Button>
          </div>
        </Card>

        {generatedDriver && totalAnimes > 0 && (
          <Card className="glass p-6 border-accent/30 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-accent" />
              <h3 className="font-display font-bold text-lg">
                Driver Criado e Indexado com Sucesso!
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Driver:</p>
                <p className="font-medium">{generatedDriver.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Domínio:</p>
                <p className="font-medium">{generatedDriver.domain}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Animes Indexados:</p>
                <p className="font-medium text-accent text-2xl">{totalAnimes}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Visibilidade:</p>
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <>
                      <Globe className="h-4 w-4 text-accent" />
                      <span className="font-medium text-accent">Público</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Privado</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => navigate('/browse')}
                  className="flex-1"
                >
                  Ver Animes
                </Button>
                <Button
                  onClick={() => navigate('/drivers')}
                  variant="outline"
                  className="flex-1"
                >
                  Meus Drivers
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="glass p-6 border-border/50">
            <h4 className="font-display font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Como Funciona
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Cole a URL de qualquer site de anime</li>
              <li>• A IA analisa a estrutura HTML</li>
              <li>• Identifica automaticamente os seletores</li>
              <li>• Gera um driver pronto para usar</li>
            </ul>
          </Card>

          <Card className="glass p-6 border-accent/30">
            <h4 className="font-display font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              Limites do Plano
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Free:</strong> Até 3 drivers com IA</li>
              <li>• <strong>Premium:</strong> Drivers ilimitados</li>
              <li>• <strong>Premium+:</strong> Uso avançado de IA</li>
              <li>• Drivers podem ser editados manualmente</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateDriver;
