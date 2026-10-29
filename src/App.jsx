import { useMemo, useState } from 'react'
import { Player } from './components/Player.jsx'
import { Playlist } from './components/Playlist.jsx'
import { useAudioPlayer } from './hooks/useAudioPlayer.js'
import { useDuracoesFaixas } from './hooks/useDuracoesFaixas.js'
import { useFavoritos } from './hooks/useFavoritos.js'
import { useMediaSession } from './hooks/useMediaSession.js'
import { useMusicasImportadas } from './hooks/useMusicasImportadas.js'
import { faixas } from './lib/tracks.js'

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function App() {
  const { importadas, importando, importar, remover } = useMusicasImportadas()
  const { favoritos, alternarFavorito } = useFavoritos()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todas')

  const todas = useMemo(() => [...faixas, ...importadas], [importadas])

  const visiveis = useMemo(() => {
    const termo = normalizar(busca.trim())
    return todas.filter((faixa) => {
      if (filtro === 'favoritas' && !favoritos.has(faixa.id)) return false
      if (filtro === 'celular' && !faixa.importada) return false
      if (!termo) return true
      return normalizar(`${faixa.titulo} ${faixa.artista}`).includes(termo)
    })
  }, [todas, busca, filtro, favoritos])

  const player = useAudioPlayer(visiveis, todas)
  const duracoes = useDuracoesFaixas(todas)

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

  async function aoImportar(arquivos) {
    try {
      const quantidade = await importar(arquivos)
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
          totalFaixas={todas.length}
          idAtual={player.idAtual}
          tocando={player.tocando}
          duracoes={duracoes}
          favoritos={favoritos}
          busca={busca}
          filtro={filtro}
          importando={importando}
          onBusca={setBusca}
          onFiltro={setFiltro}
          onImportar={aoImportar}
          onTocarFaixa={player.tocarFaixa}
          onAlternarFavorito={alternarFavorito}
          onRemover={remover}
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
      />
    </div>
  )
}
