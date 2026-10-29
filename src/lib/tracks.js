// Carrega automaticamente todos os arquivos de música em src/assets/musicas/
// e, se existir, a capa correspondente (mesmo nome de arquivo) em
// src/assets/capas/. Não precisa editar nenhuma lista manualmente: basta
// soltar os arquivos nessas pastas.
//
// Convenção de nome sugerida: "Artista - Título.mp3". Sem o " - ", o nome
// inteiro do arquivo vira o título e o artista fica ARTISTA_PADRAO.
//
// Um arquivo "padrao.jpg" (ou .jpeg/.png/.webp) em src/assets/capas/ vira a
// capa de qualquer música que não tenha uma capa própria com o mesmo nome.

const musicModules = import.meta.glob('../assets/musicas/*.{mp3,wav,ogg,m4a}', {
  eager: true,
  import: 'default',
})

const capaModules = import.meta.glob('../assets/capas/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const ARTISTA_PADRAO = 'DJ RapWell'
const NOME_CAPA_PADRAO = 'padrao'

function nomeBase(caminho) {
  const arquivo = caminho.split('/').pop()
  return arquivo.replace(/\.[^.]+$/, '')
}

// Um arquivo chamado "padrao.*" em src/assets/capas/ vira a capa usada em
// qualquer música que não tenha uma capa própria (mesmo nome do áudio).
let capaPadrao = null
const capasPorNomeBase = new Map()
for (const [caminho, url] of Object.entries(capaModules)) {
  const base = nomeBase(caminho)
  if (base === NOME_CAPA_PADRAO) {
    capaPadrao = url
  } else {
    capasPorNomeBase.set(base, url)
  }
}

function extrairTituloArtista(nome) {
  const partes = nome.split(' - ')
  if (partes.length >= 2) {
    return { artista: partes[0].trim(), titulo: partes.slice(1).join(' - ').trim() }
  }
  return { artista: ARTISTA_PADRAO, titulo: nome.trim() }
}

// Também usada pras músicas importadas do aparelho, que seguem a mesma
// convenção de nome e recebem a capa padrão.
export function criarFaixa({ id, nomeArquivo, src }) {
  const base = nomeBase(nomeArquivo)
  const { artista, titulo } = extrairTituloArtista(base)
  return {
    id,
    titulo,
    artista,
    src,
    capa: capasPorNomeBase.get(base) || capaPadrao,
  }
}

export const faixas = Object.entries(musicModules)
  .map(([caminho, url]) => criarFaixa({ id: caminho, nomeArquivo: caminho, src: url }))
  .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
