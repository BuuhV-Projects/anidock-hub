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
yarn dev:web
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
yarn build:web
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

## 🚀 Deploy via Lovable (raiz como fachada)

A produção em `https://anidock.buuhvprojects.com/` é deployada via Lovable, que lê
o `index.html`, `vite.config.ts` e `tsconfig.json` da **raiz** do repositório.

Por isso a raiz mantém um app Vite "fachada" que **não é um workspace do
monorepo** — é apenas o ponto de entrada esperado pelo Lovable. Os arquivos
envolvidos são:

- `index.html` — define qual app é deployado (atualmente aponta para o
  `landingpage` em produção). Quando precisar trocar o app deployado, edite o
  `<script src>` deste arquivo manualmente apontando para
  `./src/apps/<app>/main.tsx`.
- `vite.config.ts` — config do Vite usado pelo Lovable. Aliases dos packages
  são duplicados aqui para o Vite resolver os imports do app deployado.
- `tsconfig.json` — referencia os tsconfigs dos apps `landingpage` e `web`.
- Scripts `dev`, `build`, `build:dev`, `preview` no `package.json` raiz são os
  comandos que o Lovable executa.

**Importante:** ao desenvolver localmente, prefira sempre os scripts
nomeados (`yarn dev:landingpage`, `yarn dev:web`, etc.). A raiz é exclusivamente
para o pipeline Lovable.

## 🪝 Git Hooks

O repositório versiona um hook `pre-push` em `.githooks/pre-push` que roda
`yarn lint` em todo push e o smoke test do crawler quando o changeset toca
arquivos do crawler (`clientCrawler.ts`, `aiDriver.ts`, `puppeteerCrawler.ts`,
`smoke-test-driver.mjs` ou as fixtures).

Para ativar (uma vez por clone):

```bash
yarn hooks:install
```

Isso roda `git config core.hooksPath .githooks` e passa a usar os hooks
versionados em vez dos hooks default em `.git/hooks/`.

Para desativar:

```bash
yarn hooks:uninstall
```

### Bypasses

Em pushes raros onde o smoke test atrapalha (sem internet, site fora do ar,
release urgente), use:

```bash
ANIDOCK_SKIP_SMOKE=1 git push      # mantém o lint, pula só o smoke
ANIDOCK_SKIP_HOOKS=1 git push      # pula tudo (lint + smoke)
git push --no-verify               # pula TODOS os hooks do git
```

