import {BaseMessage} from '@langchain/core/messages'

export const ChatHistory = () => {
  let messages: BaseMessage[] = []

  return {
    addMessage(message: BaseMessage) {
      messages.push(message)
    },

    getHistory() {
      return messages
    },

    clear() {
      messages = []
    }
  }
}
