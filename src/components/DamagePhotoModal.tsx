import { X } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export function DamagePhotoModal() {
  const imgViewer = useAppStore((s) => s.imgViewer);
  const closeImgViewer = useAppStore((s) => s.closeImgViewer);

  if (!imgViewer) return null;

  return (
    <div
      onClick={closeImgViewer}
      className="animate-sheet-fade fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center p-10"
      style={{ background: "rgba(9,9,11,0.78)" }}
    >
      <div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
        <div className="absolute left-0 top-0 z-10 rounded-tl-[10px] bg-[rgba(9,9,11,0.82)] px-4 py-2.5">
          <div className="text-[15px] font-bold leading-tight text-white">{imgViewer.title}</div>
          <div className="text-[12px] font-semibold text-amber-400">{imgViewer.subtitle}</div>
        </div>
        <img
          src={imgViewer.url}
          alt={imgViewer.title}
          className="max-h-[80vh] max-w-full rounded-[10px] object-contain"
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
        />
      </div>
      <button
        onClick={closeImgViewer}
        className="absolute right-5 top-5 flex h-[38px] w-[38px] items-center justify-center rounded-full border text-white"
        style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.25)" }}
      >
        <X size={18} strokeWidth={2.4} />
      </button>
    </div>
  );
}
