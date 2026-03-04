import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageHead } from "@/components/PageHead";
import { Info, Copy, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { kurtosis, mean, stdDev, parseDataInput, formatStat } from "@/lib/statsUtils";

export default function KurtosisCalculator() {
  const [dataInput, setDataInput] = useState("");
  const [decimals, setDecimals] = useState(4);
  const { toast } = useToast();

  const { values, errors } = useMemo(() => parseDataInput(dataInput), [dataInput]);

  const results = useMemo(() => {
    if (values.length < 4) return null;
    const m = mean(values);
    const sd = stdDev(values, false);
    const k = kurtosis(values);
    return { n: values.length, mean: m, stdDev: sd, kurtosis: k };
  }, [values]);

  const handleReset = () => {
    setDataInput("");
  };

  const handleCopy = () => {
    if (!results) return;
    const text = `Excess Kurtosis: ${formatStat(results.kurtosis, decimals)}\nMean: ${formatStat(results.mean, decimals)}\nStd Dev: ${formatStat(results.stdDev, decimals)}\nn: ${results.n}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Kurtosis result copied" });
  };

  const getInterpretation = (k: number) => {
    const abs = Math.abs(k);
    if (abs < 0.5) return { text: "Mesokurtic — the distribution has tail weight similar to a normal distribution.", color: "bg-green-50 text-green-800 border-green-200" };
    if (k > 0) return { text: "Leptokurtic — the distribution has heavier tails and a sharper peak than a normal distribution, indicating more extreme outliers.", color: "bg-amber-50 text-amber-800 border-amber-200" };
    return { text: "Platykurtic — the distribution has lighter tails and a flatter peak than a normal distribution, indicating fewer extreme outliers.", color: "bg-blue-50 text-blue-800 border-blue-200" };
  };

  const faqs = [
    {
      question: "What is kurtosis in statistics?",
      answer: "Kurtosis measures the 'tailedness' of a probability distribution. It describes how much data is in the tails compared to a normal distribution. Higher kurtosis means more of the variance is due to extreme values (outliers)."
    },
    {
      question: "What is excess kurtosis and why subtract 3?",
      answer: "Excess kurtosis is kurtosis minus 3. The normal distribution has a kurtosis of 3, so subtracting 3 makes the normal distribution the baseline (excess kurtosis = 0). This makes it easier to compare distributions — positive excess kurtosis means heavier tails than normal, negative means lighter tails."
    },
    {
      question: "What do mesokurtic, leptokurtic, and platykurtic mean?",
      answer: "Mesokurtic (excess kurtosis ≈ 0) means similar to a normal distribution. Leptokurtic (excess kurtosis > 0) means heavier tails and more outliers — think financial returns. Platykurtic (excess kurtosis < 0) means lighter tails and fewer outliers — think uniform-like distributions."
    },
    {
      question: "Why do I need at least 4 data points?",
      answer: "The unbiased sample excess kurtosis formula uses correction factors involving (n-1), (n-2), and (n-3) in the denominator. With fewer than 4 data points, these terms become zero or negative, making the calculation undefined."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PageHead
        title="Kurtosis Calculator - Calculate 360"
        description="Calculate excess kurtosis of your dataset to understand tail weight and peakedness. Free online statistics calculator with interpretation."
        path="/kurtosis"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Kurtosis Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Calculate excess kurtosis to measure the tail weight and peakedness of your data distribution.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-end gap-4 mb-6">
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
                    <p>Excess kurtosis = [n(n+1)/((n-1)(n-2)(n-3))] × Σ((xᵢ - x̄)/s)⁴ − [3(n-1)²/((n-2)(n-3))] where x̄ is the sample mean and s is the sample standard deviation. A normal distribution has excess kurtosis of 0.</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {results && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Excess Kurtosis</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-kurtosis">{formatStat(results.kurtosis, decimals)}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mean</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-mean">{formatStat(results.mean, decimals)}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Std Dev</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-stddev">{formatStat(results.stdDev, decimals)}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Count (n)</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-count">{results.n}</p>
                        </div>
                      </div>

                      {isFinite(results.kurtosis) && (
                        <div className={`mt-4 rounded-lg p-4 border text-sm ${getInterpretation(results.kurtosis).color}`}>
                          <p className="font-semibold mb-1">Interpretation</p>
                          <p>{getInterpretation(results.kurtosis).text}</p>
                        </div>
                      )}

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

                {values.length > 0 && values.length < 4 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">Enter at least 4 data points to calculate kurtosis.</p>
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
                  The normal distribution has excess kurtosis of 0 (kurtosis of 3).
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Financial return data often shows leptokurtic behavior (heavy tails).
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  High kurtosis warns about the risk of extreme outliers in your data.
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
