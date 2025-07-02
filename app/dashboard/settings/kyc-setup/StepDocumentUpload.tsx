'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useCallback } from "react"

const documentTypes = [
  "NIN",
  "BVN",
  "International Passport",
  "Driver's License",
  "Voter's Card",
]

export default function StepDocumentUpload({
  selectedDoc,
  setSelectedDoc,
  file,
  setFile,
}: {
  selectedDoc: string
  setSelectedDoc: (doc: string) => void
  file: File | null
  setFile: (file: File | null) => void
}) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
  }, [setFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': [],
      'application/pdf': []
    }
  })

  return (
    <div className="space-y-4">
      {/* Document Type Select */}
      <div className="space-y-2">
        <Label htmlFor="documentType" className="block">Document Type</Label>
        <select
          id="documentType"
          className="w-2/5 h-12 rounded-xl border px-4 bg-gray-100"
          value={selectedDoc}
          onChange={(e) => setSelectedDoc(e.target.value)}
        >
          <option value="">Select document type</option>
          {documentTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* File Upload Drag Area */}
      <div className="space-y-2">
        <Label htmlFor="documentFile">Upload Document</Label>
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center h-60 border-2 border-dashed rounded-xl cursor-pointer px-4 transition
            ${isDragActive ? 'bg-blue-200 border-blue-400' : 'bg-blue-100 border-blue-300'}
          `}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-10 h-10 text-blue-500 mb-2" />
          <p className="text-sm text-gray-700">
            Drag & Drop your document or{' '}
            <span className="underline text-blue-600">browse files</span>
          </p>
          {file && (
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {file.name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
