import { useEffect, useMemo, useState } from 'react'
import { buscarNoAudius, emAltaNoAudius } from '../lib/audius.js'

// Faixas do Audius favoritadas ou postas em playlist ficam guardadas no
// aparelho, pra continuarem aparecendo sem precisar buscar de novo.
const CHAVE = 'rw-player:audius'

function lerSalvas() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE))
    return Array.isArray(salvas) ? salvas : []
  } catch {
    return []
  }
}

// `ativo`: se a aba Explorar está aberta. `termo`: o que foi digitado na busca
// (vazio mostra as em alta da semana). `idsSalvos`: ids usados em favoritos e
// playlists.
export function useAudius(ativo, termo, idsSalvos) {
  const [resultados, setResultados] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(false)
  // Toda faixa vista nesta sessão: a que está tocando continua disponível
  // mesmo depois de uma busca nova trocar os resultados.
  const [conhecidas, setConhecidas] = useState(() => new Map(lerSalvas().map((f) => [f.id, f])))

  useEffect(() => {
    if (!ativo) return
    const controle = new AbortController()
    const limpo = termo.trim()
    // Espera a pessoa parar de digitar antes de buscar.
    const espera = setTimeout(
      async () => {
        setCarregando(true)
        setErro(false)
        try {
          const faixas = limpo ? await buscarNoAudius(limpo, controle.signal) : await emAltaNoAudius(controle.signal)
          setResultados(faixas)
          setConhecidas((atual) => {
            const novo = new Map(atual)
            for (const f of faixas) novo.set(f.id, f)
            return novo
          })
        } catch (e) {
          if (e.name !== 'AbortError') setErro(true)
        } finally {
          if (!controle.signal.aborted) setCarregando(false)
        }
      },
      limpo ? 400 : 0,
    )
    return () => {
      clearTimeout(espera)
      controle.abort()
    }
  }, [ativo, termo])

  const salvas = useMemo(
    () => [...conhecidas.values()].filter((f) => idsSalvos.has(f.id)),
    [conhecidas, idsSalvos],
  )

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(salvas))
    } catch {
      // Sem armazenamento: as faixas salvas valem só nesta sessão.
    }
  }, [salvas])

  const todasConhecidas = useMemo(() => [...conhecidas.values()], [conhecidas])

  return { resultados, carregando, erro, salvas, conhecidas: todasConhecidas }
}
