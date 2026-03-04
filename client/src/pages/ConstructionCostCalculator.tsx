import { useMemo, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { ShareCopyButtons } from "@/components/ShareCopyButtons";
import { RememberInputs } from "@/components/RememberInputs";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { formatINR, formatNumber } from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building2, Package, AlertCircle } from "lucide-react";

const materials = [
  { key: "cement", label: "Cement", unit: "Bags", multiplier: 0.4, round: true, priceDefault: "350" },
  { key: "steel", label: "Steel", unit: "Ton", multiplier: 0.004, round: false, priceDefault: "55000" },
  { key: "sand", label: "Sand", unit: "Ton", multiplier: 0.0816, round: false, priceDefault: "2500" },
  { key: "aggregate", label: "Aggregate", unit: "Ton", multiplier: 0.0608, round: false, priceDefault: "1800" },
  { key: "bricks", label: "Bricks", unit: "Bricks", multiplier: 8, round: true, priceDefault: "8" },
  { key: "tiles", label: "Tiles", unit: "Tiles", multiplier: 1.3, round: true, priceDefault: "35" },
  { key: "paint", label: "Paint", unit: "Litres", multiplier: 0.018, round: false, priceDefault: "350" },
];

const priceFields = materials.map((m) => `price_${m.key}`);
const priceDefaults = Object.fromEntries(materials.map((m) => [`price_${m.key}`, m.priceDefault]));

