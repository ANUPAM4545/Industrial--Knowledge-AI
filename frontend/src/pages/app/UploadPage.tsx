import { useState, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn, formatFileSize } from '@/lib/utils'

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
  document_type: z.enum(['pdf', 'docx', 'txt', 'manual', 'sop', 'maintenance_log', 'other']),
  category: z.string().max(100).optional(),
  tags: z.string().max(200).optional(),
})

type UploadFormData = z.infer<typeof uploadSchema>

const ACCEPTED_TYPES = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.tiff']

export function UploadPage() {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { document_type: 'other' },
  })

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setValue('title', file.name.replace(/\.[^/.]+$/, ''))
    }
  }, [setValue])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setValue('title', file.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const onSubmit = async (_data: UploadFormData) => {
    if (!selectedFile) return
    setUploadState('uploading')
    // TODO: Implement API upload with FormData + progress tracking
    await new Promise((r) => setTimeout(r, 1500))
    setUploadState('success')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Document</h1>
        <p className="text-slate-400 text-sm mt-1">
          Add industrial documents to your knowledge base for AI-powered querying.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        id="upload-dropzone"
        className={cn(
          'glass-card border-2 border-dashed p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200',
          dragOver
            ? 'border-forge-500/70 bg-forge-600/10'
            : selectedFile
            ? 'border-green-500/40 bg-green-600/5'
            : 'border-white/10 hover:border-forge-500/40 hover:bg-forge-600/5'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleFileSelect}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-white">{selectedFile.name}</p>
              <p className="text-sm text-slate-400 mt-1">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
              className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 mt-2 transition-colors"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-forge-600/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-forge-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-white">Drop your document here</p>
              <p className="text-sm text-slate-500 mt-1">or click to browse</p>
            </div>
            <p className="text-xs text-slate-600">PDF, DOCX, TXT, Images · Max 50 MB</p>
          </div>
        )}
      </div>

      {/* Metadata Form */}
      {selectedFile && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-5 animate-fade-in">
          <h2 className="font-semibold text-white">Document Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="doc-title">Title</label>
            <input id="doc-title" type="text" className={cn('input-field', errors.title && 'border-red-500/50')} {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="doc-type">Type</label>
              <select id="doc-type" className="input-field" {...register('document_type')}>
                <option value="pdf">PDF Document</option>
                <option value="docx">Word Document</option>
                <option value="sop">SOP</option>
                <option value="manual">Manual</option>
                <option value="maintenance_log">Maintenance Log</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="doc-category">Category</label>
              <input id="doc-category" type="text" className="input-field" placeholder="e.g. Safety, Operations" {...register('category')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="doc-desc">Description</label>
            <textarea id="doc-desc" rows={3} className="input-field resize-none" placeholder="Brief description of the document..." {...register('description')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="doc-tags">Tags</label>
            <input id="doc-tags" type="text" className="input-field" placeholder="safety, maintenance, Q4-2024 (comma separated)" {...register('tags')} />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              id="upload-submit"
              type="submit"
              disabled={uploadState === 'uploading' || uploadState === 'success'}
              className={cn('btn-primary flex-1', uploadState === 'success' && 'bg-green-600 hover:bg-green-700')}
            >
              {uploadState === 'uploading' && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploadState === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {uploadState === 'idle' && <Upload className="w-4 h-4" />}
              {uploadState === 'uploading' ? 'Uploading...' : uploadState === 'success' ? 'Uploaded!' : 'Upload & Process'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
