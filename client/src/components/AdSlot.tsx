import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  position: "top" | "sidebar" | "bottom";
  className?: string;
}

const adSlotIds = {
  top: "4770037257",
  sidebar: "7247192630",
  bottom: "6912984863",
};

export function AdSlot({ position, className }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  const heights = {
    top: "min-h-[90px] sm:min-h-[120px]",
    sidebar: "min-h-[250px] sm:min-h-[600px]",
    bottom: "min-h-[250px]",
  };

  useEffect(() => {
    if (adRef.current && !isAdLoaded.current) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isAdLoaded.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, []);

  return (
    <div
      ref={adRef}
      className={cn(
        "w-full overflow-hidden",
        heights[position],
        className
      )}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8009221027375282"
        data-ad-slot={adSlotIds[position]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
