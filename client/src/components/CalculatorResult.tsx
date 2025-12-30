import { Copy, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface CalculatorResultProps {
  value: string | number | null;
  label: string;
  subtext?: string;
  onReset?: () => void;
  isError?: boolean;
}

export function CalculatorResult({ value, label, subtext, onReset, isError }: CalculatorResultProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value.toString());
      toast({
        title: "Copied to clipboard",
        description: value.toString(),
      });
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-dashed border-border">
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
          {label}
        </span>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={value?.toString() || "empty"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-4xl sm:text-5xl font-display font-bold mb-2 ${isError ? 'text-destructive' : 'text-primary'}`}
          >
            {value || "—"}
          </motion.div>
        </AnimatePresence>

        {subtext && (
          <p className="text-muted-foreground mb-6 max-w-xs">{subtext}</p>
        )}

        {value && !isError && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCcw className="w-4 h-4" /> Reset
            </Button>
            <Button
              size="sm"
              onClick={handleCopy}
              className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
            >
              <Copy className="w-4 h-4" /> Copy Result
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
