import apiClient from './apiClient';
import { useUIStore } from '../store/uiStore';

export interface Citation {
  chunk_id: string;
  document_id: string;
  document_name: string;
  page_number: string;
  heading: string;
  similarity_score: number;
  text: string;
}

export interface ChatResponse {
  conversation_id: string;
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

import { ProviderFactory } from './providers/ProviderFactory';

export const chatService = {
  async getConversations(limit = 50): Promise<Conversation[]> {
    return ProviderFactory.getChatProvider().getConversations(limit);
  },

  async getConversationDetails(conversationId: string): Promise<Conversation> {
    return ProviderFactory.getChatProvider().getConversationDetails(conversationId);
  },

  async deleteConversation(conversationId: string) {
    return ProviderFactory.getChatProvider().deleteConversation(conversationId);
  },

  async sendMessage(query: string, conversationId?: string): Promise<ChatResponse> {
    return ProviderFactory.getChatProvider().sendMessage(query, conversationId);
  }
};
