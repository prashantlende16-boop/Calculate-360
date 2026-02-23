import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PageHead } from "@/components/PageHead";
import { Info, Copy, RefreshCcw, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { parseDataInput, mean, median, mode, percentile, formatStat } from "@/lib/statsUtils";

export default function MeanMedianModeCalculator() {
  const [dataInput, setDataInput] = useState("");
  const [decimals, setDecimals] = useState(4);
  const [customPercentile, setCustomPercentile] = useState("50");
  const { toast } = useToast();

  const { values, errors } = useMemo(() => parseDataInput(dataInput), [dataInput]);

  const results = useMemo(() => {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((s, v) => s + v, 0);
    const m = mean(values);
    const med = median(values);
    const modes = mode(values);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;
    const q1 = percentile(values, 25);
    const q2 = percentile(values, 50);
    const q3 = percentile(values, 75);
    const cp = Number(customPercentile);
    const customP = !isNaN(cp) && cp >= 0 && cp <= 100 ? percentile(values, cp) : null;
    const first10 = sorted.slice(0, 10);
    const last10 = sorted.slice(-10);
    return { n: values.length, sum, mean: m, median: med, modes, min, max, range, q1, q2, q3, customP, sorted, first10, last10 };
  }, [values, customPercentile]);

  const handleReset = () => {
    setDataInput("");
    setCustomPercentile("50");
  };

  const handleCopy = () => {
    if (!results) return;
    const text = `Count: ${results.n}\nSum: ${formatStat(results.sum, decimals)}\nMean: ${formatStat(results.mean, decimals)}\nMedian: ${formatStat(results.median, decimals)}\nMode: ${results.modes.length > 0 ? results.modes.join(", ") : "No mode"}\nMin: ${formatStat(results.min, decimals)}\nMax: ${formatStat(results.max, decimals)}\nRange: ${formatStat(results.range, decimals)}\nQ1: ${formatStat(results.q1, decimals)}\nQ2: ${formatStat(results.q2, decimals)}\nQ3: ${formatStat(results.q3, decimals)}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "All results copied" });
  };

  const faqs = [
    {
      question: "What is the difference between mean, median, and mode?",
      answer: "The mean is the arithmetic average of all values. The median is the middle value when data is sorted. The mode is the most frequently occurring value. Each measures central tendency differently and is useful in different scenarios."
    },
    {
      question: "When should I use median instead of mean?",
      answer: "Use the median when your data has outliers or is skewed. The median is resistant to extreme values, making it a better measure of the 'typical' value in such cases. For example, median income is often more representative than mean income."
    },
    {
      question: "What are percentiles and quartiles?",
      answer: "Percentiles divide your data into 100 equal parts. The 25th percentile (Q1) means 25% of values fall below it. The 50th percentile (Q2) is the median. The 75th percentile (Q3) means 75% of values fall below it. The interquartile range (IQR = Q3 - Q1) measures spread."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PageHead
        title="Mean, Median & Mode Calculator - Calculate 360"
        description="Calculate mean, median, mode, percentiles, and other central tendency measures for your dataset. Free online statistics calculator."
        path="/mean-median-mode"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Mean, Median & Mode Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Compute central tendency measures, percentiles, and summary statistics for any dataset.
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
                    <p>Mean = Sum / n. Median = middle value of sorted data. Mode = most frequent value(s). Percentile uses linear interpolation.</p>
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
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Count (n)</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-count">{results.n}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sum</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-sum">{formatStat(results.sum, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mean</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-mean">{formatStat(results.mean, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Median</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-median">{formatStat(results.median, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mode</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-mode">
                            {results.modes.length > 0 ? results.modes.map(m => formatStat(m, decimals)).join(", ") : "No mode"}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Min</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-min">{formatStat(results.min, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Max</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-max">{formatStat(results.max, decimals)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Range</p>
                          <p className="text-2xl font-bold text-primary" data-testid="result-range">{formatStat(results.range, decimals)}</p>
                        </div>
                      </div>

                      <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" /> Percentiles / Quartiles
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Q1 (25th)</p>
                            <p className="text-lg font-bold text-primary" data-testid="result-q1">{formatStat(results.q1, decimals)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Q2 (50th)</p>
                            <p className="text-lg font-bold text-primary" data-testid="result-q2">{formatStat(results.q2, decimals)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Q3 (75th)</p>
                            <p className="text-lg font-bold text-primary" data-testid="result-q3">{formatStat(results.q3, decimals)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-end gap-2">
                          <div className="flex-1">
                            <Label className="text-xs">Custom Percentile</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={customPercentile}
                              onChange={(e) => setCustomPercentile(e.target.value)}
                              className="mt-1"
                              data-testid="input-custom-percentile"
                            />
                          </div>
                          <div className="text-center pb-2">
                            <p className="text-lg font-bold text-primary" data-testid="result-custom-percentile">
                              {results.customP !== null ? formatStat(results.customP, decimals) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {results.sorted.length > 0 && (
                        <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-100">
                          <h3 className="font-semibold text-sm text-foreground mb-2">Sorted Preview</h3>
                          <p className="text-xs text-muted-foreground font-mono">
                            {results.sorted.length <= 20
                              ? results.sorted.map(v => formatStat(v, decimals)).join(", ")
                              : `${results.first10.map(v => formatStat(v, decimals)).join(", ")} ... ${results.last10.map(v => formatStat(v, decimals)).join(", ")}`}
                          </p>
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
                  If all values appear once, there is no mode.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  For symmetric data, mean and median are approximately equal.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  The IQR (Q3 - Q1) captures the middle 50% of your data.
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
