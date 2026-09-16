import { QRCodeSVG } from "qrcode.react"

import { cn } from "@/lib/utils"

interface QrCodeProps {
  /** The URL the code encodes, without a scheme. */
  value: string
  size?: number
  className?: string
}

/**
 * A real, scannable QR code in the treatment the design specifies:
 * 118px, 8px white padding, a hairline border and an 8px radius.
 */
export function QrCode({ value, size = 118, className }: QrCodeProps) {
  const url = value.startsWith("http") ? value : `https://${value}`
  // The padding is drawn by the wrapper, so the matrix fills the rest.
  const matrixSize = size - 16

  return (
    <div
      className={cn(
        "border-border shrink-0 rounded-lg border bg-white p-2",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <QRCodeSVG
        value={url}
        size={matrixSize}
        level="M"
        bgColor="#ffffff"
        fgColor="#1c1917"
        marginSize={0}
        title={`QR code for ${value}`}
        className="size-full"
      />
    </div>
  )
}
