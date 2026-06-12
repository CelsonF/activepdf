import { useRef } from 'react'
import { Check, GripVertical } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ToolField } from '@/lib/tool-storage'

interface Props {
  field: ToolField
  scale: number
  selected: boolean
  onSelect: () => void
  onChange: (field: ToolField) => void
  onMove: (x: number, y: number) => void
}

export function FieldBox({ field, scale, selected, onSelect, onChange, onMove }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)

  function startDrag(e: React.PointerEvent) {
    e.preventDefault()
    onSelect()
    const parent = boxRef.current?.offsetParent as HTMLElement | null
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const move = (ev: PointerEvent) => {
      const x = Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0), 0.98)
      const y = Math.min(Math.max((ev.clientY - rect.top) / rect.height, 0), 0.98)
      onMove(x, y)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const fontSize = field.fontSize * scale

  return (
    <div
      ref={boxRef}
      className={cn(
        'absolute flex items-center gap-0.5 rounded-md border-2 bg-card/80 backdrop-blur-[1px]',
        selected ? 'z-10 border-primary' : 'border-primary/40 hover:border-primary',
      )}
      style={{ left: `${field.x * 100}%`, top: `${field.y * 100}%` }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <button
        type="button"
        aria-label="Mover campo"
        onPointerDown={startDrag}
        className="flex h-full cursor-grab touch-none items-center px-0.5 text-primary active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {field.type === 'check' ? (
        <button
          type="button"
          aria-label={field.label || 'Marcação'}
          onClick={() => onChange({ ...field, value: field.value ? '' : 'x' })}
          className="flex items-center justify-center text-ink"
          style={{ width: fontSize * 1.4, height: fontSize * 1.4 }}
        >
          {field.value ? (
            <Check className="h-full w-full" />
          ) : (
            <span className="block h-full w-full" />
          )}
        </button>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={field.value}
          placeholder={field.label || '...'}
          onChange={(e) => onChange({ ...field, value: e.target.value })}
          onFocus={onSelect}
          className="bg-transparent font-mono text-ink outline-none placeholder:text-muted-foreground/60"
          style={{ fontSize, width: `${Math.max(field.value.length + 2, 8)}ch` }}
        />
      )}
    </div>
  )
}
