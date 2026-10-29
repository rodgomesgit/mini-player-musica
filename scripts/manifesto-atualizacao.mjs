// Gera o android/versao.json publicado junto com o site (veja
// src/lib/atualizacao.js).
// Uso: node scripts/manifesto-atualizacao.mjs <número do build> <caminho do zip>
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const versao = Number(process.argv[2])
const zip = process.argv[3]
if (!versao || !zip) throw new Error('Uso: manifesto-atualizacao.mjs <número do build> <caminho do zip>')

const gradle = readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8')
const nativoMinimo = gradle.match(/versionName\s+"([^"]+)"/)?.[1]
if (!nativoMinimo) throw new Error('versionName não encontrado em android/app/build.gradle')

// O plugin de atualização só aceita o pacote se o SHA-256 dele bater com este.
const checksum = createHash('sha256').update(readFileSync(zip)).digest('hex')

console.log(
  JSON.stringify({
    versao,
    url: `https://rodgomesgit.github.io/mini-player-musica/android/bundle-${versao}.zip`,
    checksum,
    nativoMinimo,
  }),
)
