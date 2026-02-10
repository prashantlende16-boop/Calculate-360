import { Copy, Link as LinkIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard, setShareLink } from "@/lib/calculatorUtils";

interface ShareCopyButtonsProps {
  resultText: string;
  shareParams: Record<string, string>;
  onReset: () => void;
  hasResult: boolean;
}

export function ShareCopyButtons({ resultText, shareParams, onReset, hasResult }: ShareCopyButtonsProps) {
  const { toast } = useToast();

  const handleCopyResult = () => {
    copyToClipboard(resultText);
    toast({ title: "Copied to clipboard", description: resultText });
  };

  const handleCopyShareLink = () => {
    const link = setShareLink(shareParams);
    copyToClipboard(link);
    toast({ title: "Share link copied", description: "Link with your inputs has been copied." });
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="gap-2 text-muted-foreground hover:text-foreground"
        data-testid="button-reset"
      >
        <RefreshCcw className="w-4 h-4" /> Reset
      </Button>
      {hasResult && (
        <>
          <Button
            size="sm"
            onClick={handleCopyResult}
            className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
            data-testid="button-copy-result"
          >
            <Copy className="w-4 h-4" /> Copy Result
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyShareLink}
            className="gap-2"
            data-testid="button-copy-share"
          >
            <LinkIcon className="w-4 h-4" /> Copy Share Link
          </Button>
        </>
      )}
    </div>
  );
}
