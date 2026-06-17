import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { formatINR } from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, RotateCcw, Copy, ChevronDown, ChevronUp } from "lucide-react";

function ScoreGauge({ score }: { score: number }) {
  const pct = Math.min(score, 100);
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Excellent Value" : score >= 50 ? "Fair Value" : "Poor Value";

  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${(pct / 100) * 314} 314`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground" data-testid="text-score">{Math.round(score)}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-semibold mt-1" style={{ color }}>{label}</p>
    </div>
  );
}

function calcScore(yieldPct: number, type: "residential" | "commercial"): number {
  if (type === "residential") {
    if (yieldPct <= 1) return 20;
    if (yieldPct <= 2.5) return 20 + (yieldPct - 1) / 1.5 * 30;
    if (yieldPct <= 3.5) return 50 + (yieldPct - 2.5) / 1.0 * 25;
    if (yieldPct >= 5) return 100;
    return 75 + (yieldPct - 3.5) / 1.5 * 25;
  } else {
    if (yieldPct <= 3) return 30;
    if (yieldPct <= 5.5) return 30 + (yieldPct - 3) / 2.5 * 45;
    if (yieldPct >= 8) return 100;
    return 75 + (yieldPct - 5.5) / 2.5 * 25;
  }
}

function VerdictCard({ yieldPct, type }: { yieldPct: number; type: "residential" | "commercial" }) {
  if (type === "residential") {
    if (yieldPct > 3.5) return (
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
        <span className="text-2xl">🟢</span>
        <div><p className="font-bold text-green-700 dark:text-green-400">Undervalued / Value for Money</p><p className="text-sm text-green-600 dark:text-green-500">The property appears attractively priced relative to the rental income generated.</p></div>
      </div>
    );
    if (yieldPct >= 2.5) return (
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
        <span className="text-2xl">🟡</span>
        <div><p className="font-bold text-amber-700 dark:text-amber-400">Fairly Priced</p><p className="text-sm text-amber-600 dark:text-amber-500">The property appears reasonably valued based on current rental income.</p></div>
      </div>
    );
    return (
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
        <span className="text-2xl">🔴</span>
        <div><p className="font-bold text-red-700 dark:text-red-400">Overpriced</p><p className="text-sm text-red-600 dark:text-red-500">The property appears expensive relative to the rental income it generates.</p></div>
      </div>
    );
  }
  if (yieldPct >= 5.5) return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
      <span className="text-2xl">🟢</span>
      <div><p className="font-bold text-green-700 dark:text-green-400">Attractive Investment</p><p className="text-sm text-green-600 dark:text-green-500">This commercial property meets the recommended rental yield benchmark.</p></div>
    </div>
  );
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
      <span className="text-2xl">🔴</span>
      <div><p className="font-bold text-red-700 dark:text-red-400">Below Recommended Yield</p><p className="text-sm text-red-600 dark:text-red-500">This commercial property may not provide sufficient rental returns.</p></div>
    </div>
  );
}

export default function PropertyValueCalculator() {
  const [propertyType, setPropertyType] = useState<"residential" | "commercial">("residential");
  const [price, setPrice] = useState("");
  const [rent, setRent] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tax, setTax] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [insurance, setInsurance] = useState("");
  const [vacancyRate, setVacancyRate] = useState("5");
  const [showComparison, setShowComparison] = useState(false);
  const [priceB, setPriceB] = useState("");
  const [rentB, setRentB] = useState("");
  const [copied, setCopied] = useState(false);

  const priceNum = parseFloat(price.replace(/,/g, "")) || 0;
  const rentNum = parseFloat(rent.replace(/,/g, "")) || 0;
  const taxNum = parseFloat(tax) || 0;
  const maintNum = parseFloat(maintenance) || 0;
  const insNum = parseFloat(insurance) || 0;
  const vacancyNum = parseFloat(vacancyRate) || 0;
  const priceBNum = parseFloat(priceB.replace(/,/g, "")) || 0;
  const rentBNum = parseFloat(rentB.replace(/,/g, "")) || 0;

  const results = useMemo(() => {
    if (priceNum <= 0 || rentNum <= 0) return null;
    const annualRent = rentNum * 12;
    const grossYield = (annualRent / priceNum) * 100;
    const score = calcScore(grossYield, propertyType);
    const vacancyLoss = annualRent * (vacancyNum / 100);
    const netAnnualIncome = annualRent - taxNum - maintNum - insNum - vacancyLoss;
    const netYield = (netAnnualIncome / priceNum) * 100;
    return { annualRent, grossYield, score, netAnnualIncome, netYield };
  }, [priceNum, rentNum, propertyType, taxNum, maintNum, insNum, vacancyNum]);

  const reverseCalc = useMemo(() => {
    if (rentNum <= 0) return null;
    const annualRent = rentNum * 12;
    if (propertyType === "residential") {
      return {
        headers: ["Category", "Target Yield", "Recommended Price"],
        rows: [
          { label: "Cheap / Excellent Buy", yield: "3.5%", value: annualRent / 0.035 },
          { label: "Fair Price", yield: "3.0%", value: annualRent / 0.03 },
          { label: "Overpriced Above", yield: "2.5%", value: annualRent / 0.025 },
        ],
      };
    } else {
      return {
        headers: ["Category", "Target Yield", "Recommended Price"],
        rows: [
          { label: "Attractive Investment", yield: "5.5%", value: annualRent / 0.055 },
          { label: "Minimum Acceptable", yield: "6.5%", value: annualRent / 0.065 },
          { label: "Excellent Return", yield: "8.0%", value: annualRent / 0.08 },
        ],
      };
    }
  }, [rentNum, propertyType]);

  const compB = useMemo(() => {
    if (priceBNum <= 0 || rentBNum <= 0) return null;
    const annualRent = rentBNum * 12;
    const grossYield = (annualRent / priceBNum) * 100;
    return { annualRent, grossYield, score: calcScore(grossYield, propertyType) };
  }, [priceBNum, rentBNum, propertyType]);

  function reset() {
    setPrice(""); setRent(""); setTax(""); setMaintenance(""); setInsurance(""); setVacancyRate("5");
    setPriceB(""); setRentB("");
  }

  function copyResults() {
    if (!results) return;
    const text = [
      `Property Value-for-Money Analysis`,
      `Type: ${propertyType === "residential" ? "Residential" : "Commercial"}`,
      `Property Price: ${formatINR(priceNum)}`,
      `Monthly Rent: ${formatINR(rentNum)}`,
      `Annual Rental Income: ${formatINR(results.annualRent)}`,
      `Gross Rental Yield: ${results.grossYield.toFixed(2)}%`,
      `Value-for-Money Score: ${Math.round(results.score)}/100`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyShareLink() {
    const url = new URL(window.location.href);
    url.pathname = "/property-value";
    url.search = `?price=${priceNum}&rent=${rentNum}&type=${propertyType}`;
    navigator.clipboard.writeText(url.toString());
  }

  function getRecommendation() {
    if (!results) return "";
    const y = results.grossYield.toFixed(1);
    if (propertyType === "residential") {
      if (results.grossYield > 3.5) return `Based on a rental yield of ${y}%, the property appears attractively priced relative to its rental income. This could represent good value for a long-term investor.`;
      if (results.grossYield >= 2.5) return `Based on a rental yield of ${y}%, the property appears fairly valued and provides reasonable rental returns for the investment.`;
      return `Based on a rental yield of ${y}%, the property appears overpriced. Investors may want to negotiate a lower purchase price or consider alternative properties with better yield.`;
    } else {
      if (results.grossYield >= 5.5) return `Based on a rental yield of ${y}%, this commercial property meets the recommended rental yield threshold and may represent an attractive investment.`;
      return `Based on a rental yield of ${y}%, this commercial property falls below the recommended 5.5% threshold. Consider renegotiating the price or looking for higher-yielding alternatives.`;
    }
  }

  const faqItems = [
    { question: "What is rental yield?", answer: "Rental yield is the annual rental income expressed as a percentage of the property's total purchase price. It helps investors quickly gauge how much income a property generates relative to its cost." },
    { question: "What is a good rental yield for residential property?", answer: "For residential property in India, a yield above 3.5% is considered undervalued/cheap, 2.5%–3.5% is fairly priced, and below 2.5% suggests the property may be overpriced." },
    { question: "What is a good rental yield for commercial property?", answer: "Commercial properties typically require a higher yield to justify their risk and illiquidity. A yield of 5.5% or above is generally considered attractive for commercial investments." },
    { question: "Can rental yield determine fair property value?", answer: "Rental yield is a useful valuation benchmark but should not be the sole criterion. It doesn't account for future capital appreciation, location premiums, property condition, or market demand." },
    { question: "Should I buy a property based only on rental yield?", answer: "No. Always consider the full picture: location, infrastructure development, property age, vacancy risk, financing costs, property taxes, and long-term capital appreciation potential alongside rental yield." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Property Value-for-Money Calculator – Calculate 360"
        description="Find out whether a property is overpriced, fairly priced, or undervalued using rental yield analysis. Compare properties, estimate fair value, and evaluate investment potential."
        path="/property-value"
      />

      <main className="container mx-auto px-4 py-8 flex-grow max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Property Value-for-Money Calculator</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Find out if a property is overpriced, fairly priced, or undervalued using rental yield as a valuation metric.
          </p>
        </header>

        <div className="space-y-6">
          {/* Input Card */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="font-semibold text-foreground mb-4">Property Details</h2>

            <div className="mb-5">
              <Label className="mb-2 block">Property Type</Label>
              <div className="flex gap-3">
                {(["residential", "commercial"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPropertyType(t)}
                    data-testid={`button-type-${t}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${propertyType === t ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    {t === "residential" ? "🏠 Residential" : "🏢 Commercial"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="mb-2 block">Property Purchase Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" placeholder="e.g. 30000000" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-7" data-testid="input-price" />
                </div>
                {price && priceNum > 0 && <p className="text-xs text-muted-foreground mt-1">{formatINR(priceNum)}</p>}
              </div>
              <div>
                <Label className="mb-2 block">Monthly Rental Income</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" placeholder="e.g. 100000" value={rent} onChange={(e) => setRent(e.target.value)} className="pl-7" data-testid="input-rent" />
                </div>
                {rent && rentNum > 0 && <p className="text-xs text-muted-foreground mt-1">{formatINR(rentNum)}</p>}
              </div>
            </div>

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="mt-5 flex items-center gap-2 text-sm text-primary font-medium" data-testid="button-toggle-advanced">
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvanced ? "Hide" : "Include"} Expenses (Net Yield)
            </button>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                {[
                  { label: "Annual Property Tax (₹)", val: tax, set: setTax, id: "tax" },
                  { label: "Annual Maintenance (₹)", val: maintenance, set: setMaintenance, id: "maintenance" },
                  { label: "Annual Insurance (₹)", val: insurance, set: setInsurance, id: "insurance" },
                ].map(({ label, val, set, id }) => (
                  <div key={id}>
                    <Label className="mb-1 block text-sm">{label}</Label>
                    <Input type="number" placeholder="0" value={val} onChange={(e) => set(e.target.value)} data-testid={`input-${id}`} />
                  </div>
                ))}
                <div>
                  <Label className="mb-1 block text-sm">Vacancy Rate (%)</Label>
                  <Input type="number" placeholder="5" value={vacancyRate} onChange={(e) => setVacancyRate(e.target.value)} data-testid="input-vacancy" />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all" data-testid="button-reset">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button onClick={copyResults} disabled={!results} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-40" data-testid="button-copy">
                <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Results"}
              </button>
              <button onClick={copyShareLink} disabled={!results} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-sm text-primary hover:bg-primary/5 transition-all disabled:opacity-40" data-testid="button-share">
                🔗 Share Link
              </button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <>
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
                <h2 className="font-semibold text-foreground mb-5">Value-for-Money Analysis</h2>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <ScoreGauge score={results.score} />

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 rounded-xl p-3 border border-border">
                        <p className="text-xs text-muted-foreground">Annual Rental Income</p>
                        <p className="text-lg font-bold text-foreground" data-testid="text-annual-rent">{formatINR(results.annualRent)}</p>
                      </div>
                      <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                        <p className="text-xs text-muted-foreground">Gross Rental Yield</p>
                        <p className="text-xl font-bold text-primary" data-testid="text-gross-yield">{results.grossYield.toFixed(2)}%</p>
                      </div>
                      {showAdvanced && (
                        <div className="bg-muted/30 rounded-xl p-3 border border-border col-span-2">
                          <p className="text-xs text-muted-foreground">Net Rental Yield (after expenses)</p>
                          <p className="text-lg font-bold text-foreground" data-testid="text-net-yield">{results.netYield.toFixed(2)}%</p>
                        </div>
                      )}
                    </div>

                    <VerdictCard yieldPct={results.grossYield} type={propertyType} />
                  </div>
                </div>

                <div className="mt-5 p-4 bg-muted/20 rounded-xl border border-border text-sm">
                  <p className="font-medium text-foreground mb-1">Investment Recommendation</p>
                  <p className="text-muted-foreground" data-testid="text-recommendation">{getRecommendation()}</p>
                </div>

                {showAdvanced && (
                  <div className="mt-4 p-4 bg-muted/20 rounded-xl border border-border text-sm">
                    <p className="font-medium text-foreground mb-2">Net Yield Breakdown</p>
                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex justify-between"><span>Annual Rent</span><span className="font-medium text-foreground">{formatINR(results.annualRent)}</span></div>
                      {taxNum > 0 && <div className="flex justify-between"><span>— Property Tax</span><span className="text-red-500">-{formatINR(taxNum)}</span></div>}
                      {maintNum > 0 && <div className="flex justify-between"><span>— Maintenance</span><span className="text-red-500">-{formatINR(maintNum)}</span></div>}
                      {insNum > 0 && <div className="flex justify-between"><span>— Insurance</span><span className="text-red-500">-{formatINR(insNum)}</span></div>}
                      <div className="flex justify-between"><span>— Vacancy ({vacancyNum}%)</span><span className="text-red-500">-{formatINR(results.annualRent * vacancyNum / 100)}</span></div>
                      <div className="flex justify-between font-medium text-foreground border-t border-border pt-1 mt-1"><span>Net Annual Income</span><span>{formatINR(results.netAnnualIncome)}</span></div>
                      <div className="flex justify-between font-medium text-foreground"><span>Gross Yield</span><span>{results.grossYield.toFixed(2)}%</span></div>
                      <div className="flex justify-between font-medium text-foreground"><span>Net Yield</span><span>{results.netYield.toFixed(2)}%</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reverse Valuation */}
              {reverseCalc && rentNum > 0 && (
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
                  <h2 className="font-semibold text-foreground mb-2">What Should This Property Be Worth?</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on monthly rent of {formatINR(rentNum)}, here is the recommended price range at different yield benchmarks:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {reverseCalc.headers.map((h) => <th key={h} className="text-left py-2 text-muted-foreground font-medium">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {reverseCalc.rows.map((row, i) => (
                          <tr key={i} className={i === 0 ? "font-medium" : ""}>
                            <td className="py-2 text-foreground">{row.label}</td>
                            <td className="py-2 text-muted-foreground">{row.yield}</td>
                            <td className="py-2 text-primary font-semibold">{formatINR(row.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Formula: Recommended Price = Annual Rent ÷ Target Yield
                  </p>
                </div>
              )}
            </>
          )}

          {/* Property Comparison */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <button onClick={() => setShowComparison(!showComparison)} className="flex items-center justify-between w-full" data-testid="button-toggle-comparison">
              <h2 className="font-semibold text-foreground">Compare Two Properties</h2>
              {showComparison ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {showComparison && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-4">Property A uses the inputs above. Enter Property B details below.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block text-sm">Property B — Price (₹)</Label>
                    <Input type="number" placeholder="e.g. 25000000" value={priceB} onChange={(e) => setPriceB(e.target.value)} data-testid="input-price-b" />
                  </div>
                  <div>
                    <Label className="mb-1 block text-sm">Property B — Monthly Rent (₹)</Label>
                    <Input type="number" placeholder="e.g. 120000" value={rentB} onChange={(e) => setRentB(e.target.value)} data-testid="input-rent-b" />
                  </div>
                </div>

                {results && compB && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                          <th className={`text-right py-2 font-medium ${results.grossYield >= compB.grossYield ? "text-primary" : "text-muted-foreground"}`}>Property A</th>
                          <th className={`text-right py-2 font-medium ${compB.grossYield > results.grossYield ? "text-primary" : "text-muted-foreground"}`}>Property B</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr><td className="py-2 text-muted-foreground">Price</td><td className="text-right py-2 font-medium">{formatINR(priceNum)}</td><td className="text-right py-2 font-medium">{formatINR(priceBNum)}</td></tr>
                        <tr><td className="py-2 text-muted-foreground">Annual Rent</td><td className="text-right py-2">{formatINR(results.annualRent)}</td><td className="text-right py-2">{formatINR(compB.annualRent)}</td></tr>
                        <tr>
                          <td className="py-2 text-muted-foreground">Gross Yield</td>
                          <td className={`text-right py-2 font-bold ${results.grossYield >= compB.grossYield ? "text-primary" : ""}`}>{results.grossYield.toFixed(2)}% {results.grossYield >= compB.grossYield ? "⭐" : ""}</td>
                          <td className={`text-right py-2 font-bold ${compB.grossYield > results.grossYield ? "text-primary" : ""}`}>{compB.grossYield.toFixed(2)}% {compB.grossYield > results.grossYield ? "⭐" : ""}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-muted-foreground">Score</td>
                          <td className={`text-right py-2 font-bold ${results.score >= compB.score ? "text-primary" : ""}`}>{Math.round(results.score)}/100</td>
                          <td className={`text-right py-2 font-bold ${compB.score > results.score ? "text-primary" : ""}`}>{Math.round(compB.score)}/100</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs text-muted-foreground mt-2">⭐ indicates the better investment based on rental yield</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formula */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">How It's Calculated</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
                <p>Annual Rent = Monthly Rent × 12</p>
                <p className="mt-1">Gross Rental Yield (%) = (Annual Rent ÷ Property Price) × 100</p>
                <p className="mt-1">Recommended Price = Annual Rent ÷ Target Yield</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Worked Example</p>
                <p>Monthly Rent = ₹1,00,000 | Property Price = ₹3,00,00,000</p>
                <p>Annual Rent = ₹1,00,000 × 12 = ₹12,00,000</p>
                <p>Gross Yield = (₹12,00,000 ÷ ₹3,00,00,000) × 100 = <strong className="text-primary">4.0%</strong> → Undervalued</p>
              </div>
              <div className="border-t border-border pt-3 text-xs">
                <p><strong>Residential:</strong> &gt;3.5% Undervalued • 2.5–3.5% Fair • &lt;2.5% Overpriced</p>
                <p className="mt-1"><strong>Commercial:</strong> ≥5.5% Attractive • &lt;5.5% Below Recommended Yield</p>
                <p className="mt-2 italic">Disclaimer: Rental yield is one valuation metric. Also consider location, future appreciation, maintenance, taxes, vacancy risk, and financing costs before investing.</p>
              </div>
            </div>
          </div>

          <FAQSection title="Frequently Asked Questions" items={faqItems} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
