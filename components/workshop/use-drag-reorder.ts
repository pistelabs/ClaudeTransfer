"use client"

import * as React from "react"

import type { Id } from "@/lib/workshop/types"

interface DragState {
  /** Index being dragged, or null when idle. */
  from: number | null
  /** Index the row would drop into. */
  over: number | null
}

/**
 * Drag-and-drop (and keyboard) reordering for a list of rows.
 *
 * `onCommit` receives the ids in their new order; the caller applies the order
 * optimistically and reverts if the request fails.
 */
export function useDragReorder<T extends { id: Id }>(
  items: T[],
  onCommit: (orderedIds: Id[]) => Promise<void> | void,
) {
  const [drag, setDrag] = React.useState<DragState>({ from: null, over: null })

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return
    const ordered = [...items]
    const [moved] = ordered.splice(from, 1)
    ordered.splice(to, 0, moved)
    void onCommit(ordered.map((item) => item.id))
  }

  /** Props for the row wrapper — the row is only draggable while the handle is held. */
  const rowProps = (index: number) => ({
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.effectAllowed = "move"
      // Firefox needs data set for the drag to start at all.
      event.dataTransfer.setData("text/plain", String(index))
      setDrag({ from: index, over: index })
    },
    onDragOver: (event: React.DragEvent) => {
      if (drag.from === null) return
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
      setDrag((current) => (current.over === index ? current : { ...current, over: index }))
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault()
      if (drag.from !== null) move(drag.from, index)
      setDrag({ from: null, over: null })
    },
    onDragEnd: () => setDrag({ from: null, over: null }),
  })

  /** Props for the grip: arms dragging on pointer-down, and moves rows with the arrow keys. */
  const handleProps = (index: number) => ({
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault()
        move(index, index + (event.key === "ArrowUp" ? -1 : 1))
      }
    },
  })

  return {
    dragIndex: drag.from,
    overIndex: drag.from === null ? null : drag.over,
    isDragging: drag.from !== null,
    rowProps,
    handleProps,
    move,
  }
}
