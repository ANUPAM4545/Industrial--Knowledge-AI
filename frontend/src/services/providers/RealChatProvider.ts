import apiClient from '../apiClient'
import type { IChatProvider } from './types'
import type { Conversation, ChatResponse } from '../chatService'

export class RealChatProvider implements IChatProvider {
  async getConversations(limit = 50): Promise<Conversation[]> {
    const response = await apiClient.get(`/chat/history?limit=${limit}`)
    return response.data
  }

  async getConversationDetails(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get(`/chat/${conversationId}`)
    return response.data
  }

  async deleteConversation(conversationId: string): Promise<any> {
    const response = await apiClient.delete(`/chat/${conversationId}`)
    return response.data
  }

  async sendMessage(query: string, conversationId?: string): Promise<ChatResponse> {
    const response = await apiClient.post('/chat', {
      query,
      conversation_id: conversationId,
    })
    return response.data
  }
}
