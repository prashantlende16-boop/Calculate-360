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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <h3 className="font-display font-bold text-lg">Calculate 360</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Simple, fast, and free online calculators for your daily needs.
              Built with precision and care to help you solve problems
              instantly.
            </p>
            <div className="mt-6 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Calculate 360. All rights reserved.
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-base mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Send Feedback
            </h4>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <Input
                {...form.register("message")}
                placeholder="Found a bug? Have a suggestion?"
                className="bg-white border-slate-200"
                autoComplete="off"
              />
              <Button
                type="submit"
                disabled={createFeedback.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {createFeedback.isPending ? "Sending..." : "Send"}
              </Button>
            </form>
            {form.formState.errors.message && (
              <p className="text-xs text-destructive mt-2">
                {form.formState.errors.message.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              We read every message to improve our calculators.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
