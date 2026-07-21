import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { formatINR } from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Plus, Trash2, RotateCcw, Copy, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const DEFAULT_FIXED_COSTS = [
  { label: "Office Rent", value: "" },
  { label: "Salaries", value: "" },
  { label: "Electricity", value: "" },
  { label: "Internet", value: "" },
  { label: "Software Subscriptions", value: "" },
  { label: "Warehouse Rent", value: "" },
  { label: "Insurance", value: "" },
  { label: "Transportation", value: "" },
  { label: "EMI / Loan Payments", value: "" },
  { label: "Miscellaneous", value: "" },
];

function PieChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;
  let cumulative = 0;
  const segments: { path: string; color: string; label: string; pct: number }[] = [];

  for (const sl of slices) {
    if (sl.value <= 0) continue;
    const pct = sl.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const endAngle = (cumulative + pct) * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const x1 = 50 + 40 * Math.cos(startAngle);
    const y1 = 50 + 40 * Math.sin(startAngle);
    const x2 = 50 + 40 * Math.cos(endAngle);
    const y2 = 50 + 40 * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    segments.push({
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: sl.color,
      label: sl.label,
      pct: Math.round(pct * 100),
    });
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-40 h-40 shrink-0">
        {segments.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="0.5" />
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {slices.filter(s => s.value > 0).map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="text-foreground font-medium ml-auto">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#3bb392" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Risky";
  const pct = score;
  return (
    <div className="flex items-center gap-4">
      <div className="relative inline-flex items-center justify-center w-24 h-24 shrink-0">
        <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/20" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={`${(pct / 100) * 251} 251`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">{Math.round(score)}</span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div>
        <p className="text-lg font-bold" style={{ color }}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Business Readiness</p>
      </div>
    </div>
  );
}

export default function BusinessStartupCalculator() {
  const [fixedCosts, setFixedCosts] = useState(DEFAULT_FIXED_COSTS.map(c => ({ ...c })));
  const [costPerUnit, setCostPerUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expectedRevenue, setExpectedRevenue] = useState("");
  const [marketingPct, setMarketingPct] = useState(15);
  const [gstPct, setGstPct] = useState(18);
  const [profitPerSale, setProfitPerSale] = useState("");
  const [unexpectedPct, setUnexpectedPct] = useState(10);
  const [copied, setCopied] = useState(false);

  function updateCost(i: number, val: string) {
    setFixedCosts(prev => prev.map((c, idx) => idx === i ? { ...c, value: val } : c));
  }
  function updateLabel(i: number, val: string) {
    setFixedCosts(prev => prev.map((c, idx) => idx === i ? { ...c, label: val } : c));
  }
  function addRow() {
    setFixedCosts(prev => [...prev, { label: "Custom Expense", value: "" }]);
  }
  function removeRow(i: number) {
    setFixedCosts(prev => prev.filter((_, idx) => idx !== i));
  }

  const results = useMemo(() => {
    const totalMonthly = fixedCosts.reduce((s, c) => s + (parseFloat(c.value) || 0), 0);
    const safetyBudget = totalMonthly * 6;
    const inventoryCost = (parseFloat(costPerUnit) || 0) * (parseFloat(quantity) || 0);
    const revNum = parseFloat(expectedRevenue) || 0;
    const marketingBudget = revNum * (marketingPct / 100);
    const gstBuffer = (safetyBudget + inventoryCost) * (gstPct / 100);
    const emergencyFund = totalMonthly * 6;
    const profitNum = parseFloat(profitPerSale) || 0;
    const monthlySales = profitNum > 0 && totalMonthly > 0 ? Math.ceil(totalMonthly / profitNum) : 0;
    const dailySales = monthlySales > 0 ? Math.ceil(monthlySales / 30) : 0;

    const subtotal = safetyBudget + inventoryCost + marketingBudget + gstBuffer + emergencyFund;
    const unexpectedExpense = subtotal * (unexpectedPct / 100);
    const totalCapital = subtotal + unexpectedExpense;

    // Readiness Score
    let score = 0;
    if (emergencyFund >= totalMonthly * 3) score += 25;
    else if (emergencyFund > 0) score += 10;
    if (marketingPct >= 10) score += 20;
    else if (marketingPct >= 5) score += 10;
    if (safetyBudget >= totalMonthly * 3) score += 20;
    else if (safetyBudget > 0) score += 10;
    if (monthlySales > 0 && monthlySales < 500) score += 20;
    else if (monthlySales === 0 && profitNum === 0) score += 0;
    if (unexpectedPct >= 5) score += 15;
    else if (unexpectedPct > 0) score += 8;

    // Tips
    const tips: { type: "warning" | "info" | "success"; text: string }[] = [];
    if (emergencyFund < totalMonthly * 3 && totalMonthly > 0)
      tips.push({ type: "warning", text: "Your emergency fund is low. Aim for at least 6 months of expenses." });
    if (marketingPct < 10)
      tips.push({ type: "warning", text: "A marketing budget below 10% may make it hard to acquire customers." });
    if (monthlySales > 200)
      tips.push({ type: "warning", text: "High break-even sales target. Consider reducing monthly costs or increasing margins." });
    if (unexpectedPct < 5)
      tips.push({ type: "info", text: "Add at least 5–10% buffer for unexpected expenses — they always happen." });
    if (totalCapital > 0 && marketingPct >= 10 && emergencyFund >= totalMonthly * 3)
      tips.push({ type: "success", text: "Good financial planning! You have a solid safety net and marketing budget." });
    if (gstBuffer > 0)
      tips.push({ type: "info", text: "Keep your GST buffer in a separate account — it's not your money to spend." });

    return {
      totalMonthly, safetyBudget, inventoryCost, marketingBudget, gstBuffer,
      emergencyFund, unexpectedExpense, totalCapital, monthlySales, dailySales, score, tips,
    };
  }, [fixedCosts, costPerUnit, quantity, expectedRevenue, marketingPct, gstPct, profitPerSale, unexpectedPct]);

  function reset() {
    setFixedCosts(DEFAULT_FIXED_COSTS.map(c => ({ ...c })));
    setCostPerUnit(""); setQuantity(""); setExpectedRevenue("");
    setMarketingPct(15); setGstPct(18); setProfitPerSale(""); setUnexpectedPct(10);
  }

  function copySummary() {
    const r = results;
    const lines = [
      "Business Startup Cost Summary",
      "================================",
      `Monthly Fixed Cost:    ${formatINR(r.totalMonthly)}`,
      `Safety Budget (6mo):   ${formatINR(r.safetyBudget)}`,
      `Inventory Cost:        ${formatINR(r.inventoryCost)}`,
      `Marketing Budget:      ${formatINR(r.marketingBudget)}`,
      `GST Buffer:            ${formatINR(r.gstBuffer)}`,
      `Emergency Fund:        ${formatINR(r.emergencyFund)}`,
      `Unexpected Expenses:   ${formatINR(r.unexpectedExpense)}`,
      "================================",
      `TOTAL STARTUP CAPITAL: ${formatINR(r.totalCapital)}`,
      `Break-even Sales/mo:   ${r.monthlySales} sales`,
      `Break-even Sales/day:  ${r.dailySales} sales`,
    ].join("\n");
    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pieSlices = [
    { label: "Safety Budget", value: results.safetyBudget, color: "#3bb392" },
    { label: "Inventory", value: results.inventoryCost, color: "#3486ba" },
    { label: "Marketing", value: results.marketingBudget, color: "#e1005d" },
    { label: "GST Buffer", value: results.gstBuffer, color: "#f59e0b" },
    { label: "Emergency Fund", value: results.emergencyFund, color: "#8b5cf6" },
    { label: "Unexpected", value: results.unexpectedExpense, color: "#ef4444" },
  ];

  const faqItems = [
    { question: "How much money do I need to start a business?", answer: "It depends on your industry, scale, and location. This calculator helps estimate your total capital by combining safety buffer (6 months expenses), inventory, marketing, GST reserve, emergency fund, and unexpected costs. Most small businesses need ₹2–20 lakhs to start." },
    { question: "What is a good emergency fund for a business?", answer: "Ideally, 3–6 months of monthly operating expenses. This protects you during slow months, delayed payments, or unexpected disruptions. Many businesses fail not from lack of customers but from running out of cash reserves." },
    { question: "How do I calculate break-even sales?", answer: "Break-even Sales = Monthly Fixed Costs ÷ Profit Per Sale. For example, if your monthly costs are ₹80,000 and you make ₹400 profit per sale, you need 200 sales/month to break even." },
    { question: "How much should I spend on marketing?", answer: "10–20% of expected monthly revenue is the general recommendation. New businesses often need to spend more aggressively (15–25%) to build awareness. Below 10% makes it hard to acquire customers consistently." },
    { question: "Why should I keep a GST buffer?", answer: "GST collected from customers must be paid to the government. Many businesses accidentally spend this money on operations, then face a tax liability crisis. Always keep GST funds separate and untouched." },
    { question: "Why do businesses fail due to cash flow?", answer: "A profitable business can still fail if it runs out of cash. Common causes: delayed customer payments, seasonal slow periods, unexpected expenses, over-investment in inventory, or underfunded emergency reserves. Proper planning prevents this." },
    { question: "What percentage should I keep for unexpected expenses?", answer: "5–15% of your total startup budget is recommended. Unexpected costs always arise — equipment failures, price hikes, regulatory fees, staff replacements, or market changes. A 10% buffer is a safe default." },
  ];

  const hasData = results.totalCapital > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Business Startup Cost Calculator – Calculate 360"
        description="Estimate your business startup cost, emergency fund, break-even sales, GST reserve, marketing budget, and total investment required before launching your business."
        path="/business-startup"
      />

      <main className="container mx-auto px-4 py-8 flex-grow max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Business Startup Cost Calculator</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Starting a business requires more than just buying products. Estimate your total startup capital, operating runway, marketing budget, emergency fund, and break-even sales.
          </p>
        </header>

        <div className="space-y-6">

          {/* Section 1: Fixed Monthly Costs */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
              Monthly Fixed Costs
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Enter your monthly operating expenses to calculate your safety budget and break-even point.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fixedCosts.map((cost, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={cost.label}
                      onChange={(e) => updateLabel(i, e.target.value)}
                      className="w-full text-xs text-muted-foreground bg-transparent border-0 p-0 mb-0.5 focus:outline-none focus:text-foreground"
                    />
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={cost.value}
                        onChange={(e) => updateCost(i, e.target.value)}
                        className="pl-6 h-8 text-sm"
                        data-testid={`input-cost-${i}`}
                      />
                    </div>
                  </div>
                  {i >= 10 && (
                    <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors mt-3">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addRow} className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Custom Expense
            </button>

            {results.totalMonthly > 0 && (
              <div className="mt-4 flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-sm font-medium text-foreground">Total Monthly Fixed Cost</span>
                <span className="text-lg font-bold text-primary" data-testid="text-total-monthly">{formatINR(results.totalMonthly)}</span>
              </div>
            )}
            {results.safetyBudget > 0 && (
              <div className="mt-2 p-3 bg-muted/30 rounded-xl border border-border text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Safety Budget: </span>
                <span className="text-primary font-bold">{formatINR(results.safetyBudget)}</span>
                <span className="ml-2">(6 months reserve — minimum needed to survive without revenue)</span>
              </div>
            )}
          </div>

          {/* Section 2: Inventory */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
              Product / Service Cost
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Include raw material, packaging, delivery, labour, platform fees, payment gateway, wastage, and manufacturing costs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block text-sm">Cost Per Product / Service (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" placeholder="e.g. 500" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} className="pl-7" data-testid="input-cost-per-unit" />
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-sm">Initial Quantity</Label>
                <Input type="number" placeholder="e.g. 200" value={quantity} onChange={(e) => setQuantity(e.target.value)} data-testid="input-quantity" />
              </div>
            </div>
            {results.inventoryCost > 0 && (
              <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20 flex justify-between items-center">
                <span className="text-sm font-medium">Initial Inventory Cost</span>
                <span className="text-lg font-bold text-primary" data-testid="text-inventory">{formatINR(results.inventoryCost)}</span>
              </div>
            )}
          </div>

          {/* Section 3: Marketing */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
              Marketing Budget
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <Label className="mb-1 block text-sm">Expected Monthly Revenue (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" placeholder="e.g. 200000" value={expectedRevenue} onChange={(e) => setExpectedRevenue(e.target.value)} className="pl-7" data-testid="input-revenue" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm">Marketing Budget %</Label>
                  <span className="text-sm font-bold text-primary">{marketingPct}%</span>
                </div>
                <input type="range" min={5} max={25} step={5} value={marketingPct} onChange={(e) => setMarketingPct(Number(e.target.value))} className="w-full accent-primary" data-testid="input-marketing-pct" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5% Low</span><span className="text-primary">10–20% Recommended</span><span>25% Aggressive</span>
                </div>
              </div>
            </div>
            {results.marketingBudget > 0 && (
              <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20 flex justify-between items-center">
                <span className="text-sm font-medium">Monthly Marketing Budget</span>
                <span className="text-lg font-bold text-primary" data-testid="text-marketing">{formatINR(results.marketingBudget)}</span>
              </div>
            )}
          </div>

          {/* Section 4: GST */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">4</span>
              GST / Tax Buffer
            </h2>
            <p className="text-sm text-muted-foreground mb-3">GST collected from customers must be paid to the government. Keep this amount separate.</p>
            <div className="max-w-xs">
              <Label className="mb-1 block text-sm">GST Rate (%)</Label>
              <Input type="number" placeholder="18" value={gstPct} onChange={(e) => setGstPct(Number(e.target.value))} data-testid="input-gst" />
            </div>
            {results.gstBuffer > 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-200 dark:border-amber-800 flex justify-between items-center">
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Suggested GST Reserve</span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-400" data-testid="text-gst">{formatINR(results.gstBuffer)}</span>
              </div>
            )}
          </div>

          {/* Section 5: Break-even */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">5</span>
              Break-even Calculator
            </h2>
            <p className="text-sm text-muted-foreground mb-3">How many sales do you need per month to cover all fixed costs?</p>
            <div className="max-w-xs">
              <Label className="mb-1 block text-sm">Profit Per Sale (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <Input type="number" placeholder="e.g. 400" value={profitPerSale} onChange={(e) => setProfitPerSale(e.target.value)} className="pl-7" data-testid="input-profit" />
              </div>
            </div>
            {results.monthlySales > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
                  <p className="text-2xl font-bold text-primary" data-testid="text-monthly-sales">{results.monthlySales}</p>
                  <p className="text-xs text-muted-foreground mt-1">Sales / Month</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl border border-border text-center">
                  <p className="text-2xl font-bold text-foreground" data-testid="text-daily-sales">{results.dailySales}</p>
                  <p className="text-xs text-muted-foreground mt-1">Sales / Day</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Emergency Fund */}
          {results.emergencyFund > 0 && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">6</span>
                Emergency Fund
              </h2>
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-xl border border-purple-200 dark:border-purple-800 mb-3">
                <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Emergency Fund (6 months)</span>
                <span className="text-lg font-bold text-purple-700 dark:text-purple-400" data-testid="text-emergency">{formatINR(results.emergencyFund)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Every business experiences slow months, delayed payments, refunds, equipment failures, and weak demand. An emergency fund lets you continue operating without financial stress.</p>
            </div>
          )}

          {/* Section 7: Total Capital */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">7</span>
              Total Startup Capital
            </h2>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Unexpected Expenses Buffer</Label>
                <span className="text-sm font-bold text-primary">{unexpectedPct}%</span>
              </div>
              <input type="range" min={0} max={20} step={5} value={unexpectedPct} onChange={(e) => setUnexpectedPct(Number(e.target.value))} className="w-full accent-primary" data-testid="input-unexpected-pct" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span><span>5%</span><span>10%</span><span>15%</span><span>20%</span>
              </div>
            </div>

            {hasData && (
              <>
                <div className="mt-5 space-y-2 text-sm">
                  {[
                    { label: "Safety Budget (6mo)", val: results.safetyBudget, color: "text-foreground" },
                    { label: "Inventory Cost", val: results.inventoryCost, color: "text-foreground" },
                    { label: "Marketing Budget", val: results.marketingBudget, color: "text-foreground" },
                    { label: "GST Buffer", val: results.gstBuffer, color: "text-foreground" },
                    { label: "Emergency Fund", val: results.emergencyFund, color: "text-foreground" },
                    { label: `Unexpected (${unexpectedPct}%)`, val: results.unexpectedExpense, color: "text-foreground" },
                  ].filter(r => r.val > 0).map((r, i) => (
                    <div key={i} className="flex justify-between text-muted-foreground border-b border-border/50 pb-1.5">
                      <span>{r.label}</span>
                      <span className="font-medium text-foreground">{formatINR(r.val)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-primary rounded-2xl text-white text-center">
                  <p className="text-sm opacity-80 mb-1">Estimated Total Startup Capital</p>
                  <p className="text-3xl font-bold" data-testid="text-total-capital">{formatINR(results.totalCapital)}</p>
                </div>
              </>
            )}
          </div>

          {/* Readiness Score + Tips */}
          {hasData && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <h2 className="font-semibold text-foreground mb-4">Business Readiness Score</h2>
              <ScoreGauge score={results.score} />

              {results.tips.length > 0 && (
                <div className="mt-5 space-y-2">
                  {results.tips.map((tip, i) => (
                    <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl text-sm ${
                      tip.type === "warning" ? "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800" :
                      tip.type === "success" ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800" :
                      "bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    }`}>
                      {tip.type === "warning" ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> :
                       tip.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> :
                       <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />}
                      {tip.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary Dashboard */}
          {hasData && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <h2 className="font-semibold text-foreground mb-4">Financial Summary Dashboard</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Monthly Fixed Cost", val: results.totalMonthly, highlight: false },
                  { label: "Safety Budget", val: results.safetyBudget, highlight: false },
                  { label: "Inventory Cost", val: results.inventoryCost, highlight: false },
                  { label: "Marketing Budget", val: results.marketingBudget, highlight: false },
                  { label: "GST Buffer", val: results.gstBuffer, highlight: false },
                  { label: "Emergency Fund", val: results.emergencyFund, highlight: false },
                  { label: "Unexpected Expenses", val: results.unexpectedExpense, highlight: false },
                  { label: "Total Startup Capital", val: results.totalCapital, highlight: true },
                  { label: "Break-even Sales/mo", val: results.monthlySales, highlight: false, isNum: true },
                  { label: "Sales Needed/day", val: results.dailySales, highlight: false, isNum: true },
                ].filter(item => (item.isNum ? item.val > 0 : item.val > 0)).map((item, i) => (
                  <div key={i} className={`rounded-xl p-3 border ${item.highlight ? "bg-primary text-white border-primary" : "bg-muted/30 border-border"}`}>
                    <p className={`text-xs mb-1 ${item.highlight ? "text-white/70" : "text-muted-foreground"}`}>{item.label}</p>
                    <p className={`font-bold text-sm ${item.highlight ? "text-white text-base" : "text-foreground"}`}>
                      {item.isNum ? `${item.val} sales` : formatINR(item.val)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pie Chart */}
              {results.totalCapital > 0 && (
                <div className="border-t border-border pt-5">
                  <p className="text-sm font-medium text-foreground mb-3">Budget Allocation</p>
                  <PieChart slices={pieSlices} />
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-all" data-testid="button-reset">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button onClick={copySummary} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-all" data-testid="button-copy">
                  <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Summary"}
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-sm text-primary hover:bg-primary/5 transition-all" data-testid="button-print">
                  🖨️ Print / Save PDF
                </button>
              </div>
            </div>
          )}

          {/* Educational section */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="font-semibold text-foreground mb-3">Before Starting Any Business</h2>
            <p className="text-sm text-muted-foreground mb-3">Every business should estimate the following before investing money:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {["Monthly Operating Cost", "Startup Inventory", "Marketing Budget", "GST Liability", "Break-even Sales", "Emergency Fund", "Unexpected Expenses"].map(item => (
                <div key={item} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted/20 rounded-xl border border-border text-xs text-muted-foreground italic">
              This calculator provides estimates based on your inputs. Actual costs may vary. Always consult a financial advisor before making large investments.
            </div>
          </div>

          <FAQSection title="Frequently Asked Questions" items={faqItems} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
