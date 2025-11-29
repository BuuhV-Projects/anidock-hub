import { Button } from '@anidock/shared-ui';
import { Globe } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = () => {
    const currentIndex = languages.findIndex((lang) => lang.code === i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLanguage = languages[nextIndex];
    i18n.changeLanguage(nextLanguage.code);
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLanguageChange}
      className="gap-2"
      title="Alterar idioma / Change language / Cambiar idioma"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{currentLanguage.label}</span>
    </Button>
  );
};
