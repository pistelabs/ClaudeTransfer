import { Toaster as Sonner } from 'sonner';
import type { ComponentProps } from 'react';

/**
 * shadcn's Sonner wrapper. The notices this app raises carry their own markup and
 * styling, so they are pushed with `toast.custom` and Sonner supplies only what a
 * hand-placed notice never had: a queue, so a second notice stacks instead of
 * replacing the first, dismissal by swipe or Escape, and the timer that clears
 * one nobody acted on.
 */
function Toaster({ position = 'bottom-center', ...props }: ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      className="toaster"
      position={position}
      offset={22}
      toastOptions={{ unstyled: true, duration: 9000 }}
      {...props}
    />
  );
}

export { Toaster };
