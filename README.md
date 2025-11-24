# AniDock Hub

Sistema de indexação de animes com arquitetura monorepo, separando o site institucional da aplicação desktop.

## 📁 Estrutura do Projeto

Este projeto utiliza **Yarn Workspaces** para gerenciar um monorepo com a seguinte estrutura:

```
src/
├─ apps/
│   ├─ landingpage/                  # Site institucional (Vite)
│   │   └─ pages/            # Páginas: Index, Termos, Privacidade, LGPD, Copyright
│   │
│   └─ desktop/              # Aplicação desktop (Vite)
│       ├─ pages/            # Todas as páginas da aplicação
│       ├─ contexts/         # Contextos React (AuthContext)
│       └─ lib/              # Wrappers específicos do desktop (localStorage, crawler)
│
└─ packages/
    ├─ anime-core/           # Núcleo do sistema
    │   └─ src/
    │       ├─ types.ts      # Tipos: Driver, LocalAnime, LocalEpisode, etc.
    │       ├─ crawler.ts    # Funções de crawling e parsing
    │       └─ index.ts      # Exports principais
    │
    ├─ anime-drivers/        # Drivers em JS/TS
    │   └─ src/
    │       ├─ example.ts    # Exemplo de driver
    │       └─ index.ts      # Exports
    │
    ├─ shared-ui/            # Componentes React compartilhados
    │   └─ src/
    │       ├─ components/   # Componentes UI (shadcn/ui) + componentes customizados
    │       └─ index.ts      # Exports
    │
    └─ shared-utils/          # Funções comuns
        └─ src/
            ├─ hooks/        # Hooks React (use-mobile, etc.)
            ├─ validations/  # Schemas Zod
            ├─ integrations/ # Integrações (Supabase)
            └─ index.ts      # Exports
```

## 🚀 Como Começar

### Pré-requisitos

- **Node.js** 18+ e **npm** ou **yarn**
- Recomendado: [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) para gerenciar versões do Node

### Instalação

```sh
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd anidock-hub

# 2. Instale as dependências (Yarn Workspaces instalará tudo automaticamente)
yarn install
# ou
npm install
```

## 💻 Desenvolvimento

### Executar Aplicações

```sh
# Site institucional (porta 8080)
yarn dev:landingpage

# Aplicação desktop (porta 8081)
yarn dev:desktop

# Aplicação desktop (padrão)
yarn dev
```

### Build

```sh
# Build do site institucional
yarn build:landingpage

# Build da aplicação desktop
yarn build:desktop

# Build de ambos
yarn build
```

### Preview

```sh
# Preview do site institucional
yarn preview:landingpage

# Preview da aplicação desktop
yarn preview:desktop
```

## 📦 Packages

### `@anidock/anime-core`

Núcleo do sistema de indexação. Contém:
- **Tipos**: `Driver`, `LocalAnime`, `LocalEpisode`, `AnimeIndex`
- **Crawler**: Funções para fazer crawling de sites usando drivers
- **Parser**: Lógica de parsing HTML usando seletores CSS

**Uso:**
```typescript
import { Driver, crawlWithDriver, type FetchHTMLFunction } from '@anidock/anime-core';
```

### `@anidock/anime-drivers`

Estrutura para drivers em JavaScript/TypeScript. Drivers definem como extrair dados de sites específicos.

**Uso:**
```typescript
import { exampleDriver, type Driver } from '@anidock/anime-drivers';
```

### `@anidock/shared-ui`

Componentes React compartilhados entre as aplicações:
- Componentes shadcn/ui (Button, Card, Dialog, etc.)
- Componentes customizados (VideoPlayerModal, NavLink, ProtectedRoute)

**Uso:**
```typescript
import { Button, Card, VideoPlayerModal } from '@anidock/shared-ui';
```

### `@anidock/shared-utils`

Utilitários compartilhados:
- **Hooks**: `useIsMobile`, etc.
- **Validações**: Schemas Zod para autenticação
- **Integrações**: Cliente Supabase
- **Utils**: Funções auxiliares (`cn` para classes CSS)

**Uso:**
```typescript
import { cn, useIsMobile, supabase, signInSchema } from '@anidock/shared-utils';
```

## 🏗️ Arquitetura

### Apps

#### `@anidock/landingpage`
Site institucional que roda na rota `/`. Contém:
- Landing page
- Páginas legais (Termos, Privacidade, LGPD, Copyright)

#### `@anidock/desktop`
Aplicação principal com todas as funcionalidades:
- Autenticação
- Dashboard
- Browse de animes
- Gerenciamento de drivers
- Player de vídeo
- Indexação manual

### Packages

Os packages são organizados por responsabilidade:

- **anime-core**: Lógica de negócio pura, sem dependências de UI ou browser
- **anime-drivers**: Drivers como módulos JS/TS reutilizáveis
- **shared-ui**: Componentes React reutilizáveis
- **shared-utils**: Utilitários e integrações compartilhadas

## 🛠️ Tecnologias

- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **React** - Biblioteca UI
- **React Router** - Roteamento
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Zod** - Validação de schemas
- **Supabase** - Backend (auth, database, edge functions)
- **Yarn Workspaces** - Gerenciamento de monorepo

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `yarn dev` | Inicia o app desktop (padrão) |
| `yarn dev:landingpage` | Inicia o site institucional |
| `yarn dev:desktop` | Inicia a aplicação desktop |
| `yarn build` | Build de ambos os apps |
| `yarn build:landingpage` | Build do site institucional |
| `yarn build:desktop` | Build da aplicação desktop |
| `yarn lint` | Executa o linter |
| `yarn preview:landingpage` | Preview do build do site |
| `yarn preview:desktop` | Preview do build do desktop |

## 🔧 Configuração

### Variáveis de Ambiente

Como cada app tem `root: __dirname` configurado, você pode criar arquivos `.env` em cada app ou na raiz do projeto:

**Opção 1: .env na raiz (compartilhado entre apps)**
```bash
# Na raiz do projeto
cp .env.example .env
```

**Opção 2: .env em cada app (específico por app)**
```bash
# Para o app landingpage
cp src/apps/landingpage/.env.example src/apps/landingpage/.env

# Para o app desktop
cp src/apps/desktop/.env.example src/apps/desktop/.env
```

Edite o(s) `.env` e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

**Nota:** O Vite procura arquivos `.env` primeiro no diretório do app (quando `root: __dirname` está configurado), depois na raiz do projeto. Você pode usar qualquer uma das opções acima.

### TypeScript

Cada workspace tem seu próprio `tsconfig.json` com paths configurados para os packages.

### Vite

Cada app tem seu próprio `vite.config.ts` com aliases configurados para os packages.

## 📚 Desenvolvimento de Drivers

Drivers são módulos JavaScript/TypeScript que definem como extrair dados de sites específicos. Veja o exemplo em `src/packages/anime-drivers/src/example.ts`.

## 🤝 Contribuindo

1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado.

## 🔗 Links Úteis

- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do React](https://react.dev/)
- [Documentação do shadcn/ui](https://ui.shadcn.com/)
- [Documentação do Yarn Workspaces](https://yarnpkg.com/features/workspaces)
- [Documentação do Supabase](https://supabase.com/docs)
