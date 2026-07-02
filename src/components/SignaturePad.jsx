import React, { useRef, useState, useEffect } from 'react'

export default function SignaturePad({ onEnd }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Fit to container
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = 150
    
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'
  }, [])

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const ctx = canvasRef.current.getContext('2d')
    const { offsetX, offsetY } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { offsetX, offsetY } = getCoordinates(e)
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()
  }

  const endDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const ctx = canvasRef.current.getContext('2d')
    ctx.closePath()
    onEnd(canvasRef.current.toDataURL('image/png'))
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onEnd(null)
  }

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    if (e.touches && e.touches.length > 0) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      }
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 4, background: '#fff', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        style={{ display: 'block', touchAction: 'none' }}
      />
      <button 
        type="button" 
        onClick={clear}
        style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: '0.8rem', cursor: 'pointer' }}
      >
        Limpiar
      </button>
    </div>
  )
}
