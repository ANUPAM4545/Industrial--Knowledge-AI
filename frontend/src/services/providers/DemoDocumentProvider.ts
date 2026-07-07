import type { IDocumentProvider } from './types'
import type { Document, PaginatedResponse } from '@/types'

const DEMO_DOCUMENTS: Document[] = [
  {
    id: "demo_doc_1",
    title: "Pump Maintenance Manual.pdf",
    description: "Standard operating procedure for hydraulic pump maintenance",
    original_filename: "Pump_Maintenance_Manual.pdf",
    file_size: 4200000,
    mime_type: "application/pdf",
    document_type: "manual",
    status: "ready",
    tags: "pump, maintenance, hydraulic",
    category: "Manuals",
    department: "Maintenance",
    is_ocr_processed: true,
    language: "en",
    owner_id: "demo_user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: "demo_doc_2",
    title: "Hydraulic System Guide.pdf",
    description: "Detailed hydraulic system operations guide",
    original_filename: "Hydraulic_System_Guide.pdf",
    file_size: 3100000,
    mime_type: "application/pdf",
    document_type: "manual",
    status: "ready",
    tags: "hydraulic, guide, system",
    category: "Guides",
    department: "Engineering",
    is_ocr_processed: true,
    language: "en",
    owner_id: "demo_user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: "demo_doc_3",
    title: "Safety Procedures.pdf",
    description: "General plant safety procedures",
    original_filename: "Safety_Procedures.pdf",
    file_size: 1100000,
    mime_type: "application/pdf",
    document_type: "sop",
    status: "ready",
    tags: "safety, sop",
    category: "Safety",
    department: "HSE",
    is_ocr_processed: true,
    language: "en",
    owner_id: "demo_user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: "demo_doc_4",
    title: "Valve Inspection SOP.pdf",
    description: "Standard operating procedure for valve inspections",
    original_filename: "Valve_Inspection_SOP.pdf",
    file_size: 2500000,
    mime_type: "application/pdf",
    document_type: "sop",
    status: "ready",
    tags: "valve, inspection, sop",
    category: "SOPs",
    department: "Maintenance",
    is_ocr_processed: true,
    language: "en",
    owner_id: "demo_user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: "demo_doc_5",
    title: "Electrical Diagnostics Handbook.pdf",
    description: "Handbook for electrical system diagnostics",
    original_filename: "Electrical_Diagnostics_Handbook.pdf",
    file_size: 5600000,
    mime_type: "application/pdf",
    document_type: "manual",
    status: "ready",
    tags: "electrical, diagnostics",
    category: "Manuals",
    department: "Engineering",
    is_ocr_processed: true,
    language: "en",
    owner_id: "demo_user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: "demo_doc_6",
    title: "Industrial Equipment Catalog.pdf",
    description: "Catalog of approved industrial equipment",
    original_filename: "Industrial_Equipment_Catalog.pdf",
    file_size: 8900000,
    mime_type: "application/pdf",
    document_type: "other",
    status: "ready",
    tags: "equipment, catalog",
    category: "Procurement",
    department: "Operations",
    is_ocr_processed: true,
    language: "en",
    owner_id: "demo_user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: "demo_doc_7",
    title: "Machine Calibration Guide.pdf",
    description: "Guide for precision machine calibration",
    original_filename: "Machine_Calibration_Guide.pdf",
    file_size: 3400000,
    mime_type: "application/pdf",
    document_type: "manual",
    status: "ready",
    tags: "calibration, machine",
    category: "Guides",
    department: "Maintenance",
    is_ocr_processed: true,
    language: "en",
    owner_id: "demo_user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: "demo_doc_8",
    title: "Maintenance Logs 2025.xlsx",
    description: "Aggregated maintenance logs for previous year",
    original_filename: "Maintenance_Logs_2025.xlsx",
    file_size: 1200000,
    mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    document_type: "maintenance_log",
    status: "ready",
    tags: "logs, maintenance",
    category: "Records",
    department: "Maintenance",
    is_ocr_processed: false,
    language: "en",
    owner_id: "demo_user",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  }
]

export class DemoDocumentProvider implements IDocumentProvider {
  async getDocuments(params: { page?: number, page_size?: number, status_filter?: string, search?: string }): Promise<PaginatedResponse<Document>> {
    let filtered = [...DEMO_DOCUMENTS]
    
    if (params.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.original_filename.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
      )
    }
    
    if (params.status_filter) {
      filtered = filtered.filter(d => d.status === params.status_filter)
    }

    return {
      items: filtered,
      total: filtered.length,
      page: params.page || 1,
      page_size: params.page_size || 20,
      total_pages: 1
    }
  }

  async getDocument(id: string): Promise<Document> {
    const doc = DEMO_DOCUMENTS.find(d => d.id === id)
    if (!doc) throw new Error("Document not found")
    return doc
  }

  async getDocumentStatus(id: string): Promise<Pick<Document, 'id' | 'status'>> {
    const doc = DEMO_DOCUMENTS.find(d => d.id === id)
    if (!doc) throw new Error("Document not found")
    return { id: doc.id, status: doc.status }
  }

  async uploadDocument(payload: FormData, onProgress?: (pct: number) => void): Promise<Document> {
    // Simulate upload progress
    if (onProgress) {
      for (let i = 10; i <= 100; i += 20) {
        onProgress(i)
        await new Promise(r => setTimeout(r, 100))
      }
    }
    const file = payload.get('file') as File
    const title = payload.get('title') as string
    
    const newDoc: Document = {
      id: `demo_new_${Date.now()}`,
      title: title || file.name,
      description: (payload.get('description') as string) || "",
      original_filename: file.name,
      file_size: file.size,
      mime_type: file.type,
      document_type: "other",
      status: "processing", // Simulate processing
      tags: (payload.get('tags') as string) || "",
      category: (payload.get('category') as string) || "",
      department: (payload.get('department') as string) || "",
      is_ocr_processed: false,
      language: "en",
      owner_id: "demo_user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    DEMO_DOCUMENTS.unshift(newDoc)
    
    // Simulate processing completion after 3 seconds
    setTimeout(() => {
      newDoc.status = "ready"
      newDoc.is_ocr_processed = true
    }, 3000)
    
    return newDoc
  }

  async deleteDocument(id: string): Promise<void> {
    const idx = DEMO_DOCUMENTS.findIndex(d => d.id === id)
    if (idx !== -1) {
      DEMO_DOCUMENTS.splice(idx, 1)
    }
  }

  async downloadDocument(id: string): Promise<Blob> {
    return new Blob(["Mock document content for demo"], { type: 'text/plain' })
  }
}
