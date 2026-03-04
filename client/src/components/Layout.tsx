import { useState } from "react";
import { Calculator as CalcIcon, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreateFeedback } from "@/hooks/use-feedback";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-border/60 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary text-white p-1.5 rounded-lg shadow-lg shadow-primary/30">
              <CalcIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 leading-none">
                Calculate<span className="text-primary">360</span>
              </h1>
              <p className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">Percentage Calculator</p>
            </div>
          </div>
          
          <FeedbackButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 text-primary p-1 rounded-md">
                  <CalcIcon className="w-4 h-4" />
                </div>
                <span className="font-bold font-display text-lg">Calculate360</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                A simple, fast, and responsive percentage calculator for all your daily math needs. Built with precision and care.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-slate-900">Calculators</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-primary transition-colors">Percentage Calculator</a></li>
                <li><a href="/age" className="hover:text-primary transition-colors">Age Calculator</a></li>
                <li><a href="/home-loan" className="hover:text-primary transition-colors">Home Loan EMI</a></li>
                <li><a href="/home-loan-eligibility" className="hover:text-primary transition-colors">Loan Eligibility</a></li>
                <li><a href="/gold" className="hover:text-primary transition-colors">Jewelry Cost</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-slate-900">More Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/currency" className="hover:text-primary transition-colors">Currency Converter</a></li>
                <li><a href="/bmi" className="hover:text-primary transition-colors">BMI Calculator</a></li>
                <li><a href="/qr" className="hover:text-primary transition-colors">QR Generator</a></li>
                <li><a href="/body-fat" className="hover:text-primary transition-colors">Body Fat %</a></li>
                <li><a href="/units" className="hover:text-primary transition-colors">Unit Converter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} Calculate360. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-primary fill-primary" /> by Designers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { mutate, isPending } = useCreateFeedback();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!message.trim()) return;
    
    mutate({ message }, {
      onSuccess: () => {
        toast({ title: "Feedback sent!", description: "Thank you for helping us improve." });
        setOpen(false);
        setMessage("");
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            placeholder="Tell us what you think or report a bug..." 
            className="min-h-[100px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !message.trim()}>
            {isPending ? "Sending..." : (
              <>
                Send <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
