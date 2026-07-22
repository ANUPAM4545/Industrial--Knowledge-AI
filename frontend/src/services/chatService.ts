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
  context_json?: { citations?: Citation[], traces?: any[] };
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
  },

  async *sendMessageStream(query: string, conversationId?: string, signal?: AbortSignal): AsyncGenerator<any, void, unknown> {
    // @ts-ignore
    const clerk = window.Clerk;
    let token = localStorage.getItem('nexo_token');
    if (clerk && clerk.session) {
      try {
        const clerkToken = await clerk.session.getToken();
        if (clerkToken) token = clerkToken;
      } catch (e) {
        console.error("Failed to fetch Clerk token in stream", e);
      }
    }
    const workspaceId = localStorage.getItem('nexo_workspace_id');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (workspaceId) headers['X-Workspace-ID'] = workspaceId;

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, conversation_id: conversationId }),
      signal
    });

    if (!response.ok) {
      throw new Error('Chat request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') return;
          try {
            yield JSON.parse(dataStr);
          } catch (e) {
            console.error('Failed to parse SSE data', e);
          }
        }
      }
    }
  }
};
