import {ChatAnthropic} from '@langchain/anthropic'
import {StringOutputParser} from '@langchain/core/output_parsers'
import {ChatPromptTemplate} from '@langchain/core/prompts'
import {RunnablePassthrough, RunnableSequence} from '@langchain/core/runnables'
import 'cheerio'
import 'dotenv/config'
import {pull} from 'langchain/hub'
import {formatDocumentsAsString} from 'langchain/util/document'
import {loadDocs} from './lib/chroma-store.js'

const llm = new ChatAnthropic({
  temperature: 0,
  model: 'claude-3-5-sonnet-20240620',
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxTokens: 1024
})

const query = process.argv[2] || "What's a stream container used for ?"
const vectorStore = await loadDocs()
console.log(query)

const retriever = vectorStore.asRetriever({k: 12, searchType: 'similarity'})
const prompt = await pull<ChatPromptTemplate>('rlm/rag-prompt')

const ragChain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough()
  },
  prompt,
  llm,
  new StringOutputParser()
])

for await (const chunk of await ragChain.stream(query)) {
  console.log(chunk)
}
