import { parseWebStream } from 'music-metadata'

// Lê a capa de álbum que vem dentro do próprio arquivo de áudio (ID3 do MP3,
// "covr" do M4A, PICTURE do FLAC etc.). Só o começo do arquivo é baixado: assim
// que as tags são lidas, o download é cancelado.

const cache = new Map()

export function lerCapaEmbutida(src) {
  if (!cache.has(src)) {
    cache.set(src, extrairCapa(src).catch(() => null))
  }
  return cache.get(src)
}

async function extrairCapa(src) {
  const controle = new AbortController()
  try {
    const resposta = await fetch(src, { signal: controle.signal })
    if (!resposta.ok || !resposta.body) return null
    const metadados = await parseWebStream(
      resposta.body,
      { mimeType: resposta.headers.get('content-type') ?? undefined },
      { duration: false, skipPostHeaders: true },
    )
    const imagem = metadados.common.picture?.find((p) => p.type?.includes('front')) ?? metadados.common.picture?.[0]
    if (!imagem) return null
    return URL.createObjectURL(new Blob([imagem.data], { type: imagem.format }))
  } finally {
    controle.abort()
  }
}
