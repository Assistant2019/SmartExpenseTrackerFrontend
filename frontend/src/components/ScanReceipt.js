// frontend/src/components/ScanReceipt.js
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ScanReceipt() {
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setLoading(true)
    setPreviewUrl(URL.createObjectURL(file))

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1]
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        // Send to backend for processing
        const response = await fetch('http://localhost:3001/api/process-receipt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ imageBase64: base64 })
        })

        const result = await response.json()
        
        if (result.success) {
          alert('Receipt processed successfully!')
          // Redirect to dashboard or refresh data
          window.location.href = '/dashboard'
        } else {
          alert('Failed to process receipt: ' + result.error)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing receipt:', error)
      alert('Error processing receipt')
    } finally {
      setLoading(false)
      setPreviewUrl(null)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Analyzing & Assessing Leakage Risk...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Scan Receipt</h1>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
          id="receipt-upload"
        />
        <label
          htmlFor="receipt-upload"
          className="cursor-pointer bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Capture Receipt
        </label>
        <p className="mt-4 text-gray-600">Take a photo of your receipt or upload an image</p>
      </div>

      {previewUrl && (
        <div className="mt-6">
          <img src={previewUrl} alt="Receipt preview" className="max-w-full rounded-lg" />
        </div>
      )}
    </div>
  )
}
