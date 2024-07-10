import {ChatAnthropic} from '@langchain/anthropic'
import {StringOutputParser} from '@langchain/core/output_parsers'
import {ChatPromptTemplate, MessagesPlaceholder} from '@langchain/core/prompts'
import {RunnablePassthrough, RunnableSequence} from '@langchain/core/runnables'
import 'cheerio'
import 'dotenv/config'
import {formatDocumentsAsString} from 'langchain/util/document'
import {loadDocs} from './lib/chroma-store.js'
import {ChatOpenAI} from '@langchain/openai'
import {HumanMessage} from '@langchain/core/messages'

class ChatHistory {
  constructor() {
    this.messages = []
  }

  addMessage(message) {
    this.messages.push(message)
  }

  getHistory() {
    return this.messages
  }

  clear() {
    this.messages = []
  }
}

const vectorStore = await loadDocs()
// const llm = new ChatAnthropic({
//   temperature: 0,
//   model: 'claude-3-5-sonnet-20240620',
//   apiKey: process.env.ANTHROPIC_API_KEY,
//   maxTokens: 1024
// })
const llm = new ChatOpenAI({
  model: 'gpt-4o'
})

const contextualizeQSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`

const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
  ['system', contextualizeQSystemPrompt],
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}']
])

const contextualizeQChain = contextualizeQPrompt
  .pipe(llm)
  .pipe(new StringOutputParser())

const qaSystemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.

{context}`

const qaPrompt = ChatPromptTemplate.fromMessages([
  ['system', qaSystemPrompt],
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}']
])

const contextualizedQuestion = (input: Record<string, unknown>) => {
  if (
    'chat_history' in input &&
    Array.isArray(input.chat_history) &&
    input.chat_history.length > 0
  ) {
    return contextualizeQChain //.invoke(input)
  }
  return input.question as string
}

const retriever = vectorStore.asRetriever({k: 12, searchType: 'similarity'})

const ragChain = RunnableSequence.from([
  RunnablePassthrough.assign({
    context: async (input: Record<string, unknown>) => {
      if (
        'chat_history' in input &&
        Array.isArray(input.chat_history) &&
        input.chat_history.length > 0
      ) {
        const chain = contextualizedQuestion(input)
        return chain.pipe(retriever).pipe(formatDocumentsAsString)
      }
      return retriever.invoke(input.question).then(formatDocumentsAsString)
      // return '' //retriever.pipe(formatDocumentsAsString)
    }
  }),
  qaPrompt,
  llm
])

async function chat() {
  const chatHistory = new ChatHistory()
  while (true) {
    const question = await askQuestion('You: ')
    if (question.toLowerCase() === 'exit') {
      console.log('Goodbye!')
      break
    }

    const aiMsg = await ragChain.invoke({
      question,
      chat_history: chatHistory.getHistory()
    })

    chatHistory.addMessage(new HumanMessage(question))
    chatHistory.addMessage(aiMsg)
    console.log('AI:', aiMsg.content)
  }
}

function askQuestion(prompt) {
  return new Promise(resolve => {
    process.stdout.write(prompt)
    process.stdin.once('data', data => {
      resolve(data.toString().trim())
    })
  })
}

chat()
