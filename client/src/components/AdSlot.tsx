import { cn } from "@/lib/utils";

interface AdSlotProps {
  position: "top" | "sidebar" | "bottom";
  className?: string;
}

export function AdSlot({ position, className }: AdSlotProps) {
  const labels = {
    top: "Advertisement (Top Banner)",
    sidebar: "Advertisement (Sidebar)",
    bottom: "Advertisement (Bottom Banner)",
  };

  const heights = {
    top: "h-[90px] sm:h-[120px]",
    sidebar: "h-[250px] sm:h-[600px]",
    bottom: "h-[250px]",
  };

  return (
    <div
      className={cn(
        "w-full bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative group",
        heights[position],
        className
      )}
    >
      <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pattern-grid-lg text-slate-200" />
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest relative z-10">
        {labels[position]}
      </span>
      <p className="text-xs text-slate-300 mt-2 relative z-10">
        Ad Space Placeholder
      </p>
    </div>
  );
}
