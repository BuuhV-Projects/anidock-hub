import React from 'react';
import { useState, useEffect } from 'react';
import { Button, Card, Input, Label, Alert, AlertDescription } from '@anidock/shared-ui';
import { Settings as SettingsIcon, Eye, EyeOff, Trash2, Save, ArrowLeft, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@anidock/shared-ui';
import { getAIKey, saveAIKey, deleteAIKey } from '../lib/localStorage';

const Settings = () => {
  const navigate = useNavigate();
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [hasOpenaiKey, setHasOpenaiKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = () => {
    const savedOpenai = getAIKey('openai');
    const savedGemini = getAIKey('gemini');

    if (savedOpenai) {
      setOpenaiKey(savedOpenai);
      setHasOpenaiKey(true);
    }

    if (savedGemini) {
      setGeminiKey(savedGemini);
      setHasGeminiKey(true);
    }
  };

  const maskKey = (key: string): string => {
    if (key.length <= 8) return '****';
    return `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`;
  };

  const handleSaveOpenai = () => {
    if (!openaiKey.trim()) {
      toast.error('Insira uma API key válida');
      return;
    }

    saveAIKey('openai', openaiKey);
    setHasOpenaiKey(true);
    toast.success('Chave OpenAI salva com sucesso!');
  };

  const handleSaveGemini = () => {
    if (!geminiKey.trim()) {
      toast.error('Insira uma API key válida');
      return;
    }

    saveAIKey('gemini', geminiKey);
    setHasGeminiKey(true);
    toast.success('Chave Gemini salva com sucesso!');
  };

  const handleDeleteOpenai = () => {
    if (confirm('Tem certeza que deseja deletar a chave OpenAI?')) {
      deleteAIKey('openai');
      setOpenaiKey('');
      setHasOpenaiKey(false);
      toast.success('Chave OpenAI deletada');
    }
  };

  const handleDeleteGemini = () => {
    if (confirm('Tem certeza que deseja deletar a chave Gemini?')) {
      deleteAIKey('gemini');
      setGeminiKey('');
      setHasGeminiKey(false);
      toast.success('Chave Gemini deletada');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Configurações</h1>
          </div>
        </div>

        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            Suas chaves de API são armazenadas localmente no computador e nunca são enviadas para servidores externos.
            São usadas apenas para gerar drivers automaticamente com IA.
          </AlertDescription>
        </Alert>

        {/* OpenAI Settings */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">OpenAI API Key</h2>
                <p className="text-sm text-muted-foreground">
                  Usada para gerar drivers com GPT-4
                </p>
              </div>
              {hasOpenaiKey && (
                <Button variant="destructive" size="sm" onClick={handleDeleteOpenai}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="openai-key">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="openai-key"
                    type={showOpenaiKey ? 'text' : 'password'}
                    value={showOpenaiKey ? openaiKey : (hasOpenaiKey ? maskKey(openaiKey) : openaiKey)}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  >
                    {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleSaveOpenai}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Gemini Settings */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Google Gemini API Key</h2>
                <p className="text-sm text-muted-foreground">
                  Usada para gerar drivers com Gemini Pro
                </p>
              </div>
              {hasGeminiKey && (
                <Button variant="destructive" size="sm" onClick={handleDeleteGemini}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemini-key">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="gemini-key"
                    type={showGeminiKey ? 'text' : 'password'}
                    value={showGeminiKey ? geminiKey : (hasGeminiKey ? maskKey(geminiKey) : geminiKey)}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIza..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                  >
                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleSaveGemini}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Alert variant="default">
          <AlertDescription>
            <strong>Como obter suas chaves:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>OpenAI: Acesse <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com/api-keys</a></li>
              <li>Google Gemini: Acesse <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">makersuite.google.com/app/apikey</a></li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Settings;
