import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PercentageCalculator from "@/pages/PercentageCalculator";
import AgeCalculator from "@/pages/AgeCalculator";
import HomeLoanCalculator from "@/pages/HomeLoanCalculator";
import HomeLoanEligibility from "@/pages/HomeLoanEligibility";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PercentageCalculator} />
      <Route path="/age" component={AgeCalculator} />
      <Route path="/home-loan" component={HomeLoanCalculator} />
      <Route path="/home-loan-eligibility" component={HomeLoanEligibility} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
