import { useState, useRef } from 'react'
import { httpsCallable } from 'firebase/functions'
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react'

import { functions } from '@/lib/firebase'
import { validatePdfFile, type SignedUploadUrlResponse } from '@/lib/schemas/uploadSchema'

interface PdfUploadProps {
  venueId: string
  onUploadComplete?: (logId: string, destinationPath: string) => void
  onUploadError?: (error: string) => void
}

type UploadState = 'idle' | 'validating' | 'getting-url' | 'uploading' | 'complete' | 'error'

export function PdfUpload({ venueId, onUploadComplete, onUploadError }: PdfUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [usageInfo, setUsageInfo] = useState<{ today: number; limit: number } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const resetState = () => {
    setUploadState('idle')
    setProgress(0)
    setError(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploadState('validating')

    // Validate file
    const validation = validatePdfFile(file)
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid file')
      setUploadState('error')
      onUploadError?.(validation.error ?? 'Invalid file')
      return
    }

    setSelectedFile(file)
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    if (!functions) {
      setError('Firebase not configured')
      setUploadState('error')
      return
    }

    try {
      // Get signed URL
      setUploadState('getting-url')
      const getSignedUrl = httpsCallable<{ venueId: string }, SignedUploadUrlResponse>(
        functions,
        'getSignedUploadUrl'
      )

      const result = await getSignedUrl({ venueId })
      const { uploadUrl, destinationPath, logId, usageToday, usageLimit } = result.data

      setUsageInfo({ today: usageToday, limit: usageLimit })

      // Upload file with progress tracking
      setUploadState('uploading')
      abortControllerRef.current = new AbortController()

      await uploadWithProgress(file, uploadUrl, abortControllerRef.current.signal)

      setUploadState('complete')
      setProgress(100)
      onUploadComplete?.(logId, destinationPath)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      setUploadState('error')
      onUploadError?.(errorMessage)
    }
  }

  const uploadWithProgress = (
    file: File,
    url: string,
    signal: AbortSignal
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'))
      })

      signal.addEventListener('abort', () => {
        xhr.abort()
      })

      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', 'application/pdf')
      xhr.send(file)
    })
  }

  const handleCancel = () => {
    abortControllerRef.current?.abort()
    resetState()
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const isUploading = uploadState === 'getting-url' || uploadState === 'uploading'

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Select PDF file"
      />

      {/* Upload area */}
      {uploadState === 'idle' && (
        <button
          type="button"
          onClick={handleUploadClick}
          className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 hover:border-primary/50 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" aria-hidden="true" />
            <span className="text-sm font-medium">Upload PDF Audit Document</span>
            <span className="text-xs">Click to select a PDF file (max 10MB)</span>
          </div>
        </button>
      )}

      {/* Progress display */}
      {(isUploading || uploadState === 'validating') && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {selectedFile?.name}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 hover:bg-muted rounded"
              aria-label="Cancel upload"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {uploadState === 'validating' && 'Validating...'}
                {uploadState === 'getting-url' && 'Preparing upload...'}
                {uploadState === 'uploading' && `Uploading... ${progress}%`}
              </span>
              {uploadState === 'uploading' && <span>{progress}%</span>}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadState === 'uploading' ? progress : 0}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success state */}
      {uploadState === 'complete' && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" aria-hidden="true" />
            <span className="font-medium">Upload complete</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your PDF has been uploaded and is ready for processing.
          </p>
          {usageInfo && (
            <p className="text-xs text-green-600 mt-2">
              Usage: {usageInfo.today} of {usageInfo.limit} transforms today
            </p>
          )}
          <button
            type="button"
            onClick={resetState}
            className="mt-3 text-sm text-green-700 hover:text-green-900 underline"
          >
            Upload another file
          </button>
        </div>
      )}

      {/* Error state */}
      {uploadState === 'error' && error && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
            <span className="font-medium">Upload failed</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button
            type="button"
            onClick={resetState}
            className="mt-3 text-sm text-red-700 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
