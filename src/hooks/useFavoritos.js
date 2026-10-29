import { useCallback, useEffect, useState } from 'react'

const CHAVE = 'rw-player:favoritos'

function lerFavoritos() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CHAVE)) ?? [])
  } catch {
    return new Set()
  }
}

export function useFavoritos() {
  const [favoritos, setFavoritos] = useState(lerFavoritos)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify([...favoritos]))
    } catch {
      // Sem armazenamento disponível: os favoritos valem só nesta sessão.
    }
  }, [favoritos])

  const alternarFavorito = useCallback((id) => {
    setFavoritos((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }, [])

  return { favoritos, alternarFavorito }
}
