// Carrega automaticamente todos os arquivos de música em src/assets/musicas/
// e, se existir, a capa correspondente (mesmo nome de arquivo) em
// src/assets/capas/. Não precisa editar nenhuma lista manualmente: basta
// soltar os arquivos nessas pastas.
//
// Convenção de nome sugerida: "Artista - Título.mp3". Sem o " - ", o nome
// inteiro do arquivo vira o título e o artista fica ARTISTA_PADRAO.
//
// A capa de cada música é a imagem de álbum embutida no próprio arquivo (lida
// em useCapasEmbutidas). Uma imagem com o mesmo nome em src/assets/capas/ tem
// prioridade sobre ela. Sem nenhuma das duas, a música fica sem capa.

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

const capasPorNomeBase = new Map(
  Object.entries(capaModules).map(([caminho, url]) => [nomeBase(caminho), url]),
)

function extrairTituloArtista(nome) {
  const partes = nome.split(' - ')
  if (partes.length >= 2) {
    return { artista: partes[0].trim(), titulo: partes.slice(1).join(' - ').trim() }
  }
  return { artista: ARTISTA_PADRAO, titulo: nome.trim() }
}

// Também usada pras músicas importadas do aparelho, que seguem a mesma
// convenção de nome.
export function criarFaixa({ id, nomeArquivo, src }) {
  const base = nomeBase(nomeArquivo)
  const { artista, titulo } = extrairTituloArtista(base)
  return {
    id,
    titulo,
    artista,
    src,
    capa: capasPorNomeBase.get(base) ?? null,
  }
}

export const faixas = Object.entries(musicModules)
  .map(([caminho, url]) => criarFaixa({ id: caminho, nomeArquivo: caminho, src: url }))
  .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
