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
import { skewness, mean, stdDev, parseDataInput, formatStat } from "@/lib/statsUtils";

export default function SkewnessCalculator() {
  const [dataInput, setDataInput] = useState("");
  const [decimals, setDecimals] = useState(4);
  const { toast } = useToast();

  const { values, errors } = useMemo(() => parseDataInput(dataInput), [dataInput]);

  const results = useMemo(() => {
    if (values.length < 3) return null;
    const m = mean(values);
    const sd = stdDev(values, false);
    const g1 = skewness(values);
    return { n: values.length, mean: m, stdDev: sd, skewness: g1 };
  }, [values]);

  const handleReset = () => {
    setDataInput("");
  };

  const handleCopy = () => {
    if (!results) return;
    const text = `Skewness: ${formatStat(results.skewness, decimals)}\nMean: ${formatStat(results.mean, decimals)}\nStd Dev: ${formatStat(results.stdDev, decimals)}\nn: ${results.n}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Skewness result copied" });
  };

  const getInterpretation = (g1: number) => {
    const abs = Math.abs(g1);
    if (abs < 0.1) return { text: "Approximately symmetric — the data is evenly distributed around the mean.", color: "bg-green-50 text-green-800 border-green-200" };
    if (g1 > 0 && abs > 1) return { text: "Highly right-skewed — the distribution has a long tail on the right side with potential outliers pulling the mean above the median.", color: "bg-amber-50 text-amber-800 border-amber-200" };
    if (g1 > 0) return { text: "Moderately right-skewed — the tail extends to the right, meaning the mean is greater than the median.", color: "bg-amber-50 text-amber-800 border-amber-200" };
    if (g1 < 0 && abs > 1) return { text: "Highly left-skewed — the distribution has a long tail on the left side with potential outliers pulling the mean below the median.", color: "bg-blue-50 text-blue-800 border-blue-200" };
    return { text: "Moderately left-skewed — the tail extends to the left, meaning the mean is less than the median.", color: "bg-blue-50 text-blue-800 border-blue-200" };
  };

  const faqs = [
    {
      question: "What is skewness in statistics?",
      answer: "Skewness is a measure of the asymmetry of a probability distribution. A distribution with zero skewness is perfectly symmetric (like the normal distribution). Positive skewness means the tail on the right side is longer, while negative skewness means the tail on the left side is longer."
    },
    {
      question: "What does the Fisher-Pearson adjusted skewness formula do?",
      answer: "The Fisher-Pearson adjusted formula (g1) applies a correction factor n/((n-1)(n-2)) to reduce bias in small samples. This is the most commonly used skewness formula in statistical software and provides an unbiased estimate of population skewness."
    },
    {
      question: "How do I interpret skewness values?",
      answer: "A skewness near 0 indicates symmetry. Values between -0.5 and 0.5 indicate approximate symmetry. Values between -1 and -0.5 or 0.5 and 1 indicate moderate skew. Values less than -1 or greater than 1 indicate high skew. In a right-skewed distribution, the mean is typically greater than the median."
    },
    {
      question: "Why is skewness important?",
      answer: "Skewness helps you understand the shape of your data distribution. Many statistical tests assume normality (zero skew), so knowing the skewness helps decide whether to use parametric or non-parametric tests. It also affects the relationship between mean, median, and mode."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PageHead
        title="Skewness Calculator - Calculate 360"
        description="Calculate the skewness of your dataset using the Fisher-Pearson adjusted formula. Free online statistics calculator with interpretation guidance."
        path="/skewness"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Skewness Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Measure the asymmetry of your data distribution using the Fisher-Pearson adjusted skewness coefficient.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-end gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                  <span className="text-muted-foreground">Decimals:</span>
                  {[2, 4, 6].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDecimals(d)}
                      data-testid={`button-decimals-${d}`}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${decimals === d ? 'bg-primary text-white font-bold' : 'text-slate-500 hover:bg-slate-200'}`}
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
                    <p>Fisher-Pearson adjusted skewness: g₁ = (n/((n-1)(n-2))) × Σ((xᵢ - x̄)/s)³ where x̄ is the sample mean and s is the sample standard deviation.</p>
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
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Skewness (g₁)</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-skewness">{formatStat(results.skewness, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mean</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-mean">{formatStat(results.mean, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Std Dev</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-stddev">{formatStat(results.stdDev, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Count (n)</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-count">{results.n}</p>
                        </div>
                      </div>

                      {isFinite(results.skewness) && (
                        <div className={`mt-4 rounded-lg p-4 border text-sm ${getInterpretation(results.skewness).color}`}>
                          <p className="font-semibold mb-1">Interpretation</p>
                          <p>{getInterpretation(results.skewness).text}</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-6 justify-center">
                        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 text-muted-foreground" data-testid="button-reset">
                          <RefreshCcw className="w-4 h-4" /> Reset
                        </Button>
                        <Button size="sm" onClick={handleCopy} className="gap-2 bg-slate-900 text-white" data-testid="button-copy">
                          <Copy className="w-4 h-4" /> Copy Result
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {values.length > 0 && values.length < 3 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">Enter at least 3 data points to calculate skewness.</p>
                )}
              </motion.div>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <AdSlot position="sidebar" />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4">Quick Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  A perfectly symmetric distribution (like normal) has skewness of 0.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Income data is typically right-skewed — most people earn less than the average.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  If |skewness| &gt; 1, consider using median instead of mean as a measure of center.
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
