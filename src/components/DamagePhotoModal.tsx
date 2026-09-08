import { useAppStore } from "../store/useAppStore";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function DamagePhotoModal() {
  const imgViewer = useAppStore((s) => s.imgViewer);
  const closeImgViewer = useAppStore((s) => s.closeImgViewer);

  return (
    <Dialog open={!!imgViewer} onOpenChange={(open) => !open && closeImgViewer()}>
      {/* A lightbox: the image is the dialog, so the usual panel chrome is stripped off. */}
      <DialogContent className="w-auto max-w-[min(90vw,1100px)] border-0 bg-transparent p-0 shadow-none sm:max-w-[min(90vw,1100px)] [&>button]:text-white">
        <div className="relative">
          <div className="absolute top-0 left-0 z-10 rounded-tl-lg rounded-br-lg bg-black/80 px-4 py-2.5">
            <DialogTitle className="text-base leading-tight text-white">{imgViewer?.title}</DialogTitle>
            <DialogDescription className="text-xs font-semibold text-amber-400">
              {imgViewer?.subtitle}
            </DialogDescription>
          </div>
          <img
            src={imgViewer?.url}
            alt={imgViewer?.title}
            className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
