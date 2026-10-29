import { CapaFaixa } from './CapaFaixa.jsx'
import { IconeCoracao, IconeLixeira, IconeOndaSonora, IconePause, IconePlay } from './Icones.jsx'
import { formatarTempo } from '../lib/utils.js'

export function TrackRow({ faixa, numero, ativa, tocando, duracao, favorita, onTocar, onAlternarFavorito, onRemover }) {
  return (
    <div
      className={`group grid grid-cols-[1fr_auto] items-center rounded-md transition-colors ${
        ativa ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <button
        type="button"
        onClick={onTocar}
        className="min-w-0 grid grid-cols-[2rem_2.5rem_1fr_auto] items-center gap-3 pl-3 pr-1 py-2 text-left"
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
          <span className="block truncate text-xs text-neutral-400">
            {faixa.importada ? 'Do celular · ' : ''}
            {faixa.artista}
          </span>
        </span>

        <span className="text-xs text-neutral-400 tabular-nums">
          {formatarTempo(duracao)}
        </span>
      </button>

      <span className="flex items-center pr-2">
        <button
          type="button"
          onClick={onAlternarFavorito}
          aria-pressed={favorita}
          aria-label={favorita ? `Remover ${faixa.titulo} dos favoritos` : `Favoritar ${faixa.titulo}`}
          className={`p-2 transition-colors ${favorita ? 'text-green-500' : 'text-neutral-500 hover:text-white'}`}
        >
          <IconeCoracao preenchido={favorita} width={18} height={18} />
        </button>
        {onRemover && (
          <button
            type="button"
            onClick={onRemover}
            aria-label={`Remover ${faixa.titulo} da playlist`}
            className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
          >
            <IconeLixeira width={18} height={18} />
          </button>
        )}
      </span>
    </div>
  )
}
