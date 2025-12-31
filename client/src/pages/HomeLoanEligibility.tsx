import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Copy, Home } from "lucide-react";
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

  // Primary inputs
  const [monthlyIncome, setMonthlyIncome] = useState("75");
  const [existingEmis, setExistingEmis] = useState("0");
  const [interestRate, setInterestRate] = useState("7.5");
  const [tenure, setTenure] = useState("20");
  const [foirLimit, setFoirLimit] = useState("50");

  // Optional inputs
  const [coApplicantIncome, setCoApplicantIncome] = useState("");
  const [monthlyObligations, setMonthlyObligations] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [processingFeeType, setProcessingFeeType] = useState<"none" | "amount" | "percent">("none");
  const [processingFeeValue, setProcessingFeeValue] = useState("");

  // Parse inputs
  const incomeNum = parseFloat(monthlyIncome) || 0;
  const coIncomeNum = parseFloat(coApplicantIncome) || 0;
  const totalIncome = incomeNum + coIncomeNum;
  const existingEmisNum = parseFloat(existingEmis) || 0;
  const obligationsNum = parseFloat(monthlyObligations) || 0;
  const rateNum = parseFloat(interestRate) || 0;
  const tenureNum = parseFloat(tenure) || 0;
  const foirNum = parseFloat(foirLimit) || 50;
  const downPaymentNum = parseFloat(downPayment) || 0;

  const processingFeeAmount =
    processingFeeType === "amount"
      ? parseFloat(processingFeeValue) || 0
      : processingFeeType === "percent"
        ? (calculateMaxLoan(1, rateNum, tenureNum) * (parseFloat(processingFeeValue) || 0)) / 100
        : 0;

  // Eligibility calculations
  const maxEmiAllowed = useMemo(() => {
    if (totalIncome <= 0) return 0;
    const result = (totalIncome * foirNum) / 100 - existingEmisNum - obligationsNum;
    return Math.max(0, result);
  }, [totalIncome, foirNum, existingEmisNum, obligationsNum]);

  const maxLoanEligible = useMemo(() => {
    if (maxEmiAllowed <= 0 || tenureNum <= 0) return 0;
    return calculateMaxLoan(maxEmiAllowed, rateNum, tenureNum);
  }, [maxEmiAllowed, rateNum, tenureNum]);

  const affordablePropertyPrice = maxLoanEligible + downPaymentNum;

  // Total interest and payment for eligible loan
  const totalInterestOnEligible = useMemo(() => {
    if (rateNum === 0) return 0;
    const tenureMonths = tenureNum * 12;
    return maxEmiAllowed * tenureMonths - maxLoanEligible;
  }, [maxEmiAllowed, maxLoanEligible, rateNum, tenureNum]);

  const totalPaymentOnEligible = maxLoanEligible + totalInterestOnEligible;

  // FOIR gauge data
  const foirCapacity = (totalIncome * foirNum) / 100;
  const currentFoirUsed = existingEmisNum + maxEmiAllowed;
  const foirPercentage = foirCapacity > 0 ? (currentFoirUsed / foirCapacity) * 100 : 0;

  const handleReset = () => {
    setMonthlyIncome("75");
    setExistingEmis("0");
    setInterestRate("7.5");
    setTenure("20");
    setFoirLimit("50");
    setCoApplicantIncome("");
    setMonthlyObligations("");
    setDownPayment("");
    setProcessingFeeType("none");
    setProcessingFeeValue("");
  };

  const copySummary = () => {
    const summary = `Loan Eligibility Summary:
Max Eligible EMI: ${formatCurrency(maxEmiAllowed)}
Max Loan Amount: ${formatCurrency(maxLoanEligible)}
Affordable Property Price: ${formatCurrency(affordablePropertyPrice)}
Total Interest (estimate): ${formatCurrency(totalInterestOnEligible)}
Total Payment (estimate): ${formatCurrency(totalPaymentOnEligible)}

Note: This is an estimate. Banks may have different criteria.`;
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied",
      description: "Summary copied to clipboard",
    });
  };

  const faqs = [
    {
      question: "What is FOIR?",
      answer:
        "FOIR (Fixed Obligation to Income Ratio) is the percentage of your monthly income that can be used for loan EMIs. A 50% FOIR means you can allocate up to 50% of your income for all loan payments combined.",
    },
    {
      question: "How do existing EMIs affect my eligibility?",
      answer:
        "Your existing EMIs reduce your available capacity for a new loan. If you pay ₹10,000 for an existing car loan and your FOIR limit is 50% of ₹1,00,000 (₹50,000), your available capacity for a home loan EMI is ₹40,000.",
    },
    {
      question: "Does a longer tenure increase my eligibility?",
      answer:
        "Yes. A longer tenure (more years) reduces the monthly EMI for the same loan amount, allowing you to borrow more while staying within your FOIR limit. However, you'll pay more total interest.",
    },
    {
      question: "How accurate is this calculator?",
      answer:
        "This calculator provides an estimate based on standard FOIR criteria. Banks may have different norms, reserve funds requirements, and credit score considerations. Always consult your bank for precise eligibility.",
    },
    {
      question: "Can I include co-applicant income?",
      answer:
        "Yes. Co-applicant income (spouse, sibling, etc.) increases your total eligible loan amount. Enter their monthly income in the co-applicant field.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Calculator */}
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2 flex items-center gap-3">
                <Home className="w-8 h-8 text-primary" /> Home Loan Eligibility Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Estimate your maximum loan eligibility based on your income, EMIs, and FOIR limits.
              </p>
            </header>

            {/* Summary Cards */}
            {totalIncome > 0 && (
              <motion.div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="text-sm text-slate-600 mb-2">Max Eligible EMI</div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-700">
                    {maxEmiAllowed > 0 ? formatCurrency(maxEmiAllowed) : "Not Eligible"}
                  </div>
                  {maxEmiAllowed <= 0 && <div className="text-xs text-slate-600 mt-2">Review your inputs</div>}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="text-sm text-slate-600 mb-2">Max Loan Amount</div>
                  <div className="text-3xl md:text-4xl font-bold text-green-700">
                    {maxLoanEligible > 0 ? formatCurrency(maxLoanEligible) : "—"}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">{tenureNum} year(s) @ {rateNum}%</div>
                </div>

                {downPaymentNum > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="text-sm text-slate-600 mb-2">Affordable Property Price</div>
                    <div className="text-3xl md:text-4xl font-bold text-purple-700">
                      {affordablePropertyPrice > 0 ? formatCurrency(affordablePropertyPrice) : "—"}
                    </div>
                    <div className="text-xs text-slate-600 mt-2">Loan + Down payment</div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                  <div className="text-sm text-slate-600 mb-2">Total Interest (est.)</div>
                  <div className="text-3xl md:text-4xl font-bold text-orange-700">
                    {totalInterestOnEligible > 0 ? formatCurrency(totalInterestOnEligible) : "—"}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">Over {tenureNum} year(s)</div>
                </div>
              </motion.div>
            )}

            {/* Main Form */}
            <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <Tabs defaultValue="primary" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 rounded-lg p-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.2)'}}>
                  <TabsTrigger value="primary" className="rounded-md">Primary</TabsTrigger>
                  <TabsTrigger value="optional" className="rounded-md">Optional</TabsTrigger>
                  <TabsTrigger value="foir" className="rounded-md">FOIR Chart</TabsTrigger>
                </TabsList>

                {/* Primary Inputs */}
                <TabsContent value="primary" className="space-y-6">
                  <div className="flex justify-end mb-4">
                    <div className="flex items-center gap-2 text-sm rounded-lg border border-card-foreground/20 px-3 py-1" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
                      <span className="text-card-foreground/80">Decimals:</span>
                      {[0, 2].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDecimals(d)}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            decimals === d ? "bg-primary text-primary-foreground font-bold" : "text-card-foreground/60 hover:bg-card-foreground/20"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="block mb-2">Net Monthly Income (₹)</Label>
                    <Input
                      type="number"
                      placeholder="75,000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Existing Monthly EMIs (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={existingEmis}
                      onChange={(e) => setExistingEmis(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Annual Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="7.5"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Loan Tenure (Years)</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">FOIR / EMI-to-Income Limit</Label>
                    <Select value={foirLimit} onValueChange={setFoirLimit}>
                      <SelectTrigger className="text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40">Conservative (40%)</SelectItem>
                        <SelectItem value="50">Standard (50%)</SelectItem>
                        <SelectItem value="60">Aggressive (60%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleReset} variant="outline" className="w-full">
                    Reset
                  </Button>
                </TabsContent>

                {/* Optional Inputs */}
                <TabsContent value="optional" className="space-y-6">
                  <div>
                    <Label className="block mb-2">Co-applicant Monthly Income (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={coApplicantIncome}
                      onChange={(e) => setCoApplicantIncome(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Monthly Obligations (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={monthlyObligations}
                      onChange={(e) => setMonthlyObligations(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Down Payment (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Processing Fee</Label>
                    <div className="flex gap-2 mb-2">
                      {["none", "amount", "percent"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setProcessingFeeType(type as any)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            processingFeeType === type
                              ? "bg-primary text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {type === "none" ? "None" : type === "amount" ? "₹ Amount" : "% Percent"}
                        </button>
                      ))}
                    </div>
                    {processingFeeType !== "none" && (
                      <Input
                        type="number"
                        placeholder={processingFeeType === "amount" ? "0" : "0.5"}
                        value={processingFeeValue}
                        onChange={(e) => setProcessingFeeValue(e.target.value)}
                        className="text-lg"
                      />
                    )}
                  </div>
                </TabsContent>

                {/* FOIR Chart */}
                <TabsContent value="foir" className="space-y-6">
                  {totalIncome > 0 && (
                    <>
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-4">FOIR Utilization</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Capacity: {formatCurrency(foirCapacity)}</span>
                              <span>{foirPercentage.toFixed(0)}% used</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-green-500 to-orange-500 h-full transition-all duration-300"
                                style={{ width: `${Math.min(foirPercentage, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <div className="text-muted-foreground text-xs">Existing EMIs</div>
                              <div className="font-bold text-slate-900">{formatCurrency(existingEmisNum)}</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <div className="text-muted-foreground text-xs">New Eligible EMI</div>
                              <div className="font-bold text-slate-900">{formatCurrency(maxEmiAllowed)}</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <div className="text-muted-foreground text-xs">Total Used</div>
                              <div className="font-bold text-slate-900">{formatCurrency(currentFoirUsed)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">How FOIR Works</h4>
                        <p className="text-sm text-blue-800">
                          Your FOIR limit ({foirNum}%) allows {formatCurrency(foirCapacity)} per month for all EMIs. Subtracting
                          your existing EMIs ({formatCurrency(existingEmisNum)}) leaves {formatCurrency(maxEmiAllowed)} available for
                          your new home loan.
                        </p>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>

              {maxEmiAllowed > 0 && (
                <Button onClick={copySummary} variant="outline" className="w-full mt-6 gap-2">
                  <Copy className="w-4 h-4" /> Copy Summary
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AdSlot position="sidebar" />
          </div>
        </div>

        <AdSlot position="bottom" className="my-8" />

        {/* How Eligibility is Estimated */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8 my-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How Eligibility is Estimated</h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Understanding FOIR</h3>
              <p>
                FOIR (Fixed Obligation to Income Ratio) is a percentage of your monthly income that banks allow you to allocate towards
                loan EMIs. Banks use this to ensure you have enough income left for living expenses. Common FOIR limits are 40% (conservative), 50% (standard), or 60% (aggressive).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Impact of Existing EMIs</h3>
              <p>
                Your existing EMIs (car loans, personal loans, etc.) reduce your available capacity. If you have a 50% FOIR limit and
                ₹1,00,000 income, you can use ₹50,000 for all EMIs combined. If you already pay ₹15,000 for other loans, only ₹35,000
                is available for your home loan EMI.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Tenure and Interest Rate Effects</h3>
              <p>
                A longer tenure reduces your monthly EMI for the same loan amount. For example, a ₹50 lakh loan at 7.5% costs ₹47,743
                per month for 20 years but only ₹35,817 for 30 years. This allows you to borrow more within your FOIR limit, but you'll
                pay more total interest.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold text-yellow-900">
                ⚠️ Disclaimer: This is an estimate for reference only. Actual eligibility varies by bank based on credit score, property
                value, employment type, and other factors. Always consult your lender for precise approval.
              </p>
            </div>
          </div>
        </div>

        {/* Tips to Improve Eligibility */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8 my-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Tips to Improve Your Eligibility</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary font-bold flex-shrink-0">1.</span>
              <span>
                <strong>Reduce existing EMIs:</strong> Clearing your car loan or personal loan before applying reduces your FOIR burden
                and increases available capacity.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold flex-shrink-0">2.</span>
              <span>
                <strong>Increase down payment:</strong> A larger down payment reduces the loan amount you need, making approval easier
                and reducing interest costs.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold flex-shrink-0">3.</span>
              <span>
                <strong>Longer tenure:</strong> Extending the loan period reduces monthly EMI. However, this increases total interest
                paid—balance this carefully.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold flex-shrink-0">4.</span>
              <span>
                <strong>Add a co-applicant:</strong> A spouse or family member with additional income increases your total eligibility
                significantly.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold flex-shrink-0">5.</span>
              <span>
                <strong>Improve credit score:</strong> A higher credit score can help you negotiate better interest rates, reducing your
                EMI burden.
              </span>
            </li>
          </ul>
        </div>

        <FAQSection title="Frequently Asked Questions" items={faqs} />
      </main>

      <Footer />
    </div>
  );
}
