'use client' // Tell Next.js this is a client component (needs interactivity)

import { useState } from 'react'
import { addFDRAData } from '../../page'

export default function AddFDRAForm({ dispatchData = [] }) {
  // State for all form inputs
  const [FDRAname, setFDRAname] = useState('')
  const [BI, setBI] = useState('') // Build Index
  const [ERC, setERC] = useState('') // Energy Release Component
  const [dispatchId, setDispatchId] = useState('')
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
      formData.append('BI', BI)
      formData.append('ERC', ERC)
      formData.append('dispatchId', dispatchId)
      // Call server action to add FDRA data
      const result = await addFDRAData(formData)

      // Show error or success message
      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage('FDRA data added successfully!')
        // Clear all inputs
        setFDRAname('')
        setBI('')
        setERC('')
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
        value={BI}
        onChange={(e) => setBI(e.target.value)}
        disabled={loading}
      />
      {/* Energy Release Component input */}
      <input
        type="number"
        placeholder="Enter ERC"
        value={ERC}
        onChange={(e) => setERC(e.target.value)}
        disabled={loading}
      />
      {/* Dropdown to select dispatch area */}
      <select 
        value={dispatchId} 
        onChange={(e) => setDispatchId(e.target.value)}
        disabled={loading}
        required
      >
        <option value="">Select Dispatch Area</option>
        {dispatchData?.map((dispatch) => (
          <option key={dispatch.Dispatch_ID} value={dispatch.Dispatch_ID}>
            {dispatch.DispatchName}
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
