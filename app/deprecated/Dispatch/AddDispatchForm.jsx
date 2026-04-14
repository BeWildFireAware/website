'use client' // Tell Next.js this is a client component (needs interactivity)

import { useState } from 'react'
import { addDispatchArea } from '../../data/page'

export default function AddDispatchForm() {
  // State for form input
  const [dispatchName, setDispatchName] = useState('')
  // State to disable form while submitting
  const [loading, setLoading] = useState(false)
  // State to show success/error messages
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault() // Prevent page reload
    setLoading(true)
    setMessage('')

    try {
      // Call server action to add dispatch area
      const formData = new FormData()
      formData.append('dispatchName', dispatchName)
      const result = await addDispatchArea(formData)

      // Show error or success message
      if (result.error) {
        setMessage(`Error: ${result.error}`)
      } else {
        setMessage('Dispatch area added successfully!')
        setDispatchName('') // Clear input
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
    <form onSubmit={handleSubmit} className="add-dispatch-form">
      <input
        type="text"
        placeholder="Enter Dispatch Name"
        value={dispatchName}
        onChange={(e) => setDispatchName(e.target.value)}
        disabled={loading}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Dispatch Area'}
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
