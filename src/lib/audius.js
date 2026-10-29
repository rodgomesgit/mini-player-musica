// Audius: catálogo aberto de artistas independentes, com streaming liberado
// pela API pública (https://docs.audius.org). Só entram faixas que o artista
// deixou tocar de graça (sem acesso pago ou restrito).

const API = 'https://api.audius.co/v1'
const APP = 'RwPlayer'
const POR_PAGINA = 30

function paraFaixa(t) {
  return {
    id: `audius:${t.id}`,
    titulo: t.title,
    artista: t.user?.name ?? 'Audius',
    // Esse endereço redireciona pro servidor que tem o áudio; vale sempre,
    // ao contrário do link assinado que vem em t.stream.
    src: `${API}/tracks/${t.id}/stream?app_name=${APP}`,
    capa: t.artwork?.['480x480'] ?? null,
    duracao: t.duration,
    audius: true,
  }
}

function tocavel(t) {
  return t.is_streamable !== false && !t.is_stream_gated && t.access?.stream !== false && !t.is_delete
}

async function pedir(caminho, parametros, signal) {
  const url = new URL(`${API}${caminho}`)
  for (const [chave, valor] of Object.entries({ ...parametros, app_name: APP })) url.searchParams.set(chave, valor)
  const resposta = await fetch(url, { signal })
  if (!resposta.ok) throw new Error(`Audius respondeu ${resposta.status}`)
  const { data } = await resposta.json()
  return data.filter(tocavel).map(paraFaixa)
}

export function buscarNoAudius(termo, signal) {
  return pedir('/tracks/search', { query: termo, limit: POR_PAGINA }, signal)
}

export function emAltaNoAudius(signal) {
  return pedir('/tracks/trending', { time: 'week', limit: POR_PAGINA }, signal)
}
