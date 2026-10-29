import { useState } from 'react'
import { Dialogo, FormNome } from './Dialogo.jsx'
import { IconeAdicionar, IconeCheck, IconeLixeira } from './Icones.jsx'

// Menu de uma música: marcar/desmarcar em quais playlists ela está, criar uma
// playlist nova já com ela e, se veio do celular, removê-la do app.
export function OpcoesFaixa({ faixa, playlists, onAlternarNaPlaylist, onCriarPlaylist, onRemoverDoApp, onFechar }) {
  const [criando, setCriando] = useState(false)

  if (criando) {
    return (
      <Dialogo titulo="Nova playlist" onFechar={onFechar}>
        <FormNome
          rotuloBotao="Criar"
          onCancelar={() => setCriando(false)}
          onSalvar={(nome) => {
            onCriarPlaylist(nome, faixa.id)
            onFechar()
          }}
        />
      </Dialogo>
    )
  }

  return (
    <Dialogo titulo={faixa.titulo} onFechar={onFechar}>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Adicionar à playlist</p>
      <div className="flex flex-col">
        {playlists.map((playlist) => {
          const esta = playlist.faixas.includes(faixa.id)
          return (
            <button
              key={playlist.id}
              type="button"
              onClick={() => onAlternarNaPlaylist(playlist.id, faixa.id)}
              aria-pressed={esta}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-left hover:bg-white/5"
            >
              <span className="truncate text-white">{playlist.nome}</span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  esta ? 'border-transparent bg-festa text-white' : 'border-white/30 text-transparent'
                }`}
              >
                <IconeCheck width={16} height={16} />
              </span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => setCriando(true)}
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-white hover:bg-white/5"
        >
          <IconeAdicionar width={18} height={18} />
          Nova playlist
        </button>
      </div>

      {onRemoverDoApp && (
        <>
          <hr className="my-3 border-white/10" />
          <button
            type="button"
            onClick={() => {
              onRemoverDoApp()
              onFechar()
            }}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left text-rosa hover:bg-white/5"
          >
            <IconeLixeira width={18} height={18} />
            Remover música do app
          </button>
        </>
      )}
    </Dialogo>
  )
}
