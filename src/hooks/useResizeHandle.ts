import { useState, useCallback, useRef, useEffect } from 'react'

interface UseResizeHandleOptions {
  initialWidth: number
  minWidth: number
  maxWidth: number
  direction: 'left' | 'right'
}

export function useResizeHandle({ initialWidth, minWidth, maxWidth, direction }: UseResizeHandleOptions) {
  const [width, setWidth] = useState(initialWidth)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isDragging.current = true
      startX.current = e.clientX
      startWidth.current = width
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [width],
  )

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const delta = e.clientX - startX.current
      const multiplier = direction === 'right' ? -1 : 1
      const next = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta * multiplier))
      setWidth(next)
    }

    const onMouseUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [minWidth, maxWidth, direction])

  return { width, onMouseDown }
}
