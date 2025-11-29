import { Button } from "@anidock/shared-ui";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/LanguageSelector";

const LGPD = () => {
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

        <h1 className="text-4xl font-display font-bold mb-8">{t('lgpd.title')}</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Compromisso com a LGPD</h2>
            <p>
              O AniDock está comprometido com a conformidade à Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018). 
              Este documento explica como tratamos dados pessoais em conformidade com a legislação brasileira.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Base Legal para Tratamento de Dados</h2>
            <p>
              O tratamento de dados pessoais no AniDock é fundamentado nas seguintes bases legais da LGPD:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Consentimento (Art. 7º, I):</strong> Para criação de conta e uso de recursos em nuvem</li>
              <li><strong>Execução de contrato (Art. 7º, V):</strong> Para fornecimento de serviços contratados</li>
              <li><strong>Legítimo interesse (Art. 7º, IX):</strong> Para melhorias no software e segurança</li>
              <li><strong>Exercício regular de direitos (Art. 7º, VI):</strong> Para defesa legal quando necessário</li>
            </ul>
          </section>

          <p className="text-sm mt-8">
            {t('common.lastUpdated')}: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LGPD;
