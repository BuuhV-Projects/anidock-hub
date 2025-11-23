import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowLeft, Loader2, CheckCircle2, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const CreateDriver = () => {
  const [url, setUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDriver, setGeneratedDriver] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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
        setGeneratedDriver(data.driver);
        toast.success(data.message || 'Driver criado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao gerar driver:', error);
      toast.error('Erro ao gerar driver. Tente novamente.');
    } finally {
      setIsGenerating(false);
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
                Criar Driver com IA
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-3">
            Gere um Driver Automaticamente
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cole a URL de um site de anime e nossa IA irá analisar a estrutura 
            e criar um driver personalizado para você.
          </p>
        </div>

        <Card className="glass p-8 border-border/50 mb-6">
          <div className="space-y-6">
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
                disabled={isGenerating}
              />
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
                disabled={isGenerating}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !url.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analisando site...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Gerar Driver com IA
                </>
              )}
            </Button>
          </div>
        </Card>

        {generatedDriver && (
          <Card className="glass p-6 border-accent/30 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="h-6 w-6 text-accent" />
              <h3 className="font-display font-bold text-lg">
                Driver Criado com Sucesso!
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nome:</p>
                <p className="font-medium">{generatedDriver.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Domínio:</p>
                <p className="font-medium">{generatedDriver.domain}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Visibilidade:</p>
                <div className="flex items-center gap-2">
                  {generatedDriver.is_public ? (
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

              <div>
                <p className="text-sm text-muted-foreground mb-2">Configuração:</p>
                <pre className="bg-input p-4 rounded-lg overflow-auto max-h-64 text-xs font-mono">
                  {JSON.stringify(generatedDriver.config, null, 2)}
                </pre>
              </div>

              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full"
                variant="outline"
              >
                Ver Meus Drivers
              </Button>
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
