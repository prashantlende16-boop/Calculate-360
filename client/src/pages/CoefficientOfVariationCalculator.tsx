import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageHead } from "@/components/PageHead";
import { Info, Copy, RefreshCcw, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { parseDataInput, coefficientOfVariation, mean, stdDev, formatStat } from "@/lib/statsUtils";

export default function CoefficientOfVariationCalculator() {
  const [dataInput, setDataInput] = useState("");
  const [decimals, setDecimals] = useState(4);
  const { toast } = useToast();

  const { values, errors } = useMemo(() => parseDataInput(dataInput), [dataInput]);

  const results = useMemo(() => {
    if (values.length < 2) return null;
    const m = mean(values);
    const sd = stdDev(values, false);
    const cv = coefficientOfVariation(values);
    const meanNearZero = Math.abs(m) < 1e-10;
    return { n: values.length, mean: m, stdDev: sd, cv, meanNearZero };
  }, [values]);

  const handleReset = () => {
    setDataInput("");
  };

  const handleCopy = () => {
    if (!results) return;
    const text = `CV: ${results.meanNearZero ? "N/A" : formatStat(results.cv, decimals) + "%"}\nMean: ${formatStat(results.mean, decimals)}\nStd Dev (sample): ${formatStat(results.stdDev, decimals)}\nn: ${results.n}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "CV result copied" });
  };

  const faqs = [
    {
      question: "What is the Coefficient of Variation (CV)?",
      answer: "The Coefficient of Variation (CV) is a standardized measure of dispersion. It is defined as the ratio of the standard deviation to the mean, expressed as a percentage: CV = (SD / |Mean|) x 100%. It allows comparison of variability between datasets with different units or scales."
    },
    {
      question: "When is the CV not meaningful?",
      answer: "The CV is not meaningful when the mean is zero or very close to zero, because dividing by zero (or near-zero) produces undefined or extremely large values. It is also problematic for data measured on interval scales (like temperature in Celsius) where zero is arbitrary."
    },
    {
      question: "What is a good or bad CV value?",
      answer: "A lower CV indicates less variability relative to the mean. In many fields, a CV below 15% suggests low variation, 15-30% moderate variation, and above 30% high variation. However, acceptable thresholds vary by field and application."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PageHead
        title="Coefficient of Variation Calculator - Calculate 360"
        description="Calculate the Coefficient of Variation (CV) to compare variability across datasets. Free online statistics calculator."
        path="/coefficient-of-variation"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Coefficient of Variation Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Measure relative variability by computing the ratio of standard deviation to the mean.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex justify-end mb-6">
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
                    <p>CV = (Sample Standard Deviation / |Mean|) x 100%. Uses sample SD (n-1 denominator).</p>
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
                      {results.meanNearZero && (
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 text-sm text-amber-800 flex items-start gap-2 mt-4">
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                          <p>CV not meaningful when mean is near zero. The mean of your data is approximately 0, making the coefficient of variation undefined or unreliable.</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">CV</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-cv">
                            {results.meanNearZero ? "N/A" : formatStat(results.cv, decimals) + "%"}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mean</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-mean">{formatStat(results.mean, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Std Dev (sample)</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-stddev">{formatStat(results.stdDev, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Count (n)</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-count">{results.n}</p>
                        </div>
                      </div>

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

                {values.length === 1 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">Enter at least 2 data points to calculate CV.</p>
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
                  CV allows comparison of variability between datasets with different units.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  A lower CV means less relative variability.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  CV is only meaningful for ratio scales where zero represents absence.
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
