import {HumanMessage} from '@langchain/core/messages'
import {ragChain} from './ai.js'
import {ChatHistory} from './chat.js'

async function chat() {
  const chatHistory = ChatHistory()
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
function askQuestion(prompt: string) {
  return new Promise<string>(resolve => {
    process.stdout.write(prompt)
    process.stdin.once('data', data => {
      resolve(data.toString().trim())
    })
  })
}
chat()
