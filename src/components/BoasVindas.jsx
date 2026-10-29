import { IconeBusca } from './Icones.jsx'
import mascote from '../assets/dj-rw-mascote.webp'

// Tela de boas-vindas mostrada ao abrir o app. O que for digitado vira a
// busca da lista; os botões de baixo entram direto em "Todas" ou no Explorar.
export function BoasVindas({ onBuscar, onEntrar }) {
  function aoEnviar(ev) {
    ev.preventDefault()
    const termo = new FormData(ev.currentTarget).get('termo').trim()
    if (termo) onBuscar(termo)
    else onEntrar('todas')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="boas-vindas-titulo"
      className="boas-vindas fixed inset-0 z-50 overflow-x-hidden overflow-y-auto bg-noite"
    >
      {/* Brilhos de fundo nas cores do mascote. */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -right-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="relative min-h-full max-w-md mx-auto flex flex-col items-center justify-center text-center px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <img
          src={mascote}
          alt="DJ Rw, uma raposa de óculos escuros tocando nas pick-ups"
          className="mascote-flutuando w-64 max-w-[70vw] max-h-[42vh] object-contain drop-shadow-[0_12px_30px_rgba(249,115,22,0.35)]"
        />

        <h1 id="boas-vindas-titulo" className="mt-6 font-display text-[2rem] font-extrabold leading-tight tracking-tight text-white">
          Seja bem-vindo à festa do{' '}
          <span className="texto-festa">
            DJ Rw
          </span>
          !
        </h1>
        <p className="mt-3 text-lg text-neutral-300">Qual música você tá a fim de ouvir hoje?</p>

        <form onSubmit={aoEnviar} className="mt-6 w-full flex gap-2">
          <label className="flex-1 min-w-0 flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 focus-within:ring-2 focus-within:ring-coral/70">
            <IconeBusca width={18} height={18} className="text-neutral-400 shrink-0" />
            <input
              name="termo"
              type="search"
              enterKeyHint="search"
              placeholder="Música ou artista"
              aria-label="Música ou artista"
              className="flex-1 min-w-0 bg-transparent text-white placeholder:text-neutral-400 outline-none"
            />
          </label>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-festa brilho-festa px-5 font-bold text-white hover:brightness-110 transition"
          >
            Bora!
          </button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => onEntrar('todas')}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white hover:border-white/60 transition-colors"
          >
            Ver todas as músicas
          </button>
          <button
            type="button"
            onClick={() => onEntrar('explorar')}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white hover:border-white/60 transition-colors"
          >
            Descobrir no Explorar
          </button>
        </div>
      </div>
    </div>
  )
}
