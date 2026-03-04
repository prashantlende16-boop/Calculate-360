import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Copy, Home, Car } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateMaxLoan(maxEmi: number, annualRate: number, tenureYears: number): number {
  if (annualRate === 0) return maxEmi * tenureYears * 12;
  const monthlyRate = annualRate / 100 / 12;
  const n = tenureYears * 12;
  const numerator = Math.pow(1 + monthlyRate, n) - 1;
  const denominator = monthlyRate * Math.pow(1 + monthlyRate, n);
  return (maxEmi * numerator) / denominator;
}

export default function HomeLoanEligibility() {
  const { toast } = useToast();
  const [decimals, setDecimals] = useState(2);
  const [mainTab, setMainTab] = useState<"home" | "car">("home");

  // Home Loan State
  const [homeMonthlyIncome, setHomeMonthlyIncome] = useState("75");
  const [homeExistingEmis, setHomeExistingEmis] = useState("0");
  const [homeInterestRate, setHomeInterestRate] = useState("7.5");
  const [homeTenure, setHomeTenure] = useState("20");
  const [homeFoirLimit, setHomeFoirLimit] = useState("50");
  const [homeCoApplicantIncome, setHomeCoApplicantIncome] = useState("");
  const [homeMonthlyObligations, setHomeMonthlyObligations] = useState("");
  const [homeDownPayment, setHomeDownPayment] = useState("");

  // Car Loan State
  const [carMonthlyIncome, setCarMonthlyIncome] = useState("50");
  const [carExistingEmis, setCarExistingEmis] = useState("0");
  const [carInterestRate, setCarInterestRate] = useState("8.5");
  const [carTenure, setCarTenure] = useState("5");
  const [carFoirLimit, setCarFoirLimit] = useState("45");
  const [carCoApplicantIncome, setCarCoApplicantIncome] = useState("");
  const [carMonthlyObligations, setCarMonthlyObligations] = useState("");
  const [carDownPayment, setCarDownPayment] = useState("");
  const [carTargetPrice, setCarTargetPrice] = useState("");

  const calculateResults = (isCar: boolean) => {
    const income = parseFloat(isCar ? carMonthlyIncome : homeMonthlyIncome) || 0;
    const coIncome = parseFloat(isCar ? carCoApplicantIncome : homeCoApplicantIncome) || 0;
    const existingEmis = parseFloat(isCar ? carExistingEmis : homeExistingEmis) || 0;
    const obligations = parseFloat(isCar ? carMonthlyObligations : homeMonthlyObligations) || 0;
    const rate = parseFloat(isCar ? carInterestRate : homeInterestRate) || 0;
    const tenure = parseFloat(isCar ? carTenure : homeTenure) || 0;
    const foir = parseFloat(isCar ? carFoirLimit : homeFoirLimit) || 50;
    const downPayment = parseFloat(isCar ? carDownPayment : homeDownPayment) || 0;

    const totalIncome = income + coIncome;
    const foirCapacity = (totalIncome * foir) / 100;
    const maxEmiAllowed = Math.max(0, foirCapacity - existingEmis - obligations);
    const maxLoanEligible = maxEmiAllowed > 0 && tenure > 0 ? calculateMaxLoan(maxEmiAllowed, rate, tenure) : 0;
    const budget = maxLoanEligible + downPayment;

    return {
      totalIncome,
      foirCapacity,
      maxEmiAllowed,
      maxLoanEligible,
      budget,
      existingEmis,
      foirPercentage: foirCapacity > 0 ? ((existingEmis + maxEmiAllowed) / foirCapacity) * 100 : 0
    };
  };

  const homeResults = useMemo(() => calculateResults(false), [homeMonthlyIncome, homeCoApplicantIncome, homeExistingEmis, homeMonthlyObligations, homeInterestRate, homeTenure, homeFoirLimit, homeDownPayment]);
  const carResults = useMemo(() => calculateResults(true), [carMonthlyIncome, carCoApplicantIncome, carExistingEmis, carMonthlyObligations, carInterestRate, carTenure, carFoirLimit, carDownPayment]);

  const activeResults = mainTab === "home" ? homeResults : carResults;

  const handleReset = () => {
    if (mainTab === "home") {
      setHomeMonthlyIncome("75");
      setHomeExistingEmis("0");
      setHomeInterestRate("7.5");
      setHomeTenure("20");
      setHomeFoirLimit("50");
      setHomeCoApplicantIncome("");
      setHomeMonthlyObligations("");
      setHomeDownPayment("");
    } else {
      setCarMonthlyIncome("50");
      setCarExistingEmis("0");
      setCarInterestRate("8.5");
      setCarTenure("5");
      setCarFoirLimit("45");
      setCarCoApplicantIncome("");
      setCarMonthlyObligations("");
      setCarDownPayment("");
      setCarTargetPrice("");
    }
  };

  const copySummary = () => {
    const type = mainTab === "home" ? "Home" : "Car";
    const summary = `${type} Loan Eligibility Summary:
Max Eligible EMI: ${formatCurrency(activeResults.maxEmiAllowed)}
Max Loan Amount: ${formatCurrency(activeResults.maxLoanEligible)}
Affordable Budget: ${formatCurrency(activeResults.budget)}
FOIR Limit Used: ${activeResults.foirPercentage.toFixed(1)}%

Note: This is an estimate. Banks may have different criteria.`;
    navigator.clipboard.writeText(summary);
    toast({ title: "Copied", description: "Summary copied to clipboard" });
  };

  const homeFaqs = [
    { question: "What is FOIR?", answer: "FOIR (Fixed Obligation to Income Ratio) is the percentage of your monthly income that can be used for loan EMIs." },
    { question: "How do existing EMIs affect my eligibility?", answer: "Your existing EMIs reduce your available capacity for a new loan." }
  ];

  const carFaqs = [
    { question: "What FOIR is good for car loans?", answer: "Standard FOIR for car loans is usually around 45-50%, though it can vary by lender." },
    { question: "How does car loan tenure affect eligibility?", answer: "Longer tenure reduces EMI, increasing the loan amount you can borrow, but increases total interest." },
    { question: "Can I include co-applicant income for a car loan?", answer: "Yes, adding a co-applicant can significantly increase your eligibility." }
  ];

  const allFaqs = [...homeFaqs, ...carFaqs];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
                {mainTab === "home" ? <Home className="w-8 h-8 text-primary" /> : <Car className="w-8 h-8 text-primary" />}
                Loan Eligibility Calculator
              </h1>
              <div className="flex bg-muted p-1 rounded-xl w-fit mb-4">
                <button 
                  onClick={() => setMainTab("home")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab === "home" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >Home Loan</button>
                <button 
                  onClick={() => setMainTab("car")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab === "car" ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >Car Loan</button>
              </div>
            </header>

            {/* Summary Cards */}
            <motion.div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20">
                <div className="text-sm text-muted-foreground mb-2">Max Eligible EMI</div>
                <div className="text-3xl font-bold text-primary">{activeResults.maxEmiAllowed > 0 ? formatCurrency(activeResults.maxEmiAllowed) : "Not Eligible"}</div>
              </div>
              <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 p-6 rounded-xl border border-secondary/20">
                <div className="text-sm text-muted-foreground mb-2">Max Loan Amount</div>
                <div className="text-3xl font-bold text-secondary">{activeResults.maxLoanEligible > 0 ? formatCurrency(activeResults.maxLoanEligible) : "—"}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="text-sm text-muted-foreground mb-2">Affordable Budget</div>
                <div className="text-3xl font-bold text-purple-700">{activeResults.budget > 0 ? formatCurrency(activeResults.budget) : "—"}</div>
              </div>
              {mainTab === "car" && carTargetPrice && (
                <div className={`p-6 rounded-xl border ${activeResults.budget >= (parseFloat(carTargetPrice) || 0) ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                  <div className="text-sm mb-2">vs Target Price</div>
                  <div className="text-3xl font-bold">{formatCurrency(activeResults.budget - (parseFloat(carTargetPrice) || 0))}</div>
                  <div className="text-xs mt-1">{activeResults.budget >= (parseFloat(carTargetPrice) || 0) ? "Sufficient Budget" : "Budget Shortfall"}</div>
                </div>
              )}
            </motion.div>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="block mb-2">Net Monthly Income (₹)</Label>
                    <Input type="number" value={mainTab === "home" ? homeMonthlyIncome : carMonthlyIncome} onChange={(e) => mainTab === "home" ? setHomeMonthlyIncome(e.target.value) : setCarMonthlyIncome(e.target.value)} />
                  </div>
                  <div>
                    <Label className="block mb-2">Existing Monthly EMIs (₹)</Label>
                    <Input type="number" value={mainTab === "home" ? homeExistingEmis : carExistingEmis} onChange={(e) => mainTab === "home" ? setHomeExistingEmis(e.target.value) : setCarExistingEmis(e.target.value)} />
                  </div>
                  <div>
                    <Label className="block mb-2">Interest Rate (%)</Label>
                    <Input type="number" step="0.1" value={mainTab === "home" ? homeInterestRate : carInterestRate} onChange={(e) => mainTab === "home" ? setHomeInterestRate(e.target.value) : setCarInterestRate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="block mb-2">Tenure (Years)</Label>
                    <Input type="number" value={mainTab === "home" ? homeTenure : carTenure} onChange={(e) => mainTab === "home" ? setHomeTenure(e.target.value) : setCarTenure(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="block mb-2">FOIR Limit (%)</Label>
                    <Select value={mainTab === "home" ? homeFoirLimit : carFoirLimit} onValueChange={(v) => mainTab === "home" ? setHomeFoirLimit(v) : setCarFoirLimit(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {mainTab === "home" ? (
                          <>
                            <SelectItem value="40">Conservative (40%)</SelectItem>
                            <SelectItem value="50">Standard (50%)</SelectItem>
                            <SelectItem value="60">Aggressive (60%)</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="35">Conservative (35%)</SelectItem>
                            <SelectItem value="45">Standard (45%)</SelectItem>
                            <SelectItem value="55">Aggressive (55%)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-dashed">
                  <div className="md:col-span-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Optional Details</div>
                  <div>
                    <Label className="block mb-2">Co-applicant Income (₹)</Label>
                    <Input type="number" value={mainTab === "home" ? homeCoApplicantIncome : carCoApplicantIncome} onChange={(e) => mainTab === "home" ? setHomeCoApplicantIncome(e.target.value) : setCarCoApplicantIncome(e.target.value)} />
                  </div>
                  <div>
                    <Label className="block mb-2">Obligations (₹)</Label>
                    <Input type="number" value={mainTab === "home" ? homeMonthlyObligations : carMonthlyObligations} onChange={(e) => mainTab === "home" ? setHomeMonthlyObligations(e.target.value) : setCarMonthlyObligations(e.target.value)} />
                  </div>
                  <div>
                    <Label className="block mb-2">Down Payment (₹)</Label>
                    <Input type="number" value={mainTab === "home" ? homeDownPayment : carDownPayment} onChange={(e) => mainTab === "home" ? setHomeDownPayment(e.target.value) : setCarDownPayment(e.target.value)} />
                  </div>
                  {mainTab === "car" && (
                    <div>
                      <Label className="block mb-2">Target Car Price (₹)</Label>
                      <Input type="number" value={carTargetPrice} onChange={(e) => setCarTargetPrice(e.target.value)} />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleReset} variant="outline" className="flex-1">Reset</Button>
                  <Button onClick={copySummary} className="flex-1 gap-2"><Copy className="w-4 h-4" /> Copy Summary</Button>
                </div>
              </div>

              {/* FOIR Chart */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-4">FOIR Capacity Utilization</h3>
                <div className="w-full bg-muted rounded-full h-4 overflow-hidden flex">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(activeResults.existingEmis / (activeResults.foirCapacity || 1)) * 100}%` }} title="Existing EMIs" />
                  <div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${(activeResults.maxEmiAllowed / (activeResults.foirCapacity || 1)) * 100}%` }} title="Eligible EMI" />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-primary rounded-full" /> Existing</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-400 rounded-full" /> Eligible</div>
                  <div>Limit: {activeResults.foirPercentage.toFixed(1)}% / 100%</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <AdSlot position="sidebar" />
          </div>
        </div>

        <AdSlot position="bottom" className="my-8" />
        <FAQSection title="Eligibility FAQ" items={allFaqs} />
      </main>
      <Footer />
    </div>
  );
}
