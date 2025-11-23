import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Zap, Shield, Cpu } from "lucide-react";

const Index = () => {
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
                Next-Gen Anime Indexing
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
              Conecte qualquer site de anime. Nossa IA aprende a estrutura e indexa tudo automaticamente. 
              Sem downloads, sem mirrors — apenas metadados organizados e busca instantânea.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-8 transition-all duration-300 hover:scale-105"
              >
                Começar Gratuitamente
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-border hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                Ver Como Funciona
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Automático</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-secondary mb-2">∞</div>
                <div className="text-sm text-muted-foreground">Sites Suportados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-accent mb-2">0ms</div>
                <div className="text-sm text-muted-foreground">Setup Time</div>
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
              Sistema de drivers inteligentes inspirado no Hydra. Cole um link, deixe a IA fazer o resto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="glass p-6 border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">1. Cole o Link</h3>
              <p className="text-sm text-muted-foreground">
                Forneça o URL de qualquer site de anime. Não importa a estrutura.
              </p>
            </Card>

            <Card className="glass p-6 border-border/50 hover:border-secondary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <Cpu className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">2. IA Analisa</h3>
              <p className="text-sm text-muted-foreground">
                Nossa IA detecta padrões, aprende a estrutura e cria um driver personalizado.
              </p>
            </Card>

            <Card className="glass p-6 border-border/50 hover:border-accent/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">3. Indexa Tudo</h3>
              <p className="text-sm text-muted-foreground">
                Crawler automático extrai metadados: títulos, capas, sinopses, episódios.
              </p>
            </Card>

            <Card className="glass p-6 border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">4. Assista</h3>
              <p className="text-sm text-muted-foreground">
                Player original em iframe. Sem pirataria, sem responsabilidade legal.
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
                  Sistema de Drivers
                  <span className="text-gradient-accent"> Inteligente</span>
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Auto-detecta Padrões</h4>
                      <p className="text-sm text-muted-foreground">
                        IA identifica seletores CSS, estrutura de episódios e metadados automaticamente
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
                        Comunidade pode criar e compartilhar drivers para novos sites
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Proteção Legal</h4>
                      <p className="text-sm text-muted-foreground">
                        Você não distribui drivers prontos, apenas a ferramenta de criação
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="glass p-8 border-border/50">
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre className="text-primary">{`{
  "titleSelector": "h1.title",
  "episodeListSelector": ".episodes a",
  "imageSelector": ".cover img",
  "descriptionSelector": ".sinopse",
  "pattern": "/episodio-{n}",
  "pagination": true
}`}</pre>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Exemplo de driver gerado automaticamente
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="glass max-w-4xl mx-auto p-12 text-center border-primary/30 glow-cyan">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Crie sua conta gratuita e comece a indexar seus animes favoritos agora mesmo. 
              Sem cartão de crédito necessário.
            </p>
            <Button 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
            >
              Criar Conta Grátis
            </Button>
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
