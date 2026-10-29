import { useCallback, useEffect, useMemo, useState } from 'react'
import { Player } from './components/Player.jsx'
import { Playlist } from './components/Playlist.jsx'
import { TelaTocando } from './components/TelaTocando.jsx'
import { useAudioPlayer } from './hooks/useAudioPlayer.js'
import { useCapasEmbutidas } from './hooks/useCapasEmbutidas.js'
import { useCatalogoOnline } from './hooks/useCatalogoOnline.js'
import { useDuracoesFaixas } from './hooks/useDuracoesFaixas.js'
import { useFavoritos } from './hooks/useFavoritos.js'
import { useMediaSession } from './hooks/useMediaSession.js'
import { useMusicasImportadas } from './hooks/useMusicasImportadas.js'
import { usePlaylists } from './hooks/usePlaylists.js'
import { faixas } from './lib/tracks.js'

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function App() {
  const { importadas, importando, importar, remover } = useMusicasImportadas()
  const online = useCatalogoOnline()
  const { favoritos, alternarFavorito } = useFavoritos()
  const { playlists, criar, renomear, excluir, alternarFaixa, removerFaixaDeTodas } = usePlaylists()
  const [busca, setBusca] = useState('')
  const [filtroEscolhido, setFiltro] = useState('todas')
  const [telaAberta, setTelaAberta] = useState(false)

  // A tela cheia ganha uma entrada no histórico: assim o "voltar" do Android
  // fecha a tela em vez de sair do app.
  useEffect(() => {
    if (history.state?.telaTocando) history.replaceState(null, '')
    const aoVoltar = () => setTelaAberta(history.state?.telaTocando === true)
    window.addEventListener('popstate', aoVoltar)
    return () => window.removeEventListener('popstate', aoVoltar)
  }, [])
  const abrirTela = useCallback(() => {
    history.pushState({ telaTocando: true }, '')
    setTelaAberta(true)
  }, [])
  const fecharTela = useCallback(() => {
    if (history.state?.telaTocando) history.back()
    else setTelaAberta(false)
  }, [])

  // As do catálogo online já vêm com capa e duração do banco; só as locais
  // precisam ser lidas do arquivo.
  const locais = useMemo(() => [...faixas, ...importadas], [importadas])
  const capasEmbutidas = useCapasEmbutidas(locais)
  const todas = useMemo(
    () => [
      ...faixas,
      ...online,
      ...importadas,
    ].map((faixa) => (faixa.capa || !capasEmbutidas[faixa.id] ? faixa : { ...faixa, capa: capasEmbutidas[faixa.id] })),
    [online, importadas, capasEmbutidas],
  )

  // Se a playlist aberta for excluída, volta pra lista com todas.
  const playlistAtiva = filtroEscolhido.startsWith('playlist:')
    ? playlists.find((p) => `playlist:${p.id}` === filtroEscolhido) ?? null
    : null
  const filtro = filtroEscolhido.startsWith('playlist:') && !playlistAtiva ? 'todas' : filtroEscolhido

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim())
    const base = playlistAtiva
      ? playlistAtiva.faixas.map((id) => todas.find((f) => f.id === id)).filter(Boolean)
      : todas
    return base.filter((faixa) => {
      if (filtro === 'favoritas' && !favoritos.has(faixa.id)) return false
      if (filtro === 'celular' && !faixa.importada) return false
      if (filtro === 'online' && !faixa.online) return false
      if (!termo) return true
      return normalizar(`${faixa.titulo} ${faixa.artista}`).includes(termo)
    })
  }, [todas, busca, filtro, favoritos, playlistAtiva])

  const player = useAudioPlayer(visiveis, todas)
  const duracoesLocais = useDuracoesFaixas(locais)
  const duracoes = useMemo(() => {
    const doBanco = Object.fromEntries(online.filter((f) => f.duracao).map((f) => [f.id, f.duracao]))
    return { ...doBanco, ...duracoesLocais }
  }, [online, duracoesLocais])

  const { tocar, pausar, proxima, anterior, buscar } = player
  const acoesMidia = useMemo(
    () => ({
      play: tocar,
      pause: pausar,
      nexttrack: proxima,
      previoustrack: anterior,
      seekto: (detalhes) => {
        if (Number.isFinite(detalhes?.seekTime)) buscar(detalhes.seekTime)
      },
    }),
    [tocar, pausar, proxima, anterior, buscar],
  )
  useMediaSession({
    faixaAtual: player.faixaAtual,
    tocando: player.tocando,
    progresso: player.progresso,
    duracao: player.duracao,
    acoes: acoesMidia,
  })

  async function aoImportar(selecionados) {
    try {
      const quantidade = await importar(selecionados)
      if (quantidade > 0) setFiltro('celular')
    } catch {
      alert('Não foi possível adicionar as músicas. Verifique se há espaço livre no aparelho.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950">
      <header className="px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-4">
        <h1 className="text-3xl font-bold tracking-tight">🎵 Rw Player</h1>
      </header>

      <main className="px-4 sm:px-6 max-w-5xl mx-auto pb-36">
        <Playlist
          faixas={visiveis}
          todasFaixas={todas}
          idAtual={player.idAtual}
          tocando={player.tocando}
          duracoes={duracoes}
          favoritos={favoritos}
          busca={busca}
          filtro={filtro}
          importando={importando}
          playlists={playlists}
          playlistAtiva={playlistAtiva}
          temOnline={online.length > 0}
          onBusca={setBusca}
          onFiltro={setFiltro}
          onImportar={aoImportar}
          onTocarFaixa={player.tocarFaixa}
          onAlternarFavorito={alternarFavorito}
          onRemoverDoApp={(id) => {
            remover(id)
            removerFaixaDeTodas(id)
          }}
          onCriarPlaylist={criar}
          onRenomearPlaylist={renomear}
          onExcluirPlaylist={excluir}
          onAlternarNaPlaylist={alternarFaixa}
        />
      </main>

      <Player
        faixaAtual={player.faixaAtual}
        tocando={player.tocando}
        progresso={player.progresso}
        duracao={player.duracao}
        volume={player.volume}
        embaralhar={player.embaralhar}
        repetir={player.repetir}
        onAlternarPlayPause={player.alternarPlayPause}
        onProxima={player.proxima}
        onAnterior={player.anterior}
        onBuscar={player.buscar}
        onVolume={player.setVolume}
        onAlternarEmbaralhar={() => player.setEmbaralhar((v) => !v)}
        onAlternarRepetir={() => player.setRepetir((v) => !v)}
        onAbrirTela={abrirTela}
      />

      {telaAberta && (
        <TelaTocando
          faixaAtual={player.faixaAtual}
          tocando={player.tocando}
          progresso={player.progresso}
          duracao={player.duracao}
          embaralhar={player.embaralhar}
          repetir={player.repetir}
          favorita={player.faixaAtual ? favoritos.has(player.faixaAtual.id) : false}
          playlists={playlists}
          onFechar={fecharTela}
          onAlternarPlayPause={player.alternarPlayPause}
          onProxima={player.proxima}
          onAnterior={player.anterior}
          onBuscar={player.buscar}
          onAlternarEmbaralhar={() => player.setEmbaralhar((v) => !v)}
          onAlternarRepetir={() => player.setRepetir((v) => !v)}
          onAlternarFavorito={() => alternarFavorito(player.faixaAtual.id)}
          onAlternarNaPlaylist={alternarFaixa}
          onCriarPlaylist={criar}
        />
      )}
    </div>
  )
}
