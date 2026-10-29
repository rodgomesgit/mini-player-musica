import { Capacitor } from '@capacitor/core'
import { MediaSession } from '@capgo/capacitor-media-session'
import { useEffect, useRef } from 'react'

// No app Android, o plugin nativo cria a notificação de mídia e os controles
// da tela de bloqueio, e mantém um serviço em primeiro plano pra música seguir
// tocando com a tela apagada. No navegador, usa a Media Session API padrão.
const nativo = Capacitor.isNativePlatform()

const ACOES = ['play', 'pause', 'previoustrack', 'nexttrack', 'seekto']

// O plugin nativo não consegue ler URLs internas do WebView, então a capa vai
// como data URL, reduzida pra não pesar na ponte JS ↔ Android.
const cacheCapas = new Map()
function capaComoDataUrl(url) {
  if (!url) return Promise.resolve(null)
  if (!cacheCapas.has(url)) {
    cacheCapas.set(
      url,
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const lado = 512
          const canvas = document.createElement('canvas')
          canvas.width = lado
          canvas.height = lado
          const escala = Math.max(lado / img.width, lado / img.height)
          const w = img.width * escala
          const h = img.height * escala
          canvas.getContext('2d').drawImage(img, (lado - w) / 2, (lado - h) / 2, w, h)
          try {
            resolve(canvas.toDataURL('image/jpeg', 0.85))
          } catch {
            resolve(null)
          }
        }
        img.onerror = () => resolve(null)
        // Capas do catálogo online vêm de outro domínio; sem isso o canvas
        // fica "contaminado" e não exporta a imagem.
        img.crossOrigin = 'anonymous'
        img.src = url
      }),
    )
  }
  return cacheCapas.get(url)
}

const api = {
  setMetadata(dados) {
    if (nativo) return MediaSession.setMetadata(dados)
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata(dados)
  },
  setPlaybackState(estado) {
    if (nativo) return MediaSession.setPlaybackState({ playbackState: estado })
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = estado
  },
  setPositionState(posicao) {
    if (nativo) return MediaSession.setPositionState(posicao)
    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
      navigator.mediaSession.setPositionState(posicao)
    }
  },
  setActionHandler(acao, handler) {
    if (nativo) return MediaSession.setActionHandler({ action: acao }, handler)
    if ('mediaSession' in navigator) navigator.mediaSession.setActionHandler(acao, handler)
  },
}

function seguro(promessa) {
  Promise.resolve(promessa).catch(() => {})
}

export function useMediaSession({ faixaAtual, tocando, progresso, duracao, acoes }) {
  // Os handlers são registrados uma vez só; a ref garante que sempre chamem a
  // versão mais recente das funções do player.
  const acoesRef = useRef(acoes)
  useEffect(() => {
    acoesRef.current = acoes
  }, [acoes])

  useEffect(() => {
    ACOES.forEach((acao) => {
      try {
        seguro(api.setActionHandler(acao, (detalhes) => acoesRef.current[acao]?.(detalhes)))
      } catch {
        // Ação não suportada neste navegador.
      }
    })
  }, [])

  useEffect(() => {
    if (!faixaAtual) return
    let cancelado = false
    capaComoDataUrl(faixaAtual.capa).then((capa) => {
      if (cancelado) return
      seguro(
        api.setMetadata({
          title: faixaAtual.titulo,
          artist: faixaAtual.artista,
          album: 'Rw Player',
          artwork: capa ? [{ src: capa, sizes: '512x512', type: 'image/jpeg' }] : [],
        }),
      )
    })
    return () => {
      cancelado = true
    }
  }, [faixaAtual])

  useEffect(() => {
    seguro(api.setPlaybackState(!faixaAtual ? 'none' : tocando ? 'playing' : 'paused'))
  }, [faixaAtual, tocando])

  // Atualiza a barra de progresso da notificação no máximo uma vez por segundo.
  const segundo = Math.floor(progresso)
  useEffect(() => {
    if (!faixaAtual || !(duracao > 0)) return
    try {
      seguro(api.setPositionState({ duration: duracao, position: Math.min(segundo, duracao), playbackRate: 1 }))
    } catch {
      // Posição inválida enquanto a faixa carrega.
    }
  }, [faixaAtual, segundo, duracao])
}
