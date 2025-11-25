import { Button, Card } from "@anidock/shared-ui";
import { Database, Zap, Shield, Cpu, Download, HardDrive, MonitorPlay, Sparkles, Lock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero.png";
import screenshotDashboard from "../assets/screenshot-dashboard.png";
import screenshotAiDriver from "../assets/screenshot-ai-driver.png";

const Index = () => {
  const navigate = useNavigate();

  const handleDownload = () => {
    // TODO: Link para download quando o Electron build estiver pronto
    window.open('https://github.com/seu-repo/anidock/releases', '_blank');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Gradient Background - Hydra Style */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container relative mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 px-4 py-2 backdrop-blur-sm">
                <Cpu className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">
                  v1.0 • Lançamento
                </span>
              </div>

              {/* Main Heading */}
              <div>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
                  O indexador de animes
                  <span className="text-gradient-primary animate-glow block mt-2">
                    definitivo
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-xl">
                  Conecte qualquer site de anime. Nossa IA aprende a estrutura e indexa tudo localmente no seu PC Windows.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleDownload}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8 transition-all duration-300 hover:scale-105 gap-2 group"
                >
                  <Download className="h-5 w-5 group-hover:animate-bounce" />
                  Baixar para Windows
                </Button>
                <Button 
                  size="lg"
                  onClick={() => navigate('/browse')}
                  variant="outline"
                  className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  Ver Demo
                </Button>
              </div>

              {/* Features Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm">100% Local</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <span className="text-sm">IA Integrada</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="text-sm">Drivers compartilháveis</span>
                </div>
              </div>

              {/* Info */}
              <p className="text-sm text-muted-foreground">
                Windows 10/11 • Gratuito
              </p>
            </div>

            {/* Right Content - Screenshot */}
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border border-primary/20 glow-cyan shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="AniDock Interface"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* What is AniDock Section - Hydra Style */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              O que é o AniDock?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AniDock é um software desktop que revoluciona como você organiza e assiste animes. 
              Cole o link de qualquer site, nossa IA analisa a estrutura, cria um "driver" automaticamente 
              e indexa todo o catálogo localmente no seu computador.
            </p>
          </div>

          {/* Dashboard Screenshot */}
          <div className="max-w-5xl mx-auto">
            <Card className="glass overflow-hidden border-primary/20">
              <img 
                src={screenshotDashboard} 
                alt="Dashboard do AniDock"
                className="w-full h-auto"
              />
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid - Hydra Style */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Muitos recursos incríveis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para organizar e assistir animes do seu jeito
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            {/* Feature Cards */}
            <Card className="glass p-6 border-primary/20 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">IA que Aprende</h3>
              <p className="text-sm text-muted-foreground">
                Cole qualquer URL de site de anime. Nossa IA analisa a estrutura HTML e cria drivers automaticamente.
              </p>
            </Card>

            <Card className="glass p-6 border-secondary/20 hover:border-secondary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">100% Privado</h3>
              <p className="text-sm text-muted-foreground">
                Tudo roda localmente. Zero telemetria, zero tracking. Seus dados nunca saem do seu PC.
              </p>
            </Card>

            <Card className="glass p-6 border-accent/20 hover:border-accent/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Compartilhe Drivers</h3>
              <p className="text-sm text-muted-foreground">
                Exporte e compartilhe drivers com amigos. Importe drivers criados pela comunidade.
              </p>
            </Card>

            <Card className="glass p-6 border-primary/20 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Indexação Inteligente</h3>
              <p className="text-sm text-muted-foreground">
                Catálogos completos indexados localmente. Pesquisa rápida e organização automática.
              </p>
            </Card>

            <Card className="glass p-6 border-secondary/20 hover:border-secondary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MonitorPlay className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Player Integrado</h3>
              <p className="text-sm text-muted-foreground">
                Assista diretamente no aplicativo ou abra links externos. Histórico de visualização completo.
              </p>
            </Card>

            <Card className="glass p-6 border-accent/20 hover:border-accent/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Leve e Rápido</h3>
              <p className="text-sm text-muted-foreground">
                Instalação rápida. Inicia em segundos. Interface fluida e responsiva.
              </p>
            </Card>
          </div>

          {/* AI Driver Creation Screenshot */}
          <div className="max-w-5xl mx-auto">
            <Card className="glass overflow-hidden border-secondary/20">
              <img 
                src={screenshotAiDriver} 
                alt="Criação de Driver com IA"
                className="w-full h-auto"
              />
            </Card>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Cole o link de qualquer site e deixe a IA fazer o resto
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Três passos simples para começar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-display font-bold text-primary mb-4">01</div>
              <h3 className="font-display font-semibold text-xl mb-3">Baixe e Instale</h3>
              <p className="text-muted-foreground">
                Download rápido e instalação em segundos. Sem configuração complexa ou cadastro necessário.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-4xl font-display font-bold text-secondary mb-4">02</div>
              <h3 className="font-display font-semibold text-xl mb-3">Cole o Link</h3>
              <p className="text-muted-foreground">
                Cole a URL de qualquer site de anime. Nossa IA analisa e cria um driver automaticamente.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                <MonitorPlay className="h-8 w-8 text-accent" />
              </div>
              <div className="text-4xl font-display font-bold text-accent mb-4">03</div>
              <h3 className="font-display font-semibold text-xl mb-3">Assista</h3>
              <p className="text-muted-foreground">
                Navegue pelo catálogo indexado e assista. Tudo organizado e salvo localmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Hydra Style */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 px-4 py-2 backdrop-blur-sm mb-8">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Baixe agora</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Baixe o AniDock
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Software desktop gratuito para Windows. 
              Organize seus animes do seu jeito, no seu PC.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg"
                onClick={handleDownload}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-10 text-lg group"
              >
                <Download className="h-6 w-6 mr-2 group-hover:animate-bounce" />
                Download para Windows
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>100% Local</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-2xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-6 w-6 text-primary" />
                <span className="font-display font-bold text-xl">AniDock</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Indexador inteligente de animes. 100% local e privado.
              </p>
            </div>
            
            <div>
              <h4 className="font-display font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <button onClick={() => navigate('/termos')} className="block text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </button>
                <button onClick={() => navigate('/privacidade')} className="block text-muted-foreground hover:text-primary transition-colors">
                  Privacidade
                </button>
                <button onClick={() => navigate('/lgpd')} className="block text-muted-foreground hover:text-primary transition-colors">
                  LGPD
                </button>
                <button onClick={() => navigate('/direitos-autorais')} className="block text-muted-foreground hover:text-primary transition-colors">
                  Direitos Autorais
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2024 AniDock. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
