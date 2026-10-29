import { useRef, useState } from 'react'
import { Dialogo, FormNome } from './Dialogo.jsx'
import { OpcoesFaixa } from './OpcoesFaixa.jsx'
import { TrackRow } from './TrackRow.jsx'
import { IconeAdicionar, IconeBusca, IconeMusica } from './Icones.jsx'

const FILTROS_FIXOS = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'favoritas', rotulo: 'Favoritas' },
  { id: 'celular', rotulo: 'Do celular' },
]

export function Playlist({
  faixas,
  todasFaixas,
  idAtual,
  tocando,
  duracoes,
  favoritos,
  busca,
  filtro,
  importando,
  playlists,
  playlistAtiva,
  onBusca,
  onFiltro,
  onImportar,
  onTocarFaixa,
  onAlternarFavorito,
  onRemoverDoApp,
  onCriarPlaylist,
  onRenomearPlaylist,
  onExcluirPlaylist,
  onAlternarNaPlaylist,
}) {
  const inputArquivosRef = useRef(null)
  // Qual painel está aberto: 'nova', 'renomear', 'excluir' ou { opcoesDe: id }.
  const [dialogo, setDialogo] = useState(null)
  const fecharDialogo = () => setDialogo(null)
  const faixaDasOpcoes = dialogo?.opcoesDe ? todasFaixas.find((f) => f.id === dialogo.opcoesDe) : null

  function aoEscolherArquivos(ev) {
    onImportar(ev.target.files)
    // Limpa pra permitir escolher os mesmos arquivos de novo depois.
    ev.target.value = ''
  }

  return (
    <div>
      <div className="px-3 pb-3 flex items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 min-w-0">
          <h2 className="text-2xl font-bold truncate">{playlistAtiva?.nome ?? 'Sua playlist'}</h2>
          <span className="text-sm text-neutral-400 whitespace-nowrap">
            {playlistAtiva ? faixas.length : todasFaixas.length}{' '}
            {(playlistAtiva ? faixas.length : todasFaixas.length) === 1 ? 'música' : 'músicas'}
          </span>
        </div>
        {playlistAtiva ? (
          <div className="shrink-0 flex gap-2">
            <button
              type="button"
              onClick={() => setDialogo('renomear')}
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:border-white/60 transition-colors"
            >
              Renomear
            </button>
            <button
              type="button"
              onClick={() => setDialogo('excluir')}
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm font-medium text-red-400 hover:border-red-400 transition-colors"
            >
              Excluir
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputArquivosRef.current?.click()}
            disabled={importando}
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:border-white/60 disabled:opacity-50 transition-colors"
          >
            <IconeAdicionar width={16} height={16} />
            {importando ? 'Adicionando…' : 'Adicionar músicas'}
          </button>
        )}
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
        <div
          className="-mx-3 px-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filtrar playlist"
        >
          {[...FILTROS_FIXOS, ...playlists.map((p) => ({ id: `playlist:${p.id}`, rotulo: p.nome }))].map(
            ({ id, rotulo }) => (
              <button
                key={id}
                type="button"
                onClick={() => onFiltro(id)}
                aria-pressed={filtro === id}
                className={`shrink-0 max-w-[12rem] truncate rounded-full px-3 py-1 text-sm transition-colors ${
                  filtro === id ? 'bg-green-500 text-black font-medium' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {rotulo}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => setDialogo('nova')}
            className="shrink-0 flex items-center gap-1 rounded-full border border-dashed border-white/30 px-3 py-1 text-sm text-white hover:border-white/60"
          >
            <IconeAdicionar width={14} height={14} />
            Nova playlist
          </button>
        </div>
      </div>

      {faixas.length === 0 ? (
        <ListaVazia totalFaixas={todasFaixas.length} busca={busca} filtro={filtro} playlistAtiva={playlistAtiva} />
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
              onOpcoes={() => setDialogo({ opcoesDe: faixa.id })}
            />
          ))}
        </div>
      )}

      {dialogo === 'nova' && (
        <Dialogo titulo="Nova playlist" onFechar={fecharDialogo}>
          <FormNome
            rotuloBotao="Criar"
            onCancelar={fecharDialogo}
            onSalvar={(nome) => {
              onFiltro(`playlist:${onCriarPlaylist(nome)}`)
              fecharDialogo()
            }}
          />
        </Dialogo>
      )}

      {dialogo === 'renomear' && playlistAtiva && (
        <Dialogo titulo="Renomear playlist" onFechar={fecharDialogo}>
          <FormNome
            valorInicial={playlistAtiva.nome}
            rotuloBotao="Salvar"
            onCancelar={fecharDialogo}
            onSalvar={(nome) => {
              onRenomearPlaylist(playlistAtiva.id, nome)
              fecharDialogo()
            }}
          />
        </Dialogo>
      )}

      {dialogo === 'excluir' && playlistAtiva && (
        <Dialogo titulo={`Excluir "${playlistAtiva.nome}"?`} onFechar={fecharDialogo}>
          <p className="text-sm text-neutral-300 mb-5">
            A playlist some, mas as músicas continuam no app.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={fecharDialogo} className="rounded-full px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onExcluirPlaylist(playlistAtiva.id)
                fecharDialogo()
              }}
              className="rounded-full bg-red-500 px-5 py-2 text-sm font-bold text-white hover:bg-red-400"
            >
              Excluir
            </button>
          </div>
        </Dialogo>
      )}

      {faixaDasOpcoes && (
        <OpcoesFaixa
          faixa={faixaDasOpcoes}
          playlists={playlists}
          onAlternarNaPlaylist={onAlternarNaPlaylist}
          onCriarPlaylist={onCriarPlaylist}
          onRemoverDoApp={faixaDasOpcoes.importada ? () => onRemoverDoApp(faixaDasOpcoes.id) : undefined}
          onFechar={fecharDialogo}
        />
      )}
    </div>
  )
}

function ListaVazia({ totalFaixas, busca, filtro, playlistAtiva }) {
  let titulo = 'Nenhuma música ainda'
  let texto = 'Toque em "Adicionar músicas" pra escolher arquivos de áudio do seu aparelho.'
  if (totalFaixas > 0 && busca.trim()) {
    titulo = 'Nada encontrado'
    texto = `Nenhuma música combina com "${busca.trim()}".`
  } else if (playlistAtiva) {
    titulo = 'Playlist vazia'
    texto = 'Em "Todas", toque em ⋯ ao lado de uma música e escolha esta playlist.'
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
