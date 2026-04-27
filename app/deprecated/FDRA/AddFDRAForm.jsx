'use client' // Tell Next.js this is a client component (needs interactivity)

import { useState } from 'react'
import { addFDRAData } from '@/app/data/page'

export default function AddFDRAForm({ dispatchData = [] }) {
  // State for all form inputs
  const [FDRAname, setFDRAname] = useState('')
  const [AVG_BI, setAVG_BI] = useState('') // Build Index
  const [AVG_ERC, setAVG_ERC] = useState('') // Energy Release Component
  const [Dispatch_ID, setDispatchId] = useState('')
  // State to disable form while submitting
  const [loading, setLoading] = useState(false)
  // State to show success/error messages
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault() // Prevent page reload
    setLoading(true)
    setMessage('')

    try {
      // Create FormData object to send to server
      const formData = new FormData()
      formData.append('FDRAname', FDRAname)
      formData.append('AVG_BI', AVG_BI)
      formData.append('AVG_ERC', AVG_ERC)
      formData.append('Dispatch_ID', Dispatch_ID)
      // Call server action to add FDRA data
      const result = await addFDRAData(formData)

      // Show error or success message
      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage('FDRA data added successfully!')
        // Clear all inputs
        setFDRAname('')
        setAVG_BI('')
        setAVG_ERC('')
        setDispatchId('')
        // Refresh page after 1.5 seconds to show new data
        setTimeout(() => window.location.reload(), 1500)
      }

    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false) // Always enable form after request
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-fdra-form">
      {/* FDRA name input */}
      <input
        type="text"
        placeholder="Enter FDRA Name"
        value={FDRAname}
        onChange={(e) => setFDRAname(e.target.value)}
        disabled={loading}
        required
      />
      {/* Build Index input */}
      <input
        type="number"
        placeholder="Enter BI"
        value={AVG_BI}
        onChange={(e) => setAVG_BI(e.target.value)}
        disabled={loading}
      />
      {/* Energy Release Component input */}
      <input
        type="number"
        placeholder="Enter ERC"
        value={AVG_ERC}
        onChange={(e) => setAVG_ERC(e.target.value)}
        disabled={loading}
      />
      {/* Dropdown to select dispatch area */}
      <select 
        value={Dispatch_ID} 
        onChange={(e) => setDispatchId(e.target.value)}
        disabled={loading}
        required
      >
        <option value="">Select Dispatch Area</option>
        {dispatchData?.map((dispatchArea) => (
          <option key={dispatchArea.Dispatch_ID} value={dispatchArea.Dispatch_ID}>
            {dispatchArea.DispatchName}
          </option>
        ))}
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add FDRA'}
      </button>
      {/* Show message if one exists */}
      {message && (
        <p className={message.startsWith('Error') ? 'error-message' : 'success-message'}>
          {message}
        </p>
      )}
    </form>
  )
}
