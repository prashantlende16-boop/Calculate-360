import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { ShareCopyButtons } from "@/components/ShareCopyButtons";
import { RememberInputs } from "@/components/RememberInputs";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { formatINR } from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Category {
  name: string;
  defaultPct: number;
  color: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { name: "Venue", defaultPct: 25, color: "#6366f1" },
  { name: "Food & Catering", defaultPct: 30, color: "#f59e0b" },
  { name: "Decor", defaultPct: 10, color: "#3bb392" },
  { name: "Photography", defaultPct: 10, color: "#ef4444" },
  { name: "Music & Entertainment", defaultPct: 5, color: "#8b5cf6" },
  { name: "Outfits", defaultPct: 8, color: "#ec4899" },
  { name: "Invitations", defaultPct: 2, color: "#14b8a6" },
  { name: "Miscellaneous", defaultPct: 10, color: "#64748b" },
];

const fields = ["totalBudget", "guestCount", ...DEFAULT_CATEGORIES.flatMap((c) => [`pct_${c.name}`, `actual_${c.name}`])];
const defaults: Record<string, string> = {};
DEFAULT_CATEGORIES.forEach((c) => {
  defaults[`pct_${c.name}`] = c.defaultPct.toString();
  defaults[`actual_${c.name}`] = "";
});

