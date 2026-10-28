import { CapaFaixa } from './CapaFaixa.jsx'
import { IconeOndaSonora, IconePause, IconePlay } from './Icones.jsx'
import { formatarTempo } from '../lib/utils.js'

export function TrackRow({ faixa, numero, ativa, tocando, duracao, onTocar }) {
  return (
    <button
      type="button"
      onClick={onTocar}
      className={`group w-full grid grid-cols-[2rem_3rem_1fr_auto] items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
        ativa ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <span className="text-sm text-neutral-400 flex items-center justify-center">
        {ativa && tocando ? (
          <IconeOndaSonora className="text-green-500" width={16} height={16} />
        ) : ativa ? (
          <IconePause className="text-green-500" width={14} height={14} />
        ) : (
          <>
            <span className="group-hover:hidden">{numero}</span>
            <IconePlay className="hidden group-hover:block" width={14} height={14} />
          </>
        )}
      </span>

      <CapaFaixa capa={faixa.capa} titulo={faixa.titulo} tamanho="w-10 h-10" />

      <span className="min-w-0">
        <span
          className={`block truncate text-sm font-medium ${ativa ? 'text-green-500' : 'text-white'}`}
        >
          {faixa.titulo}
        </span>
        <span className="block truncate text-xs text-neutral-400">{faixa.artista}</span>
      </span>

      <span className="text-xs text-neutral-400 tabular-nums">
        {formatarTempo(duracao)}
      </span>
    </button>
  )
}
