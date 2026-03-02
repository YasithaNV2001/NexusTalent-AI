'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CVUploaderProps {
  onUploadComplete: () => void
  jobId?: string | null
}

export default function CVUploader({ onUploadComplete, jobId = null }: CVUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return

    setError(null)
    setSuccess(false)
    setUploading(true)
    setProgress(0)

    const totalFiles = acceptedFiles.length
    let completed = 0
    let lastError: string | null = null

    setFileName(
      totalFiles === 1
        ? acceptedFiles[0].name
        : `${totalFiles} files`
    )

    for (const file of acceptedFiles) {
      setFileName(
        totalFiles === 1
          ? file.name
          : `File ${completed + 1} of ${totalFiles}: ${file.name}`
      )

      try {
        const formData = new FormData()
        formData.append('file', file)
        if (jobId) formData.append('jobId', jobId)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          lastError = data.error || `Upload failed for ${file.name}`
        }
      } catch {
        lastError = `Network error uploading ${file.name}`
      }

      completed++
      setProgress(Math.round((completed / totalFiles) * 100))
    }

    if (lastError && completed < totalFiles) {
      setError(lastError)
    }

    setSuccess(true)
    setTimeout(() => {
      setUploading(false)
      setSuccess(false)
      setFileName(null)
      setProgress(0)
      onUploadComplete()
    }, 1500)
  }, [jobId, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    multiple: !!jobId, // B2B allows multiple, B2C single
    disabled: uploading,
    onDropRejected: (rejections) => {
      const rejection = rejections[0]
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError('File size must be under 5MB.')
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError('Only PDF files are accepted.')
      } else {
        setError('Invalid file. Please upload a PDF under 5MB.')
      }
    },
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300',
          isDragActive
            ? 'border-violet-500 bg-violet-500/10 scale-[1.02]'
            : uploading
            ? 'border-slate-700 bg-slate-800/30 cursor-default'
            : 'border-slate-700/50 bg-slate-800/20 hover:border-violet-500/50 hover:bg-violet-500/5'
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-3">
                {success ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{fileName}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {success ? 'Upload complete! AI scoring done.' : 'Uploading & analyzing with AI...'}
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    success
                      ? 'bg-emerald-500'
                      : 'bg-linear-to-r from-violet-500 to-indigo-500'
                  )}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                {isDragActive ? (
                  <FileText className="w-7 h-7 text-violet-400" />
                ) : (
                  <Upload className="w-7 h-7 text-slate-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {isDragActive ? 'Drop your CV here' : 'Drag & drop your CV'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF only, max 5MB{jobId ? ' · Multiple files allowed' : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
              >
                Browse Files
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
