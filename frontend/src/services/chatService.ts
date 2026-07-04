import apiClient from './apiClient';

export interface Citation {
  chunk_id: str;
  document_id: str;
  document_name: str;
  page_number: string;
  heading: string;
  similarity_score: number;
  text: string;
}

export interface ChatResponse {
  conversation_id: str;
  answer: string;
  citations: Citation[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  context_json?: { citations?: Citation[] };
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export const chatService = {
  async getConversations(limit = 50) {
    const response = await apiClient.get(`/chat/history?limit=${limit}`);
    return response.data;
  },

  async getConversationDetails(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get(`/chat/${conversationId}`);
    return response.data;
  },

  async deleteConversation(conversationId: string) {
    const response = await apiClient.delete(`/chat/${conversationId}`);
    return response.data;
  },

  async sendMessage(query: string, conversationId?: string): Promise<ChatResponse> {
    const response = await apiClient.post('/chat', {
      query,
      conversation_id: conversationId,
    });
    return response.data;
  }
};
