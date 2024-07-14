import {CohereEmbeddings} from '@langchain/cohere'
import {Chroma} from '@langchain/community/vectorstores/chroma'
import {Document} from '@langchain/core/documents'
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter'

const collectionName = process.env.COLLECTION_NAME
const url = process.env.CHROMA_URL

export const storeDocs = async (documents: Document[]) => {
  //  Split the Document into chunks for embedding and vector storage.
  const textSplitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
    chunkSize: 1000,
    chunkOverlap: 200
  })
  const splits = await textSplitter.splitDocuments(documents)
  // Initialize Chroma (this will persist the data)
  await Chroma.fromDocuments(
    splits,
    // Embedding models create a vector representation of a piece of text.
    // https://js.langchain.com/v0.2/docs/concepts#embedding-models
    new CohereEmbeddings(),
    {
      collectionName,
      url
    }
  )
}

export const loadDocs = async () => {
  return Chroma.fromExistingCollection(new CohereEmbeddings(), {
    collectionName,
    url
  })
}
