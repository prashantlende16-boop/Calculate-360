import { useCreateFeedback } from "@/hooks/use-feedback";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeedbackSchema } from "@shared/schema";
import { MessageSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InsertFeedback } from "@shared/schema";

export function Footer() {
  const createFeedback = useCreateFeedback();
  
  const form = useForm<InsertFeedback>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = (data: InsertFeedback) => {
    createFeedback.mutate(data, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <footer className="bg-slate-50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <h3 className="font-display font-bold text-lg">Calculate 360</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Simple, fast, and free online calculators for your daily needs.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-foreground mb-3">Finance</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Percentage</a></li>
              <li><a href="/home-loan" className="hover:text-primary transition-colors">Home Loan EMI</a></li>
              <li><a href="/home-loan-eligibility" className="hover:text-primary transition-colors">Loan Eligibility</a></li>
              <li><a href="/gold" className="hover:text-primary transition-colors">Jewelry Cost</a></li>
              <li><a href="/currency" className="hover:text-primary transition-colors">Currency</a></li>
              <li><a href="/savings-goal" className="hover:text-primary transition-colors">Savings Goal</a></li>
              <li><a href="/ads-metrics" className="hover:text-primary transition-colors">Ads Metrics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-foreground mb-3">Health</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><a href="/bmi" className="hover:text-primary transition-colors">BMI Calculator</a></li>
              <li><a href="/body-fat" className="hover:text-primary transition-colors">Body Fat %</a></li>
              <li><a href="/bmr-tdee" className="hover:text-primary transition-colors">BMR / TDEE</a></li>
              <li><a href="/ideal-weight" className="hover:text-primary transition-colors">Ideal Weight</a></li>
              <li><a href="/water-intake" className="hover:text-primary transition-colors">Water Intake</a></li>
              <li><a href="/sleep-cycle" className="hover:text-primary transition-colors">Sleep Cycle</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-foreground mb-3">Utilities</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><a href="/age" className="hover:text-primary transition-colors">Age Calculator</a></li>
              <li><a href="/qr" className="hover:text-primary transition-colors">QR Generator</a></li>
              <li><a href="/units" className="hover:text-primary transition-colors">Unit Converter</a></li>
              <li><a href="/word-counter" className="hover:text-primary transition-colors">Word Counter</a></li>
              <li><a href="/encoder-tools" className="hover:text-primary transition-colors">Encoder</a></li>
              <li><a href="/color-tools" className="hover:text-primary transition-colors">Color Tools</a></li>
              <li><a href="/random-data" className="hover:text-primary transition-colors">Random Data</a></li>
              <li><a href="/fuel-cost" className="hover:text-primary transition-colors">Fuel Cost</a></li>
              <li><a href="/trip-splitter" className="hover:text-primary transition-colors">Trip Splitter</a></li>
              <li><a href="/event-budget" className="hover:text-primary transition-colors">Event Budget</a></li>
              <li><a href="/timezone-meeting" className="hover:text-primary transition-colors">Time Zones</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Send Feedback
              </h4>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                <Input
                  {...form.register("message")}
                  placeholder="Found a bug? Have a suggestion?"
                  className="bg-white border-slate-200 text-sm"
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  disabled={createFeedback.isPending}
                  size="sm"
                >
                  {createFeedback.isPending ? "..." : "Send"}
                </Button>
              </form>
              {form.formState.errors.message && (
                <p className="text-xs text-destructive mt-2">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 text-xs text-muted-foreground">
              <a href="/privacy-policy" className="hover:text-primary transition-colors" data-testid="link-privacy-policy">Privacy Policy</a>
              <span>© {new Date().getFullYear()} Calculate 360. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
