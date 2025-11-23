import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Zap, Shield, Cpu, Download, HardDrive, MonitorPlay } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleDownload = () => {
    // TODO: Link para download quando o Electron build estiver pronto
    window.open('https://github.com/seu-repo/anidock/releases', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Logo/Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 px-4 py-2 backdrop-blur-sm">
              <Cpu className="h-4 w-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-medium text-muted-foreground">
                Software Desktop para Windows
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 font-display text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-gradient-primary animate-glow">AniDock</span>
            </h1>
            
            <p className="mb-4 text-xl md:text-2xl text-foreground/90">
              O indexador de animes definitivo
            </p>
            
            <p className="mb-12 text-lg text-muted-foreground max-w-2xl mx-auto">
              Software desktop que roda localmente no seu PC Windows. 
              Conecte qualquer site de anime, nossa IA aprende e indexa tudo localmente. 
              Seus dados ficam no seu computador.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleDownload}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8 transition-all duration-300 hover:scale-105 gap-2"
              >
                <Download className="h-5 w-5" />
                Baixar para Windows
              </Button>
              <Button 
                size="lg"
                onClick={() => navigate('/browse')}
                variant="outline"
                className="border-border hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                Ver Demo Online
              </Button>
            </div>

            {/* Version & Size Info */}
            <div className="mt-6 text-sm text-muted-foreground">
              Versão 1.0.0 • Gratuito • Windows 10/11
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Local</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-secondary mb-2">0</div>
                <div className="text-sm text-muted-foreground">Servidores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-accent mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Sites</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Instale, abra e comece. Tudo roda localmente no seu computador.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="glass p-6 border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">1. Baixe e Instale</h3>
              <p className="text-sm text-muted-foreground">
                Download rápido e instalação em segundos. Sem configuração complexa.
              </p>
            </Card>

            <Card className="glass p-6 border-border/50 hover:border-secondary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <Database className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">2. Cole o Link</h3>
              <p className="text-sm text-muted-foreground">
                Forneça o URL de qualquer site. IA analisa e cria driver automaticamente.
              </p>
            </Card>

            <Card className="glass p-6 border-border/50 hover:border-accent/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <MonitorPlay className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">3. Assista Offline</h3>
              <p className="text-sm text-muted-foreground">
                Tudo fica salvo localmente. Acesse sua biblioteca sem internet.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                  100% Local.
                  <span className="text-gradient-accent"> Zero Nuvem.</span>
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Privacidade Total</h4>
                      <p className="text-sm text-muted-foreground">
                        Nenhum dado sai do seu PC. Tudo fica armazenado localmente no seu Windows.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Drivers Compartilháveis</h4>
                      <p className="text-sm text-muted-foreground">
                        Compartilhe drivers com amigos via arquivo. Comunidade pode criar e trocar drivers.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Sem Dependências</h4>
                      <p className="text-sm text-muted-foreground">
                        Não precisa de servidor próprio. Tudo roda no seu computador.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="glass p-8 border-border/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <HardDrive className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Armazenamento Local</h4>
                      <p className="text-sm text-muted-foreground">Tudo salvo no seu PC</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Shield className="h-8 w-8 text-secondary" />
                    <div>
                      <h4 className="font-semibold">Zero Telemetria</h4>
                      <p className="text-sm text-muted-foreground">Nenhum tracking ou analytics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Zap className="h-8 w-8 text-accent" />
                    <div>
                      <h4 className="font-semibold">Leve e Rápido</h4>
                      <p className="text-sm text-muted-foreground">~50MB de instalação</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="glass max-w-4xl mx-auto p-12 text-center border-primary/30 glow-cyan">
            <Download className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Baixe AniDock Agora
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Software desktop gratuito e de código aberto. 
              Instale em segundos e comece a organizar seus animes offline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={handleDownload}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 gap-2"
              >
                <Download className="h-5 w-5" />
                Download para Windows
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.open('https://github.com/seu-repo/anidock', '_blank')}
                className="border-border hover:border-primary hover:bg-primary/10"
              >
                Ver no GitHub
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Windows 10 ou superior • ~50MB • Gratuito para sempre
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="font-display font-bold">AniDock</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AniDock. Indexação inteligente de animes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
