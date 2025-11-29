import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Label, Progress, Alert, AlertDescription } from '@anidock/shared-ui';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2, Cpu } from 'lucide-react';
import { toast } from 'sonner';
import { db, Driver } from '../lib/indexedDB';
import { generateDriverWithAI, validateAPIKey, type AIConfig, type AIProvider } from '../lib/aiDriver';
import { crawlWithDriver } from '../lib/clientCrawler';

const CreateDriver = () => {
  const [url, setUrl] = useState('');
  const [catalogUrl, setCatalogUrl] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidated, setKeyValidated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [indexProgress, setIndexProgress] = useState(0);
  const [indexStatus, setIndexStatus] = useState('');
  const [totalAnimes, setTotalAnimes] = useState(0);
  const navigate = useNavigate();

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Insira a API key');
      return;
    }

    setIsValidatingKey(true);
    try {
      const config: AIConfig = {
        provider: aiProvider,
        apiKey: apiKey.trim(),
      };

      const isValid = await validateAPIKey(config);
      
      if (isValid) {
        setKeyValidated(true);
        toast.success('API key validada com sucesso!');
        // Save to localStorage for future use
        localStorage.setItem(`anidock_${aiProvider}_key`, apiKey.trim());
      } else {
        toast.error('API key inválida');
      }
    } catch (error) {
      console.error('Error validating key:', error);
      toast.error('Erro ao validar API key');
    } finally {
      setIsValidatingKey(false);
    }
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

    if (!keyValidated) {
      toast.error('Valide a API key primeiro');
      return;
    }

    setIsGenerating(true);
    setGeneratedDriver(null);

    try {
      const config: AIConfig = {
        provider: aiProvider,
        apiKey: apiKey.trim(),
      };

      // Generate driver with AI
      const driver = await generateDriverWithAI(catalogUrl.trim(), config, setGenerationStatus);
      
      // Initialize IndexedDB
      await db.init();
      
      // Save driver locally
      await db.saveDriver(driver);
      
      toast.success('Driver gerado com sucesso!');
      setGenerationStatus('');
      
      // Start indexing
      setIsIndexing(true);
      await generateIndexFromDriver(driver);
      
    } catch (error: any) {
      console.error('Error generating driver:', error);
      toast.error(error.message || 'Erro ao gerar driver');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateIndexFromDriver = async (driver: Driver) => {
    try {
      const urlToIndex = driver.catalogUrl || driver.sourceUrl || driver.config.baseUrl;

      const result = await crawlWithDriver(
        urlToIndex,
        driver,
        (progress) => {
          const percent = Math.round((progress.current / progress.total) * 100);
          setIndexProgress(percent);
          setIndexStatus(progress.status);
        }
      );

      if (result.errors.length > 0) {
        console.warn('Indexing errors:', result.errors);
      }

      if (result.animes.length === 0) {
        toast.error('Nenhum anime encontrado');
        return;
      }

      // Save index to IndexedDB
      const animeIndex = {
        id: crypto.randomUUID(),
        driverId: driver.id,
        name: `Index for ${driver.name}`,
        sourceUrl: urlToIndex,
        totalAnimes: result.animes.length,
        animes: result.animes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.saveIndex(animeIndex);

      setTotalAnimes(result.animes.length);
      toast.success(`Driver criado com ${result.animes.length} animes indexados!`);
      
      setTimeout(() => {
        navigate('/drivers');
      }, 2000);
    } catch (error: any) {
      console.error('Error indexing:', error);
      toast.error('Erro ao indexar animes');
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
            <h1 className="font-display text-2xl font-bold text-gradient-primary">
              Criar Driver com IA
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Alert className="mb-6">
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            Use sua própria API key do OpenAI ou Google Gemini para gerar drivers automaticamente.
            Sua chave é armazenada localmente e nunca é enviada para nossos servidores.
          </AlertDescription>
        </Alert>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label>Provedor de IA</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={aiProvider === 'openai' ? 'default' : 'outline'}
                  onClick={() => setAiProvider('openai')}
                  disabled={isGenerating}
                >
                  OpenAI
                </Button>
                <Button
                  variant={aiProvider === 'gemini' ? 'default' : 'outline'}
                  onClick={() => setAiProvider('gemini')}
                  disabled={isGenerating}
                >
                  Google Gemini
                </Button>
              </div>
            </div>

            <div>
              <Label>API Key</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="password"
                  placeholder={`Sua ${aiProvider === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isGenerating || keyValidated}
                />
                <Button
                  onClick={handleValidateKey}
                  disabled={isValidatingKey || keyValidated || !apiKey.trim()}
                  className="shrink-0"
                >
                  {isValidatingKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : keyValidated ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    'Validar'
                  )}
                </Button>
              </div>
              {keyValidated && (
                <p className="text-sm text-green-600 mt-1">✓ API key validada</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="url">URL do Site *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://exemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isGenerating || isIndexing}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="catalogUrl">URL do Catálogo *</Label>
              <Input
                id="catalogUrl"
                type="url"
                placeholder="https://exemplo.com/animes"
                value={catalogUrl}
                onChange={(e) => setCatalogUrl(e.target.value)}
                disabled={isGenerating || isIndexing}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL da página que lista os animes
              </p>
            </div>

            {(isGenerating || isIndexing) && (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {generationStatus || indexStatus}
                  </p>
                </div>
                {isIndexing && (
                  <div className="space-y-2">
                    <Progress value={indexProgress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {totalAnimes > 0 && `${totalAnimes} animes indexados`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isIndexing || !keyValidated}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating || isIndexing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Gerar Driver com IA
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default CreateDriver;
