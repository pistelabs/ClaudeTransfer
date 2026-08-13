import { useEffect, useRef } from "react";

/** Draw-to-sign canvas. Reports a data URL on every stroke end, and null once cleared. */
export function SignaturePad({ onChange, clearSignal }: { onChange: (dataUrl: string | null) => void; clearSignal: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  // Size the bitmap to the element so strokes aren't stretched on hi-dpi screens.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#18181b";
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    dirty.current = false;
    onChange(null);
    // only when the parent asks for a clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSignal]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-[150px] w-full touch-none rounded-[9px] border border-dashed border-border bg-white"
      style={{ cursor: "crosshair" }}
      onPointerDown={(e) => {
        const ctx = e.currentTarget.getContext("2d");
        if (!ctx) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drawing.current = true;
        const { x, y } = pos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        const ctx = e.currentTarget.getContext("2d");
        if (!ctx) return;
        const { x, y } = pos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        dirty.current = true;
      }}
      onPointerUp={(e) => {
        drawing.current = false;
        onChange(dirty.current ? e.currentTarget.toDataURL("image/png") : null);
      }}
    />
  );
}
