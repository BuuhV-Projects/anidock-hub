# Como Funciona o Monorepo

## 📦 Instalação

**Você NÃO precisa fazer build dos packages primeiro!**

Quando você roda `yarn install` na raiz:

1. **Yarn Workspaces** detecta automaticamente todos os workspaces definidos em `package.json`
2. Instala todas as dependências de todos os workspaces
3. Cria **symlinks** (links simbólicos) entre os packages usando `workspace:*`

```bash
# Apenas isso é necessário:
yarn install
```

## 🔗 Como os Packages são Linkados

Quando um app referencia um package com `*` (Yarn v1) ou `workspace:*` (Yarn Berry):

```json
// src/apps/landingpage/package.json
{
  "dependencies": {
    "@anidock/shared-ui": "*"  // ← Yarn v1: usa "*"
    // "@anidock/shared-ui": "workspace:*"  // ← Yarn Berry: usa "workspace:*"
  }
}
```

O Yarn cria um link simbólico que aponta diretamente para o diretório do package. Isso significa que:

- ✅ Mudanças nos packages são refletidas **imediatamente** nos apps
- ✅ Não precisa fazer rebuild dos packages
- ✅ Hot reload funciona normalmente

## 🚀 Desenvolvimento

### Fluxo Normal:

```bash
# 1. Instalar dependências (apenas uma vez, ou quando adicionar novas)
yarn install

# 2. Rodar o app diretamente
yarn dev:landingpage
# ou
yarn dev:desktop
```

**Não precisa:**
- ❌ Build dos packages
- ❌ Rebuild após mudanças nos packages
- ❌ Nada além de `yarn install` inicial

### Por que funciona sem build?

Os packages estão configurados para apontar diretamente para os arquivos fonte:

```json
// src/packages/anime-core/package.json
{
  "main": "./src/index.ts",        // ← Aponta para arquivo fonte
  "types": "./src/index.ts",       // ← TypeScript resolve direto
  "exports": {
    ".": "./src/index.ts"          // ← Vite resolve direto
  }
}
```

O **Vite** e **TypeScript** resolvem os imports diretamente dos arquivos `.ts`/`.tsx` durante:
- ✅ Desenvolvimento (dev server)
- ✅ Build (compilação final)

## 📁 Estrutura de Resolução

Quando você importa:

```typescript
import { Button } from '@anidock/shared-ui';
```

O que acontece:

1. **Yarn** resolve `@anidock/shared-ui` → `src/packages/shared-ui`
2. **Vite/TypeScript** lê o `package.json` do package
3. Encontra `"main": "./src/index.ts"`
4. Resolve para `src/packages/shared-ui/src/index.ts`
5. Processa o arquivo TypeScript diretamente

## 🏗️ Build para Produção

Quando você faz build dos apps:

```bash
yarn build:landingpage
yarn build:desktop
```

O Vite:
1. Resolve todos os imports dos packages
2. Compila tudo junto (packages + apps)
3. Gera bundles otimizados
4. **Ainda não precisa build separado dos packages!**

## 🔄 Quando Reinstalar?

Você só precisa rodar `yarn install` novamente quando:

- ✅ Adicionar/remover dependências em qualquer workspace
- ✅ Mudar versões de dependências
- ✅ Adicionar novos workspaces
- ✅ Clonar o projeto em uma nova máquina

## 📊 Fluxo Visual

```
┌─────────────────────────────────────────┐
│  yarn install (raiz)                     │
│  ↓                                       │
│  • Instala dependências de todos         │
│  • Cria symlinks workspace:*             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  yarn dev:landingpage                            │
│  ↓                                       │
│  Vite resolve imports:                   │
│  @anidock/shared-ui →                    │
│  → src/packages/shared-ui/src/index.ts  │
│  → Processa TypeScript direto            │
│  → Hot reload funciona                   │
└─────────────────────────────────────────┘
```

## ⚠️ Problemas Comuns

### "Module not found"

Se você receber erros de módulo não encontrado:

1. Verifique se rodou `yarn install` na raiz
2. Verifique se o package está listado em `workspaces` no `package.json` raiz
3. Verifique se o app tem `workspace:*` na dependência

### Mudanças não aparecem

- Os symlinks são automáticos, mas às vezes o cache do Vite pode causar problemas
- Tente: `yarn dev:landingpage --force` ou limpe o cache do Vite

### TypeScript não encontra tipos

- Verifique se o `tsconfig.json` do app tem os paths configurados
- Verifique se o package tem `"types"` no `package.json`

## 🎯 Resumo

**Para começar:**
```bash
yarn install    # Uma vez
yarn dev:landingpage    # Rodar app
```

**Não precisa:**
- ❌ Build dos packages
- ❌ Scripts de preparação
- ❌ Ordem específica de comandos

**Funciona porque:**
- ✅ Yarn Workspaces cria symlinks
- ✅ Vite resolve TypeScript direto
- ✅ Packages apontam para arquivos fonte

