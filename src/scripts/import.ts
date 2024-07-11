import 'dotenv/config'
import {indexDocs} from '../lib/index-docs.js'
import {storeDocs} from '../lib/chroma-store.js'

// Load all documents from the given directory into
const docs = await indexDocs(process.env.DOCS_PATH)

await storeDocs(docs)

console.log(`Stored ${docs.length} documents.`)
