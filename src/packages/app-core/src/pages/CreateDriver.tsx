import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Input, Switch, Label, Progress } from '@anidock/shared-ui';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2, Globe, Lock } from 'lucide-react';
import { supabase } from '@anidock/shared-utils';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth/useAuth';
import { crawlWithDriver } from '../lib/crawler';
import { saveLocalDriver, type Driver } from '../lib/localStorage';

const CreateDriver = () => {
  const [searchParams] = useSearchParams();
  const existingDriverId = searchParams.get('driver');
  const [url, setUrl] = useState('');
  const [catalogUrl, setCatalogUrl] = useState(''); // Optional: specific catalog page
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
      setCatalogUrl(data.catalog_url || '');
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

    // Atualizar catalog_url do driver se foi alterado
    if (catalogUrl !== existingDriver.catalog_url) {
      try {
        const { error } = await supabase
          .from('drivers')
          .update({ catalog_url: catalogUrl || null })
          .eq('id', existingDriver.id);

        if (error) throw error;
        
        // Atualizar o objeto local
        existingDriver.catalog_url = catalogUrl || null;
      } catch (error: any) {
        console.error('Error updating catalog_url:', error);
        toast.error('Erro ao atualizar URL do catálogo');
        return;
      }
    }

    setIsIndexing(true);
    await generateIndexFromDriver(existingDriver);
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      toast.error('Cole a URL do site de anime');
      return;
    }

    if (!catalogUrl.trim()) {
      toast.error('A URL do catálogo é obrigatória');
      return;
    }

    if (!user) {
      toast.error('Você precisa estar logado para criar drivers');
      navigate('/auth');
      return;
    }

    // Check driver limit for free users
    try {
      const { data: roleData } = await supabase.rpc('get_user_role', { _user_id: user.id });
      const userRole = roleData as 'free' | 'premium' | 'premium_plus';

      if (userRole === 'free') {
        const { count } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (count !== null && count >= 3) {
          toast.error('Limite de 3 drivers atingido!', {
            description: 'Faça upgrade para Premium para criar drivers ilimitados',
            duration: 5000
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking driver limit:', error);
    }

    setIsGenerating(true);
    setGeneratedDriver(null);
    let createdDriver: any = null;

    try {
      const { data, error } = await supabase.functions.invoke('generate-driver', {
        body: { 
          url: url.trim(),
          catalog_url: catalogUrl.trim(),
          is_public: isPublic 
        }
      });

      // Handle edge function errors (don't throw, just show message)
      if (error) {
        console.error('Edge function error:', error);
        toast.error('Erro ao conectar com o servidor. Tente novamente.');
        return;
      }

      // Handle validation errors from AI (e.g., episode list detection)
      if (data?.error) {
        if (data.suggestion) {
          toast.error(data.error, {
            description: data.suggestion,
            duration: 7000
          });
        } else {
          toast.error(data.error);
        }
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

    // Usar a catalog_url do driver se existir, caso contrário usar source_url
    const sourceUrl = driver.catalog_url || driver.source_url || url;

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
      setIndexStatus(hasAnimes ? 'Salvando indexação...' : 'Salvando driver sem indexação...');

      // Save indexed data to indexes table
      if (user && hasAnimes) {
        // Check if index already exists
        const { data: existingIndex } = await supabase
          .from('indexes')
          .select('id')
          .eq('driver_id', driver.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingIndex) {
          // Update existing index
          const { error: updateIndexError } = await supabase
            .from('indexes')
            .update({
              index_data: crawlResult.animes as any,
              total_animes: crawlResult.animes.length,
              source_url: url,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingIndex.id);

          if (updateIndexError) throw updateIndexError;
        } else {
          // Create new index
          const { error: createIndexError } = await supabase
            .from('indexes')
            .insert({
              driver_id: driver.id,
              user_id: user.id,
              name: driver.name,
              source_url: url,
              index_data: crawlResult.animes as any,
              total_animes: crawlResult.animes.length,
              is_public: driver.is_public,
            });

          if (createIndexError) throw createIndexError;
        }

        // Update driver metadata
        const { error: updateDriverError } = await supabase
          .from('drivers')
          .update({
            source_url: url,
            total_animes: crawlResult.animes.length,
            last_indexed_at: new Date().toISOString(),
          })
          .eq('id', driver.id);

        if (updateDriverError) throw updateDriverError;
      } else if (user && !hasAnimes) {
        // Just update driver metadata without index
        const { error: updateError } = await supabase
          .from('drivers')
          .update({
            source_url: url,
            total_animes: 0,
            last_indexed_at: null,
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
                placeholder="https://exemplo-anime.com"
                className="bg-input border-border"
                disabled={isGenerating || isIndexing || !!existingDriver}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {existingDriver 
                  ? 'URL configurada no driver'
                  : 'Cole a URL principal do site'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                URL do Catálogo <span className="text-destructive">*</span>
              </label>
              <Input
                type="url"
                value={catalogUrl}
                onChange={(e) => setCatalogUrl(e.target.value)}
                placeholder="https://exemplo-anime.com/animes"
                className="bg-input border-border"
                disabled={isGenerating || isIndexing}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {existingDriver 
                  ? 'URL específica da página de catálogo de animes (obrigatório para re-indexação)'
                  : 'URL da página que lista todos os animes do site (obrigatório)'
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
