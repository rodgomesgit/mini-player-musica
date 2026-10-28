import { useEffect, useState } from 'react'

// Pré-carrega só os metadados (não o áudio inteiro) de cada faixa pra
// conseguir mostrar a duração na lista antes de tocar qualquer uma.
export function useDuracoesFaixas(faixas) {
  const [duracoes, setDuracoes] = useState({})

  useEffect(() => {
    let cancelado = false
    const audiosTemporarios = faixas.map((faixa) => {
      const audio = new Audio()
      audio.preload = 'metadata'
      audio.src = faixa.src

      function aoCarregarMetadados() {
        if (cancelado) return
        setDuracoes((atual) => ({ ...atual, [faixa.id]: audio.duration }))
      }
      audio.addEventListener('loadedmetadata', aoCarregarMetadados)
      return { audio, aoCarregarMetadados }
    })

    return () => {
      cancelado = true
      audiosTemporarios.forEach(({ audio, aoCarregarMetadados }) => {
        audio.removeEventListener('loadedmetadata', aoCarregarMetadados)
        audio.src = ''
      })
    }
  }, [faixas])

  return duracoes
}
