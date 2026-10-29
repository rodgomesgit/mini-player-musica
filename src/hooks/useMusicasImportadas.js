import { useCallback, useEffect, useState } from 'react'
import { listarImportadas, removerImportada, salvarImportadas } from '../lib/importadas.js'
import { criarFaixa } from '../lib/tracks.js'

// Transforma cada registro salvo (com o arquivo em Blob) numa faixa tocável,
// usando uma URL de objeto que vale enquanto o app estiver aberto.
function paraFaixa(registro) {
  return {
    ...criarFaixa({ id: registro.id, nomeArquivo: registro.nome, src: URL.createObjectURL(registro.arquivo) }),
    importada: true,
    adicionadaEm: registro.adicionadaEm,
  }
}

export function useMusicasImportadas() {
  const [importadas, setImportadas] = useState([])
  const [importando, setImportando] = useState(false)

  useEffect(() => {
    let cancelado = false
    listarImportadas()
      .then((registros) => {
        if (cancelado) return
        registros.sort((a, b) => a.adicionadaEm - b.adicionadaEm)
        setImportadas(registros.map(paraFaixa))
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [])

  const importar = useCallback(async (arquivos) => {
    const audios = Array.from(arquivos).filter((arquivo) => arquivo.type.startsWith('audio/') || /\.(mp3|m4a|aac|ogg|opus|wav|flac)$/i.test(arquivo.name))
    if (audios.length === 0) return 0
    setImportando(true)
    try {
      const agora = Date.now()
      const registros = audios.map((arquivo, i) => ({
        id: `importada:${agora}-${i}-${arquivo.name}`,
        nome: arquivo.name,
        arquivo,
        adicionadaEm: agora + i,
      }))
      await salvarImportadas(registros)
      setImportadas((atual) => [...atual, ...registros.map(paraFaixa)])
      return registros.length
    } finally {
      setImportando(false)
    }
  }, [])

  const remover = useCallback(async (id) => {
    await removerImportada(id)
    setImportadas((atual) => {
      const faixa = atual.find((f) => f.id === id)
      if (faixa) URL.revokeObjectURL(faixa.src)
      return atual.filter((f) => f.id !== id)
    })
  }, [])

  return { importadas, importando, importar, remover }
}
