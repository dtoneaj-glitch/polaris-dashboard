import { useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

// ── Annotation Modal (Custom Canvas Drawing) ───────────
export function AnnotationModal({ onClose }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [tool, setTool] = useState('pen')
  const [strokeColor, setStrokeColor] = useState('#e76f51')
  const [dpr, setDpr] = useState(window.devicePixelRatio || 1)

  useLayoutEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Sync canvas pixel dimensions to its rendered size
  useLayoutEffect(() => {
    const sync = () => {
      const c = canvasRef.current; if (!c) return
      const rect = c.getBoundingClientRect()
      const w = Math.floor(rect.width)
      const h = Math.floor(rect.height)
      if (w === 0 || h === 0) return
      const ratio = dpr
      if (c.width !== w * ratio || c.height !== h * ratio) {
        c.width = w * ratio
        c.height = h * ratio
        const ctx = c.getContext('2d')
        ctx.scale(ratio, ratio)
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, 0, w, h)
      }
    }
    sync()
    const ro = new ResizeObserver(sync)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [dpr])

  const getCanvas = () => canvasRef.current
  const getCtx = () => getCanvas()?.getContext('2d')

  const startDraw = (e) => {
    const c = getCanvas(); if (!c) return
    const rect = c.getBoundingClientRect()
    const x = e.clientX - rect.left; const y = e.clientY - rect.top
    const ctx = getCtx()
    ctx.beginPath()
    ctx.moveTo(x, y)
    setDrawing(true)
  }
  const draw = (e) => {
    if (!drawing) return
    const c = getCanvas(); if (!c) return
    const rect = c.getBoundingClientRect()
    const x = e.clientX - rect.left; const y = e.clientY - rect.top
    const ctx = getCtx()
    ctx.lineWidth = tool === 'eraser' ? 20 : 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : strokeColor
    ctx.globalCompositeOperation = tool === 'eraser' ? 'source-over' : 'source-over'
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  const stopDraw = () => { setDrawing(false); getCtx()?.closePath() }

  const clearCanvas = () => {
    const c = getCanvas(); if (!c) return
    const w = c.getBoundingClientRect().width
    const h = c.getBoundingClientRect().height
    const ctx = c.getContext('2d')
    ctx.scale(c.width / w, c.height / h)
    ctx.clearRect(0, 0, w, h)
    ctx.scale(w / c.width, h / c.height)
  }

  const exportCanvas = () => {
    const c = getCanvas(); if (!c) return
    const dataUrl = c.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl; a.download = `nora-annotation-${Date.now()}.png`
    a.click()
  }

  const colors = ['#e76f51', '#6f8f78', '#7087a3', '#bb8b4d', '#9b5de5', '#1a1a2e']

  return (
    <div className="modal-backdrop" style={{ zIndex: 100 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-excalidraw" style={{ width: 'min(100%, 960px)', height: 'min(90vh, 700px)', padding: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 0, flexShrink: 0 }}>
          <div>
            <div className="section-kicker"><span style={{ color: 'var(--coral)' }}>✏️</span> ANNOTATION</div>
            <h2>標註回饋</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="關閉"><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
          {['pen', 'eraser'].map(t => (
            <button key={t} className={`outline-button ${tool === t ? 'active-tool' : ''}`}
              style={{ padding: '5px 12px', fontSize: 11, background: tool === t ? 'var(--coral-soft)' : 'white', borderColor: tool === t ? 'var(--coral)' : undefined }}
              onClick={() => setTool(t)}>{t === 'pen' ? '筆' : '橡皮擦'}</button>
          ))}
          <div style={{ display: 'flex', gap: 5, marginLeft: 8, alignItems: 'center' }}>
            {colors.map(c => <button key={c} onClick={() => setStrokeColor(c)}
              style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: strokeColor === c ? '2px solid white' : '2px solid transparent', boxShadow: strokeColor === c ? '0 0 0 1px ' + c : 'none', cursor: 'pointer' }} />)}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="outline-button" style={{ padding: '5px 12px', fontSize: 11 }} onClick={clearCanvas}>清除</button>
            <button className="primary-button" style={{ padding: '5px 12px', fontSize: 11 }} onClick={exportCanvas}>匯出 PNG</button>
          </div>
        </div>
        <div ref={containerRef} style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <canvas ref={canvasRef}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            style={{ width: '100%', height: '100%', display: 'block', cursor: tool === 'eraser' ? 'cell' : 'crosshair', touchAction: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}
