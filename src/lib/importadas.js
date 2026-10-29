// Guarda as músicas que a pessoa importa do próprio aparelho no IndexedDB do
// navegador/WebView, pra que continuem na playlist depois de fechar o app.

const NOME_BANCO = 'rw-player'
const LOJA = 'musicas-importadas'

function abrirBanco() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(NOME_BANCO, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(LOJA, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function transacao(modo, operacao) {
  const banco = await abrirBanco()
  return new Promise((resolve, reject) => {
    const tx = banco.transaction(LOJA, modo)
    const resultado = operacao(tx.objectStore(LOJA))
    tx.oncomplete = () => {
      banco.close()
      resolve(resultado?.result)
    }
    tx.onerror = () => {
      banco.close()
      reject(tx.error)
    }
  })
}

export function listarImportadas() {
  return transacao('readonly', (loja) => loja.getAll())
}

export function salvarImportadas(registros) {
  return transacao('readwrite', (loja) => {
    registros.forEach((registro) => loja.put(registro))
  })
}

export function removerImportada(id) {
  return transacao('readwrite', (loja) => loja.delete(id))
}
