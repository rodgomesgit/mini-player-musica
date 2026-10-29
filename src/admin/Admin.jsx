import { parseBlob } from 'music-metadata'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CapaFaixa } from '../components/CapaFaixa.jsx'
import { IconeAdicionar, IconeLixeira } from '../components/Icones.jsx'
import { supabase, urlPublica } from '../lib/supabase.js'
import { criarFaixa } from '../lib/tracks.js'
import { formatarTempo } from '../lib/utils.js'

// Página pra subir e apagar músicas do catálogo online. Só quem está na
// tabela "admins" do Supabase consegue enviar; as regras ficam no banco
// (supabase/schema.sql), esta página só oferece a interface.
export function Admin() {
  const [sessao, setSessao] = useState(undefined)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => setSessao(nova))
    return () => data.subscription.unsubscribe()
  }, [])

  let conteudo
  if (!supabase) {
    conteudo = (
      <Aviso>
        O Supabase ainda não está configurado. Preencha <code>VITE_SUPABASE_KEY</code> no arquivo <code>.env</code>.
      </Aviso>
    )
  } else if (sessao === undefined) {
    conteudo = <p className="text-neutral-400">Carregando…</p>
  } else if (!sessao) {
    conteudo = <Login />
  } else {
    conteudo = <Painel email={sessao.user.email} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-16">
        <header className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">🎵 Rw Player · Admin</h1>
          {sessao && (
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="shrink-0 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white hover:border-white/60"
            >
              Sair
            </button>
          )}
        </header>
        {conteudo}
      </div>
    </div>
  )
}

function Aviso({ children }) {
  return <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-neutral-300">{children}</p>
}

