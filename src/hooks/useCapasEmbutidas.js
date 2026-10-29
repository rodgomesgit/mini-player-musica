import { useEffect, useState } from 'react'
import { lerCapaEmbutida } from '../lib/capasEmbutidas.js'

// Busca, uma faixa por vez, a capa embutida em cada arquivo de áudio e devolve
// um mapa { idDaFaixa: urlDaCapa }. Faixas sem capa embutida ficam de fora.
export function useCapasEmbutidas(faixas) {
  const [capas, setCapas] = useState({})

  useEffect(() => {
    let cancelado = false
    ;(async () => {
      for (const faixa of faixas) {
        const capa = await lerCapaEmbutida(faixa.src)
        if (cancelado) return
        if (capa) {
          setCapas((atual) => (atual[faixa.id] === capa ? atual : { ...atual, [faixa.id]: capa }))
        }
      }
    })()
    return () => {
      cancelado = true
    }
  }, [faixas])

  return capas
}
