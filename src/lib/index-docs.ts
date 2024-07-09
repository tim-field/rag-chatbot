import {UnstructuredLoader} from '@langchain/community/document_loaders/fs/unstructured'
import 'dotenv/config'
import {DirectoryLoader} from 'langchain/document_loaders/fs/directory'

export const indexDocs = (markdownPath = '../documentation/docs/') => {
  const loader = new DirectoryLoader(markdownPath, {
    '.md': path => {
      console.log(path)
      return new UnstructuredLoader(path, {
        apiKey: process.env.UNSTRUCTURED_API_KEY,
        apiUrl: process.env.UNSTRUCTURED_API_URL
      })
    }
  })
  return loader.load()
}