export default function EventBudgetPlanner() {
  const { values, setValue, resetAll, remember, setRemember } = useCalculatorState(
    "event-budget",
    fields,
    defaults
  );

  const totalBudget = parseFloat(values.totalBudget) || 0;
  const guestCount = parseInt(values.guestCount) || 0;

  const categoryData = DEFAULT_CATEGORIES.map((cat) => {
    const pct = parseFloat(values[`pct_${cat.name}`]) || 0;
    const actual = parseFloat(values[`actual_${cat.name}`]) || 0;
    const planned = totalBudget * (pct / 100);
    const variance = planned - actual;
    return { ...cat, pct, actual, planned, variance };
  });

  const totalPctUsed = categoryData.reduce((s, c) => s + c.pct, 0);
  const totalPlanned = categoryData.reduce((s, c) => s + c.planned, 0);
  const totalActual = categoryData.reduce((s, c) => s + c.actual, 0);
  const totalVariance = totalPlanned - totalActual;
  const remainingBudget = totalBudget - totalActual;

  const hasResults = totalBudget > 0;
  const hasActuals = categoryData.some((c) => c.actual > 0);

  const resultText = hasResults
    ? `Budget: ${formatINR(totalBudget)}, Spent: ${formatINR(totalActual)}, Remaining: ${formatINR(remainingBudget)}`
    : "";

  const maxBarValue = Math.max(...categoryData.map((c) => Math.max(c.planned, c.actual)), 1);

  const faqs = [
    {
      question: "How do I set a realistic wedding budget?",
      answer:
        "Start with your total available funds, then allocate percentages to each category. The default percentages provided are industry averages for Indian weddings, but you can adjust them based on your priorities.",
    },
    {
      question: "What does variance mean in the budget table?",
      answer:
        "Variance is the difference between what you planned to spend and what you actually spent. A positive variance means you spent less than planned (under budget), while a negative variance means you overspent.",
    },
    {
      question: "Why should my total percentages add up to 100%?",
      answer:
        "When your category percentages total 100%, every rupee of your budget is accounted for. If the total is less than 100%, some budget is unallocated. If more, you're planning to overspend.",
    },
    {
      question: "How does the per-guest cost help in planning?",
      answer:
        "Per-guest cost helps you compare with industry benchmarks. For Indian weddings, per-guest costs typically range from ₹2,000 to ₹15,000+ depending on the city and scale.",
    },
    {
      question: "Can I use this for events other than weddings?",
      answer:
        "Absolutely! While the default categories are tailored for weddings, you can adjust the percentages and mentally rename categories to suit birthdays, corporate events, or any large gathering.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Wedding & Event Budget Planner - Calculate 360"
        description="Plan your wedding or event budget with category-wise allocation, track actual spending, and visualize variance against your plan."
        path="/event-budget"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">

        <div className="space-y-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Wedding / Event Budget Planner
              </h1>
              <p className="text-lg text-muted-foreground">
                Plan your event budget, allocate by category, and track actual spending vs planned.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Total Budget (&#8377;)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 2000000"
                      value={values.totalBudget}
                      onChange={(e) => setValue("totalBudget", e.target.value)}
                      className="input-field"
                      data-testid="input-total-budget"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Guest Count</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 300"
                      value={values.guestCount}
                      onChange={(e) => setValue("guestCount", e.target.value)}
                      className="input-field"
                      data-testid="input-guest-count"
                    />
                  </div>
                </div>

                {totalPctUsed !== 100 && totalBudget > 0 && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-sm text-amber-800">
                    Total allocation is {totalPctUsed.toFixed(1)}% &mdash; ideally should be 100%.
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-display font-bold text-foreground mb-4">Category Allocations</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-categories">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="py-2 pr-3 font-medium text-muted-foreground">Category</th>
                          <th className="py-2 pr-3 font-medium text-muted-foreground text-center w-20">%</th>
                          <th className="py-2 pr-3 font-medium text-muted-foreground text-right">Planned</th>
                          <th className="py-2 pr-3 font-medium text-muted-foreground text-right w-32">Actual (&#8377;)</th>
                          <th className="py-2 font-medium text-muted-foreground text-right">Variance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryData.map((cat, i) => (
                          <tr key={cat.name} className="border-b border-border/50" data-testid={`row-category-${i}`}>
                            <td className="py-2 pr-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
                                <span className="font-medium text-foreground whitespace-nowrap">{cat.name}</span>
                              </div>
                            </td>
                            <td className="py-2 pr-3 text-center">
                              <Input
                                type="number"
                                value={values[`pct_${cat.name}`]}
                                onChange={(e) => setValue(`pct_${cat.name}`, e.target.value)}
                                className="w-16 text-center h-8 text-xs mx-auto"
                                data-testid={`input-pct-${i}`}
                              />
                            </td>
                            <td className="py-2 pr-3 text-right text-muted-foreground whitespace-nowrap">
                              {totalBudget > 0 ? formatINR(cat.planned) : "\u2014"}
                            </td>
                            <td className="py-2 pr-3 text-right">
                              <Input
                                type="number"
                                placeholder="0"
                                value={values[`actual_${cat.name}`]}
                                onChange={(e) => setValue(`actual_${cat.name}`, e.target.value)}
                                className="w-28 text-right h-8 text-xs ml-auto"
                                data-testid={`input-actual-${i}`}
                              />
                            </td>
                            <td
                              className={`py-2 text-right font-medium whitespace-nowrap ${
                                cat.actual > 0
                                  ? cat.variance > 0
                                    ? "text-green-600"
                                    : cat.variance < 0
                                    ? "text-red-600"
                                    : ""
                                  : "text-muted-foreground"
                              }`}
                            >
                              {cat.actual > 0 ? (cat.variance > 0 ? "+" : "") + formatINR(cat.variance) : "\u2014"}
                            </td>
                          </tr>
                        ))}
                        {totalBudget > 0 && (
                          <tr className="font-bold border-t-2 border-border">
                            <td className="py-2 pr-3">Total</td>
                            <td className="py-2 pr-3 text-center">{totalPctUsed.toFixed(0)}%</td>
                            <td className="py-2 pr-3 text-right">{formatINR(totalPlanned)}</td>
                            <td className="py-2 pr-3 text-right">{hasActuals ? formatINR(totalActual) : "\u2014"}</td>
                            <td
                              className={`py-2 text-right ${
                                hasActuals
                                  ? totalVariance > 0
                                    ? "text-green-600"
                                    : totalVariance < 0
                                    ? "text-red-600"
                                    : ""
                                  : ""
                              }`}
                            >
                              {hasActuals ? (totalVariance > 0 ? "+" : "") + formatINR(totalVariance) : "\u2014"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h2 className="text-lg font-display font-bold text-foreground mb-4">Results</h2>

                  {!hasResults ? (
                    <p className="text-center text-muted-foreground py-4" data-testid="text-incomplete">
                      &#x2014;
                    </p>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                          <p className="text-xs text-muted-foreground">Total Budget</p>
                          <p className="text-lg font-display font-bold text-primary" data-testid="text-total-budget">
                            {formatINR(totalBudget)}
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Total Spent</p>
                          <p className="text-lg font-display font-bold text-foreground" data-testid="text-total-spent">
                            {hasActuals ? formatINR(totalActual) : "\u2014"}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg p-3 border ${
                            remainingBudget >= 0
                              ? "bg-green-50 border-green-100"
                              : "bg-red-50 border-red-100"
                          }`}
                        >
                          <p className="text-xs text-muted-foreground">Remaining</p>
                          <p
                            className={`text-lg font-display font-bold ${
                              remainingBudget >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                            data-testid="text-remaining"
                          >
                            {hasActuals ? formatINR(remainingBudget) : "\u2014"}
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">Per Guest</p>
                          <p className="text-lg font-display font-bold text-foreground" data-testid="text-per-guest">
                            {guestCount > 0 ? formatINR(totalBudget / guestCount) : "\u2014"}
                          </p>
                        </div>
                      </div>

                      {totalBudget > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-foreground mb-3">Budget Allocation</h3>
                          <svg
                            viewBox="0 0 500 220"
                            className="w-full"
                            role="img"
                            aria-label="Budget allocation bar chart"
                            data-testid="svg-bar-chart"
                          >
                            {categoryData.map((cat, i) => {
                              const barWidth = maxBarValue > 0 ? (cat.planned / maxBarValue) * 320 : 0;
                              const actualWidth = maxBarValue > 0 ? (cat.actual / maxBarValue) * 320 : 0;
                              const y = i * 26 + 4;
                              return (
                                <g key={cat.name}>
                                  <text x="0" y={y + 14} fontSize="10" fill="#64748b" textAnchor="start">
                                    {cat.name.length > 12 ? cat.name.substring(0, 12) + ".." : cat.name}
                                  </text>
                                  <rect x="110" y={y} width={barWidth} height="10" rx="2" fill={cat.color} opacity="0.3" />
                                  {cat.actual > 0 && (
                                    <rect x="110" y={y + 1} width={actualWidth} height="8" rx="2" fill={cat.color} />
                                  )}
                                  <text x="440" y={y + 14} fontSize="9" fill="#64748b" textAnchor="end">
                                    {formatINR(cat.planned)}
                                  </text>
                                </g>
                              );
                            })}
                            <line x1="110" y1={categoryData.length * 26 + 8} x2="430" y2={categoryData.length * 26 + 8} stroke="#e2e8f0" strokeWidth="1" />
                            <text x="110" y={categoryData.length * 26 + 22} fontSize="9" fill="#94a3b8">
                              Lighter = Planned | Solid = Actual
                            </text>
                          </svg>
                        </div>
                      )}

                      <ShareCopyButtons
                        resultText={resultText}
                        shareParams={{ totalBudget: values.totalBudget, guestCount: values.guestCount }}
                        onReset={resetAll}
                        hasResult={hasResults}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
          </aside>
        </div>

      </main>

      <Footer />
    </div>
  );
}
