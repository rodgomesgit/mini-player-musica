import { useEffect } from 'react'

// Painel modal: no celular abre como uma folha vinda de baixo, no computador
// fica centralizado. Fecha com Esc ou tocando fora.
export function Dialogo({ titulo, onFechar, children }) {
  useEffect(() => {
    function aoTeclar(ev) {
      if (ev.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-noite/70 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(ev) => ev.stopPropagation()}
        className="w-full sm:max-w-sm max-h-[80vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-noite-alta ring-1 ring-white/10 shadow-2xl shadow-black/60 px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <h3 className="font-display text-xl font-bold tracking-tight text-white truncate mb-4">{titulo}</h3>
        {children}
      </div>
    </div>
  )
}

export function FormNome({ valorInicial = '', rotuloBotao, onSalvar, onCancelar }) {
  function aoEnviar(ev) {
    ev.preventDefault()
    const nome = new FormData(ev.currentTarget).get('nome').trim()
    if (nome) onSalvar(nome)
  }
  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-4">
      <input
        name="nome"
        defaultValue={valorInicial}
        autoFocus
        maxLength={60}
        placeholder="Nome da playlist"
        aria-label="Nome da playlist"
        className="rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-coral/60"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancelar} className="rounded-full px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white">
          Cancelar
        </button>
        <button type="submit" className="rounded-full bg-festa brilho-festa px-5 py-2 text-sm font-bold text-white hover:brightness-110">
          {rotuloBotao}
        </button>
      </div>
    </form>
  )
}
