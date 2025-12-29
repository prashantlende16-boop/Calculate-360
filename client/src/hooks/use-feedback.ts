import { useMutation } from "@tanstack/react-query";
import { api, type InsertFeedback } from "@shared/routes";

export function useCreateFeedback() {
  return useMutation({
    mutationFn: async (data: InsertFeedback) => {
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
  });
}
