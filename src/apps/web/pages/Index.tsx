import { Button } from "@/packages/shared-ui/components/ui/button";
import { Download, Shield, Zap, Package, Github } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const handleDownload = () => {
    // TODO: Atualizar com o link real do instalador quando o build Electron estiver pronto
    window.open("#", "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Package className="w-4 h-4" />
                Software Desktop para Windows
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground">
              AniDock
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Indexador de animes que roda <span className="text-primary font-semibold">100% localmente no seu PC Windows</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 gap-3"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5" />
                Download para Windows
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground pt-4">
              <span>📦 Versão 1.0.0</span>
              <span>💾 ~50MB</span>
              <span>🖥️ Windows 10/11</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 border-y border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100% Local</div>
              <p className="text-muted-foreground">Roda no seu PC</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">0 Servidores</div>
              <p className="text-muted-foreground">Seus dados ficam no seu computador</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">∞ Sites</div>
              <p className="text-muted-foreground">Compatível com qualquer fonte</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">1. Baixe</h3>
              <p className="text-muted-foreground">
                Faça o download do instalador para Windows
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">2. Instale</h3>
              <p className="text-muted-foreground">
                Instale no seu computador com poucos cliques
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">3. Use</h3>
              <p className="text-muted-foreground">
                Comece a indexar e assistir seus animes localmente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Recursos</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-lg border border-border/40 bg-background/60 backdrop-blur">
              <Shield className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Privacidade Total</h3>
              <p className="text-muted-foreground">
                Seus dados ficam no seu computador. Nenhuma informação é enviada para servidores externos.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border/40 bg-background/60 backdrop-blur">
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Zero Dependência de Cloud</h3>
              <p className="text-muted-foreground">
                Não depende de servidores ou serviços de terceiros para funcionar.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border/40 bg-background/60 backdrop-blur">
              <Package className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Sistema de Drivers</h3>
              <p className="text-muted-foreground">
                Crie ou importe drivers para indexar qualquer site de animes.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border/40 bg-background/60 backdrop-blur">
              <Shield className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Sem Telemetria</h3>
              <p className="text-muted-foreground">
                Não coletamos dados de uso, histórico ou qualquer informação pessoal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Pronto para começar?
          </h2>
          <p className="text-xl text-muted-foreground">
            Baixe agora e comece a usar o AniDock no seu Windows
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 gap-3"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5" />
            Download Gratuito
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">AniDock</h3>
              <p className="text-muted-foreground text-sm">
                Indexador de animes local para Windows
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/termos" className="hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
                <Link to="/privacidade" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </Link>
                <Link to="/lgpd" className="hover:text-primary transition-colors">
                  LGPD
                </Link>
                <Link to="/direitos-autorais" className="hover:text-primary transition-colors">
                  Direitos Autorais
                </Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AniDock. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
