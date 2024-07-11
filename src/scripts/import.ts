import 'dotenv/config'
import {indexDocs} from '../lib/index-docs.js'
import {storeDocs} from '../lib/chroma-store.js'

const docsPath = process.env.DOCS_PATH

if (!docsPath) {
  throw new Error('DOCS_PATH environment variable is required.')
}

// Load all documents from the given directory into
const docs = await indexDocs(docsPath)

await storeDocs(docs)

console.log(`Stored ${docs.length} documents.`)
