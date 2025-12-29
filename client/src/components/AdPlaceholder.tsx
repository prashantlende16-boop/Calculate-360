import { cn } from "@/lib/utils";

interface AdPlaceholderProps {
  className?: string;
  label?: string;
  size?: "banner" | "sidebar" | "box";
}

export function AdPlaceholder({ className, label = "Advertisement", size = "box" }: AdPlaceholderProps) {
  return (
    <div 
      className={cn(
        "bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-muted-foreground text-xs font-medium uppercase tracking-widest relative overflow-hidden group",
        size === "banner" && "h-24 w-full",
        size === "sidebar" && "h-[600px] w-full",
        size === "box" && "h-64 w-full",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <span>{label}</span>
    </div>
  );
}
