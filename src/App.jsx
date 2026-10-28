import { Player } from './components/Player.jsx'
import { Playlist } from './components/Playlist.jsx'
import { useAudioPlayer } from './hooks/useAudioPlayer.js'
import { useDuracoesFaixas } from './hooks/useDuracoesFaixas.js'
import { faixas } from './lib/tracks.js'

export default function App() {
  const player = useAudioPlayer(faixas)
  const duracoes = useDuracoesFaixas(faixas)

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950">
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">🎵 Rw Player</h1>
      </header>

      <main className="px-4 sm:px-6 max-w-5xl mx-auto pb-28">
        <Playlist
          faixas={faixas}
          indiceAtual={player.indiceAtual}
          tocando={player.tocando}
          duracoes={duracoes}
          onTocarFaixa={player.tocarFaixa}
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
