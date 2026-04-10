"use client"

import { useState, useEffect } from "react"

export default function MobileCandToggle({ candA, candB }: { candA: any; candB: any }) {
  const [active, setActive] = useState('A')

  useEffect(() => {
    // Inject defaults
    if (!document.body.classList.contains('show-cand-a') && !document.body.classList.contains('show-cand-b')) {
      document.body.classList.add('show-cand-a')
    }

    if (active === 'A') {
      document.body.classList.remove('show-cand-b')
      document.body.classList.add('show-cand-a')
    } else {
      document.body.classList.remove('show-cand-a')
      document.body.classList.add('show-cand-b')
    }
  }, [active])

  return (
    <div className="mobile-toggle-nav" role="tablist" aria-label="Candidate Navigation">
      <button 
        role="tab"
        aria-selected={active === 'A'}
        aria-controls="candidate-col-a"
        id="tab-cand-a"
        onClick={() => setActive('A')} 
        className={active === 'A' ? 'active' : ''}
        style={{ borderBottomColor: active === 'A' ? candA.color : 'transparent' }}
      >
        <span className="mt-avatar" style={{ background: candA.color }} aria-hidden="true">{candA.initials}</span>
        <span className="mt-name">{candA.fullName}</span>
      </button>

      <button 
        role="tab"
        aria-selected={active === 'B'}
        aria-controls="candidate-col-b"
        id="tab-cand-b"
        onClick={() => setActive('B')} 
        className={active === 'B' ? 'active' : ''}
        style={{ borderBottomColor: active === 'B' ? candB.color : 'transparent' }}
      >
        <span className="mt-avatar" style={{ background: candB.color }} aria-hidden="true">{candB.initials}</span>
        <span className="mt-name">{candB.fullName}</span>
      </button>
    </div>
  )
}
