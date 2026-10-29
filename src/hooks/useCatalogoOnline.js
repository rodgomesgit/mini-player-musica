import { useEffect, useState } from 'react'
import { supabase, urlPublica } from '../lib/supabase.js'

function paraFaixa(musica) {
  return {
    id: `online:${musica.id}`,
    titulo: musica.titulo,
    artista: musica.artista,
    src: urlPublica('audios', musica.audio_path),
    capa: urlPublica('capas', musica.capa_path),
    duracao: musica.duracao ?? undefined,
    online: true,
  }
}

// Músicas do catálogo online. Sem internet (ou sem Supabase configurado) a
// lista fica vazia e o app segue com as músicas locais.
export function useCatalogoOnline() {
  const [online, setOnline] = useState([])

  useEffect(() => {
    if (!supabase) return
    let cancelado = false
    supabase
      .from('musicas')
      .select('id, titulo, artista, audio_path, capa_path, duracao')
      .order('titulo')
      .then(({ data, error }) => {
        if (cancelado || error) return
        setOnline(data.map(paraFaixa))
      })
    return () => {
      cancelado = true
    }
  }, [])

  return online
}
