import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import type { PointerEvent, RefObject } from 'react';
import styles from './SignaturePad.module.css';

/** Backing store size — the element is scaled to fit its container. */
const WIDTH = 640;
const HEIGHT = 240;

export interface SignaturePadHandle {
  clear: () => void;
  /** PNG data URL of what was drawn, or '' if the canvas is unavailable. */
  toDataUrl: () => string;
}

interface SignaturePadProps {
  ref: RefObject<SignaturePadHandle | null>;
  empty: boolean;
  onDraw: () => void;
}

export function SignaturePad({ ref, empty, onDraw }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const context = useCallback(() => canvasRef.current?.getContext('2d') ?? null, []);

  useEffect(() => {
    const ctx = context();
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#18181b';
  }, [context]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const ctx = context();
      if (ctx) ctx.clearRect(0, 0, WIDTH, HEIGHT);
    },
    toDataUrl: () => canvasRef.current?.toDataURL('image/png') ?? '',
  }));

  // Pointer coordinates scaled from the rendered box to the backing store.
  const position = (event: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    return [
      (event.clientX - rect.left) * (canvas.width / rect.width),
      (event.clientY - rect.top) * (canvas.height / rect.height),
    ];
  };

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    const ctx = context();
    if (!ctx) return;
    drawing.current = true;
    canvasRef.current?.setPointerCapture(event.pointerId);
    const [x, y] = position(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (empty) onDraw();
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = context();
    if (!ctx) return;
    const [x, y] = position(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stop = () => {
    drawing.current = false;
  };

  return (
    <div className={styles.pad}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className={styles.canvas}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerLeave={stop}
      />
      {empty ? <div className={styles.placeholder}>Draw your signature here</div> : null}
    </div>
  );
}
