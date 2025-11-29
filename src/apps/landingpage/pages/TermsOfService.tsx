import { Button } from "@anidock/shared-ui";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/LanguageSelector";

const TermsOfService = () => {
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

        <h1 className="text-4xl font-display font-bold mb-8">{t('terms.title')}</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.acceptance.title')}</h2>
            <p>
              {t('terms.acceptance.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.description.title')}</h2>
            <p>
              {t('terms.description.content')}
            </p>
            <p className="mt-4">
              {t('terms.description.note')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.responsibilities.title')}</h2>
            <p>{t('terms.responsibilities.intro')}</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>{t('terms.responsibilities.item1')}</li>
              <li>{t('terms.responsibilities.item2')}</li>
              <li>{t('terms.responsibilities.item3')}</li>
              <li>{t('terms.responsibilities.item4')}</li>
              <li>{t('terms.responsibilities.item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.liability.title')}</h2>
            <p>
              {t('terms.liability.intro')}
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>{t('terms.liability.item1')}</li>
              <li>{t('terms.liability.item2')}</li>
              <li>{t('terms.liability.item3')}</li>
              <li>{t('terms.liability.item4')}</li>
              <li>{t('terms.liability.item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.ip.title')}</h2>
            <p>
              {t('terms.ip.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.modifications.title')}</h2>
            <p>
              {t('terms.modifications.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.termination.title')}</h2>
            <p>
              {t('terms.termination.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.law.title')}</h2>
            <p>
              {t('terms.law.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('terms.contact.title')}</h2>
            <p>
              {t('terms.contact.content')}
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

export default TermsOfService;
