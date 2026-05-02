# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/BuuhV-Projects/anidock-hub/compare/v1.0.1...v1.1.0) (2026-05-02)


### Features

* **desktop:** encrypt AI provider keys via Electron safeStorage ([fe1f684](https://github.com/BuuhV-Projects/anidock-hub/commit/fe1f68467630371110a9e7e0f138bd9efefad131))
* **edit-driver:** allow editing driver name, baseUrl, catalogUrl, sourceUrl ([5a51f40](https://github.com/BuuhV-Projects/anidock-hub/commit/5a51f40487fc53e890a3cda050d97a51b6538270))
* **library:** add user-curated library with status, tags, score, notes + watch stats dashboard ([d6ea616](https://github.com/BuuhV-Projects/anidock-hub/commit/d6ea616ebe1ee9e4bf4225d565dc44c77e8c4fe1))


### Bug Fixes

* **ai-driver:** force UTF-8 decoding in CORS proxy fetchHTML ([fb3ab15](https://github.com/BuuhV-Projects/anidock-hub/commit/fb3ab156ea6b79e7881f92fbf34ff902b9e4c105))
* **ai-driver:** friendly parse error and drop dead cors-anywhere proxy ([7524e7f](https://github.com/BuuhV-Projects/anidock-hub/commit/7524e7f44cf6087f7e53096cc4d1659245adf0aa))
* **app-core:** four runtime bugs in core flows ([0a6a229](https://github.com/BuuhV-Projects/anidock-hub/commit/0a6a229d2943b049ddfb81e22c8b7a2b8cef52e2))
* **crawler:** force UTF-8 decoding when fetching via CORS proxies ([d0d9db6](https://github.com/BuuhV-Projects/anidock-hub/commit/d0d9db6b1a042ac35cdd96e42e515b8a84af9966))
* **crawler:** preserve external URLs when resolving against driver base ([6608cee](https://github.com/BuuhV-Projects/anidock-hub/commit/6608ceeffa48a6cac76f247b3aeceff9e4973d91))
* **crawler:** tolerate empty episodeNumber selector in crawlEpisodes ([b3da480](https://github.com/BuuhV-Projects/anidock-hub/commit/b3da480725b7c0424d8afeef7e5a955cf529c63b))
* **create-driver:** reuse existing AnimeIndex per driver and persist site URL ([db926e5](https://github.com/BuuhV-Projects/anidock-hub/commit/db926e5f32004c3da2cbf017b05402c706ae7aaa))
* delay ([803f7ff](https://github.com/BuuhV-Projects/anidock-hub/commit/803f7ffb67abc2e468f997d4959e4ca792ba74d9))
* **desktop:** re-enable Chromium sandbox in Puppeteer crawler ([2e1bfaa](https://github.com/BuuhV-Projects/anidock-hub/commit/2e1bfaa10fd1accad8a8354bf80eafa1d9fe15e4))
* **desktop:** replace nonexistent 'yarn changelog' alias with standard-version ([088fe7a](https://github.com/BuuhV-Projects/anidock-hub/commit/088fe7a5fb34cf4bd6ab77304956502f52cbfa05))
* driver ([8d7d56c](https://github.com/BuuhV-Projects/anidock-hub/commit/8d7d56c808192237b9ea39391a64c9ce964c0e47))
* driver ([d43c30f](https://github.com/BuuhV-Projects/anidock-hub/commit/d43c30f6331b2a92eda9441fa6be2fdd94f31d64))
* **drivers:** tighten import validation and use crypto.randomUUID for episodes ([a91d99d](https://github.com/BuuhV-Projects/anidock-hub/commit/a91d99da71e1d586dbf850982a3965b994e659fa))
* hooks and lint ([1bade77](https://github.com/BuuhV-Projects/anidock-hub/commit/1bade770934600ddfb1bbd2ab395b424ae3dbd05))
* lint ([fd59589](https://github.com/BuuhV-Projects/anidock-hub/commit/fd595898e287d29b849260d843066a7c1cc71629))
* puppeteer ([054a0ae](https://github.com/BuuhV-Projects/anidock-hub/commit/054a0ae8e26917f147a720d594a15c70e4117f59))
* push ([6da11bd](https://github.com/BuuhV-Projects/anidock-hub/commit/6da11bd6b3b54e673d4afe8efd144efaa9fce2eb))
* push ([5485d97](https://github.com/BuuhV-Projects/anidock-hub/commit/5485d9772a6838564b36811441ceada890f566df))
* **smoke-test:** add --no-sandbox so the script can launch Chromium on Ubuntu 24.04 CI runners ([791d860](https://github.com/BuuhV-Projects/anidock-hub/commit/791d8603edcf4778706713f3362758a6e64bbefa))
* url dos animes e episódio ao gerar o driver ([440baac](https://github.com/BuuhV-Projects/anidock-hub/commit/440baacacfca04f36598342f63b30a61a547970a))
* yarn.lock ([6d40ce8](https://github.com/BuuhV-Projects/anidock-hub/commit/6d40ce884876cde304d23925527a8d7967484a16))

### [1.0.1](https://github.com/BuuhV-Projects/anidock-hub/compare/v1.1.0...v1.0.1) (2025-11-29)


### Bug Fixes

* rc ([26e8639](https://github.com/BuuhV-Projects/anidock-hub/commit/26e8639de219a3a56a05c0478f9692afe45f7d7f))

## 1.1.0 (2025-11-29)


### Features

* Arquitetura monorepo ([cba8fb7](https://github.com/BuuhV-Projects/anidock-hub/commit/cba8fb72088eef69ee50e78869c471a34795a1d6))
* Build do app para desktop ([90b6dd3](https://github.com/BuuhV-Projects/anidock-hub/commit/90b6dd3b0699521744be0b5c84a32f54fedb8549))
* cache do electron ([196bad2](https://github.com/BuuhV-Projects/anidock-hub/commit/196bad23f42d48d4a33ca5e96fa282973e715839))
* cache e dev tools ([6d57c1a](https://github.com/BuuhV-Projects/anidock-hub/commit/6d57c1a011ffbaf8ad475418a54ef9ec6cc3b2a7))
* Rotas ([0793dd0](https://github.com/BuuhV-Projects/anidock-hub/commit/0793dd0ec9427de0cea47165f617be6a9e8040c2))
* Versão desktop com vite-electron ([548cff9](https://github.com/BuuhV-Projects/anidock-hub/commit/548cff9cd908bfb60b03d263d01778e5b3535a4d))


### Bug Fixes

* .env ([adc16e9](https://github.com/BuuhV-Projects/anidock-hub/commit/adc16e9465bc9dcf451a65e1765281484fb03a84))
* Build do electron ([3c61a40](https://github.com/BuuhV-Projects/anidock-hub/commit/3c61a405299f106687653f7896d9e816414653fe))
* builder ([a9940b4](https://github.com/BuuhV-Projects/anidock-hub/commit/a9940b4253fe99d29da8390dbbfb03c1496bf283))
* default env ([01c9e5a](https://github.com/BuuhV-Projects/anidock-hub/commit/01c9e5ac2ee99adc99612a6d0edf9be699a93125))
* devtools ([21f90b9](https://github.com/BuuhV-Projects/anidock-hub/commit/21f90b9fab1264add03b982e81d1d6ad2a97ca1a))
* env ([b64d02f](https://github.com/BuuhV-Projects/anidock-hub/commit/b64d02f6e66b976d6f870cd9b89e386ff925afd9))
* env e secrets ([0eac9f2](https://github.com/BuuhV-Projects/anidock-hub/commit/0eac9f2621a35d63942a3f40fb13da9b9df1e5c0))
* Estrutura desktop ([f22ffc7](https://github.com/BuuhV-Projects/anidock-hub/commit/f22ffc7053474203eacbca588000c3c98dc26dd7))
* landingpage ([f003a71](https://github.com/BuuhV-Projects/anidock-hub/commit/f003a71de5c7d4a9e7143f0416012a762495b2fa))
* modal external link para desktop ([4a0869d](https://github.com/BuuhV-Projects/anidock-hub/commit/4a0869d65a2eb1cb913114ab18703380a8eed523))
* postcss ([7f52989](https://github.com/BuuhV-Projects/anidock-hub/commit/7f529891ddd75c39c1ec54e27434dac717fb00cc))
* scripts ([3d1d65e](https://github.com/BuuhV-Projects/anidock-hub/commit/3d1d65e336e4499449261617dc6dd46b3dcd1f2c))
* text ([d193efe](https://github.com/BuuhV-Projects/anidock-hub/commit/d193efe4026abb92bb3b7c7c7c40877a8cac9e42))
* versão web ([78a40d4](https://github.com/BuuhV-Projects/anidock-hub/commit/78a40d4f9277c673c3f4c4bfa8c3e7083865f6dc))
* web ([7ef6dba](https://github.com/BuuhV-Projects/anidock-hub/commit/7ef6dba0995a37763b9a87d3b28dbd486d976f1e))
