import { useEffect, useRef, useState } from 'react'
import { CapaFaixa } from './CapaFaixa.jsx'
import { OpcoesFaixa } from './OpcoesFaixa.jsx'
import {
  IconeAdicionarPlaylist,
  IconeAnterior,
  IconeCoracao,
  IconeEmbaralhar,
  IconeMaisOpcoes,
  IconePause,
  IconePlay,
  IconeProxima,
  IconeRecolher,
  IconeRepetir,
} from './Icones.jsx'
import { formatarTempo } from '../lib/utils.js'

// Arrastar mais que isso pra baixo fecha a tela.
const DISTANCIA_PRA_FECHAR = 120

// Tela cheia "Tocando agora": capa grande com a própria capa borrada no fundo,
// controles maiores pro dedo. Fecha pela seta, Esc, voltar do Android ou
// arrastando pra baixo.
export function TelaTocando({
  faixaAtual,
  tocando,
  progresso,
  duracao,
  embaralhar,
  repetir,
  favorita,
  playlists,
  onFechar,
  onAlternarPlayPause,
  onProxima,
  onAnterior,
  onBuscar,
  onAlternarEmbaralhar,
  onAlternarRepetir,
  onAlternarFavorito,
  onAlternarNaPlaylist,
  onCriarPlaylist,
}) {
  const [opcoesAbertas, setOpcoesAbertas] = useState(false)
  const [arrasto, setArrasto] = useState(0)
  const inicioToque = useRef(null)
  const progressoPercentual = duracao > 0 ? (progresso / duracao) * 100 : 0

  useEffect(() => {
    if (opcoesAbertas) return
    function aoTeclar(ev) {
      if (ev.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar, opcoesAbertas])

  // Trava a rolagem da lista que fica por trás.
  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [])

  function aoIniciarToque(ev) {
    // Arrastar a barra de progresso não deve fechar a tela.
    if (ev.target.closest('input, button')) return
    inicioToque.current = ev.touches[0].clientY
  }
  function aoMoverToque(ev) {
    if (inicioToque.current === null) return
    setArrasto(Math.max(0, ev.touches[0].clientY - inicioToque.current))
  }
  function aoSoltarToque() {
    if (inicioToque.current === null) return
    inicioToque.current = null
    if (arrasto > DISTANCIA_PRA_FECHAR) onFechar()
    else setArrasto(0)
  }

  if (!faixaAtual) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tocando agora"
      onTouchStart={aoIniciarToque}
      onTouchMove={aoMoverToque}
      onTouchEnd={aoSoltarToque}
      style={arrasto ? { transform: `translateY(${arrasto}px)`, transition: 'none' } : undefined}
      className="tela-tocando fixed inset-0 z-40 overflow-hidden bg-noite transition-transform duration-200"
    >
      {/* Fundo: a própria capa, ampliada e borrada. */}
      {faixaAtual.capa && (
        <img
          src={faixaAtual.capa}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover scale-125 blur-3xl opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-noite/20 via-noite/55 to-noite/95" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-rosa/20 blur-3xl" />

      <div className="relative h-full max-w-md mx-auto flex flex-col px-6 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar tela da música"
            className="-ml-2 p-2 text-white/90 hover:text-white"
          >
            <IconeRecolher width={28} height={28} />
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Tocando agora</p>
          <button
            type="button"
            onClick={() => setOpcoesAbertas(true)}
            aria-label={`Mais opções para ${faixaAtual.titulo}`}
            className="-mr-2 p-2 text-white/90 hover:text-white"
          >
            <IconeMaisOpcoes width={24} height={24} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center py-6">
          <CapaFaixa
            capa={faixaAtual.capa}
            titulo={faixaAtual.titulo}
            tamanho="w-full max-w-[22rem] aspect-square rounded-3xl shadow-2xl shadow-black/60 ring-1 ring-white/10 [&>svg]:w-1/4 [&>svg]:h-1/4"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpcoesAbertas(true)}
            aria-label="Adicionar à playlist"
            className="-ml-2 p-2 text-white/80 hover:text-white"
          >
            <IconeAdicionarPlaylist width={24} height={24} />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <p className="font-display truncate text-2xl font-bold tracking-tight text-white">{faixaAtual.titulo}</p>
            <p className="truncate text-sm text-white/70">{faixaAtual.artista}</p>
          </div>
          <button
            type="button"
            onClick={onAlternarFavorito}
            aria-pressed={favorita}
            aria-label={favorita ? 'Remover dos favoritos' : 'Favoritar'}
            className={`-mr-2 p-2 transition-colors ${favorita ? 'text-rosa' : 'text-white/80 hover:text-white'}`}
          >
            <IconeCoracao preenchido={favorita} width={24} height={24} />
          </button>
        </div>

        <div className="mt-6">
          <input
            type="range"
            className="player-slider player-slider-grande w-full"
            style={{ '--progresso': `${progressoPercentual}%` }}
            min={0}
            max={duracao || 0}
            step={0.1}
            value={progresso}
            onChange={(ev) => onBuscar(Number(ev.target.value))}
            aria-label="Progresso da música"
          />
          <div className="mt-1 flex justify-between text-xs text-white/60 tabular-nums">
            <span>{formatarTempo(progresso)}</span>
            <span>{formatarTempo(duracao)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onAlternarRepetir}
            aria-pressed={repetir}
            aria-label="Repetir"
            className={`p-2 transition-colors ${repetir ? 'text-coral' : 'text-white/70 hover:text-white'}`}
          >
            <IconeRepetir width={22} height={22} />
          </button>
          <button type="button" onClick={onAnterior} aria-label="Faixa anterior" className="p-2 text-white">
            <IconeAnterior width={32} height={32} />
          </button>
          <button
            type="button"
            onClick={onAlternarPlayPause}
            aria-label={tocando ? 'Pausar' : 'Tocar'}
            className="w-[4.5rem] h-[4.5rem] flex items-center justify-center rounded-full bg-festa brilho-festa text-white hover:scale-105 transition-transform"
          >
            {tocando ? <IconePause width={30} height={30} /> : <IconePlay width={30} height={30} />}
          </button>
          <button type="button" onClick={onProxima} aria-label="Próxima faixa" className="p-2 text-white">
            <IconeProxima width={32} height={32} />
          </button>
          <button
            type="button"
            onClick={onAlternarEmbaralhar}
            aria-pressed={embaralhar}
            aria-label="Embaralhar"
            className={`p-2 transition-colors ${embaralhar ? 'text-coral' : 'text-white/70 hover:text-white'}`}
          >
            <IconeEmbaralhar width={22} height={22} />
          </button>
        </div>
      </div>

      {opcoesAbertas && (
        <OpcoesFaixa
          faixa={faixaAtual}
          playlists={playlists}
          onAlternarNaPlaylist={onAlternarNaPlaylist}
          onCriarPlaylist={onCriarPlaylist}
          onFechar={() => setOpcoesAbertas(false)}
        />
      )}
    </div>
  )
}
