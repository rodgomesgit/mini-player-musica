import { TrackRow } from './TrackRow.jsx'
import { IconeMusica } from './Icones.jsx'

export function Playlist({ faixas, indiceAtual, tocando, duracoes, onTocarFaixa }) {
  if (faixas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-24 text-neutral-400">
        <IconeMusica width={40} height={40} className="text-neutral-600" />
        <p className="text-lg font-medium text-neutral-200">Nenhuma música ainda</p>
        <p className="text-sm max-w-sm">
          Coloque arquivos <code className="text-neutral-300">.mp3</code> dentro de{' '}
          <code className="text-neutral-300">src/assets/musicas</code> e eles aparecem
          aqui automaticamente.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="px-3 pb-2 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">Sua playlist</h2>
        <span className="text-sm text-neutral-400">
          {faixas.length} {faixas.length === 1 ? 'música' : 'músicas'}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {faixas.map((faixa, indice) => (
          <TrackRow
            key={faixa.id}
            faixa={faixa}
            numero={indice + 1}
            ativa={indice === indiceAtual}
            tocando={tocando}
            duracao={duracoes[faixa.id]}
            onTocar={() => onTocarFaixa(indice)}
          />
        ))}
      </div>
    </div>
  )
}
