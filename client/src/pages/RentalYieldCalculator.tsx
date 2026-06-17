import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { formatINR } from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, TrendingUp, RotateCcw, Copy, ChevronDown, ChevronUp } from "lucide-react";

function YieldGauge({ yield: yieldPct, type }: { yield: number; type: "residential" | "commercial" }) {
  const zones = type === "residential"
    ? [
        { label: "Poor", max: 2.5, color: "#ef4444" },
        { label: "Fair", max: 3.5, color: "#f59e0b" },
        { label: "Excellent", max: 8, color: "#22c55e" },
      ]
    : [
        { label: "Low", max: 5.5, color: "#ef4444" },
        { label: "Attractive", max: 12, color: "#22c55e" },
      ];

  const maxYield = type === "residential" ? 8 : 12;
  const clampedYield = Math.min(yieldPct, maxYield);
  const pct = (clampedYield / maxYield) * 100;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>0%</span>
        {type === "residential" ? <><span>2.5%</span><span>3.5%</span></> : <span>5.5%</span>}
        <span>{maxYield}%+</span>
      </div>
      <div className="relative h-4 rounded-full overflow-hidden flex">
        {zones.map((z, i) => {
          const prev = i === 0 ? 0 : zones[i - 1].max;
          const width = ((z.max - prev) / maxYield) * 100;
          return <div key={i} style={{ width: `${width}%`, backgroundColor: z.color, opacity: 0.25 }} />;
        })}
        <div
          className="absolute top-0 bottom-0 w-1 rounded-full bg-foreground shadow"
          style={{ left: `calc(${pct}% - 2px)`, transition: "left 0.4s ease" }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        {zones.map((z) => (
          <span key={z.label} style={{ color: z.color }} className="font-medium">{z.label}</span>
        ))}
      </div>
    </div>
  );
}

function RatingBadge({ yield: yieldPct, type }: { yield: number; type: "residential" | "commercial" }) {
  if (type === "residential") {
    if (yieldPct > 3.5) return <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"><span className="text-xl">✅</span><div><p className="font-bold text-green-700 dark:text-green-400">Cheap Property</p><p className="text-xs text-green-600 dark:text-green-500">Good value based on rental income.</p></div></div>;
    if (yieldPct >= 2.5) return <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800"><span className="text-xl">🟢</span><div><p className="font-bold text-amber-700 dark:text-amber-400">Fairly Priced</p><p className="text-xs text-amber-600 dark:text-amber-500">Property appears reasonably valued.</p></div></div>;
    return <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"><span className="text-xl">🔴</span><div><p className="font-bold text-red-700 dark:text-red-400">Expensive Property</p><p className="text-xs text-red-600 dark:text-red-500">Property may be overpriced relative to rental income.</p></div></div>;
  }
  if (yieldPct >= 5.5) return <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"><span className="text-xl">✅</span><div><p className="font-bold text-green-700 dark:text-green-400">Attractive Investment</p><p className="text-xs text-green-600 dark:text-green-500">Commercial property meets the recommended rental yield threshold.</p></div></div>;
  return <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800"><span className="text-xl">⚠️</span><div><p className="font-bold text-amber-700 dark:text-amber-400">Low Rental Yield</p><p className="text-xs text-amber-600 dark:text-amber-500">Commercial property may not generate sufficient rental returns.</p></div></div>;
}

