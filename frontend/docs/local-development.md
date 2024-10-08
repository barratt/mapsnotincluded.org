# Maps Not Included - Local Development

[Root README](../README.md)

## Local Environment Setup and Configuration

1. Clone the repository: [Maps Not Included](https://github.com/barratt/mapsnotincluded.org) from GitHub.
1. Download, and install, the latest version of [VS Code](https://code.visualstudio.com/)
1. Download and install [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (*Note:* disable Vetur).
1. Open the workspace file for the portion of the project you're working on:
   - [Front-End/UI](../../frontend.code-workspace)
   - [Back-End/API](../../backend.code-workspace)
   - [Worker](../../game-worker.code-workspace)
   - [ONI Mod](../../mod.code-workspace)

## Vite Configuration

Maps Not Included uses ViteJS. The project's vite configuration can be found [here](../vite.config.js).

[ViteJS Configuration Reference](https://vitejs.dev/config/).

## Front-End Local Development

Maps Not Included leverages npm for local development. All NPM commands should be run in the same directory as the package.json file.
For the front-end that file is located in the ./frontend directory.

Begin by instaling necessary dependencies.

```sh
npm install
```

You can run a local copy of the front-end, with hot-reload enabled using:

```sh
npm run dev
```

A production ready build can be created localy be executing:

```sh
npm run build
```

## Back-End Local Development

Coming Soon!

## Mod Local Development

Coming Soon!
