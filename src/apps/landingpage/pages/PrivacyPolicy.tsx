import { Button } from "@anidock/shared-ui";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/LanguageSelector";

const PrivacyPolicy = () => {
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

        <h1 className="text-4xl font-display font-bold mb-8">{t('privacy.title')}</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introdução</h2>
            <p>
              Esta Política de Privacidade descreve como o AniDock coleta, usa e protege suas informações pessoais. 
              Ao utilizar nosso software, você concorda com as práticas descritas nesta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Princípio de Privacidade Local</h2>
            <p>
              O AniDock foi projetado com privacidade em mente. O software opera prioritariamente de forma local:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Todos os dados indexados são armazenados localmente no seu computador</li>
              <li>Drivers e configurações ficam no seu dispositivo</li>
              <li>Histórico de visualização é mantido apenas localmente</li>
              <li>Nenhuma telemetria ou rastreamento é realizado por padrão</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Informações Coletadas</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.1 Uso Não Autenticado</h3>
            <p>
              Quando você usa o AniDock sem criar uma conta, NENHUMA informação pessoal é coletada ou transmitida 
              para nossos servidores. Tudo permanece 100% local no seu computador.
            </p>
          </section>

          <p className="text-sm mt-8">
            {t('common.lastUpdated')}: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
