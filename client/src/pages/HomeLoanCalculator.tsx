import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CalculatorResult } from "@/components/CalculatorResult";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Copy, Download, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  closingBalance: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateEMI(principal: number, annualRate: number, monthlyTenure: number): number {
  if (annualRate === 0) return principal / monthlyTenure;
  const monthlyRate = annualRate / 100 / 12;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, monthlyTenure);
  const denominator = Math.pow(1 + monthlyRate, monthlyTenure) - 1;
  return numerator / denominator;
}

function generateAmortization(principal: number, annualRate: number, monthlyTenure: number, emi: number): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const monthlyRate = annualRate === 0 ? 0 : annualRate / 100 / 12;
  let balance = principal;

  for (let month = 1; month <= monthlyTenure; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    const closingBalance = Math.max(0, balance - principalPaid);

    schedule.push({
      month,
      openingBalance: balance,
      emi: emi,
      principal: principalPaid,
      interest: interest,
      closingBalance: closingBalance,
    });

    balance = closingBalance;
  }

  return schedule;
}

export default function HomeLoanCalculator() {
  const { toast } = useToast();
  const [decimals, setDecimals] = useState(2);
  const [principal, setPrincipal] = useState("50");
  const [annualRate, setAnnualRate] = useState("7.5");
  const [tenureYears, setTenureYears] = useState("");
  const [tenureMonths, setTenureMonths] = useState("300");
  const [tenureMode, setTenureMode] = useState<"years" | "months">("months");
  const [processingFeeType, setProcessingFeeType] = useState<"amount" | "percent" | "none">("none");
  const [processingFeeValue, setProcessingFeeValue] = useState("");
  const [showAllMonths, setShowAllMonths] = useState(false);

  const principalNum = parseFloat(principal) || 0;
  const rateNum = parseFloat(annualRate) || 0;
  const tenureMonthsNum =
    tenureMode === "years"
      ? (parseFloat(tenureYears) || 0) * 12
      : (parseFloat(tenureMonths) || 0);

  const processingFeeAmount =
    processingFeeType === "amount"
      ? parseFloat(processingFeeValue) || 0
      : processingFeeType === "percent"
        ? (principalNum * (parseFloat(processingFeeValue) || 0)) / 100
        : 0;

  const emi = principalNum && rateNum > 0 && tenureMonthsNum > 0 ? calculateEMI(principalNum, rateNum, tenureMonthsNum) : 0;
  const totalInterest = tenureMonthsNum > 0 ? emi * tenureMonthsNum - principalNum : 0;
  const totalPayment = principalNum + totalInterest;
  const effectiveTotal = totalPayment + processingFeeAmount;

  const amortization = useMemo(() => {
    if (principalNum && tenureMonthsNum > 0) {
      return generateAmortization(principalNum, rateNum, tenureMonthsNum, emi);
    }
    return [];
  }, [principalNum, rateNum, tenureMonthsNum, emi]);

  const displayMonths = showAllMonths ? amortization : amortization.slice(0, 12);

  const downloadCSV = () => {
    if (amortization.length === 0) return;

    const headers = ["Month", "Opening Balance", "EMI", "Principal", "Interest", "Closing Balance"];
    const rows = amortization.map((row) => [
      row.month,
      row.openingBalance.toFixed(2),
      row.emi.toFixed(2),
      row.principal.toFixed(2),
      row.interest.toFixed(2),
      row.closingBalance.toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "home_loan_amortization.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Amortization schedule downloaded as CSV",
    });
  };

  const copyEMI = () => {
    navigator.clipboard.writeText(emi.toFixed(decimals));
    toast({
      title: "Copied",
      description: `₹${formatCurrency(emi)} copied to clipboard`,
    });
  };

  const handleReset = () => {
    setPrincipal("50");
    setAnnualRate("7.5");
    setTenureYears("");
    setTenureMonths("300");
    setProcessingFeeType("none");
    setProcessingFeeValue("");
  };

  const faqs = [
    {
      question: "What is EMI?",
      answer:
        "EMI (Equated Monthly Installment) is a fixed payment made towards a loan each month. It consists of both principal and interest components.",
    },
    {
      question: "How is home loan interest calculated?",
      answer:
        "Interest is typically calculated on a reducing balance basis. As you pay down the principal, the interest component decreases each month.",
    },
    {
      question: "What is a processing fee?",
      answer:
        "A processing fee is a one-time charge imposed by lenders for processing your loan application. It can be a fixed amount or a percentage of the loan amount.",
    },
    {
      question: "Can I prepay my home loan?",
      answer:
        "Yes, most lenders allow prepayment. Check if there are any penalties. Prepayment can significantly reduce the total interest paid.",
    },
    {
      question: "What does LTV mean?",
      answer:
        "LTV (Loan-to-Value) is the ratio of the loan amount to the property value. Lower LTV typically means lower risk for the lender.",
    },
  ];

  // Pie chart for principal vs interest
  const totalForChart = principalNum + totalInterest;
  const principalPercent = totalForChart > 0 ? (principalNum / totalForChart) * 100 : 0;
  const interestPercent = totalForChart > 0 ? (totalInterest / totalForChart) * 100 : 0;

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
                <Home className="w-8 h-8 text-primary" /> Home Loan EMI Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Calculate your monthly EMI, total interest, and view amortization schedule for your home loan.
              </p>
            </header>

            <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <Tabs defaultValue="inputs" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 rounded-lg p-1" style={{backgroundColor: 'rgba(0, 0, 0, 0.2)'}}>
                  <TabsTrigger value="inputs" className="rounded-md">Inputs</TabsTrigger>
                  <TabsTrigger value="results" className="rounded-md">Results</TabsTrigger>
                  <TabsTrigger value="schedule" className="rounded-md">Schedule</TabsTrigger>
                </TabsList>

                {/* Inputs Tab */}
                <TabsContent value="inputs" className="space-y-6">
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

                  {/* Loan Amount */}
                  <div>
                    <Label className="block mb-2">Loan Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="50,00,000"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <Label className="block mb-2">Annual Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="7.5"
                      value={annualRate}
                      onChange={(e) => setAnnualRate(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  {/* Tenure */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Tenure</Label>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${tenureMode === "months" ? "text-primary font-bold" : "text-muted-foreground"}`}>
                          Months
                        </span>
                        <Switch
                          checked={tenureMode === "years"}
                          onCheckedChange={(checked) => setTenureMode(checked ? "years" : "months")}
                        />
                        <span className={`text-sm ${tenureMode === "years" ? "text-primary font-bold" : "text-muted-foreground"}`}>
                          Years
                        </span>
                      </div>
                    </div>
                    <Input
                      type="number"
                      placeholder={tenureMode === "years" ? "25" : "300"}
                      value={tenureMode === "years" ? tenureYears : tenureMonths}
                      onChange={(e) => (tenureMode === "years" ? setTenureYears(e.target.value) : setTenureMonths(e.target.value))}
                      className="text-lg"
                    />
                  </div>

                  {/* Processing Fee */}
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

                  <Button onClick={handleReset} variant="outline" className="w-full">
                    Reset
                  </Button>
                </TabsContent>

                {/* Results Tab */}
                <TabsContent value="results" className="space-y-6">
                  <motion.div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                      <div className="text-sm text-slate-600 mb-2">Monthly EMI</div>
                      <div className="text-3xl md:text-4xl font-bold text-blue-700">
                        {emi > 0 ? formatCurrency(emi) : "—"}
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        EMI = P × r × (1+r)^n / ((1+r)^n − 1)
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                      <div className="text-sm text-slate-600 mb-2">Total Interest</div>
                      <div className="text-3xl md:text-4xl font-bold text-green-700">
                        {totalInterest > 0 ? formatCurrency(totalInterest) : "—"}
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        Over {tenureMonthsNum} months
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                      <div className="text-sm text-slate-600 mb-2">Total Payment</div>
                      <div className="text-3xl md:text-4xl font-bold text-purple-700">
                        {totalPayment > 0 ? formatCurrency(totalPayment) : "—"}
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        Principal + Interest
                      </div>
                    </div>

                    {processingFeeAmount > 0 && (
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                        <div className="text-sm text-slate-600 mb-2">With Processing Fee</div>
                        <div className="text-3xl md:text-4xl font-bold text-orange-700">
                          {formatCurrency(effectiveTotal)}
                        </div>
                        <div className="text-xs text-slate-600 mt-2">
                          Fee: {formatCurrency(processingFeeAmount)}
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Chart: Principal vs Interest */}
                  {totalForChart > 0 && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-4">Principal vs Interest Breakdown</h3>
                      <div className="flex items-center justify-center gap-8">
                        <svg width="150" height="150" viewBox="0 0 150 150" className="flex-shrink-0">
                          <circle cx="75" cy="75" r="60" fill="none" stroke="#e2e8f0" strokeWidth="20" />
                          <circle
                            cx="75"
                            cy="75"
                            r="60"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="20"
                            strokeDasharray={`${(principalPercent / 100) * 376.99} 376.99`}
                            strokeDashoffset="0"
                            style={{ transition: "stroke-dasharray 0.3s" }}
                          />
                          <circle
                            cx="75"
                            cy="75"
                            r="60"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="20"
                            strokeDasharray={`${(interestPercent / 100) * 376.99} 376.99`}
                            strokeDashoffset={`-${(principalPercent / 100) * 376.99}`}
                            style={{ transition: "stroke-dasharray 0.3s" }}
                          />
                        </svg>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="text-sm">Principal: {principalPercent.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-sm">Interest: {interestPercent.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={copyEMI} variant="outline" className="flex-1 gap-2">
                      <Copy className="w-4 h-4" /> Copy EMI
                    </Button>
                  </div>
                </TabsContent>

                {/* Amortization Tab */}
                <TabsContent value="schedule" className="space-y-4">
                  {amortization.length > 0 ? (
                    <>
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-100 border-b">
                            <tr>
                              <th className="px-4 py-2 text-left">Month</th>
                              <th className="px-4 py-2 text-right">Opening Balance</th>
                              <th className="px-4 py-2 text-right">EMI</th>
                              <th className="px-4 py-2 text-right">Principal</th>
                              <th className="px-4 py-2 text-right">Interest</th>
                              <th className="px-4 py-2 text-right">Closing Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayMonths.map((row, idx) => (
                              <tr key={idx} className="border-b hover:bg-slate-50">
                                <td className="px-4 py-2 font-medium">{row.month}</td>
                                <td className="px-4 py-2 text-right text-xs">{formatCurrency(row.openingBalance)}</td>
                                <td className="px-4 py-2 text-right text-xs font-semibold">{formatCurrency(row.emi)}</td>
                                <td className="px-4 py-2 text-right text-xs text-blue-600">{formatCurrency(row.principal)}</td>
                                <td className="px-4 py-2 text-right text-xs text-green-600">{formatCurrency(row.interest)}</td>
                                <td className="px-4 py-2 text-right text-xs">{formatCurrency(row.closingBalance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {!showAllMonths && amortization.length > 12 && (
                        <Button onClick={() => setShowAllMonths(true)} variant="outline" className="w-full">
                          Show All {amortization.length} Months
                        </Button>
                      )}

                      <Button onClick={downloadCSV} variant="outline" className="w-full gap-2">
                        <Download className="w-4 h-4" /> Download CSV
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">Enter loan details to view amortization schedule</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <AdSlot position="sidebar" />
          </div>
        </div>

        <AdSlot position="bottom" className="my-8" />

        {/* How it Works */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8 my-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong>EMI Calculation:</strong> We use the standard formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the principal
              amount, r is the monthly interest rate, and n is the tenure in months.
            </p>
            <p>
              <strong>Amortization Schedule:</strong> This shows how your monthly payment is split between principal and interest. Over time, you
              pay more principal and less interest.
            </p>
            <p>
              <strong>Processing Fee:</strong> A one-time fee charged by the lender. It can be a fixed amount or a percentage of the loan.
            </p>
          </div>
        </div>

        <FAQSection title="Frequently Asked Questions" items={faqs} />
      </main>

      <Footer />
    </div>
  );
}
