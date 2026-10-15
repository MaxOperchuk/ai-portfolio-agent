import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DownloadCV({ className }: { className?: string }) {
  return (
    <a
      href="/maksym-operchuk-cv.pdf"
      download="Maksym-Operchuk-CV.pdf"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-coral px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/35 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <Download size={20} aria-hidden="true" />
      Download CV
    </a>
  );
}
