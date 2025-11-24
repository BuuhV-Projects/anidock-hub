import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Textarea } from '@anidock/shared-ui';
import { Cpu, Upload, FileCode, Download, ArrowLeft } from 'lucide-react';
import { importDriver, Driver, exportDriver, getLocalDrivers } from '../lib/localStorage';
import { createExampleDriver } from '../lib/crawler';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@anidock/shared-utils';

const ImportDriver = () => {
  const [driverJson, setDriverJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setDriverJson(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!driverJson.trim()) {
      toast.error('Cole o JSON do driver primeiro');
      return;
    }

    // Check driver limit for free users (only for authenticated users)
    if (user) {
      try {
        const { data: roleData } = await supabase.rpc('get_user_role', { _user_id: user.id });
        const userRole = roleData as 'free' | 'premium' | 'premium_plus';

        if (userRole === 'free') {
          const localDriversCount = getLocalDrivers().length;
          
          if (localDriversCount >= 3) {
            toast.error('Limite de 3 drivers atingido!', {
              description: 'Faça upgrade para Premium para ter drivers ilimitados',
              duration: 5000
            });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking driver limit:', error);
      }
    }

    setIsLoading(true);
    try {
      const driver = importDriver(driverJson);
      toast.success(`Driver "${driver.name}" importado com sucesso!`);
      navigate('/browse');
    } catch (error) {
      toast.error('Erro ao importar driver. Verifique o formato JSON.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExample = () => {
    const example = createExampleDriver();
    const json = exportDriver(example.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'example-driver.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exemplo baixado!');
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
              <Cpu className="h-8 w-8 text-primary animate-pulse-glow" />
              <h1 className="font-display text-2xl font-bold text-gradient-primary">
                Importar Driver
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-3">
            Importe um Driver Local
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Drivers são arquivos JSON que definem como extrair dados de sites de anime.
            Importe drivers compartilhados pela comunidade ou crie o seu próprio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="glass p-6 border-border/50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">
                Upload de Arquivo
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione um arquivo .json do seu dispositivo
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-primary/50 hover:bg-primary/10 w-full"
              >
                <FileCode className="h-4 w-4 mr-2" />
                Escolher Arquivo
              </Button>
            </div>
          </Card>

          <Card className="glass p-6 border-border/50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">
                Driver Exemplo
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Baixe um driver de exemplo para entender a estrutura
              </p>
              <Button
                onClick={downloadExample}
                variant="outline"
                className="border-secondary/50 hover:bg-secondary/10 w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Exemplo
              </Button>
            </div>
          </Card>
        </div>

        <Card className="glass p-6 border-border/50">
          <h3 className="font-display font-bold text-lg mb-4">
            JSON do Driver
          </h3>
          <Textarea
            value={driverJson}
            onChange={(e) => setDriverJson(e.target.value)}
            placeholder='Cole o JSON do driver aqui ou selecione um arquivo acima...'
            className="min-h-[400px] font-mono text-sm bg-input border-border"
          />
          
          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleImport}
              disabled={isLoading || !driverJson.trim()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
            >
              {isLoading ? 'Importando...' : 'Importar Driver'}
            </Button>
            <Button
              onClick={() => setDriverJson('')}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              Limpar
            </Button>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="glass p-6 border-accent/30 mt-8">
          <h4 className="font-display font-bold mb-3 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-accent" />
            Como funcionam os drivers?
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Drivers são arquivos JSON que definem seletores CSS</li>
            <li>• Cada driver ensina o AniDock como extrair dados de um site específico</li>
            <li>• Tudo funciona 100% localmente no seu navegador</li>
            <li>• Você pode criar drivers manualmente ou usar IA (requer login)</li>
            <li>• Drivers podem ser compartilhados com amigos via arquivo JSON</li>
          </ul>
        </Card>
      </main>
    </div>
  );
};

export default ImportDriver;