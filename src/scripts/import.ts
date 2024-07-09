import {indexDocs} from '../lib/index-docs.js'
import {storeDocs} from '../lib/chroma-store.js'

const docs = await indexDocs('/Users/timfield/atomic/code/documentation/docs')
await storeDocs(docs)

console.log(`Stored ${docs.length} documents.`)
