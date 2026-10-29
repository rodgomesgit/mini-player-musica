import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// `fila` é a lista que está na tela (com busca/filtro aplicados): próxima,
// anterior e embaralhar andam por ela. `todas` serve pra continuar mostrando a
// faixa atual mesmo quando ela some da lista por causa de um filtro.
export function useAudioPlayer(fila, todas) {
  const audioRef = useRef(null)
  if (!audioRef.current) {
    audioRef.current = new Audio()
  }

  const [idAtual, setIdAtual] = useState(null)
  const [tocando, setTocando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [embaralhar, setEmbaralhar] = useState(false)
  const [repetir, setRepetir] = useState(false)

  const faixaAtual = useMemo(
    () => (idAtual !== null ? todas.find((f) => f.id === idAtual) ?? null : null),
    [todas, idAtual],
  )
  const indiceNaFila = idAtual !== null ? fila.findIndex((f) => f.id === idAtual) : -1

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
      audio.pause()
      audio.removeAttribute('src')
      setTocando(false)
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

  const idAleatorio = useCallback(() => {
    if (fila.length <= 1) return fila[0]?.id ?? null
    let novo
    do {
      novo = fila[Math.floor(Math.random() * fila.length)].id
    } while (novo === idAtual)
    return novo
  }, [fila, idAtual])

  const proxima = useCallback(() => {
    if (fila.length === 0) return
    const novo = embaralhar
      ? idAleatorio()
      : fila[indiceNaFila === -1 ? 0 : (indiceNaFila + 1) % fila.length].id
    setIdAtual(novo)
    setTocando(true)
  }, [fila, embaralhar, indiceNaFila, idAleatorio])

  const anterior = useCallback(() => {
    if (fila.length === 0) return
    // Como no Spotify: se já tocou mais de 3s, volta pro início da mesma
    // faixa em vez de ir pra anterior.
    if (idAtual !== null && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      setProgresso(0)
      return
    }
    const novo = embaralhar
      ? idAleatorio()
      : fila[indiceNaFila === -1 ? fila.length - 1 : (indiceNaFila - 1 + fila.length) % fila.length].id
    setIdAtual(novo)
    setTocando(true)
  }, [fila, embaralhar, idAtual, indiceNaFila, idAleatorio])

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

  const tocarFaixa = useCallback((id) => {
    setIdAtual(id)
    setTocando(true)
  }, [])

  const tocar = useCallback(() => {
    if (!faixaAtual) return
    audioRef.current.play().catch(() => {})
    setTocando(true)
  }, [faixaAtual])

  const pausar = useCallback(() => {
    audioRef.current.pause()
    setTocando(false)
  }, [])

  const alternarPlayPause = useCallback(() => {
    if (tocando) pausar()
    else tocar()
  }, [tocando, tocar, pausar])

  const buscar = useCallback((segundos) => {
    audioRef.current.currentTime = segundos
    setProgresso(segundos)
  }, [])

  return {
    faixaAtual,
    idAtual,
    tocando,
    progresso,
    duracao,
    volume,
    embaralhar,
    repetir,
    tocarFaixa,
    tocar,
    pausar,
    alternarPlayPause,
    proxima,
    anterior,
    buscar,
    setVolume: setVolumeState,
    setEmbaralhar,
    setRepetir,
  }
}
