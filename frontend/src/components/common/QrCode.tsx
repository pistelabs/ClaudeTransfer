import { useMemo } from "react"

import { cn } from "@/lib/utils"

/**
 * Decorative QR placeholder carried over from the prototype: a deterministic
 * 21x21 matrix with real-looking finder patterns. It does NOT scan — swap in
 * `qrcode.react` pointed at the live URL and keep this visual treatment.
 */
const MODULES = 21

function pseudoRandom(seed: number): () => number {
  let state = seed || 1
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

function isFinder(row: number, col: number): boolean | null {
  const corners = [
    [0, 0],
    [0, MODULES - 7],
    [MODULES - 7, 0],
  ]
  for (const [r, c] of corners) {
    const dr = row - r
    const dc = col - c
    if (dr >= 0 && dr < 7 && dc >= 0 && dc < 7) {
      const ring = Math.max(Math.abs(dr - 3), Math.abs(dc - 3))
      return ring !== 2
    }
    // Quiet ring around each finder
    if (dr >= -1 && dr < 8 && dc >= -1 && dc < 8) return false
  }
  return null
}

export function QrCode({
  value,
  size = 118,
  className,
}: {
  value: string
  size?: number
  className?: string
}) {
  const matrix = useMemo(() => {
    let seed = 0
    for (let i = 0; i < value.length; i += 1) {
      seed = (seed * 31 + value.charCodeAt(i)) & 0x7fffffff
    }
    const rand = pseudoRandom(seed)
    return Array.from({ length: MODULES }, (_, row) =>
      Array.from({ length: MODULES }, (_, col) => {
        const finder = isFinder(row, col)
        if (finder !== null) return finder
        // Timing patterns
        if (row === 6 || col === 6) return (row + col) % 2 === 0
        return rand() > 0.5
      }),
    )
  }, [value])

  return (
    <div
      className={cn(
        "border-border shrink-0 rounded-lg border bg-white p-2",
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`QR code for ${value}`}
    >
      <svg
        viewBox={`0 0 ${MODULES} ${MODULES}`}
        className="size-full"
        shapeRendering="crispEdges"
      >
        <rect width={MODULES} height={MODULES} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((on, c) =>
            on ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#1c1917"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  )
}
