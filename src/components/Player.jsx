import { CapaFaixa } from './CapaFaixa.jsx'
import {
  IconeAnterior,
  IconeEmbaralhar,
  IconePause,
  IconePlay,
  IconeProxima,
  IconeRepetir,
  IconeVolume,
  IconeVolumeMudo,
} from './Icones.jsx'
import { formatarTempo } from '../lib/utils.js'

export function Player({
  faixaAtual,
  tocando,
  progresso,
  duracao,
  volume,
  embaralhar,
  repetir,
  onAlternarPlayPause,
  onProxima,
  onAnterior,
  onBuscar,
  onVolume,
  onAlternarEmbaralhar,
  onAlternarRepetir,
  onAbrirTela,
}) {
  const progressoPercentual = duracao > 0 ? (progresso / duracao) * 100 : 0
  const semFaixa = !faixaAtual

  return (
    <footer className="fixed bottom-0 inset-x-0 border-t border-white/10 bg-neutral-950/95 backdrop-blur px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {/* No celular: faixa em cima, controles embaixo; o volume fica com os
          botões físicos do aparelho. */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] items-center gap-2 sm:gap-4">
        {/* Faixa atual: tocar aqui abre a tela cheia da música */}
        <button
          type="button"
          onClick={onAbrirTela}
          disabled={semFaixa}
          aria-label={semFaixa ? undefined : `Abrir tela da música ${faixaAtual.titulo}`}
          className="flex items-center gap-3 min-w-0 text-left rounded-md -m-1 p-1 enabled:hover:bg-white/5 transition-colors"
        >
          <CapaFaixa capa={faixaAtual?.capa} titulo={faixaAtual?.titulo} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">
              {faixaAtual?.titulo ?? 'Nada tocando'}
            </span>
            <span className="block truncate text-xs text-neutral-400">
              {faixaAtual?.artista ?? 'Escolha uma música na lista'}
            </span>
          </span>
        </button>

        {/* Controles + barra de progresso */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-6 sm:gap-4">
            <button
              type="button"
              onClick={onAlternarEmbaralhar}
              disabled={semFaixa}
              aria-pressed={embaralhar}
              aria-label="Embaralhar"
              className={`transition-colors disabled:opacity-30 ${embaralhar ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}
            >
              <IconeEmbaralhar width={16} height={16} />
            </button>
            <button
              type="button"
              onClick={onAnterior}
              disabled={semFaixa}
              aria-label="Faixa anterior"
              className="text-neutral-200 hover:text-white disabled:opacity-30"
            >
              <IconeAnterior width={20} height={20} />
            </button>
            <button
              type="button"
              onClick={onAlternarPlayPause}
              disabled={semFaixa}
              aria-label={tocando ? 'Pausar' : 'Tocar'}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black disabled:opacity-30 hover:scale-105 transition-transform"
            >
              {tocando ? <IconePause width={18} height={18} /> : <IconePlay width={18} height={18} />}
            </button>
            <button
              type="button"
              onClick={onProxima}
              disabled={semFaixa}
              aria-label="Próxima faixa"
              className="text-neutral-200 hover:text-white disabled:opacity-30"
            >
              <IconeProxima width={20} height={20} />
            </button>
            <button
              type="button"
              onClick={onAlternarRepetir}
              disabled={semFaixa}
              aria-pressed={repetir}
              aria-label="Repetir"
              className={`transition-colors disabled:opacity-30 ${repetir ? 'text-green-500' : 'text-neutral-400 hover:text-white'}`}
            >
              <IconeRepetir width={16} height={16} />
            </button>
          </div>

          <div className="w-full flex items-center gap-2">
            <span className="text-xs text-neutral-400 tabular-nums w-9 text-right">
              {formatarTempo(progresso)}
            </span>
            <input
              type="range"
              className="player-slider flex-1"
              style={{ '--progresso': `${progressoPercentual}%` }}
              min={0}
              max={duracao || 0}
              step={0.1}
              value={progresso}
              disabled={semFaixa}
              onChange={(ev) => onBuscar(Number(ev.target.value))}
              aria-label="Progresso da música"
            />
            <span className="text-xs text-neutral-400 tabular-nums w-9">
              {formatarTempo(duracao)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center justify-end gap-2">
          {volume === 0 ? (
            <IconeVolumeMudo width={18} height={18} className="text-neutral-400" />
          ) : (
            <IconeVolume width={18} height={18} className="text-neutral-400" />
          )}
          <input
            type="range"
            className="player-slider w-24"
            style={{ '--progresso': `${volume * 100}%` }}
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(ev) => onVolume(Number(ev.target.value))}
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  )
}
