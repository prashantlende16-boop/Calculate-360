import { useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { ShareCopyButtons } from "@/components/ShareCopyButtons";
import { RememberInputs } from "@/components/RememberInputs";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { formatINR, formatNumber } from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";

export default function SavingsGoalPlanner() {
  const { values, setValue, resetAll, remember, setRemember } = useCalculatorState(
    "savings-goal",
    ["target", "current", "monthly", "rate"],
    { rate: "0" }
  );

  const target = parseFloat(values.target) || 0;
  const current = parseFloat(values.current) || 0;
  const monthly = parseFloat(values.monthly) || 0;
  const annualRate = parseFloat(values.rate) || 0;

  const results = useMemo(() => {
    if (target <= 0 || monthly <= 0 || current >= target) return null;

    const remaining = target - current;
    const monthlyRate = annualRate / 100 / 12;

    let months = 0;
    if (annualRate > 0) {
      if (monthlyRate === 0) {
        months = Math.ceil(remaining / monthly);
      } else {
        let balance = current;
        while (balance < target && months < 1200) {
          balance = balance * (1 + monthlyRate) + monthly;
          months++;
        }
        if (months >= 1200) return null;
      }
    } else {
      months = Math.ceil(remaining / monthly);
    }

    const totalContributions = monthly * months;
    const totalValue = annualRate > 0
      ? (() => {
          let bal = current;
          for (let i = 0; i < months; i++) {
            bal = bal * (1 + monthlyRate) + monthly;
          }
          return bal;
        })()
      : current + totalContributions;
    const interestEarned = totalValue - current - totalContributions;

    const schedule: { month: number; contribution: number; interest: number; balance: number }[] = [];
    let bal = current;
    const displayMonths = Math.min(months, 12);
    for (let i = 1; i <= displayMonths; i++) {
      const interestThisMonth = bal * monthlyRate;
      bal = bal + interestThisMonth + monthly;
      schedule.push({
        month: i,
        contribution: monthly,
        interest: interestThisMonth,
        balance: bal,
      });
    }

    return {
      months,
      years: Math.floor(months / 12),
      remainingMonths: months % 12,
      totalContributions,
      interestEarned,
      schedule,
    };
  }, [target, current, monthly, annualRate]);

  const hasResult = results !== null;

  const resultText = hasResult
    ? `Time: ${results.years}y ${results.remainingMonths}m | Contributions: ${formatINR(results.totalContributions)} | Interest: ${formatINR(results.interestEarned)}`
    : "";

  const faqs = [
    {
      question: "How does compound interest help reach savings goals faster?",
      answer: "Compound interest earns interest on both your principal and previously earned interest. Over time, this snowball effect significantly accelerates your savings growth compared to simple interest or no interest at all.",
    },
    {
      question: "What is a realistic expected annual return rate?",
      answer: "For savings accounts in India, expect 3-7% annually. Fixed deposits offer 5-8%. Mutual funds (equity) historically return 10-15% but with higher risk. Use a conservative estimate for planning.",
    },
    {
      question: "Should I increase my monthly contribution over time?",
      answer: "Yes, increasing contributions annually (even by 5-10%) can dramatically reduce the time to reach your goal. As your income grows, try to allocate a portion of raises toward savings.",
    },
    {
      question: "What if I already have some savings toward my goal?",
      answer: "Enter your existing savings in the 'Current Savings' field. The calculator will factor in your head start and compute the remaining time needed based on your monthly contributions and expected returns.",
    },
    {
      question: "How accurate is this savings goal estimate?",
      answer: "This calculator provides an estimate based on fixed monthly contributions and a constant return rate. Real-world returns fluctuate, so treat the result as a planning guide rather than a guarantee.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Savings Goal Planner - Calculate 360"
        description="Plan your savings goal with compound interest. Calculate how long it takes to reach your target amount with monthly contributions."
        path="/savings-goal"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">

        <div className="space-y-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Savings Goal Planner
              </h1>
              <p className="text-lg text-muted-foreground">
                Calculate how long it will take to reach your savings target with monthly contributions and compound interest.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Target Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">&#8377;</span>
                    <Input
                      type="number"
                      placeholder="10,00,000"
                      value={values.target}
                      onChange={(e) => setValue("target", e.target.value)}
                      className="input-field pl-7"
                      data-testid="input-target"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Current Savings</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">&#8377;</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={values.current}
                      onChange={(e) => setValue("current", e.target.value)}
                      className="input-field pl-7"
                      data-testid="input-current"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <Label>Monthly Contribution</Label>
                  <span className="text-sm font-semibold text-primary" data-testid="text-monthly-value">
                    {values.monthly ? formatINR(parseFloat(values.monthly)) : "—"}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="200000"
                  step="500"
                  value={values.monthly || "5000"}
                  onChange={(e) => setValue("monthly", e.target.value)}
                  className="w-full accent-primary"
                  data-testid="slider-monthly"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>&#8377;500</span>
                  <span>&#8377;2,00,000</span>
                </div>
                <Input
                  type="number"
                  placeholder="5000"
                  value={values.monthly}
                  onChange={(e) => setValue("monthly", e.target.value)}
                  className="input-field mt-2"
                  data-testid="input-monthly"
                />
              </div>

              <div className="mt-6">
                <Label className="mb-2 block">Expected Annual Return (%)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={values.rate}
                  onChange={(e) => setValue("rate", e.target.value)}
                  className="input-field"
                  data-testid="input-rate"
                />
              </div>

              <div className="mt-6">
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>

              <div className="mt-8 pt-8 border-t border-dashed border-border">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
                    Time to Reach Goal
                  </span>
                  <div className="text-4xl sm:text-5xl font-display font-bold text-primary mb-2" data-testid="text-result-time">
                    {hasResult
                      ? `${results.years > 0 ? `${results.years}y ` : ""}${results.remainingMonths}m`
                      : "—"}
                  </div>
                  <div className="text-muted-foreground text-sm" data-testid="text-result-months">
                    {hasResult ? `${results.months} months total` : ""}
                  </div>
                </div>

                {hasResult && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Contributions</div>
                      <div className="text-lg font-bold text-foreground" data-testid="text-total-contributions">
                        {formatINR(results.totalContributions)}
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Interest Earned</div>
                      <div className="text-lg font-bold text-foreground" data-testid="text-interest-earned">
                        {formatINR(results.interestEarned)}
                      </div>
                    </div>
                  </div>
                )}

                {hasResult && results.schedule.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Schedule (First {results.schedule.length} Months)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" data-testid="table-schedule">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="py-2 px-2 text-muted-foreground font-medium">Month</th>
                            <th className="py-2 px-2 text-muted-foreground font-medium">Contribution</th>
                            <th className="py-2 px-2 text-muted-foreground font-medium">Interest</th>
                            <th className="py-2 px-2 text-muted-foreground font-medium">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.schedule.map((row) => (
                            <tr key={row.month} className="border-b border-border/50">
                              <td className="py-2 px-2">{row.month}</td>
                              <td className="py-2 px-2">{formatINR(row.contribution)}</td>
                              <td className="py-2 px-2">{formatINR(row.interest)}</td>
                              <td className="py-2 px-2 font-medium">{formatINR(row.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <ShareCopyButtons
                  resultText={resultText}
                  shareParams={values}
                  onReset={resetAll}
                  hasResult={hasResult}
                />
              </div>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Savings Tips
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Start early — even small amounts grow significantly with compound interest.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Automate your monthly contributions to stay consistent.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Review and increase your SIP amount annually.
                </li>
              </ul>
            </div>
          </aside>
        </div>

      </main>

      <Footer />
    </div>
  );
}
