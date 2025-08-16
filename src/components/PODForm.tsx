'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Clock, Send, Download, Calendar, Loader2 } from 'lucide-react'
import { getCurrentGMTTime, convertToBase64 } from '@/lib/utils'
import { PODEntry } from '@/types'

export default function PODForm() {
  const [podFile, setPodFile] = useState<File | null>(null)
  const [jobSheetFile, setJobSheetFile] = useState<File | null>(null)
  const [timeIn, setTimeIn] = useState('')
  const [timeOut, setTimeOut] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const onDropPOD = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setPodFile(acceptedFiles[0])
    }
  }, [])

  const onDropJobSheet = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setJobSheetFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps: getPODRootProps, getInputProps: getPODInputProps, isDragActive: isPODDragActive } = useDropzone({
    onDrop: onDropPOD,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const { getRootProps: getJobSheetRootProps, getInputProps: getJobSheetInputProps, isDragActive: isJobSheetDragActive } = useDropzone({
    onDrop: onDropJobSheet,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const handleSetCurrentTime = () => {
    setTimeOut(getCurrentGMTTime())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!podFile || !jobSheetFile || !timeIn || !timeOut) {
      setMessage('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const podBase64 = await convertToBase64(podFile)
      const jobSheetBase64 = await convertToBase64(jobSheetFile)

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          podImage: podBase64,
          jobSheetImage: jobSheetBase64,
          podFileName: podFile.name,
          jobSheetFileName: jobSheetFile.name,
          timeIn,
          timeOut,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Successfully submitted!')
        // Reset form
        setPodFile(null)
        setJobSheetFile(null)
        setTimeIn('')
        setTimeOut('')
      } else {
        setMessage(data.error || 'Failed to submit')
      }
    } catch (error) {
      setMessage('Error submitting form')
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pod-entries-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      setMessage('Failed to export data')
    }
  }

  const handleReconcile = async () => {
    try {
      const response = await fetch('/api/reconcile')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `weekly-reconciliation-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Reconcile error:', error)
      setMessage('Failed to reconcile weekly data')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">PODagent</h1>
            <p className="text-center text-gray-600 mt-2">Delivery Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* POD Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload POD (Proof of Delivery)
              </label>
              <div
                {...getPODRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isPODDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                } ${podFile ? 'bg-green-50 border-green-500' : ''}`}
              >
                <input {...getPODInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                {podFile ? (
                  <p className="text-green-600 font-medium">{podFile.name}</p>
                ) : (
                  <p className="text-gray-600">
                    {isPODDragActive ? 'Drop the POD here' : 'Drag & drop POD here, or click to select'}
                  </p>
                )}
              </div>
            </div>

            {/* Job Sheet Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Job Sheet
              </label>
              <div
                {...getJobSheetRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isJobSheetDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                } ${jobSheetFile ? 'bg-green-50 border-green-500' : ''}`}
              >
                <input {...getJobSheetInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                {jobSheetFile ? (
                  <p className="text-green-600 font-medium">{jobSheetFile.name}</p>
                ) : (
                  <p className="text-gray-600">
                    {isJobSheetDragActive ? 'Drop the job sheet here' : 'Drag & drop job sheet here, or click to select'}
                  </p>
                )}
              </div>
            </div>

            {/* Time Input Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeIn" className="block text-sm font-medium text-gray-700 mb-2">
                  Time In
                </label>
                <input
                  type="time"
                  id="timeIn"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="timeOut" className="block text-sm font-medium text-gray-700 mb-2">
                  Time Out
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    id="timeOut"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSetCurrentTime}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    title="Set current London time"
                  >
                    <Clock className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send
                </>
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-md ${
                message.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </form>

          {/* Action Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                Export to Sheet
              </button>
              <button
                onClick={handleReconcile}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Calendar className="h-5 w-5" />
                Weekly Reconciliation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}