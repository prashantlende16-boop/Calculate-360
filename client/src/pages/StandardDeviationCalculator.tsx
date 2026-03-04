import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageHead } from "@/components/PageHead";
import { Info, Copy, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { parseDataInput, stdDev, variance, mean, formatStat } from "@/lib/statsUtils";

export default function StandardDeviationCalculator() {
  const [dataInput, setDataInput] = useState("");
  const [decimals, setDecimals] = useState(4);
  const [isPopulation, setIsPopulation] = useState(false);
  const { toast } = useToast();

  const { values, errors } = useMemo(() => parseDataInput(dataInput), [dataInput]);

  const results = useMemo(() => {
    if (values.length < 2) return null;
    const m = mean(values);
    const v = variance(values, isPopulation);
    const sd = stdDev(values, isPopulation);
    return { n: values.length, mean: m, variance: v, stdDev: sd };
  }, [values, isPopulation]);

  const handleReset = () => {
    setDataInput("");
  };

  const handleCopy = () => {
    if (!results) return;
    const label = isPopulation ? "Population" : "Sample";
    const text = `${label} Std Dev: ${formatStat(results.stdDev, decimals)}\n${label} Variance: ${formatStat(results.variance, decimals)}\nMean: ${formatStat(results.mean, decimals)}\nn: ${results.n}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Standard deviation result copied" });
  };

  const faqs = [
    {
      question: "What is standard deviation?",
      answer: "Standard deviation measures the amount of variation or dispersion in a dataset. A low standard deviation means data points tend to be close to the mean, while a high standard deviation indicates data points are spread over a wide range."
    },
    {
      question: "What is the difference between sample and population standard deviation?",
      answer: "Population standard deviation (σ) divides by n, while sample standard deviation (s) divides by n-1 (Bessel's correction). Sample SD is used when your data represents a sample from a larger population, which is the typical scenario."
    },
    {
      question: "How is standard deviation related to variance?",
      answer: "Standard deviation is the square root of variance. While variance is in squared units, standard deviation is in the same units as the original data, making it easier to interpret and compare."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PageHead
        title="Standard Deviation Calculator - Calculate 360"
        description="Calculate sample or population standard deviation and variance for your dataset. Free online statistics calculator with formulas."
        path="/standard-deviation"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Standard Deviation Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Calculate standard deviation and variance to understand the spread of your data.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 bg-muted p-2 rounded-lg border border-border">
                  <span className={`text-sm font-medium ${!isPopulation ? 'text-primary' : 'text-muted-foreground'}`}>Sample (n-1)</span>
                  <Switch checked={isPopulation} onCheckedChange={setIsPopulation} data-testid="toggle-population" />
                  <span className={`text-sm font-medium ${isPopulation ? 'text-primary' : 'text-muted-foreground'}`}>Population (n)</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded-lg border border-border">
                  <span className="text-muted-foreground">Decimals:</span>
                  {[2, 4, 6].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDecimals(d)}
                      data-testid={`button-decimals-${d}`}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${decimals === d ? 'bg-primary text-white font-bold' : 'text-muted-foreground hover:bg-muted/80'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2">
                  <Label>Enter Data</Label>
                  <textarea
                    className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter numbers separated by commas, spaces, or new lines&#10;Example: 12, 45, 67, 23, 89"
                    value={dataInput}
                    onChange={(e) => setDataInput(e.target.value)}
                    data-testid="input-data"
                  />
                  {errors.length > 0 && (
                    <p className="text-sm text-destructive">Invalid tokens at positions: {errors.map(e => e.index + 1).join(', ')}</p>
                  )}
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2 mt-4">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">How it's calculated</p>
                    <p>
                      {isPopulation
                        ? "Population SD: σ = √[Σ(xᵢ - μ)² / n]"
                        : "Sample SD: s = √[Σ(xᵢ - x̄)² / (n - 1)]"}
                    </p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {results && (
                    <motion.div
                      key={`results-${isPopulation}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            {isPopulation ? "Population" : "Sample"} Std Dev
                          </p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-stddev">{formatStat(results.stdDev, decimals)}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            {isPopulation ? "Population" : "Sample"} Variance
                          </p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-variance">{formatStat(results.variance, decimals)}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mean</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-mean">{formatStat(results.mean, decimals)}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Count (n)</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-count">{results.n}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-6 justify-center">
                        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 text-muted-foreground" data-testid="button-reset">
                          <RefreshCcw className="w-4 h-4" /> Reset
                        </Button>
                        <Button size="sm" onClick={handleCopy} className="gap-2 bg-card dark:bg-background text-white" data-testid="button-copy">
                          <Copy className="w-4 h-4" /> Copy Result
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {values.length === 1 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">Enter at least 2 data points to calculate standard deviation.</p>
                )}
              </motion.div>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <AdSlot position="sidebar" />

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4">Quick Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  About 68% of data falls within 1 SD of the mean (normal distribution).
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  About 95% falls within 2 SDs, and 99.7% within 3 SDs.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Standard deviation of zero means all values are identical.
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <AdSlot position="bottom" className="mt-8" />
      </main>

      <Footer />
    </div>
  );
}
