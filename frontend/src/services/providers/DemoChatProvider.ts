import type { IChatProvider } from './types'
import type { Conversation, ChatResponse } from '../chatService'

const DEMO_CONVERSATIONS: Conversation[] = Array.from({ length: 20 }, (_, i) => ({
  id: `demo_conv_${i + 1}`,
  title: [
    "Pump Replacement Guide", "Valve Calibration Steps", "Safety Procedures Summary",
    "Hydraulic Diagnostics", "Emergency Shutdown", "Lubrication Schedule",
    "Electrical Safety Limits", "Machine Tolerance Check", "Filter Replacement",
    "Sensor Reset Protocol", "Pressure Variance", "Overheating Warnings",
    "Coolant Flow Rate", "Manual Override", "Belt Tension Specs",
    "Alignment Errors", "Vibration Analysis", "Torque Settings",
    "Seal Inspection", "O-ring Sizing"
  ][i],
  messages: []
}))

export class DemoChatProvider implements IChatProvider {
  async getConversations(limit = 50): Promise<Conversation[]> {
    return DEMO_CONVERSATIONS.slice(0, limit)
  }

  async getConversationDetails(conversationId: string): Promise<Conversation> {
    const conv = DEMO_CONVERSATIONS.find(c => c.id === conversationId)
    if (!conv) throw new Error("Conversation not found")
    
    // Auto-populate messages if empty for the demo
    if (conv.messages.length === 0) {
      conv.messages = [
        {
          id: `msg_user_${conversationId}`,
          role: "user",
          content: `Can you explain the details for ${conv.title.toLowerCase()}?`,
          created_at: new Date(Date.now() - 1000 * 60).toISOString()
        },
        {
          id: `msg_assistant_${conversationId}`,
          role: "assistant",
          content: `According to the relevant manuals, the ${conv.title.toLowerCase()} requires adherence to standard operating procedures. Ensure safety protocols are met before proceeding.`,
          created_at: new Date(Date.now() - 1000 * 30).toISOString(),
          context_json: {
            citations: [
              {
                chunk_id: `demo_chunk_${conversationId}_1`,
                document_id: "demo_doc_1",
                document_name: "Pump Maintenance Manual.pdf",
                page_number: "4",
                heading: "Procedure Overview",
                similarity_score: 0.94,
                text: "standard operating procedures require adherence"
              }
            ]
          }
        }
      ]
    }
    return conv
  }

  async deleteConversation(conversationId: string): Promise<any> {
    const idx = DEMO_CONVERSATIONS.findIndex(c => c.id === conversationId)
    if (idx !== -1) DEMO_CONVERSATIONS.splice(idx, 1)
    return { status: "deleted" }
  }

  async sendMessage(query: string, conversationId?: string): Promise<ChatResponse> {
    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 800))
    
    return {
      conversation_id: conversationId || "demo_conv_new",
      answer: `Based on the provided documentation, here is the answer regarding your query about "${query}".\n\n1. Always check safety parameters.\n2. Refer to the standard operation manuals.\n3. Ensure system is depressurized.`,
      citations: [
        {
          chunk_id: "demo_chunk_dyn_1",
          document_id: "demo_doc_1",
          document_name: "Pump Maintenance Manual.pdf",
          page_number: "2",
          heading: "Safety Parameters",
          similarity_score: 0.98,
          text: "Always check safety parameters."
        },
        {
          chunk_id: "demo_chunk_dyn_2",
          document_id: "demo_doc_3",
          document_name: "Safety Procedures.pdf",
          page_number: "1",
          heading: "Depressurization",
          similarity_score: 0.95,
          text: "Ensure system is depressurized."
        }
      ]
    }
  }
}