export default function ConstructionCostCalculator() {
  const state = useCalculatorState("construction-cost", ["sqft", ...priceFields], { ...priceDefaults });
  const [showCost, setShowCost] = useState(false);

  const sqft = parseFloat(state.values.sqft) || 0;
  const isValid = sqft > 0;

  const results = useMemo(() => {
    if (!isValid) return null;
    return materials.map((m) => {
      const raw = sqft * m.multiplier;
      const qty = m.round ? Math.ceil(raw) : parseFloat(raw.toFixed(2));
      const price = parseFloat(state.values[`price_${m.key}`]) || 0;
      const cost = qty * price;
      return { ...m, qty, cost };
    });
  }, [sqft, isValid, state.values]);

  const totalCost = useMemo(() => {
    if (!results) return 0;
    return results.reduce((sum, r) => sum + r.cost, 0);
  }, [results]);

  const resultText = results
    ? results.map((r) => `${r.label}: ${formatNumber(r.qty)} ${r.unit}`).join("\n") +
      (showCost ? `\nTotal Estimated Cost: ${formatINR(totalCost)}` : "")
    : "";

  const faqItems = [
    {
      question: "Are these material quantities exact?",
      answer:
        "These are approximate estimates based on standard thumb-rule multipliers used in the Indian construction industry. Actual quantities can vary based on design, soil type, number of floors, and structural requirements. Always consult a civil engineer for precise bills of quantities.",
    },
    {
      question: "Do material rates vary by foundation type or design?",
      answer:
        "Yes. A raft foundation uses more cement and steel than a simple strip foundation. Similarly, earthquake-resistant designs require additional steel reinforcement. The multipliers used here assume a standard single or double-storey residential construction.",
    },
    {
      question: "What is built-up area?",
      answer:
        "Built-up area is the total covered area of a building measured from the outer walls. It includes the carpet area (usable floor space) plus the thickness of inner and outer walls. This is the figure typically used for construction cost estimation.",
    },
    {
      question: "Can I change the multipliers?",
      answer:
        "The multipliers used here are industry-standard defaults. For a more precise estimate, work with your architect or structural engineer who can provide project-specific quantities based on detailed drawings.",
    },
    {
      question: "How accurate is the cost estimation?",
      answer:
        "The cost estimation uses the quantity multiplied by the unit price you enter. Material prices vary significantly by region, brand, and market conditions. Update the prices to match your local market for a more realistic estimate.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHead
        title="House Construction Cost Calculator - Calculate 360"
        description="Estimate cement, steel, sand, aggregate, bricks, tiles and paint needed for your house based on built-up area in sqft."
        path="/construction-cost"
      />
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <AdSlot position="top" className="mb-6" />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3">
                <Building2 className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground" data-testid="text-page-title">
                House Construction Cost Calculator
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
                Estimate the quantity of construction materials required to build your house based on built-up area in square feet.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Enter Details
                </h2>
                <RememberInputs checked={state.remember} onChange={state.setRemember} />
              </div>

              <div>
                <Label htmlFor="sqft" className="text-sm font-medium">Built-up Area (sqft)</Label>
                <Input
                  id="sqft"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 1000"
                  value={state.values.sqft}
                  onChange={(e) => state.setValue("sqft", e.target.value)}
                  className="mt-1"
                  data-testid="input-sqft"
                />
                {state.values.sqft !== "" && !isValid && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1" data-testid="text-error-sqft">
                    <AlertCircle className="w-3 h-3" /> Area must be greater than 0
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Switch
                  checked={showCost}
                  onCheckedChange={setShowCost}
                  id="toggle-cost"
                  data-testid="switch-cost-toggle"
                />
                <Label htmlFor="toggle-cost" className="cursor-pointer text-sm text-muted-foreground">
                  Estimate Material Cost
                </Label>
              </div>

              {showCost && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {materials.map((m) => (
                    <div key={m.key}>
                      <Label htmlFor={`price-${m.key}`} className="text-xs text-muted-foreground">
                        {m.label} (per {m.unit === "Bags" ? "bag" : m.unit === "Ton" ? "ton" : m.unit === "Bricks" ? "brick" : m.unit === "Tiles" ? "tile" : "litre"})
                      </Label>
                      <div className="relative mt-0.5">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">&#8377;</span>
                        <Input
                          id={`price-${m.key}`}
                          type="number"
                          min="0"
                          step="any"
                          value={state.values[`price_${m.key}`]}
                          onChange={(e) => state.setValue(`price_${m.key}`, e.target.value)}
                          className="pl-6 text-sm"
                          data-testid={`input-price-${m.key}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">Material Estimate</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-results">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Material</th>
                      <th className="pb-2 font-medium text-right">Multiplier</th>
                      <th className="pb-2 font-medium text-right">Quantity</th>
                      <th className="pb-2 font-medium text-right">Unit</th>
                      {showCost && <th className="pb-2 font-medium text-right">Cost</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m) => {
                      const row = results?.find((r) => r.key === m.key);
                      return (
                        <tr key={m.key} className="border-b border-border/50" data-testid={`row-${m.key}`}>
                          <td className="py-2.5 font-medium text-foreground">{m.label}</td>
                          <td className="py-2.5 text-right text-muted-foreground">{m.multiplier}</td>
                          <td className="py-2.5 text-right font-semibold text-foreground">
                            {row ? formatNumber(row.qty) : "—"}
                          </td>
                          <td className="py-2.5 text-right text-muted-foreground">{m.unit}</td>
                          {showCost && (
                            <td className="py-2.5 text-right font-semibold text-foreground">
                              {row ? formatINR(row.cost) : "—"}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                  {showCost && results && (
                    <tfoot>
                      <tr className="border-t-2 border-border">
                        <td colSpan={4} className="py-3 font-bold text-foreground text-right">Total Estimated Cost</td>
                        <td className="py-3 text-right font-bold text-primary text-base" data-testid="text-total-cost">
                          {formatINR(totalCost)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {results && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  {results.slice(0, 4).map((r) => (
                    <div key={r.key} className="bg-muted rounded-xl p-3 text-center border border-border/50">
                      <div className="text-lg font-bold text-foreground" data-testid={`text-card-${r.key}`}>
                        {formatNumber(r.qty)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {r.label} ({r.unit})
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <ShareCopyButtons
                resultText={resultText}
                shareParams={state.values}
                onReset={state.resetAll}
                hasResult={isValid}
              />
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display font-semibold text-lg text-foreground mb-3">How It's Calculated</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Each material quantity is calculated using a simple formula:
              </p>
              <div className="bg-muted rounded-xl p-4 border border-border/50 mb-4">
                <code className="text-sm font-mono text-foreground">Quantity = Built-up Area (sqft) x Multiplier</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3 font-medium">Worked Example for 1,000 sqft:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Material</th>
                      <th className="pb-2 font-medium text-right">Calculation</th>
                      <th className="pb-2 font-medium text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Cement</td>
                      <td className="py-2 text-right text-muted-foreground">1000 x 0.4</td>
                      <td className="py-2 text-right font-semibold">400 Bags</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Steel</td>
                      <td className="py-2 text-right text-muted-foreground">1000 x 0.004</td>
                      <td className="py-2 text-right font-semibold">4 Ton</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Sand</td>
                      <td className="py-2 text-right text-muted-foreground">1000 x 0.0816</td>
                      <td className="py-2 text-right font-semibold">81.6 Ton</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Aggregate</td>
                      <td className="py-2 text-right text-muted-foreground">1000 x 0.0608</td>
                      <td className="py-2 text-right font-semibold">60.8 Ton</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Bricks</td>
                      <td className="py-2 text-right text-muted-foreground">1000 x 8</td>
                      <td className="py-2 text-right font-semibold">8,000 Bricks</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Tiles</td>
                      <td className="py-2 text-right text-muted-foreground">1000 x 1.3</td>
                      <td className="py-2 text-right font-semibold">1,300 Tiles</td>
                    </tr>
                    <tr>
                      <td className="py-2">Paint</td>
                      <td className="py-2 text-right text-muted-foreground">1000 x 0.018</td>
                      <td className="py-2 text-right font-semibold">18 Litres</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqItems} />

            <AdSlot position="bottom" className="mt-6" />
          </div>

          <aside className="hidden lg:block w-[200px] shrink-0">
            <div className="sticky top-20">
              <AdSlot position="sidebar" />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
