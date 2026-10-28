// Carrega automaticamente todos os arquivos de música em src/assets/musicas/
// e, se existir, a capa correspondente (mesmo nome de arquivo) em
// src/assets/capas/. Não precisa editar nenhuma lista manualmente: basta
// soltar os arquivos nessas pastas.
//
// Convenção de nome sugerida: "Artista - Título.mp3". Sem o " - ", o nome
// inteiro do arquivo vira o título e o artista fica ARTISTA_PADRAO.

const musicModules = import.meta.glob('../assets/musicas/*.{mp3,wav,ogg,m4a}', {
  eager: true,
  import: 'default',
})

const capaModules = import.meta.glob('../assets/capas/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const ARTISTA_PADRAO = 'DJ RapWell'

function nomeBase(caminho) {
  const arquivo = caminho.split('/').pop()
  return arquivo.replace(/\.[^.]+$/, '')
}

const capasPorNomeBase = new Map()
for (const [caminho, url] of Object.entries(capaModules)) {
  capasPorNomeBase.set(nomeBase(caminho), url)
}

function extrairTituloArtista(nome) {
  const partes = nome.split(' - ')
  if (partes.length >= 2) {
    return { artista: partes[0].trim(), titulo: partes.slice(1).join(' - ').trim() }
  }
  return { artista: ARTISTA_PADRAO, titulo: nome.trim() }
}

export const faixas = Object.entries(musicModules)
  .map(([caminho, url]) => {
    const base = nomeBase(caminho)
    const { artista, titulo } = extrairTituloArtista(base)
    return {
      id: caminho,
      titulo,
      artista,
      src: url,
      capa: capasPorNomeBase.get(base) || null,
    }
  })
  .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
