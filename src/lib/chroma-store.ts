import {CohereEmbeddings} from '@langchain/cohere'
import {Chroma} from '@langchain/community/vectorstores/chroma'
import {Document} from '@langchain/core/documents'
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter'

const collectionName = process.env.COLLECTION_NAME
const url = process.env.CHROMA_URL

export const storeDocs = async (documents: Document[]) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })
  const splits = await textSplitter.splitDocuments(documents)
  // Initialize Chroma (this will persist the data)
  await Chroma.fromDocuments(splits, new CohereEmbeddings(), {
    collectionName,
    url
  })
}

export const loadDocs = async () => {
  return Chroma.fromExistingCollection(new CohereEmbeddings(), {
    collectionName,
    url
  })
}
