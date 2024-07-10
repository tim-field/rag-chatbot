import {WebSocket, WebSocketServer} from 'ws'
import {ragChain} from './ai.js' // import necessary functions and classes
import {ChatHistory} from './chat.js'
import {HumanMessage} from '@langchain/core/messages'

const wss = new WebSocketServer({port: 8080})

wss.on('connection', (ws: WebSocket) => {
  const chatHistory = ChatHistory()

  ws.on('message', async (message: string) => {
    const question = message.toString()

    if (question.toLowerCase() === 'exit') {
      ws.send('Goodbye!')
      ws.close()
      return
    }

    const aiMsg = await ragChain.invoke({
      question,
      chat_history: chatHistory.getHistory()
    })

    chatHistory.addMessage(new HumanMessage(question))
    chatHistory.addMessage(aiMsg)
    ws.send(aiMsg.content)
  })
})

console.log('WebSocket server running on ws://localhost:8080')
