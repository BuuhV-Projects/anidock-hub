import { Button } from '@anidock/shared-ui';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/LanguageSelector';

const NotFound = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const messages = {
    'pt-BR': {
      title: 'Página não encontrada',
      description: 'A página que você está procurando não existe ou foi movida.',
      button: 'Voltar para o início'
    },
    en: {
      title: 'Page not found',
      description: 'The page you are looking for does not exist or has been moved.',
      button: 'Back to home'
    },
    es: {
      title: 'Página no encontrada',
      description: 'La página que busca no existe o ha sido movida.',
      button: 'Volver al inicio'
    }
  };

  const currentMessages = messages[i18n.language as keyof typeof messages] || messages['pt-BR'];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">{currentMessages.title}</h2>
        <p className="text-muted-foreground mb-8">
          {currentMessages.description}
        </p>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Home className="h-4 w-4" />
          {currentMessages.button}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
