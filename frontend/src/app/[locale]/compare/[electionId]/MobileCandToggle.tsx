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

  const TabButton = ({ id, cand, isActive }: { id: string; cand: any; isActive: boolean }) => (
    <button 
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(id as 'A' | 'B')} 
      className={isActive ? 'active' : ''}
      style={{ 
        flex: 1,
        padding: '12px 8px',
        border: 'none',
        background: isActive ? 'var(--paper)' : 'var(--ink-03)',
        borderBottom: `3px solid ${isActive ? cand.color : 'transparent'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.2s ease',
        opacity: isActive ? 1 : 0.6
      }}
    >
      <div style={{ 
        width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', 
        background: cand.color, flexShrink: 0,
        backgroundImage: cand.photoUrl ? `url(${cand.photoUrl})` : 'none',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: 700, color: 'white'
      }}>
        {!cand.photoUrl && cand.initials}
      </div>
      <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>{cand.displayName}</p>
        <p style={{ fontSize: '9px', fontWeight: 500, color: 'var(--ink-40)', fontFamily: 'var(--font-mono)' }}>{cand.party}</p>
      </div>
    </button>
  )

  return (
    <div className="mobile-toggle-nav" role="tablist" aria-label="Candidate Navigation" style={{ display: 'flex', background: 'var(--ink-03)', position: 'sticky', top: 'var(--navbar-h)', zIndex: 110 }}>
      <TabButton id="A" cand={candA} isActive={active === 'A'} />
      <TabButton id="B" cand={candB} isActive={active === 'B'} />
    </div>
  )
}
