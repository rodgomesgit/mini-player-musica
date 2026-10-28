import { useCallback, useEffect, useRef, useState } from 'react'

export function useAudioPlayer(faixas) {
  const audioRef = useRef(null)
  if (!audioRef.current) {
    audioRef.current = new Audio()
  }

  const [indiceAtual, setIndiceAtual] = useState(null)
  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [embaralhar, setEmbaralhar] = useState(false)
  const [repetir, setRepetir] = useState(false)

  const faixaAtual = indiceAtual !== null ? faixas[indiceAtual] ?? null : null

  // Mantém uma referência síncrona da intenção de tocar, pra decidir (sem
  // recriar o efeito de troca de faixa) se deve dar play automático ao
  // trocar de música.
  const tocandoRef = useRef(tocando)
  useEffect(() => {
    tocandoRef.current = tocando
  }, [tocando])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  // Troca o <audio> de fonte sempre que a faixa atual muda.
  useEffect(() => {
    const audio = audioRef.current
    if (!faixaAtual) {
      audio.removeAttribute('src')
      setProgresso(0)
      setDuracao(0)
      return
    }
    audio.src = faixaAtual.src
    audio.load()
    setProgresso(0)
    if (tocandoRef.current) {
      audio.play().catch(() => {})
    }
  }, [faixaAtual?.src])

  const proximoIndiceAleatorio = useCallback(() => {
    if (faixas.length <= 1) return 0
    let novo
    do {
      novo = Math.floor(Math.random() * faixas.length)
    } while (novo === indiceAtual)
    return novo
  }, [faixas.length, indiceAtual])

  const proxima = useCallback(() => {
    if (faixas.length === 0) return
    const novo = embaralhar
      ? proximoIndiceAleatorio()
      : indiceAtual === null
        ? 0
        : (indiceAtual + 1) % faixas.length
    setIndiceAtual(novo)
    setTocando(true)
  }, [faixas.length, embaralhar, indiceAtual, proximoIndiceAleatorio])

  const anterior = useCallback(() => {
    if (faixas.length === 0) return
    // Como no Spotify: se já tocou mais de 3s, volta pro início da mesma
    // faixa em vez de ir pra anterior.
    if (indiceAtual !== null && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      setProgresso(0)
      return
    }
    const novo = embaralhar
      ? proximoIndiceAleatorio()
      : indiceAtual === null
        ? faixas.length - 1
        : (indiceAtual - 1 + faixas.length) % faixas.length
    setIndiceAtual(novo)
    setTocando(true)
  }, [faixas.length, embaralhar, indiceAtual, proximoIndiceAleatorio])

  // Listeners do elemento de áudio.
  useEffect(() => {
    const audio = audioRef.current

    function aoAtualizarTempo() {
      setProgresso(audio.currentTime)
    }
    function aoCarregarMetadados() {
      setDuracao(audio.duration || 0)
    }
    function aoTerminar() {
      if (repetir) {
        audio.currentTime = 0
        audio.play().catch(() => {})
        return
      }
      proxima()
    }

    audio.addEventListener('timeupdate', aoAtualizarTempo)
    audio.addEventListener('loadedmetadata', aoCarregarMetadados)
    audio.addEventListener('ended', aoTerminar)
    return () => {
      audio.removeEventListener('timeupdate', aoAtualizarTempo)
      audio.removeEventListener('loadedmetadata', aoCarregarMetadados)
      audio.removeEventListener('ended', aoTerminar)
    }
  }, [repetir, proxima])

  const tocarFaixa = useCallback((indice) => {
    setIndiceAtual(indice)
    setTocando(true)
  }, [])

  const alternarPlayPause = useCallback(() => {
    if (!faixaAtual) return
    const audio = audioRef.current
    if (tocando) {
      audio.pause()
      setTocando(false)
    } else {
      audio.play().catch(() => {})
      setTocando(true)
    }
  }, [tocando, faixaAtual])

  const buscar = useCallback((segundos) => {
    audioRef.current.currentTime = segundos
    setProgresso(segundos)
  }, [])

  return {
    faixaAtual,
    indiceAtual,
    tocando,
    progresso,
    duracao,
    volume,
    embaralhar,
    repetir,
    tocarFaixa,
    alternarPlayPause,
    proxima,
    anterior,
    buscar,
    setVolume: setVolumeState,
    setEmbaralhar,
    setRepetir,
  }
}
