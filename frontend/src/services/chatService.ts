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

export const chatService = {
  async getConversations(limit = 50): Promise<Conversation[]> {
    if (useUIStore.getState().demoMode) {
      return [
        {
          id: "demo_conv_1",
          title: "Standard Safety SOP Analysis",
          messages: []
        }
      ];
    }
    const response = await apiClient.get(`/chat/history?limit=${limit}`);
    return response.data;
  },

  async getConversationDetails(conversationId: string): Promise<Conversation> {
    if (useUIStore.getState().demoMode && conversationId.startsWith("demo_")) {
      return {
        id: "demo_conv_1",
        title: "Standard Safety SOP Analysis",
        messages: [
          {
            id: "msg_user_1",
            role: "user",
            content: "What are the temperature parameters for emergency backup valves?",
            created_at: new Date().toISOString()
          },
          {
            id: "msg_assistant_1",
            role: "assistant",
            content: "According to the Standard Safety SOP (Page 1), the backup pressure check valves must trigger immediate sensor indicators if backup power thresholds fall below emergency limit levels. Standard operations require temperature warnings at 85C.",
            created_at: new Date().toISOString(),
            context_json: {
              citations: [
                {
                  chunk_id: "demo_chunk_1",
                  document_id: "demo_1",
                  document_name: "Standard Safety SOP.pdf",
                  page_number: "1",
                  heading: "Emergency Valve Operations",
                  similarity_score: 0.94,
                  text: "backup pressure check valves must trigger immediate sensor indicators if backup power thresholds fall"
                },
                {
                  chunk_id: "demo_chunk_2",
                  document_id: "demo_2",
                  document_name: "Valve Specs Checklist.docx",
                  page_number: "1",
                  heading: "Specifications Datasheet",
                  similarity_score: 0.89,
                  text: "safety sensors trigger checklist parameters. Standard operations require temperature warnings at 85C"
                }
              ]
            }
          }
        ]
      };
    }
    const response = await apiClient.get(`/chat/${conversationId}`);
    return response.data;
  },

  async deleteConversation(conversationId: string) {
    if (useUIStore.getState().demoMode && conversationId.startsWith("demo_")) {
      return { status: "deleted" };
    }
    const response = await apiClient.delete(`/chat/${conversationId}`);
    return response.data;
  },

  async sendMessage(query: string, conversationId?: string): Promise<ChatResponse> {
    if (useUIStore.getState().demoMode) {
      // Simulate real-time response matching the demo documents
      return {
        conversation_id: conversationId || "demo_conv_1",
        answer: "Based on the Standard Safety SOP and specifications check valve guidelines: \n\n1. **Backup pressure check valves** are configured to trigger immediate indicators upon emergency drops.\n2. Operations specify a warning temperature limit threshold of **85°C** (refer to Valve Specs Checklist page 1).",
        citations: [
          {
            chunk_id: "demo_chunk_1",
            document_id: "demo_1",
            document_name: "Standard Safety SOP.pdf",
            page_number: "1",
            heading: "Emergency Valve Operations",
            similarity_score: 0.94,
            text: "backup pressure check valves"
          },
          {
            chunk_id: "demo_chunk_2",
            document_id: "demo_2",
            document_name: "Valve Specs Checklist.docx",
            page_number: "1",
            heading: "Specifications Datasheet",
            similarity_score: 0.89,
            text: "safety sensors trigger"
          }
        ]
      };
    }
    const response = await apiClient.post('/chat', {
      query,
      conversation_id: conversationId,
    });
    return response.data;
  }
};
