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

const MIN_W = 0.04
const MIN_H = 0.02

export function FieldBox({ field, scale, selected, onSelect, onChange, onMove }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)

  function trackPointer(e: React.PointerEvent, onPoint: (x: number, y: number) => void) {
    e.preventDefault()
    e.stopPropagation()
    onSelect()
    const parent = boxRef.current?.offsetParent as HTMLElement | null
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const move = (ev: PointerEvent) => {
      onPoint((ev.clientX - rect.left) / rect.width, (ev.clientY - rect.top) / rect.height)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const startDrag = (e: React.PointerEvent) =>
    trackPointer(e, (x, y) =>
      onMove(Math.min(Math.max(x, 0), 0.98), Math.min(Math.max(y, 0), 0.98)),
    )

  const startResize = (e: React.PointerEvent) =>
    trackPointer(e, (x, y) =>
      onChange({ ...field, w: Math.max(MIN_W, x - field.x), h: Math.max(MIN_H, y - field.y) }),
    )

  const fontSize = field.fontSize * scale

  return (
    <div
      ref={boxRef}
      className={cn(
        'absolute flex items-center gap-0.5 rounded-md border-2 bg-card/80 backdrop-blur-[1px]',
        selected ? 'z-10 border-primary' : 'border-primary/40 hover:border-primary',
      )}
      style={{
        left: `${field.x * 100}%`,
        top: `${field.y * 100}%`,
        width: field.w !== undefined ? `${field.w * 100}%` : undefined,
        height: field.h !== undefined ? `${field.h * 100}%` : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      <button
        type="button"
        aria-label="Mover campo"
        onPointerDown={startDrag}
        className="flex h-full shrink-0 cursor-grab touch-none items-center px-0.5 text-primary active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {field.type === 'check' ? (
        <button
          type="button"
          aria-label={field.label || 'Marcação'}
          onClick={() => onChange({ ...field, value: field.value ? '' : 'x' })}
          className={cn('flex items-center justify-center text-ink', field.w !== undefined && 'h-full min-w-0 flex-1')}
          style={field.w === undefined ? { width: fontSize * 1.4, height: fontSize * 1.4 } : undefined}
        >
          {field.value ? <Check className="h-full max-h-6 w-full" /> : <span className="block h-full w-full" />}
        </button>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={field.value}
          placeholder={field.label || '...'}
          autoFocus={selected}
          onChange={(e) => onChange({ ...field, value: e.target.value })}
          onFocus={onSelect}
          className={cn(
            'bg-transparent px-1 font-mono text-ink outline-none placeholder:text-muted-foreground/60',
            field.w !== undefined && 'h-full min-w-0 flex-1',
          )}
          style={{
            fontSize,
            width: field.w === undefined ? `${Math.max(field.value.length + 2, 8)}ch` : undefined,
          }}
        />
      )}

      {selected && (
        <button
          type="button"
          aria-label="Redimensionar campo"
          onPointerDown={startResize}
          className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize touch-none rounded-sm border-2 border-primary bg-card"
        />
      )}
    </div>
  )
}
