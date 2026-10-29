import { IconeMusica } from './Icones.jsx'

export function CapaFaixa({ capa, titulo, tamanho = 'w-12 h-12' }) {
  if (capa) {
    return (
      <img
        src={capa}
        alt=""
        className={`${tamanho} rounded-lg object-cover shrink-0`}
      />
    )
  }
  return (
    <div
      className={`${tamanho} rounded-lg shrink-0 bg-gradient-to-br from-violeta/35 via-rosa/25 to-ambar/30 flex items-center justify-center text-white/70`}
      aria-hidden="true"
      title={titulo}
    >
      <IconeMusica width={18} height={18} />
    </div>
  )
}
