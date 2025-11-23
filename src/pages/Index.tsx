import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cpu, Play, Search, Star } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container relative mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Logo/Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
              <Cpu className="h-4 w-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-medium text-muted-foreground">
                Next-Gen Anime Platform
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 font-display text-6xl md:text-8xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="text-gradient-primary animate-glow">AniDock</span>
            </h1>
            
            <p className="mb-4 text-2xl md:text-3xl text-foreground/90 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Seus animes, organizados
            </p>
            
            <p className="mb-12 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
              A plataforma definitiva para gerenciar e descobrir seus animes favoritos. 
              Tudo em um só lugar, organizado e otimizado.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
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
                Ver Planos Premium
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="text-center group">
                <div className="text-4xl font-display font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <div className="text-sm text-muted-foreground">Busca Avançada</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-display font-bold text-secondary mb-2 group-hover:scale-110 transition-transform">
                  <Star className="w-12 h-12 mx-auto" />
                </div>
                <div className="text-sm text-muted-foreground">Favoritos Ilimitados</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-display font-bold text-accent mb-2 group-hover:scale-110 transition-transform">
                  <Play className="w-12 h-12 mx-auto" />
                </div>
                <div className="text-sm text-muted-foreground">Acesso Direto</div>
              </div>
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
