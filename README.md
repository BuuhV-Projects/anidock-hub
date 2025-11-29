# AniDock Hub

🎌 **Indexador inteligente de animes open source para Windows**

AniDock é um software desktop que revoluciona como você organiza e assiste animes. Cole o link de qualquer site, nossa IA analisa a estrutura, cria um "driver" automaticamente e indexa todo o catálogo localmente no seu computador.

[![GitHub](https://img.shields.io/badge/GitHub-BuuhV--Projects%2Fanidock--hub-blue?logo=github)](https://github.com/BuuhV-Projects/anidock-hub)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Windows](https://img.shields.io/badge/platform-Windows%2010%2F11-blue.svg)](https://github.com/BuuhV-Projects/anidock-hub/releases)

## ✨ Características

- 🤖 **IA que Aprende** - Cole qualquer URL e deixe a IA criar drivers automaticamente
- 🔒 **100% Privado** - Tudo roda localmente, zero telemetria, seus dados nunca saem do PC
- 💾 **Armazenamento Local** - IndexedDB para guardar drivers, animes e histórico
- 🎨 **Interface Moderna** - Design clean e responsivo com Tailwind CSS
- 🔄 **Backup & Restore** - Exporte e importe sua biblioteca completa
- 👥 **Compartilhe Drivers** - Exporte drivers e compartilhe com a comunidade
- 🎬 **Player Integrado** - Assista diretamente no app ou abra links externos
- 📊 **Histórico Completo** - Rastreie todos os episódios que você assistiu
- 🌐 **Open Source** - Código 100% aberto, audite e contribua

## 📁 Estrutura do Projeto

Monorepo organizado com Yarn Workspaces:

```
src/
├── apps/
│   ├── landingpage/         # Site institucional (Lovable/Vite)
│   │   └── pages/           # Landing, Termos, Privacidade, LGPD, Copyright
│   │
│   ├── desktop/             # Aplicação Electron para Windows
│   │   ├── main/            # Processo principal do Electron
│   │   ├── preload/         # Scripts preload
│   │   ├── renderer/        # Interface React
│   │   └── resources/       # Ícones e assets
│   │
│   └── web/                 # Versão web (Lovable/Vite)
│       └── (mesma estrutura da aplicação core)
│
└── packages/
    ├── app-core/            # Lógica principal da aplicação
    │   ├── pages/           # Todas as páginas (Dashboard, Browse, etc.)
    │   ├── contexts/        # Contextos React (PlataformContext)
    │   ├── router/          # Configuração de rotas
    │   └── lib/             # Libs (indexedDB, localStorage, aiDriver, crawler)
    │
    ├── anime-core/          # Motor de crawling
    │   └── src/
    │       ├── types.ts     # Tipos: Driver, LocalAnime, LocalEpisode
    │       ├── crawler.ts   # Crawling client-side
    │       └── index.ts
    │
    ├── anime-drivers/       # Drivers exemplo
    │   └── src/
    │       └── example.ts   # Estrutura de driver
    │
    ├── shared-ui/           # Componentes React (shadcn/ui)
    │   └── src/
    │       ├── components/  # Button, Card, Dialog, etc.
    │       └── styles/      # Design system (index.css)
    │
    └── shared-utils/        # Utilitários compartilhados
        └── src/
            ├── hooks/       # use-mobile
            └── utils.ts     # Helpers (cn, etc.)
```

## 🚀 Instalação

### Para Usuários

1. Acesse a [página de releases](https://github.com/BuuhV-Projects/anidock-hub/releases)
2. Baixe a versão mais recente para Windows (`.exe`)
3. Execute o instalador
4. Pronto! O AniDock estará instalado

### Para Desenvolvedores

**Pré-requisitos:**
- Node.js 18+
- Yarn ou npm
- Windows 10/11 (para build do Electron)

**Clone e instale:**

```bash
# Clone o repositório
git clone https://github.com/BuuhV-Projects/anidock-hub.git
cd anidock-hub

# Instale as dependências
yarn install
# ou
npm install
```

## 💻 Desenvolvimento

### Executar Aplicações

```bash
# Landing page (porta 8080)
yarn dev:landingpage

# Aplicação web (porta 8081)
yarn dev:web

# Aplicação desktop (Electron)
cd src/apps/desktop
yarn dev

# Aplicação web (padrão - Lovable)
yarn dev
```

### Build

```bash
# Build da landing page
yarn build:landingpage

# Build da aplicação web
yarn build:web

# Build da aplicação desktop (Windows)
cd src/apps/desktop
yarn build:win
```

### Preview

```bash
# Preview da landing page
yarn preview:landingpage

# Preview da aplicação web
yarn preview:web
```

## 🧩 Arquitetura

### Armazenamento Local

O AniDock usa **IndexedDB** para armazenar todos os dados localmente:

- **Drivers** - Configurações de sites aprendidas pela IA
- **Índices de Animes** - Catálogos completos indexados
- **Histórico** - Episódios assistidos
- **Chaves de API** - OpenAI/Gemini (opcionais, para IA)

### Sistema de Drivers

Drivers definem como extrair dados de sites específicos. Existem duas formas de criar drivers:

1. **AI-Powered** - Cole uma URL, a IA analisa e cria automaticamente
2. **Manual** - Defina seletores CSS manualmente para sites complexos

**Estrutura de um Driver:**

```typescript
interface Driver {
  publicId: string;
  name: string;
  domain: string;
  catalogUrl?: string;
  sourceUrl?: string;
  config: {
    catalog?: CatalogSelectors;
    animePage?: AnimePageSelectors;
    episodePage?: EpisodePageSelectors;
  };
  totalAnimes?: number;
  isPublic: boolean;
  lastIndexedAt?: Date;
  indexedData?: AnimeIndex;
}
```

### IA Client-Side

Para usar a geração automática de drivers, você pode fornecer sua própria chave de API:

- **OpenAI** (GPT-4 ou superior)
- **Google Gemini** (Gemini Pro)

As chaves são armazenadas localmente e nunca saem do seu computador.

## 📦 Packages

### `@anidock/app-core`

Lógica principal da aplicação compartilhada entre web e desktop:
- Páginas (Dashboard, Browse, AnimeDetails, Player, etc.)
- Gerenciamento de drivers e índices
- Histórico de visualização
- Integração com IA para criar drivers

### `@anidock/anime-core`

Motor de crawling e parsing:
- Tipos TypeScript para drivers e animes
- Funções de crawling client-side
- Parser HTML usando seletores CSS

### `@anidock/anime-drivers`

Exemplos e templates de drivers:
- Driver exemplo documentado
- Estrutura para criar novos drivers

### `@anidock/shared-ui`

Componentes React reutilizáveis:
- Todos os componentes shadcn/ui customizados
- Design system completo em Tailwind CSS
- Componentes específicos (VideoPlayerModal, NavLink, etc.)

### `@anidock/shared-utils`

Utilitários compartilhados:
- Hooks React (`useIsMobile`)
- Funções auxiliares (`cn` para classes)
- Validações Zod

## 🛠️ Stack Tecnológica

- **Framework UI**: React 18 + TypeScript
- **Build Tools**: Vite (web/landing) + Electron Vite (desktop)
- **Estilização**: Tailwind CSS + shadcn/ui
- **Roteamento**: React Router v6
- **Armazenamento**: IndexedDB (Dexie.js)
- **Desktop**: Electron + electron-builder
- **Validação**: Zod
- **HTTP Client**: Fetch API
- **Parsing HTML**: linkedom (client-side)
- **Monorepo**: Yarn Workspaces

## 🎯 Funcionalidades Principais

### Dashboard
- Estatísticas da biblioteca
- Ações rápidas (criar driver, importar, backup)
- Animes recentemente adicionados
- Últimos episódios assistidos

### Browse
- Navegue por todos os animes indexados
- Busca por título
- Filtros por driver
- Cards com covers e informações

### Gerenciamento de Drivers
- Criar drivers com IA (OpenAI/Gemini)
- Criar drivers manualmente
- Importar drivers JSON
- Editar drivers existentes
- Exportar e compartilhar drivers

### Player
- Player integrado ou link externo
- Detecção automática de tipo (iframe/video/link)
- Histórico de visualização
- Marcação automática de episódios assistidos

### Backup & Restore
- Exporte toda sua biblioteca (drivers, índices, histórico)
- Importe de backups anteriores
- Migre entre computadores
- Estatísticas da biblioteca

### Configurações
- Gerencie chaves de API (OpenAI/Gemini)
- Visualize chaves mascaradas
- Edite ou delete chaves salvas

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `yarn dev` | App web (porta padrão Lovable) |
| `yarn dev:landingpage` | Landing page (porta 8080) |
| `yarn dev:web` | App web (porta 8081) |
| `yarn build` | Build de ambos (landing + web) |
| `yarn build:landingpage` | Build da landing page |
| `yarn build:web` | Build da aplicação web |
| `yarn lint` | Executa ESLint |
| `yarn preview:landingpage` | Preview do build da landing |
| `yarn preview:web` | Preview do build do web |

**Para a aplicação desktop:**

```bash
cd src/apps/desktop
yarn dev          # Desenvolver com hot reload
yarn build:win    # Build para Windows (.exe)
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga o estilo de código existente
- Adicione testes quando aplicável
- Atualize a documentação se necessário
- Mantenha commits atômicos e bem descritos

## 📄 Licença

Este projeto é distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔗 Links Úteis

- [Website Oficial](https://anidock.lovableproject.com)
- [Releases](https://github.com/BuuhV-Projects/anidock-hub/releases)
- [Issues](https://github.com/BuuhV-Projects/anidock-hub/issues)
- [Documentação Vite](https://vitejs.dev/)
- [Documentação React](https://react.dev/)
- [Documentação Electron](https://www.electronjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 🙏 Agradecimentos

- Comunidade open source
- Todos os contribuidores do projeto
- Usuários que testam e reportam bugs

---

**Feito com ❤️ pela comunidade**