function Login() {
  const [erro, setErro] = useState(null)
  const [entrando, setEntrando] = useState(false)

  async function aoEnviar(ev) {
    ev.preventDefault()
    const dados = new FormData(ev.currentTarget)
    setEntrando(true)
    setErro(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: dados.get('email').trim(),
      password: dados.get('senha'),
    })
    setEntrando(false)
    if (error) setErro('E-mail ou senha incorretos.')
  }

  return (
    <form onSubmit={aoEnviar} className="max-w-sm flex flex-col gap-3">
      <h2 className="text-xl font-bold mb-1">Entrar</h2>
      <input
        name="email"
        type="email"
        required
        autoComplete="username"
        placeholder="E-mail"
        aria-label="E-mail"
        className="rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-white/40"
      />
      <input
        name="senha"
        type="password"
        required
        autoComplete="current-password"
        placeholder="Senha"
        aria-label="Senha"
        className="rounded-lg bg-white/10 px-4 py-3 text-white placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-white/40"
      />
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      <button
        type="submit"
        disabled={entrando}
        className="rounded-full bg-green-500 px-5 py-2.5 font-bold text-black hover:bg-green-400 disabled:opacity-50"
      >
        {entrando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}

// Lê título, artista, duração e capa das tags do arquivo. Sem tags, usa o
// nome do arquivo ("Artista - Título.mp3"), igual ao app.
async function lerArquivo(arquivo) {
  const doNome = criarFaixa({ id: '', nomeArquivo: arquivo.name, src: '' })
  let titulo = doNome.titulo
  let artista = doNome.artista
  let duracao = null
  let capa = null
  try {
    const { common, format } = await parseBlob(arquivo)
    if (common.title) titulo = common.title
    if (common.artist) artista = common.artist
    if (format.duration) duracao = format.duration
    const imagem = common.picture?.find((p) => p.type?.includes('front')) ?? common.picture?.[0]
    if (imagem) capa = new Blob([imagem.data], { type: imagem.format })
  } catch {
    // Arquivo sem tags legíveis: fica com o que veio do nome.
  }
  return {
    chave: `${arquivo.name}-${arquivo.size}-${arquivo.lastModified}`,
    arquivo,
    titulo,
    artista,
    duracao,
    capa,
    capaUrl: capa ? URL.createObjectURL(capa) : null,
    estado: 'pronta',
  }
}

function extensao(nome, padrao) {
  const ext = nome.match(/\.([a-z0-9]+)$/i)?.[1]
  return ext ? ext.toLowerCase() : padrao
}

async function enviarMusica(item) {
  const id = crypto.randomUUID()
  const audioPath = `${id}.${extensao(item.arquivo.name, 'mp3')}`
  const envioAudio = await supabase.storage
    .from('audios')
    .upload(audioPath, item.arquivo, { contentType: item.arquivo.type || 'audio/mpeg' })
  if (envioAudio.error) throw envioAudio.error

  let capaPath = null
  if (item.capa) {
    capaPath = `${id}.${item.capa.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'}`
    const envioCapa = await supabase.storage.from('capas').upload(capaPath, item.capa, { contentType: item.capa.type })
    if (envioCapa.error) capaPath = null
  }

  const { error } = await supabase.from('musicas').insert({
    id,
    titulo: item.titulo.trim() || item.arquivo.name,
    artista: item.artista.trim() || 'Desconhecido',
    audio_path: audioPath,
    capa_path: capaPath,
    duracao: item.duracao,
  })
  if (error) {
    await supabase.storage.from('audios').remove([audioPath])
    if (capaPath) await supabase.storage.from('capas').remove([capaPath])
    throw error
  }
}

function Painel({ email }) {
  const [ehAdmin, setEhAdmin] = useState(null)
  const [musicas, setMusicas] = useState([])
  const [fila, setFila] = useState([])
  const [enviando, setEnviando] = useState(false)
  const inputRef = useRef(null)

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from('musicas')
      .select('id, titulo, artista, audio_path, capa_path, duracao')
      .order('criada_em', { ascending: false })
    setMusicas(data ?? [])
  }, [])

  useEffect(() => {
    supabase.rpc('eh_admin').then(({ data }) => setEhAdmin(data === true))
    carregar()
  }, [carregar])

  async function aoEscolher(ev) {
    const arquivos = Array.from(ev.target.files)
    ev.target.value = ''
    const lidos = await Promise.all(arquivos.map(lerArquivo))
    setFila((atual) => [...atual, ...lidos.filter((novo) => !atual.some((i) => i.chave === novo.chave))])
  }

  function atualizar(chave, mudancas) {
    setFila((atual) => atual.map((i) => (i.chave === chave ? { ...i, ...mudancas } : i)))
  }

  async function enviarTodas() {
    setEnviando(true)
    for (const item of fila.filter((i) => i.estado !== 'enviada')) {
      atualizar(item.chave, { estado: 'enviando', erro: null })
      try {
        await enviarMusica(item)
        atualizar(item.chave, { estado: 'enviada' })
      } catch (erro) {
        atualizar(item.chave, { estado: 'erro', erro: erro.message })
      }
    }
    setEnviando(false)
    carregar()
  }

  async function apagar(musica) {
    if (!confirm(`Apagar "${musica.titulo}" do catálogo? Some pra todo mundo que usa o app.`)) return
    const { error } = await supabase.from('musicas').delete().eq('id', musica.id)
    if (error) {
      alert(`Não foi possível apagar: ${error.message}`)
      return
    }
    await supabase.storage.from('audios').remove([musica.audio_path])
    if (musica.capa_path) await supabase.storage.from('capas').remove([musica.capa_path])
    carregar()
  }

  if (ehAdmin === false) {
    return (
      <Aviso>
        A conta <strong>{email}</strong> entrou, mas não é admin. Adicione esse e-mail na tabela <code>admins</code> do
        Supabase (veja a última linha de <code>supabase/schema.sql</code>).
      </Aviso>
    )
  }

  const pendentes = fila.filter((i) => i.estado !== 'enviada')

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Subir músicas</h2>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm font-medium text-white hover:border-white/60"
          >
            <IconeAdicionar width={16} height={16} />
            Escolher arquivos
          </button>
          <input ref={inputRef} type="file" accept="audio/*" multiple hidden onChange={aoEscolher} />
        </div>
        <p className="mb-4 text-sm text-neutral-400">
          Título, artista e capa são lidos do próprio arquivo. Confira antes de enviar.
        </p>

        {fila.length > 0 && (
          <div className="flex flex-col gap-2">
            {fila.map((item) => (
              <div key={item.chave} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                <CapaFaixa capa={item.capaUrl} titulo={item.titulo} />
                <div className="flex-1 min-w-0 grid gap-1.5 sm:grid-cols-2">
                  <input
                    value={item.titulo}
                    onChange={(ev) => atualizar(item.chave, { titulo: ev.target.value })}
                    disabled={item.estado === 'enviando' || item.estado === 'enviada'}
                    aria-label="Título"
                    className="min-w-0 rounded bg-white/10 px-2 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
                  />
                  <input
                    value={item.artista}
                    onChange={(ev) => atualizar(item.chave, { artista: ev.target.value })}
                    disabled={item.estado === 'enviando' || item.estado === 'enviada'}
                    aria-label="Artista"
                    className="min-w-0 rounded bg-white/10 px-2 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
                  />
                  {item.erro && <p className="sm:col-span-2 text-xs text-red-400">{item.erro}</p>}
                </div>
                <span className="w-20 shrink-0 text-right text-xs text-neutral-400">
                  {{ pronta: formatarTempo(item.duracao), enviando: 'Enviando…', enviada: '✓ Enviada', erro: 'Falhou' }[item.estado]}
                </span>
                {item.estado !== 'enviando' && item.estado !== 'enviada' && (
                  <button
                    type="button"
                    onClick={() => setFila((atual) => atual.filter((i) => i.chave !== item.chave))}
                    aria-label={`Tirar ${item.titulo} da fila`}
                    className="p-1 text-neutral-500 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={enviarTodas}
              disabled={enviando || pendentes.length === 0}
              className="mt-2 self-end rounded-full bg-green-500 px-5 py-2.5 font-bold text-black hover:bg-green-400 disabled:opacity-50"
            >
              {enviando ? 'Enviando…' : `Enviar ${pendentes.length} ${pendentes.length === 1 ? 'música' : 'músicas'}`}
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">
          No catálogo <span className="text-sm font-normal text-neutral-400">({musicas.length})</span>
        </h2>
        {musicas.length === 0 ? (
          <p className="text-sm text-neutral-400">Nenhuma música online ainda.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {musicas.map((musica) => (
              <div key={musica.id} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5">
                <CapaFaixa capa={urlPublica('capas', musica.capa_path)} titulo={musica.titulo} tamanho="w-10 h-10" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{musica.titulo}</p>
                  <p className="truncate text-xs text-neutral-400">{musica.artista}</p>
                </div>
                <span className="text-xs text-neutral-400 tabular-nums">{formatarTempo(musica.duracao)}</span>
                <button
                  type="button"
                  onClick={() => apagar(musica)}
                  aria-label={`Apagar ${musica.titulo}`}
                  className="p-2 text-neutral-500 hover:text-red-400"
                >
                  <IconeLixeira width={18} height={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
