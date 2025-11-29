import { Button, Card } from "@anidock/shared-ui";
import { Cpu, Database, Download, HardDrive, Lock, MonitorPlay, Sparkles, Users, Zap, Github, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/LanguageSelector";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDownload = () => {
    window.open('https://github.com/BuuhV-Projects/anidock-hub/releases', '_blank');
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
        
        {/* Language Selector */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>

        <div className="container relative mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/50 px-4 py-2 backdrop-blur-sm">
                <Code className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t('hero.badge')}
                </span>
              </div>

              {/* Main Heading */}
              <div>
                <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4">
                  {t('hero.title')}
                  <span className="text-gradient-primary animate-glow block mt-2">
                    {t('hero.titleHighlight')}
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-xl">
                  {t('hero.subtitle')}
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
                  {t('hero.downloadButton')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.open('https://github.com/BuuhV-Projects/anidock-hub', '_blank')}
                  className="border-primary/20 hover:border-primary/50 hover:bg-primary/10 font-semibold px-8 transition-all duration-300 gap-2 group"
                >
                  <Github className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  {t('hero.githubButton')}
                </Button>
              </div>

              {/* Features Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t('hero.openSource')}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t('hero.local')}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <span className="text-sm">{t('hero.aiIntegrated')}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="text-sm">{t('hero.sharedDrivers')}</span>
                </div>
              </div>

              {/* Info */}
              <p className="text-sm text-muted-foreground">
                {t('hero.systemRequirements')}
              </p>
            </div>

            {/* Right Content - Screenshot */}
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border border-primary/20 glow-cyan shadow-2xl">
                <div className="w-full h-auto bg-muted/30 flex items-center justify-center p-12">
                  <div className="text-center">
                    <Cpu className="h-24 w-24 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('hero.interfacePreview')}</p>
                  </div>
                </div>
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
              {t('about.title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('about.description')}
            </p>
          </div>

          {/* Dashboard Screenshot */}
          <div className="max-w-5xl mx-auto">
            <Card className="glass overflow-hidden border-primary/20">
              <div className="w-full h-64 bg-muted/30 flex items-center justify-center">
                <div className="text-center">
                  <Database className="h-16 w-16 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">{t('about.dashboardPreview')}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid - Hydra Style */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            {/* Feature Cards */}
            <Card className="glass p-6 border-primary/20 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('features.openSource.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.openSource.description')}
              </p>
            </Card>

            <Card className="glass p-6 border-primary/20 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('features.aiLearning.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.aiLearning.description')}
              </p>
            </Card>

            <Card className="glass p-6 border-secondary/20 hover:border-secondary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('features.privacy.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.privacy.description')}
              </p>
            </Card>

            <Card className="glass p-6 border-accent/20 hover:border-accent/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('features.shareDrivers.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.shareDrivers.description')}
              </p>
            </Card>

            <Card className="glass p-6 border-primary/20 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('features.smartIndexing.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.smartIndexing.description')}
              </p>
            </Card>

            <Card className="glass p-6 border-secondary/20 hover:border-secondary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MonitorPlay className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('features.integratedPlayer.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.integratedPlayer.description')}
              </p>
            </Card>

            <Card className="glass p-6 border-accent/20 hover:border-accent/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{t('features.lightFast.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('features.lightFast.description')}
              </p>
            </Card>
          </div>

          {/* AI Driver Creation Screenshot */}
          <div className="max-w-5xl mx-auto">
            <Card className="glass overflow-hidden border-secondary/20">
              <div className="w-full h-64 bg-muted/30 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="h-16 w-16 text-secondary mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">{t('features.aiDriverCreation')}</p>
                </div>
              </div>
            </Card>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t('features.aiDriverHint')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <div className="text-4xl font-display font-bold text-primary mb-4">{t('howItWorks.step1.number')}</div>
              <h3 className="font-display font-semibold text-xl mb-3">{t('howItWorks.step1.title')}</h3>
              <p className="text-muted-foreground">
                {t('howItWorks.step1.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-4xl font-display font-bold text-secondary mb-4">{t('howItWorks.step2.number')}</div>
              <h3 className="font-display font-semibold text-xl mb-3">{t('howItWorks.step2.title')}</h3>
              <p className="text-muted-foreground">
                {t('howItWorks.step2.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                <MonitorPlay className="h-8 w-8 text-accent" />
              </div>
              <div className="text-4xl font-display font-bold text-accent mb-4">{t('howItWorks.step3.number')}</div>
              <h3 className="font-display font-semibold text-xl mb-3">{t('howItWorks.step3.title')}</h3>
              <p className="text-muted-foreground">
                {t('howItWorks.step3.description')}
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
              <span className="text-sm font-medium">{t('cta.badge')}</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
              {t('cta.title')}
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg"
                onClick={handleDownload}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-semibold px-10 text-lg group"
              >
                <Download className="h-6 w-6 mr-2 group-hover:animate-bounce" />
                {t('cta.downloadButton')}
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.open('https://github.com/BuuhV-Projects/anidock-hub', '_blank')}
                className="border-primary/20 hover:border-primary/50 hover:bg-primary/10 font-semibold px-10 text-lg group"
              >
                <Github className="h-6 w-6 mr-2 group-hover:rotate-12 transition-transform" />
                {t('cta.githubButton')}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span>{t('cta.openSource')}</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>{t('cta.free')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>{t('cta.noAccount')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-6 w-6 text-primary" />
                <span className="font-display font-bold text-xl">AniDock</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t('footer.description')}
              </p>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.legal')}</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/termos')}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.terms')}
                </button>
                <button 
                  onClick={() => navigate('/privacidade')}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.privacy')}
                </button>
                <button 
                  onClick={() => navigate('/lgpd')}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.lgpd')}
                </button>
                <button 
                  onClick={() => navigate('/direitos-autorais')}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.copyright')}
                </button>
              </div>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.community')}</h3>
              <div className="space-y-2">
                <a 
                  href="https://github.com/BuuhV-Projects/anidock-hub" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.github')}
                </a>
                <a 
                  href="https://github.com/BuuhV-Projects/anidock-hub/issues" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.issues')}
                </a>
                <a 
                  href="https://github.com/BuuhV-Projects/anidock-hub/discussions" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('footer.discussions')}
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border/50 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AniDock. {t('footer.rightsReserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
