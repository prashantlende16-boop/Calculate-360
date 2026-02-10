import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PercentageCalculator from "@/pages/PercentageCalculator";
import AgeCalculator from "@/pages/AgeCalculator";
import HomeLoanCalculator from "@/pages/HomeLoanCalculator";
import HomeLoanEligibility from "@/pages/HomeLoanEligibility";
import GoldCalculator from "@/pages/GoldCalculator";
import CurrencyConverter from "@/pages/CurrencyConverter";
import BMICalculator from "@/pages/BMICalculator";
import QRCodeGenerator from "@/pages/QRCodeGenerator";
import BodyFatEstimator from "@/pages/BodyFatEstimator";
import UnitConverter from "@/pages/UnitConverter";
import SavingsGoalPlanner from "@/pages/SavingsGoalPlanner";
import AdsMetricsCalculator from "@/pages/AdsMetricsCalculator";
import FuelCostCalculator from "@/pages/FuelCostCalculator";
import TripSplitter from "@/pages/TripSplitter";
import EventBudgetPlanner from "@/pages/EventBudgetPlanner";
import BmrTdeeCalculator from "@/pages/BmrTdeeCalculator";
import IdealWeightCalculator from "@/pages/IdealWeightCalculator";
import WaterIntakeCalculator from "@/pages/WaterIntakeCalculator";
import SleepCyclePlanner from "@/pages/SleepCyclePlanner";
import WordCounter from "@/pages/WordCounter";
import EncoderTools from "@/pages/EncoderTools";
import ColorTools from "@/pages/ColorTools";
import RandomDataGenerator from "@/pages/RandomDataGenerator";
import TimezoneMeeting from "@/pages/TimezoneMeeting";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PercentageCalculator} />
      <Route path="/age" component={AgeCalculator} />
      <Route path="/home-loan" component={HomeLoanCalculator} />
      <Route path="/home-loan-eligibility" component={HomeLoanEligibility} />
      <Route path="/gold" component={GoldCalculator} />
      <Route path="/currency" component={CurrencyConverter} />
      <Route path="/bmi" component={BMICalculator} />
      <Route path="/qr" component={QRCodeGenerator} />
      <Route path="/body-fat" component={BodyFatEstimator} />
      <Route path="/units" component={UnitConverter} />
      <Route path="/savings-goal" component={SavingsGoalPlanner} />
      <Route path="/ads-metrics" component={AdsMetricsCalculator} />
      <Route path="/fuel-cost" component={FuelCostCalculator} />
      <Route path="/trip-splitter" component={TripSplitter} />
      <Route path="/event-budget" component={EventBudgetPlanner} />
      <Route path="/bmr-tdee" component={BmrTdeeCalculator} />
      <Route path="/ideal-weight" component={IdealWeightCalculator} />
      <Route path="/water-intake" component={WaterIntakeCalculator} />
      <Route path="/sleep-cycle" component={SleepCyclePlanner} />
      <Route path="/word-counter" component={WordCounter} />
      <Route path="/encoder-tools" component={EncoderTools} />
      <Route path="/color-tools" component={ColorTools} />
      <Route path="/random-data" component={RandomDataGenerator} />
      <Route path="/timezone-meeting" component={TimezoneMeeting} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
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
