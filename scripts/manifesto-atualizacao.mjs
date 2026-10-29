// Gera o android/versao.json publicado junto com o site (veja
// src/lib/atualizacao.js). Uso: node scripts/manifesto-atualizacao.mjs <número do build>
import { readFileSync } from 'node:fs'

const versao = Number(process.argv[2])
if (!versao) throw new Error('Informe o número do build.')

const gradle = readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8')
const nativoMinimo = gradle.match(/versionName\s+"([^"]+)"/)?.[1]
if (!nativoMinimo) throw new Error('versionName não encontrado em android/app/build.gradle')

console.log(
  JSON.stringify({
    versao,
    url: `https://rodgomesgit.github.io/mini-player-musica/android/bundle-${versao}.zip`,
    nativoMinimo,
  }),
)
