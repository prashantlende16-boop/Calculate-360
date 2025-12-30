import { useMutation } from "@tanstack/react-query";
import { api, type InsertFeedback } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCreateFeedback() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
      // Validate with Zod schema before sending
      const validated = api.feedback.create.input.parse(data);
      
      const res = await fetch(api.feedback.create.path, {
        method: api.feedback.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.feedback.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit feedback");
      }

      return api.feedback.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Feedback Received",
        description: "Thank you for helping us improve Calculate 360!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
