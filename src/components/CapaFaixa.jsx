import { IconeMusica } from './Icones.jsx'

export function CapaFaixa({ capa, titulo, tamanho = 'w-12 h-12' }) {
  if (capa) {
    return (
      <img
        src={capa}
        alt=""
        className={`${tamanho} rounded object-cover shrink-0`}
      />
    )
  }
  return (
    <div
      className={`${tamanho} rounded shrink-0 bg-neutral-800 flex items-center justify-center text-neutral-500`}
      aria-hidden="true"
      title={titulo}
    >
      <IconeMusica width={18} height={18} />
    </div>
  )
}
