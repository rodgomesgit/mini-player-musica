import { useCallback, useEffect, useState } from 'react'

// Playlists criadas pela pessoa: só guardam o nome e os ids das faixas, na
// ordem em que foram adicionadas.
const CHAVE = 'rw-player:playlists'

function lerPlaylists() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE))
    return Array.isArray(salvas) ? salvas : []
  } catch {
    return []
  }
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState(lerPlaylists)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(playlists))
    } catch {
      // Sem armazenamento disponível: as playlists valem só nesta sessão.
    }
  }, [playlists])

  const criar = useCallback((nome, faixaInicial) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setPlaylists((atual) => [...atual, { id, nome, faixas: faixaInicial ? [faixaInicial] : [] }])
    return id
  }, [])

  const renomear = useCallback((id, nome) => {
    setPlaylists((atual) => atual.map((p) => (p.id === id ? { ...p, nome } : p)))
  }, [])

  const excluir = useCallback((id) => {
    setPlaylists((atual) => atual.filter((p) => p.id !== id))
  }, [])

  const alternarFaixa = useCallback((id, faixaId) => {
    setPlaylists((atual) =>
      atual.map((p) => {
        if (p.id !== id) return p
        const tem = p.faixas.includes(faixaId)
        return { ...p, faixas: tem ? p.faixas.filter((f) => f !== faixaId) : [...p.faixas, faixaId] }
      }),
    )
  }, [])

  const removerFaixaDeTodas = useCallback((faixaId) => {
    setPlaylists((atual) =>
      atual.map((p) => (p.faixas.includes(faixaId) ? { ...p, faixas: p.faixas.filter((f) => f !== faixaId) } : p)),
    )
  }, [])

  return { playlists, criar, renomear, excluir, alternarFaixa, removerFaixaDeTodas }
}
