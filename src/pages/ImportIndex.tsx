import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Database, Upload, FileCode, ArrowLeft } from 'lucide-react';
import { importIndex } from '@/lib/localStorage';
import { toast } from 'sonner';

const ImportIndex = () => {
  const [indexJson, setIndexJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setIndexJson(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!indexJson.trim()) {
      toast.error('Cole o JSON da indexação primeiro');
      return;
    }

    setIsLoading(true);
    try {
      const index = importIndex(indexJson);
      toast.success(`Indexação "${index.name}" importada com sucesso!`);
      navigate('/browse');
    } catch (error) {
      toast.error('Erro ao importar indexação. Verifique o formato JSON.');
      console.error(error);
    } finally {
      setIsLoading(false);
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
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Database className="h-8 w-8 text-primary animate-pulse-glow" />
            <h1 className="font-display text-2xl font-bold text-gradient-primary">
              Importar Indexação
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-3">
            Importe uma Indexação
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Indexações são arquivos JSON que contêm listas de animes já extraídas.
            Importe indexações compartilhadas pela comunidade ou por amigos.
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
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">
                O que são Indexações?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Listas de animes prontas para assistir
              </p>
            </div>
          </Card>
        </div>

        <Card className="glass p-6 border-border/50">
          <h3 className="font-display font-bold text-lg mb-4">
            JSON da Indexação
          </h3>
          <Textarea
            value={indexJson}
            onChange={(e) => setIndexJson(e.target.value)}
            placeholder='Cole o JSON da indexação aqui ou selecione um arquivo acima...'
            className="min-h-[400px] font-mono text-sm bg-input border-border"
          />
          
          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleImport}
              disabled={isLoading || !indexJson.trim()}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
            >
              {isLoading ? 'Importando...' : 'Importar Indexação'}
            </Button>
            <Button
              onClick={() => setIndexJson('')}
              variant="outline"
              className="border-border hover:bg-muted"
            >
              Limpar
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ImportIndex;
