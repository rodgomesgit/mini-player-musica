import { createClient } from '@supabase/supabase-js'

// Fica null enquanto a chave não estiver no .env: o app continua funcionando
// só com as músicas locais.
const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_KEY

export const supabase = url && chave ? createClient(url, chave) : null

export function urlPublica(bucket, caminho) {
  if (!supabase || !caminho) return null
  return supabase.storage.from(bucket).getPublicUrl(caminho).data.publicUrl
}
