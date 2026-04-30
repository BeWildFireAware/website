'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function DispatchDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="dropdown-container">
      <button onClick={() => setIsOpen(!isOpen)} 
        className="dropdown-trigger">
        Learn More
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <Link href="/learn-more/overview" className="dropdown-link" onClick={() => setIsOpen(false)}> Overview </Link>
          <Link href="/learn-more/website" className="dropdown-link" onClick={() => setIsOpen(false)}> Using the Website </Link>
          <Link href="/learn-more/basics" className="dropdown-link" onClick={() => setIsOpen(false)}> Fire Behavior Basics </Link>
          <Link href="/learn-more/nfdrs" className="dropdown-link" onClick={() => setIsOpen(false)}> NFDRS Explained </Link>
          <Link href="/learn-more/inputs" className="dropdown-link" onClick={() => setIsOpen(false)}> Weather & Fuel Inputs </Link>
          <Link href="/learn-more/outputs" className="dropdown-link" onClick={() => setIsOpen(false)}> NFDRS Outputs </Link>
          <Link href="/learn-more/models" className="dropdown-link" onClick={() => setIsOpen(false)}> Fuel Models </Link>
          <Link href="/learn-more/restrict" className="dropdown-link" onClick={() => setIsOpen(false)}> Terms & Restrictions </Link>
        </div>
      )}
    </div>
  )
}