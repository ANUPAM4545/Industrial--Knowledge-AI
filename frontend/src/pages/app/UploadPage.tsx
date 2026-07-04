/**
 * UploadPage — Document upload with drag-and-drop, form, and progress tracking.
 *
 * Wired to the real API via useUploadDocument (TanStack Query mutation).
 * Shows upload progress bar, success confirmation, and error toast.
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DragDropZone } from '@/components/documents/DragDropZone'
import { UploadProgress, type UploadStatus } from '@/components/documents/UploadProgress'
import { useUploadDocument } from '@/hooks/useDocuments'

// ── Form Schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  title:         z.string().min(1, 'Title is required').max(500),
  description:   z.string().max(500).optional(),
  document_type: z.enum(['pdf', 'docx', 'manual', 'sop', 'maintenance_log', 'other']),
  category:      z.string().max(100).optional(),
  tags:          z.string().max(300).optional(),
  department:    z.string().max(200).optional(),
})

type FormData = z.infer<typeof schema>

// ── Component ─────────────────────────────────────────────────────────────────

export function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadError, setUploadError] = useState<string>()
  const [uploadedDocId, setUploadedDocId] = useState<string>()

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { document_type: 'other' },
  })

  const uploadMutation = useUploadDocument((pct) => setProgress(pct))

  const handleFileSelect = useCallback((f: File) => {
    setFile(f)
    setUploadStatus('idle')
    setUploadError(undefined)
    setValue('title', f.name.replace(/\.[^/.]+$/, ''))
  }, [setValue])

  const handleFileClear = useCallback(() => {
    setFile(null)
    setProgress(0)
    setUploadStatus('idle')
    setUploadError(undefined)
  }, [])

  const onSubmit = async (data: FormData) => {
    if (!file) return

    setUploadStatus('uploading')
    setProgress(0)
    setUploadError(undefined)

    try {
      const doc = await uploadMutation.mutateAsync({
        file,
        title:       data.title,
        description: data.description,
        category:    data.category,
        tags:        data.tags,
        department:  data.department,
      })

      setProgress(100)
      setUploadStatus('success')
      setUploadedDocId(doc.id)

    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || 'Upload failed. Please try again.'
      setUploadStatus('error')
      setUploadError(message)
    }
  }

  const handleUploadAnother = () => {
    setFile(null)
    setProgress(0)
    setUploadStatus('idle')
    setUploadedDocId(undefined)
    reset()
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/app/knowledge-base')}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Back to Knowledge Base"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Document</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Add industrial PDFs or DOCX files to your knowledge base.
          </p>
        </div>
      </div>

      {/* Success state */}
      {uploadStatus === 'success' && (
        <div className="glass-card p-6 rounded-2xl border border-green-500/20 bg-green-500/5 text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-green-400/10 flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Document uploaded successfully</h2>
            <p className="text-sm text-slate-400 mt-1">
              Your document is now being processed. It will be available in the Knowledge Base
              once indexing is complete.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              id="view-knowledge-base-btn"
              type="button"
              onClick={() => navigate('/app/knowledge-base')}
              className="btn-primary"
            >
              View Knowledge Base
            </button>
            <button
              id="upload-another-btn"
              type="button"
              onClick={handleUploadAnother}
              className="btn-secondary"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {uploadStatus !== 'success' && (
        <>
          {/* Drop Zone */}
          <DragDropZone
            file={file}
            onFileSelect={handleFileSelect}
            onFileClear={handleFileClear}
          />

          {/* Progress bar (shown during and after upload) */}
          {(uploadStatus === 'uploading' || uploadStatus === 'error') && file && (
            <UploadProgress
              filename={file.name}
              progress={progress}
              status={uploadStatus}
              errorMessage={uploadError}
            />
          )}

          {/* Metadata form (appears once file is selected) */}
          {file && uploadStatus !== 'uploading' && (
            <form
              id="upload-form"
              onSubmit={handleSubmit(onSubmit)}
              className="glass-card p-6 rounded-2xl space-y-5 animate-fade-in"
            >
              <h2 className="font-semibold text-white text-base">Document Details</h2>

              {/* Title */}
              <div>
                <label htmlFor="doc-title" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="doc-title"
                  type="text"
                  className={cn('input-field', errors.title && 'border-red-500/50')}
                  placeholder="Enter document title"
                  {...register('title')}
                />
                {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
              </div>

              {/* Type + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="doc-type" className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
                  <select id="doc-type" className="input-field" {...register('document_type')}>
                    <option value="pdf">PDF Document</option>
                    <option value="docx">Word Document</option>
                    <option value="sop">SOP</option>
                    <option value="manual">Technical Manual</option>
                    <option value="maintenance_log">Maintenance Log</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="doc-category" className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <input
                    id="doc-category"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Safety, Operations"
                    {...register('category')}
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label htmlFor="doc-department" className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
                <input
                  id="doc-department"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Engineering, Maintenance"
                  {...register('department')}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="doc-desc" className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  id="doc-desc"
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Brief description of the document content..."
                  {...register('description')}
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="doc-tags" className="block text-sm font-medium text-slate-300 mb-1.5">Tags</label>
                <input
                  id="doc-tags"
                  type="text"
                  className="input-field"
                  placeholder="safety, Q4-2024, maintenance (comma separated)"
                  {...register('tags')}
                />
              </div>

              {/* Error message */}
              {uploadStatus === 'error' && uploadError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {uploadError}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button
                  id="upload-submit"
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploadMutation.isPending ? 'Uploading…' : 'Upload Document'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}
