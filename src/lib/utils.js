export function formatarTempo(segundosTotais) {
  if (!Number.isFinite(segundosTotais) || segundosTotais < 0) return '0:00'
  const minutos = Math.floor(segundosTotais / 60)
  const segundos = Math.floor(segundosTotais % 60)
  return `${minutos}:${String(segundos).padStart(2, '0')}`
}
