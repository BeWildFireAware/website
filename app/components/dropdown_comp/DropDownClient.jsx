'use client'
import { useState, useRef, useEffect } from 'react' //useState for managing open/close , useeffect for handling outside clicks to close dropdown, useref
import Link from 'next/link'

export default function DispatchDropdown({ dispatchData }) {

  // State to control if the dropdown is open or closed
  const [isOpen, setIsOpen] = useState(false)
  
  // reference to the dropdown container 
  const dropdownRef = useRef(null)

  // useEffect to handle clicking 
  useEffect(() => {
    //function to close dropdow
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown container
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { //if obj is not null and click is not within drowdown, close
        setIsOpen(false) 
      }
    }

    // Add event listener to call close dropdown when click outside
    document.addEventListener('mousedown', handleClickOutside) //document=webpage, mousedown=touchpad down(click=down+up), call above fx
    
    // Cleanup function before dropdown disappears, remove current event listener to save memory/bugs
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, []) // Empty array means this runs only once per mount/unmount, important for memory leaks with updates rather than removal, first render


  // switch open close on click
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    //attach reference to entire container
    <div className="dropdown-container" ref={dropdownRef}>
      
      <button onClick={toggleDropdown} className="dropdown-trigger">Dispatch Areas
        {/* Dropdown indicator arrow, two classes, one rotates 180 degrees */}
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {/* Dropdown menu - only shown when isOpen is true */}
      {isOpen && (
        <div className="dropdown-menu">
          {!dispatchData || dispatchData.length === 0 ? {/* if no data, no data available then display loading,error?}*/}
          (
            <div className="dropdown-empty">
              <p>Dispatch Areas Currently Unavailable...</p>
            </div>
          ) 
          
          : (
            // else if there is data, Map through each dispatch area:fdras

            //dispatch area headers
            dispatchData.map((dispatch) => 
            ( <div key={dispatch.id} className="dispatch-group">
                <div className="dispatch-header">
                  {dispatch.name}
                </div>
                {/* List of FDRAs under this dispatch area */}
                <div className="fdra-list">
                  {dispatch.fdrAs && dispatch.fdrAs.length > 0 ? 
                  (
                    dispatch.fdrAs.map((fdra) =>   
                    (
                      <Link className="fdra-link" key={fdra.id} href={`/fdra/${fdra.id}`} onClick={() => setIsOpen(false)} // Close dropdown when link is clicked, link to fdra page with id to render template
                      >{fdra.name}</Link>
                    )
                    )
                  ) 
                  : //else if no fdra, diplay no fdra
                  (
                    <div className="fdra-empty">
                      No FDRAs available
                    </div>
                  )
                  }
                </div> {/* end of fdra list, below is end of dispatch group*/}
              </div>
            )) //end of map through dispatch areas
          )}
        </div> 
      )} {/* end of is open fx */}
    </div>
  )
}

//aria-expanded={isOpen} aria-haspopup="true"