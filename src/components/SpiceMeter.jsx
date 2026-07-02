import React, { useState } from 'react'

export default function SpiceMeter({ level = 1, max = 5, onChange = null }) {
  const [hoverLevel, setHoverLevel] = useState(0)
  const isInteractive = !!onChange
  const currentLevel = hoverLevel || level

  const items = []
  for (let i = 1; i <= max; i++) {
    items.push(
      <span 
        key={i} 
        onMouseEnter={() => isInteractive && setHoverLevel(i)}
        onMouseLeave={() => isInteractive && setHoverLevel(0)}
        onClick={() => isInteractive && onChange(i)}
        style={{
          opacity: i <= currentLevel ? 1 : 0.3,
          filter: i <= currentLevel ? 'drop-shadow(0 0 4px rgba(255,100,0,0.6))' : 'grayscale(100%)',
          fontSize: isInteractive && i <= hoverLevel ? '1.5rem' : '1.3rem',
          transition: 'all 0.2s ease',
          cursor: isInteractive ? 'pointer' : 'default',
          transform: isInteractive && i <= hoverLevel ? 'scale(1.1)' : 'scale(1)',
          display: 'inline-block'
        }}
      >
        🔥
      </span>
    )
  }

  return (
    <div className="spice-meter" style={{ display: 'inline-flex', gap: '4px', minHeight: '30px', alignItems: 'center' }} title={`Nivel ${level} de ${max}`}>
      {items}
    </div>
  )
}