export default function RentalYieldCalculator() {
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
    const vacancyLoss = annualRent * (vacancyNum / 100);
    const netAnnualIncome = annualRent - taxNum - maintNum - insNum - vacancyLoss;
    const netYield = (netAnnualIncome / priceNum) * 100;
    return { annualRent, grossYield, netAnnualIncome, netYield };
  }, [priceNum, rentNum, taxNum, maintNum, insNum, vacancyNum]);

  const comparisonB = useMemo(() => {
    if (priceBNum <= 0 || rentBNum <= 0) return null;
    const annualRent = rentBNum * 12;
    const grossYield = (annualRent / priceBNum) * 100;
    return { annualRent, grossYield };
  }, [priceBNum, rentBNum]);

  const comparisonA = useMemo(() => {
    if (!results) return null;
    return { annualRent: results.annualRent, grossYield: results.grossYield };
  }, [results]);

  function reset() {
    setPrice(""); setRent(""); setTax(""); setMaintenance(""); setInsurance(""); setVacancyRate("5");
    setPriceB(""); setRentB("");
  }

  function copyResults() {
    if (!results) return;
    const text = [
      `Rental Yield Analysis`,
      `Property Type: ${propertyType === "residential" ? "Residential" : "Commercial"}`,
      `Property Price: ${formatINR(priceNum)}`,
      `Monthly Rent: ${formatINR(rentNum)}`,
      `Annual Rental Income: ${formatINR(results.annualRent)}`,
      `Gross Rental Yield: ${results.grossYield.toFixed(2)}%`,
      showAdvanced ? `Net Rental Yield: ${results.netYield.toFixed(2)}%` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyShareLink() {
    const url = new URL(window.location.href);
    url.pathname = "/rental-yield";
    url.search = `?price=${priceNum}&rent=${rentNum}&type=${propertyType}`;
    navigator.clipboard.writeText(url.toString());
  }

  const faqItems = [
    { question: "What is Gross Rental Yield?", answer: "Gross Rental Yield is the annual rental income expressed as a percentage of the property's purchase price. It's a quick way to compare the income-generating potential of different properties." },
    { question: "What is a good rental yield for residential property?", answer: "For residential properties in India, a yield above 3.5% is considered excellent value, 2.5%–3.5% is fairly priced, and below 2.5% suggests the property may be overpriced relative to its rental income." },
    { question: "What is a good rental yield for commercial property?", answer: "For commercial properties, a rental yield of 5.5% or above is generally considered attractive. Below 5.5% may indicate insufficient rental returns for the investment risk." },
    { question: "What is the difference between Gross Yield and Net Yield?", answer: "Gross Yield is calculated using the total rental income before expenses. Net Yield deducts property tax, maintenance, insurance, and vacancy losses to give a more realistic picture of actual returns." },
    { question: "Should I buy a property based only on rental yield?", answer: "No. Rental yield is one important metric, but you should also consider location, future capital appreciation potential, vacancy risk, financing costs, and local market conditions before making an investment decision." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Rental Yield Calculator – Calculate 360"
        description="Calculate Gross and Net Rental Yield instantly. Evaluate residential and commercial property investments based on rental income and purchase price."
        path="/rental-yield"
      />

      <main className="container mx-auto px-4 py-8 flex-grow max-w-4xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Rental Yield Calculator</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Evaluate whether a property is fairly priced based on its rental income. Supports residential and commercial properties.
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
                  <Input
                    type="number"
                    placeholder="e.g. 5000000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7"
                    data-testid="input-price"
                  />
                </div>
                {price && priceNum > 0 && <p className="text-xs text-muted-foreground mt-1">{formatINR(priceNum)}</p>}
              </div>
              <div>
                <Label className="mb-2 block">Monthly Rent</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input
                    type="number"
                    placeholder="e.g. 15000"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    className="pl-7"
                    data-testid="input-rent"
                  />
                </div>
                {rent && rentNum > 0 && <p className="text-xs text-muted-foreground mt-1">{formatINR(rentNum)}</p>}
              </div>
            </div>

            {/* Advanced toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mt-5 flex items-center gap-2 text-sm text-primary font-medium"
              data-testid="button-toggle-advanced"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvanced ? "Hide" : "Include"} Ownership Costs (Net Yield)
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
              <button onClick={copyResults} disabled={!results} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-40" data-testid="button-copy-results">
                <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Results"}
              </button>
              <button onClick={copyShareLink} disabled={!results} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-sm text-primary hover:bg-primary/5 transition-all disabled:opacity-40" data-testid="button-share">
                🔗 Share Link
              </button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Rental Yield Analysis</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Annual Rental Income</p>
                  <p className="text-xl font-bold text-foreground" data-testid="text-annual-rent">{formatINR(results.annualRent)}</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Gross Rental Yield</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-gross-yield">{results.grossYield.toFixed(2)}%</p>
                </div>
                {showAdvanced && (
                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Net Rental Yield</p>
                    <p className="text-xl font-bold text-foreground" data-testid="text-net-yield">{results.netYield.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground">After expenses</p>
                  </div>
                )}
              </div>

              <RatingBadge yield={results.grossYield} type={propertyType} />
              <YieldGauge yield={results.grossYield} type={propertyType} />

              {showAdvanced && (
                <div className="mt-4 p-4 bg-muted/20 rounded-xl border border-border text-sm">
                  <p className="font-medium text-foreground mb-2">Net Yield Breakdown</p>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between"><span>Annual Rent</span><span className="text-foreground font-medium">{formatINR(results.annualRent)}</span></div>
                    {taxNum > 0 && <div className="flex justify-between"><span>— Property Tax</span><span className="text-red-500">-{formatINR(taxNum)}</span></div>}
                    {maintNum > 0 && <div className="flex justify-between"><span>— Maintenance</span><span className="text-red-500">-{formatINR(maintNum)}</span></div>}
                    {insNum > 0 && <div className="flex justify-between"><span>— Insurance</span><span className="text-red-500">-{formatINR(insNum)}</span></div>}
                    <div className="flex justify-between"><span>— Vacancy ({vacancyNum}%)</span><span className="text-red-500">-{formatINR(results.annualRent * vacancyNum / 100)}</span></div>
                    <div className="flex justify-between font-medium text-foreground border-t border-border pt-1 mt-1"><span>Net Annual Income</span><span>{formatINR(results.netAnnualIncome)}</span></div>
                  </div>
                </div>
              )}

              <div className="mt-5 p-4 bg-muted/20 rounded-xl border border-border text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Investment Summary</p>
                <p>
                  Based on the current rental income, this {propertyType} property at {formatINR(priceNum)} with a monthly rent of {formatINR(rentNum)} generates a gross rental yield of{" "}
                  <span className="text-primary font-semibold">{results.grossYield.toFixed(2)}%</span>.{" "}
                  {propertyType === "residential"
                    ? results.grossYield > 3.5 ? "This represents good value relative to the purchase price."
                      : results.grossYield >= 2.5 ? "The property appears reasonably priced."
                      : "The property may be overpriced relative to the rental income it generates."
                    : results.grossYield >= 5.5 ? "This meets the recommended commercial rental yield threshold."
                      : "This falls below the recommended 5.5% commercial yield benchmark."}
                </p>
              </div>
            </div>
          )}

          {/* Property Comparison */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center justify-between w-full"
              data-testid="button-toggle-comparison"
            >
              <h2 className="font-semibold text-foreground">Compare Two Properties</h2>
              {showComparison ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {showComparison && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-4">Property A uses the inputs above. Enter Property B details below.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block text-sm">Property B — Price (₹)</Label>
                    <Input type="number" placeholder="e.g. 6000000" value={priceB} onChange={(e) => setPriceB(e.target.value)} data-testid="input-price-b" />
                  </div>
                  <div>
                    <Label className="mb-1 block text-sm">Property B — Monthly Rent (₹)</Label>
                    <Input type="number" placeholder="e.g. 18000" value={rentB} onChange={(e) => setRentB(e.target.value)} data-testid="input-rent-b" />
                  </div>
                </div>

                {comparisonA && comparisonB && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                          <th className={`text-right py-2 font-medium ${comparisonA.grossYield >= comparisonB.grossYield ? "text-primary" : "text-muted-foreground"}`}>Property A</th>
                          <th className={`text-right py-2 font-medium ${comparisonB.grossYield > comparisonA.grossYield ? "text-primary" : "text-muted-foreground"}`}>Property B</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="py-2 text-muted-foreground">Property Price</td>
                          <td className="text-right py-2 font-medium">{formatINR(priceNum)}</td>
                          <td className="text-right py-2 font-medium">{formatINR(priceBNum)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-muted-foreground">Annual Rent</td>
                          <td className="text-right py-2">{formatINR(comparisonA.annualRent)}</td>
                          <td className="text-right py-2">{formatINR(comparisonB.annualRent)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-muted-foreground">Gross Yield</td>
                          <td className={`text-right py-2 font-bold ${comparisonA.grossYield >= comparisonB.grossYield ? "text-primary" : ""}`}>{comparisonA.grossYield.toFixed(2)}% {comparisonA.grossYield >= comparisonB.grossYield ? "⭐" : ""}</td>
                          <td className={`text-right py-2 font-bold ${comparisonB.grossYield > comparisonA.grossYield ? "text-primary" : ""}`}>{comparisonB.grossYield.toFixed(2)}% {comparisonB.grossYield > comparisonA.grossYield ? "⭐" : ""}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs text-muted-foreground mt-2">⭐ indicates the higher rental yield (better income relative to price)</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* How it's calculated */}
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h2 className="font-semibold text-foreground mb-4">How It's Calculated</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
                <p>Annual Rent = Monthly Rent × 12</p>
                <p className="mt-1">Gross Rental Yield (%) = (Annual Rent ÷ Property Price) × 100</p>
                <p className="mt-1">Net Yield (%) = (Net Annual Income ÷ Property Price) × 100</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Worked Example</p>
                <p>Property Price: ₹50,00,000 | Monthly Rent: ₹15,000</p>
                <p>Annual Rent = ₹15,000 × 12 = ₹1,80,000</p>
                <p>Gross Yield = (₹1,80,000 ÷ ₹50,00,000) × 100 = <strong className="text-primary">3.60%</strong> → Fairly Priced</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs">
                  <strong>Residential benchmarks:</strong> Above 3.5% = Cheap Property • 2.5%–3.5% = Fairly Priced • Below 2.5% = Expensive<br />
                  <strong>Commercial benchmarks:</strong> Above 5.5% = Attractive • Below 5.5% = Low Yield
                </p>
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
