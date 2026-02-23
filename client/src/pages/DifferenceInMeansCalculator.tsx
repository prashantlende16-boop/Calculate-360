import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
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
import {
  parseDataInput,
  mean,
  stdDev,
  welchTTest,
  pooledTTest,
  cohenD,
  inverseTCDF,
  formatStat,
} from "@/lib/statsUtils";

export default function DifferenceInMeansCalculator() {
  const [decimals, setDecimals] = useState(4);
  const [dataA, setDataA] = useState("");
  const [dataB, setDataB] = useState("");
  const [equalVar, setEqualVar] = useState(false);
  const [confidence, setConfidence] = useState(95);
  const { toast } = useToast();

  const result = useMemo(() => {
    const { values: vA } = parseDataInput(dataA);
    const { values: vB } = parseDataInput(dataB);
    if (vA.length < 2 || vB.length < 2) return null;

    const test = equalVar ? pooledTTest(vA, vB) : welchTTest(vA, vB);
    const mA = mean(vA);
    const mB = mean(vB);
    const sA = stdDev(vA, false);
    const sB = stdDev(vB, false);
    const d = cohenD(vA, vB);

    const tCrit = inverseTCDF(1 - (1 - confidence / 100) / 2, test.df);
    const margin = tCrit * test.se;

    return {
      meanA: mA,
      meanB: mB,
      diff: test.meanDiff,
      se: test.se,
      t: test.t,
      df: test.df,
      pValue: test.pValue,
      ciLower: test.meanDiff - margin,
      ciUpper: test.meanDiff + margin,
      cohenD: d,
      nA: vA.length,
      nB: vB.length,
      sdA: sA,
      sdB: sB,
    };
  }, [dataA, dataB, equalVar, confidence]);

  const cohenDInterpretation = (d: number) => {
    const abs = Math.abs(d);
    if (abs < 0.2) return "Negligible";
    if (abs < 0.5) return "Small";
    if (abs < 0.8) return "Medium";
    return "Large";
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Mean A: ${formatStat(result.meanA, decimals)}
Mean B: ${formatStat(result.meanB, decimals)}
Difference (A-B): ${formatStat(result.diff, decimals)}
SE: ${formatStat(result.se, decimals)}
t: ${formatStat(result.t, decimals)}
df: ${formatStat(result.df, decimals)}
p-value: ${formatStat(result.pValue, decimals)}
${confidence}% CI: [${formatStat(result.ciLower, decimals)}, ${formatStat(result.ciUpper, decimals)}]
Cohen's d: ${formatStat(result.cohenD, decimals)} (${cohenDInterpretation(result.cohenD)})`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Results copied" });
  };

  const handleReset = () => {
    setDataA("");
    setDataB("");
  };

  const faqs = [
    {
      question: "What is the difference in means test?",
      answer: "A difference in means test (two-sample t-test) determines whether the means of two independent groups are statistically different. It computes a t-statistic and p-value to assess the evidence against the null hypothesis that the means are equal."
    },
    {
      question: "What is Cohen's d?",
      answer: "Cohen's d is a measure of effect size that quantifies the difference between two group means in terms of standard deviation units. Common benchmarks: 0.2 = small, 0.5 = medium, 0.8 = large effect."
    },
    {
      question: "When should I assume equal variances?",
      answer: "Assume equal variances (pooled t-test) only if you have strong evidence the population variances are similar, such as from Levene's test. When in doubt, use the Welch t-test, which does not assume equal variances and is generally more robust."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PageHead
        title="Difference in Means Calculator - Calculate 360"
        description="Compare two groups with a two-sample t-test. Calculate the difference in means, confidence interval, and Cohen's d effect size."
        path="/difference-in-means"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Difference in Means Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Compare two groups to determine if their means are statistically different, with effect size analysis.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className={`text-sm font-medium ${!equalVar ? 'text-primary' : 'text-slate-400'}`}>Welch (unequal)</span>
                  <Switch checked={equalVar} onCheckedChange={setEqualVar} data-testid="toggle-equal-var" />
                  <span className={`text-sm font-medium ${equalVar ? 'text-primary' : 'text-slate-400'}`}>Pooled (equal)</span>
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="mb-2 block">Group A Data</Label>
                  <textarea
                    className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter numbers separated by commas, spaces, or new lines"
                    value={dataA}
                    onChange={(e) => setDataA(e.target.value)}
                    data-testid="input-data-a"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Group B Data</Label>
                  <textarea
                    className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter numbers separated by commas, spaces, or new lines"
                    value={dataB}
                    onChange={(e) => setDataB(e.target.value)}
                    data-testid="input-data-b"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label className="mb-1 block">Confidence Level</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {[90, 95, 99].map((c) => (
                    <button
                      key={c}
                      onClick={() => setConfidence(c)}
                      data-testid={`button-conf-${c}`}
                      className={`px-3 py-1 rounded text-sm transition-colors ${confidence === c ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {c}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">How it's calculated</p>
                  <p>t = (x\u0304\u2081 - x\u0304\u2082) / SE. {equalVar ? "Pooled SE uses combined variance estimate." : "Welch's SE adjusts for unequal variances and approximates df."} Cohen's d = (x\u0304\u2081 - x\u0304\u2082) / s_pooled.</p>
                </div>
              </div>

              {result && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${result.t}-${result.pValue}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mean A</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-mean-a">{formatStat(result.meanA, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mean B</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-mean-b">{formatStat(result.meanB, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Difference (A-B)</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-diff">{formatStat(result.diff, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Standard Error</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-se">{formatStat(result.se, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">t Statistic</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-t">{formatStat(result.t, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">df</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-df">{formatStat(result.df, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">p-value (two-tailed)</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-pvalue">{formatStat(result.pValue, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center col-span-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{confidence}% CI for Difference</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-ci">[{formatStat(result.ciLower, decimals)}, {formatStat(result.ciUpper, decimals)}]</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className={`rounded-lg p-4 text-center ${Math.abs(result.cohenD) >= 0.8 ? 'bg-green-50 border border-green-200' : Math.abs(result.cohenD) >= 0.5 ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'}`}>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cohen's d (Effect Size)</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-cohen-d">{formatStat(result.cohenD, decimals)}</p>
                        <p className="text-sm text-muted-foreground mt-1" data-testid="result-effect-label">{cohenDInterpretation(result.cohenD)} effect</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center mt-6">
                      <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 text-muted-foreground" data-testid="button-reset">
                        <RefreshCcw className="w-4 h-4" /> Reset
                      </Button>
                      <Button size="sm" onClick={handleCopy} className="gap-2 bg-slate-900 text-white" data-testid="button-copy">
                        <Copy className="w-4 h-4" /> Copy Result
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <AdSlot position="sidebar" />
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4">Quick Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Use Welch's test by default\u2014it's robust to unequal variances.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Cohen's d benchmarks: 0.2 small, 0.5 medium, 0.8 large.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  If the CI for the difference includes 0, the difference is not significant.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Ensure both groups have at least 2 data points.
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
