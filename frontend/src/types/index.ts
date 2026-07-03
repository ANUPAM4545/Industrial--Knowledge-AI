/**
 * ForgeMind AI — TypeScript Type Definitions
 */

// ─── User ─────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'engineer' | 'manager' | 'operator'
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  role: UserRole
  status: UserStatus
  is_verified: boolean
  avatar_url?: string
  bio?: string
  department?: string
  created_at: string
  updated_at: string
}

// ─── Document ─────────────────────────────────────────────────────────
export type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'extracting'
  | 'embedding'
  | 'ready'
  | 'failed'

export type DocumentType =
  | 'pdf'
  | 'docx'
  | 'txt'
  | 'image'
  | 'manual'
  | 'sop'
  | 'maintenance_log'
  | 'other'

export interface Document {
  id: string
  title: string
  description?: string
  original_filename: string
  file_size: number
  mime_type: string
  document_type: DocumentType
  status: DocumentStatus
  page_count?: number
  chunk_count?: number
  tags?: string
  category?: string
  department?: string
  is_ocr_processed: boolean
  language: string
  owner_id: string
  created_at: string
  updated_at: string
}

// ─── Chat ─────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system'

export interface Citation {
  document_id: string
  document_title: string
  page_number?: number
  chunk_text: string
  score: number
}

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  citations?: Citation[]
  tokens_used?: number
  model_used?: string
  created_at: string
}

export interface Conversation {
  id: string
  title: string
  user_id: string
  document_ids?: string
  message_count: number
  is_archived: boolean
  messages?: Message[]
  created_at: string
  updated_at: string
}

// ─── Analytics ────────────────────────────────────────────────────────
export interface DashboardStats {
  total_documents: number
  total_users: number
  total_searches: number
  total_conversations: number
  knowledge_health_score: number
  documents_by_status: Record<DocumentStatus, number>
  searches_last_7_days: TimeSeriesPoint[]
  conversations_last_7_days: TimeSeriesPoint[]
}

export interface TimeSeriesPoint {
  date: string
  count: number
}

// ─── API ──────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ApiError {
  error: string
  detail?: string
}

// ─── Auth ─────────────────────────────────────────────────────────────
export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  full_name: string
  password: string
  role?: UserRole
}
