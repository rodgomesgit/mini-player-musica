import { Capacitor } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'

// Atualização do app Android sem APK novo. A cada push na main, o GitHub
// Actions publica junto com o site um pacote com a parte web do app
// (android/bundle-N.zip) e um android/versao.json dizendo qual é o mais novo.
// Ao abrir, o app confere esse arquivo, baixa o pacote em segundo plano e o
// aplica na próxima vez que for aberto (ou quando sair de cena).
//
// "nativoMinimo" é o versionName do android/app/build.gradle com que o pacote
// foi gerado: se o APK instalado for mais antigo (faltando algum plugin
// nativo, por exemplo), o pacote é ignorado e é preciso instalar um APK novo.

const URL_VERSAO = 'https://rodgomesgit.github.io/mini-player-musica/android/versao.json'

// Número do build no GitHub Actions; 0 nos builds feitos à mão.
export const VERSAO_WEB = Number(import.meta.env.VITE_VERSAO_WEB) || 0

const nativo = Capacitor.isNativePlatform()

// Situação da atualização, mostrada discretamente no rodapé da lista pra
// dar pra saber em que pé está sem precisar de um computador.
let estado = nativo ? 'Procurando atualização…' : null
const ouvintes = new Set()

function definirEstado(novo) {
  estado = novo
  for (const ouvinte of ouvintes) ouvinte()
}

export function lerEstadoAtualizacao() {
  return estado
}

export function ouvirEstadoAtualizacao(ouvinte) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

// Precisa rodar logo que o app abre: sem isso o plugin acha que o pacote
// novo quebrou e volta pro anterior depois de alguns segundos.
export function avisarAppPronto() {
  if (nativo) CapacitorUpdater.notifyAppReady()
}

export async function verificarAtualizacao() {
  if (!nativo) return
  try {
    const resposta = await fetch(URL_VERSAO, { cache: 'no-store' })
    if (!resposta.ok) throw new Error(`versao.json respondeu ${resposta.status}`)
    const { versao, url, nativoMinimo } = await resposta.json()
    if (!(versao > VERSAO_WEB)) {
      definirEstado('App atualizado')
      return
    }

    const atual = await CapacitorUpdater.current()
    // O plugin devolve a versão nativa como "2.0.0".
    if (parseFloat(String(atual.native)) < parseFloat(nativoMinimo)) {
      definirEstado(`Versão ${versao} precisa de um APK novo`)
      return
    }

    // Apaga pacotes antigos e reaproveita o novo se já tiver sido baixado.
    const { bundles } = await CapacitorUpdater.list()
    let pacote = bundles.find((b) => b.version === String(versao) && (b.status === 'success' || b.status === 'pending'))
    for (const b of bundles) {
      if (b.id !== atual.bundle.id && b.id !== pacote?.id) {
        await CapacitorUpdater.delete({ id: b.id }).catch(() => {})
      }
    }
    if (!pacote) {
      definirEstado(`Baixando a versão ${versao}…`)
      pacote = await CapacitorUpdater.download({ url, version: String(versao) })
    }
    await CapacitorUpdater.next({ id: pacote.id })
    definirEstado(`Versão ${versao} pronta: feche e abra o app`)
  } catch (erro) {
    // Sem internet ou servidor fora do ar: tenta de novo na próxima abertura.
    definirEstado(`Não deu pra atualizar (${erro?.message ?? erro})`)
  }
}
