import { useRef } from 'react'
import { TrackRow } from './TrackRow.jsx'
import { IconeAdicionar, IconeBusca, IconeMusica } from './Icones.jsx'

const FILTROS = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'favoritas', rotulo: 'Favoritas' },
  { id: 'celular', rotulo: 'Do celular' },
]

export function Playlist({
  faixas,
  totalFaixas,
  idAtual,
  tocando,
  duracoes,
  favoritos,
  busca,
  filtro,
  importando,
  onBusca,
  onFiltro,
  onImportar,
  onTocarFaixa,
  onAlternarFavorito,
  onRemover,
}) {
  const inputArquivosRef = useRef(null)

  function aoEscolherArquivos(ev) {
    onImportar(ev.target.files)
    // Limpa pra permitir escolher os mesmos arquivos de novo depois.
    ev.target.value = ''
  }

  return (
    <div>
      <div className="px-3 pb-3 flex items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 min-w-0">
          <h2 className="text-2xl font-bold whitespace-nowrap">Sua playlist</h2>
          <span className="text-sm text-neutral-400 whitespace-nowrap">
            {totalFaixas} {totalFaixas === 1 ? 'música' : 'músicas'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => inputArquivosRef.current?.click()}
          disabled={importando}
          className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:border-white/60 disabled:opacity-50 transition-colors"
        >
          <IconeAdicionar width={16} height={16} />
          {importando ? 'Adicionando…' : 'Adicionar músicas'}
        </button>
        <input
          ref={inputArquivosRef}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={aoEscolherArquivos}
        />
      </div>

      <div className="px-3 pb-3 flex flex-col gap-3">
        <label className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 focus-within:ring-2 focus-within:ring-white/40">
          <IconeBusca width={16} height={16} className="text-neutral-400 shrink-0" />
          <input
            type="search"
            value={busca}
            onChange={(ev) => onBusca(ev.target.value)}
            placeholder="Buscar por música ou artista"
            className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-neutral-400 outline-none"
            aria-label="Buscar na playlist"
          />
        </label>
        <div className="flex gap-2" role="group" aria-label="Filtrar playlist">
          {FILTROS.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              onClick={() => onFiltro(id)}
              aria-pressed={filtro === id}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                filtro === id ? 'bg-green-500 text-black font-medium' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      {faixas.length === 0 ? (
        <ListaVazia totalFaixas={totalFaixas} busca={busca} filtro={filtro} />
      ) : (
        <div className="flex flex-col gap-0.5">
          {faixas.map((faixa, indice) => (
            <TrackRow
              key={faixa.id}
              faixa={faixa}
              numero={indice + 1}
              ativa={faixa.id === idAtual}
              tocando={tocando}
              duracao={duracoes[faixa.id]}
              favorita={favoritos.has(faixa.id)}
              onTocar={() => onTocarFaixa(faixa.id)}
              onAlternarFavorito={() => onAlternarFavorito(faixa.id)}
              onRemover={faixa.importada ? () => onRemover(faixa.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ListaVazia({ totalFaixas, busca, filtro }) {
  let titulo = 'Nenhuma música ainda'
  let texto = 'Toque em "Adicionar músicas" pra escolher arquivos de áudio do seu aparelho.'
  if (totalFaixas > 0 && busca.trim()) {
    titulo = 'Nada encontrado'
    texto = `Nenhuma música combina com "${busca.trim()}".`
  } else if (filtro === 'favoritas') {
    titulo = 'Nenhuma favorita ainda'
    texto = 'Toque no coração ao lado de uma música pra favoritar.'
  } else if (filtro === 'celular') {
    titulo = 'Nenhuma música do celular'
    texto = 'Toque em "Adicionar músicas" pra escolher arquivos de áudio do seu aparelho.'
  }
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 text-neutral-400">
      <IconeMusica width={40} height={40} className="text-neutral-600" />
      <p className="text-lg font-medium text-neutral-200">{titulo}</p>
      <p className="text-sm max-w-sm">{texto}</p>
    </div>
  )
}
