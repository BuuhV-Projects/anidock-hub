import { Button } from "@anidock/shared-ui";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/LanguageSelector";

const Copyright = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('legal');

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.backButton')}
        </Button>

        <h1 className="text-4xl font-display font-bold mb-8">{t('copyright.title')}</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Declaração Importante</h2>
            <p className="font-semibold text-foreground">
              O AniDock NÃO hospeda, armazena, distribui, transmite ou disponibiliza qualquer conteúdo protegido 
              por direitos autorais, incluindo vídeos, episódios de anime ou qualquer material audiovisual.
            </p>
            <p className="mt-4">
              O AniDock é exclusivamente uma ferramenta de organização e indexação de informações públicas 
              disponíveis na internet. O software armazena APENAS metadados (títulos, sinopses, imagens de capa) 
              e links para sites de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Natureza do Serviço</h2>
            <p>
              O AniDock funciona como:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Um organizador de bookmarks/favoritos</li>
              <li>Um indexador de informações públicas</li>
              <li>Uma ferramenta de catalogação pessoal</li>
            </ul>
          </section>

          <div className="bg-card p-6 rounded-lg border border-border mt-8">
            <p className="font-semibold text-foreground mb-2">Resumo para Usuários:</p>
            <p>
              Use o AniDock de forma responsável e legal. Organize apenas conteúdo que você tem direito de acessar. 
              Não use para pirataria. Respeite direitos autorais. Você é responsável por suas escolhas.
            </p>
          </div>

          <p className="text-sm mt-8">
            {t('common.lastUpdated')}: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Copyright;
