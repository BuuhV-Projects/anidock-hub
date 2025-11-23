import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { crawlWithDriver } from '@/lib/crawler';
import { saveLocalIndex, type AnimeIndex } from '@/lib/localStorage';

const GenerateIndex = () => {
  const [searchParams] = useSearchParams();
  const driverId = searchParams.get('driver');
  const [url, setUrl] = useState('');
  const [indexName, setIndexName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<AnimeIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!url.trim() || !indexName.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (!driverId) {
      toast.error('Driver não selecionado');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatus('Carregando driver...');
    setError(null);

    try {
      // Get driver from database
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('public_id', driverId)
        .single();

      if (driverError || !driver) {
        throw new Error('Driver não encontrado');
      }

      setProgress(20);
      setStatus('Acessando site...');

      // Crawl website
      const crawlResult = await crawlWithDriver(
        url,
        {
          id: driver.public_id,
          name: driver.name,
          domain: driver.domain,
          version: '1.0',
          config: driver.config as any,
          isLocal: false,
          createdAt: driver.created_at,
          updatedAt: driver.updated_at,
        },
        (statusMsg, progressVal) => {
          setStatus(statusMsg);
          setProgress(20 + (progressVal * 60));
        }
      );

      setProgress(85);
      setStatus('Criando indexação...');

      // Create index object
      const indexData: AnimeIndex = {
        id: `index_${Date.now()}`,
        driver_id: driver.public_id,
        name: indexName,
        source_url: url,
        total_animes: crawlResult.animes.length,
        animes: crawlResult.animes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to cloud if user is logged in
      if (user) {
        const { data: savedIndex, error: saveError } = await supabase
          .from('indexes')
          .insert([{
            driver_id: driver.id,
            user_id: user.id,
            name: indexName,
            source_url: url,
            total_animes: crawlResult.animes.length,
            index_data: crawlResult.animes as any,
            is_public: isPublic,
          }])
          .select()
          .single();

        if (saveError) throw saveError;

        indexData.id = savedIndex.public_id;
      } else {
        // Save locally
        saveLocalIndex(indexData);
      }

      setProgress(100);
      setStatus('Indexação concluída!');
      setResult(indexData);
      toast.success(`${crawlResult.animes.length} animes indexados com sucesso!`);
    } catch (err: any) {
      console.error('Error generating index:', err);
      setError(err.message || 'Erro ao gerar indexação');
      toast.error('Erro ao gerar indexação');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/drivers')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
            <h1 className="font-display text-2xl font-bold text-gradient-primary">
              Gerar Indexação
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!result ? (
          <Card className="glass p-8 border-border/50">
            <div className="space-y-6">
              <div>
                <Label htmlFor="index-name">Nome da Indexação</Label>
                <Input
                  id="index-name"
                  value={indexName}
                  onChange={(e) => setIndexName(e.target.value)}
                  placeholder="Ex: Animes de Ação 2024"
                  disabled={isGenerating}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="site-url">URL do Site</Label>
                <Input
                  id="site-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplo-anime.com/lista"
                  disabled={isGenerating}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Cole a URL da página que lista os animes
                </p>
              </div>

              {user && (
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
                  <div>
                    <Label htmlFor="public-toggle">Indexação Pública</Label>
                    <p className="text-sm text-muted-foreground">
                      Outros usuários poderão baixar esta indexação
                    </p>
                  </div>
                  <Switch
                    id="public-toggle"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    disabled={isGenerating}
                  />
                </div>
              )}

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {status}
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !url.trim() || !indexName.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Indexação
                  </>
                )}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="glass p-8 border-accent/30">
            <div className="text-center mb-6">
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold mb-2">
                Indexação Concluída!
              </h3>
              <p className="text-muted-foreground">
                {result.total_animes} animes foram indexados com sucesso
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Nome:</p>
                <p className="font-medium">{result.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">URL:</p>
                <p className="font-medium text-sm break-all">{result.source_url}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Animes:</p>
                <p className="font-medium">{result.total_animes}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/browse')}
                className="flex-1"
              >
                Ver no Browse
              </Button>
              <Button
                onClick={() => navigate('/indexes')}
                variant="outline"
                className="flex-1"
              >
                Minhas Indexações
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default GenerateIndex;
