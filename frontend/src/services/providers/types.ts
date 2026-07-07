import type { Document, PaginatedResponse } from '@/types'
import type { 
  DashboardOverview, KnowledgeHealth, SearchAnalytics, 
  SystemHealth, DashboardTrends, SmartInsight 
} from '../dashboardService'

export interface IDocumentProvider {
  getDocuments(params: { page?: number, page_size?: number, status_filter?: string, search?: string }): Promise<PaginatedResponse<Document>>
  getDocument(id: string): Promise<Document>
  getDocumentStatus(id: string): Promise<Pick<Document, 'id' | 'status'>>
  uploadDocument(payload: FormData, onProgress?: (pct: number) => void): Promise<Document>
  deleteDocument(id: string): Promise<void>
  downloadDocument(id: string): Promise<Blob>
}

import type { Conversation, ChatResponse } from '../chatService'

export interface IChatProvider {
  getConversations(limit?: number): Promise<Conversation[]>
  getConversationDetails(id: string): Promise<Conversation>
  deleteConversation(id: string): Promise<any>
  sendMessage(query: string, conversationId?: string): Promise<ChatResponse>
}

export interface IDashboardProvider {
  getOverview(): Promise<DashboardOverview>
  getKnowledge(): Promise<KnowledgeHealth>
  getSearch(): Promise<SearchAnalytics>
  getSystem(): Promise<SystemHealth>
  getTrends(): Promise<DashboardTrends>
  getInsights(): Promise<SmartInsight[]>
}
