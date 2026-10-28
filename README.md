# Mini Player 🎵

Um mini player de música no estilo Spotify Web, porém bem mais simples: só a lista de reprodução e o player. Feito com **React + Vite + Tailwind CSS**, sem backend — as músicas ficam junto com o código e tudo roda no navegador.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Como adicionar músicas

1. Coloque os arquivos de áudio (`.mp3`, `.wav`, `.ogg` ou `.m4a`) dentro de `src/assets/musicas/`.
2. (Opcional) Pra dar uma capa pra faixa, coloque uma imagem (`.jpg`, `.jpeg`, `.png` ou `.webp`) em `src/assets/capas/` **com o mesmo nome do arquivo de áudio** (só muda a extensão). Sem capa, aparece um ícone de nota musical no lugar.

A playlist é montada **automaticamente** a partir do que estiver nessas pastas — não precisa editar nenhum código nem manter uma lista manual.

### Nome do arquivo = artista e título

Nomeie o arquivo assim: `Artista - Título.mp3`. O player separa pelo primeiro ` - ` e usa a primeira parte como artista e o resto como título.

Exemplo:

```
src/assets/musicas/
  Marina Sena - Por Supuesto.mp3
  Tim Maia - Não Vou Ficar.mp3

src/assets/capas/
  Marina Sena - Por Supuesto.jpg   (capa opcional, mesmo nome)
```

Se o arquivo não tiver ` - ` no nome, o nome inteiro vira o título e o artista fica "Artista desconhecido".

## Funcionalidades do player

- Play/pause, próxima/anterior, barra de progresso arrastável.
- Embaralhar e repetir a faixa atual.
- Controle de volume.
- "Voltar" reinicia a música atual se já tiver passado de 3s tocando (igual ao Spotify), senão vai pra faixa anterior.
- Duração de cada faixa aparece na lista assim que o navegador consegue ler os metadados do arquivo.

## Deploy no GitHub Pages

Já vem com um workflow (`.github/workflows/deploy.yml`) que builda o projeto e publica em `https://<seu-usuário>.github.io/mini-player-musica/` a cada push na branch `main`.

**Só uma vez**, antes do primeiro deploy, é preciso habilitar isso nas configurações do repositório no GitHub:

`Settings` → `Pages` → em "Build and deployment", mude a opção **Source** para **GitHub Actions**.

Depois disso, todo push em `main` publica a versão mais recente automaticamente.

## Estrutura do projeto

```
src/
  assets/
    musicas/      coloque os arquivos de áudio aqui
    capas/        (opcional) capas das músicas, mesmo nome do áudio
  components/      Player, Playlist, TrackRow, ícones
  hooks/           lógica de reprodução (useAudioPlayer) e duração das faixas
  lib/             tracks.js (monta a playlist automaticamente) e utils.js
  App.jsx          junta tudo
```
