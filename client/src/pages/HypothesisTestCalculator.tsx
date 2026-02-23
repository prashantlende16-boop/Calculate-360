import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  oneSampleTTest,
  welchTTest,
  pooledTTest,
  tCDF,
  formatStat,
} from "@/lib/statsUtils";

export default function HypothesisTestCalculator() {
  const [decimals, setDecimals] = useState(4);
  const { toast } = useToast();

  const [oneUseSummary, setOneUseSummary] = useState(false);
  const [oneDataInput, setOneDataInput] = useState("");
  const [oneN, setOneN] = useState("");
  const [oneMean, setOneMean] = useState("");
  const [oneSD, setOneSD] = useState("");
  const [oneMu0, setOneMu0] = useState("");
  const [oneAlt, setOneAlt] = useState<"two-sided" | "greater" | "less">("two-sided");
  const [oneAlpha, setOneAlpha] = useState(0.05);
  const [oneCustomAlpha, setOneCustomAlpha] = useState("");

  const [twoDataA, setTwoDataA] = useState("");
  const [twoDataB, setTwoDataB] = useState("");
  const [twoAlt, setTwoAlt] = useState<"two-sided" | "greater" | "less">("two-sided");
  const [twoAlpha, setTwoAlpha] = useState(0.05);
  const [twoCustomAlpha, setTwoCustomAlpha] = useState("");
  const [twoEqualVar, setTwoEqualVar] = useState(false);

  const activeOneAlpha = oneAlpha === 0 ? parseFloat(oneCustomAlpha) || 0 : oneAlpha;
  const activeTwoAlpha = twoAlpha === 0 ? parseFloat(twoCustomAlpha) || 0 : twoAlpha;

  const oneResult = useMemo(() => {
    const mu0 = parseFloat(oneMu0);
    if (!isFinite(mu0)) return null;

    if (oneUseSummary) {
      const n = parseFloat(oneN);
      const m = parseFloat(oneMean);
      const s = parseFloat(oneSD);
      if (!n || n < 2 || !isFinite(m) || !isFinite(s) || s <= 0) return null;
      const se = s / Math.sqrt(n);
      const t = (m - mu0) / se;
      const df = n - 1;
      let pValue: number;
      if (oneAlt === "two-sided") {
        pValue = 2 * (1 - tCDF(Math.abs(t), df));
      } else if (oneAlt === "greater") {
        pValue = 1 - tCDF(t, df);
      } else {
        pValue = tCDF(t, df);
      }
      return { t, df, pValue, n, mean: m, sd: s };
    } else {
      const { values } = parseDataInput(oneDataInput);
      if (values.length < 2) return null;
      const result = oneSampleTTest(values, mu0, oneAlt);
      return { ...result, n: values.length, mean: mean(values), sd: stdDev(values, false) };
    }
  }, [oneDataInput, oneUseSummary, oneN, oneMean, oneSD, oneMu0, oneAlt]);

  const twoResult = useMemo(() => {
    const { values: vA } = parseDataInput(twoDataA);
    const { values: vB } = parseDataInput(twoDataB);
    if (vA.length < 2 || vB.length < 2) return null;
    const result = twoEqualVar ? pooledTTest(vA, vB) : welchTTest(vA, vB);
    let pValue = result.pValue;
    if (twoAlt === "greater") {
      pValue = result.t > 0 ? result.pValue / 2 : 1 - result.pValue / 2;
    } else if (twoAlt === "less") {
      pValue = result.t < 0 ? result.pValue / 2 : 1 - result.pValue / 2;
    }
    return {
      t: result.t,
      df: result.df,
      pValue,
      meanA: mean(vA),
      meanB: mean(vB),
      sdA: stdDev(vA, false),
      sdB: stdDev(vB, false),
      nA: vA.length,
      nB: vB.length,
    };
  }, [twoDataA, twoDataB, twoAlt, twoEqualVar]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Result copied" });
  };

  const altButtons = (current: string, setCurrent: (v: "two-sided" | "greater" | "less") => void) => (
    <div className="space-y-2">
      <Label className="mb-1 block">Alternative Hypothesis</Label>
      <div className="flex flex-wrap items-center gap-2">
        {([["two-sided", "\u2260 (two-sided)"], ["greater", "> (right)"], ["less", "< (left)"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setCurrent(val)}
            data-testid={`button-alt-${val}`}
            className={`px-3 py-1 rounded text-sm transition-colors ${current === val ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  const alphaButtons = (current: number, setCurrent: (v: number) => void, custom: string, setCustom: (v: string) => void) => (
    <div className="space-y-2">
      <Label className="mb-1 block">Significance Level (\u03B1)</Label>
      <div className="flex flex-wrap items-center gap-2">
        {[0.10, 0.05, 0.01].map((a) => (
          <button
            key={a}
            onClick={() => setCurrent(a)}
            data-testid={`button-alpha-${a}`}
            className={`px-3 py-1 rounded text-sm transition-colors ${current === a ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {a}
          </button>
        ))}
        <button
          onClick={() => setCurrent(0)}
          className={`px-3 py-1 rounded text-sm transition-colors ${current === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          Custom
        </button>
        {current === 0 && (
          <Input
            type="number"
            placeholder="e.g. 0.025"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-24"
            data-testid="input-custom-alpha"
          />
        )}
      </div>
    </div>
  );

  const renderDecision = (pValue: number, alpha: number) => {
    const reject = pValue < alpha;
    return (
      <div className={`rounded-lg p-4 text-center mt-4 ${reject ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Decision (\u03B1 = {alpha})</p>
        <p className={`text-xl font-bold ${reject ? 'text-green-700' : 'text-amber-700'}`} data-testid="result-decision">
          {reject ? "Reject H\u2080" : "Fail to Reject H\u2080"}
        </p>
      </div>
    );
  };

  const faqs = [
    {
      question: "What is a hypothesis test?",
      answer: "A hypothesis test is a statistical method used to determine whether there is enough evidence in a sample to reject a null hypothesis (H\u2080). The null hypothesis typically represents a default position, such as 'no effect' or 'no difference'."
    },
    {
      question: "What is the difference between one-sample and two-sample t-tests?",
      answer: "A one-sample t-test compares the mean of a single sample to a known or hypothesized value (\u03BC\u2080). A two-sample t-test compares the means of two independent groups to determine if they are significantly different from each other."
    },
    {
      question: "What does 'fail to reject H\u2080' mean?",
      answer: "Failing to reject H\u2080 means the data does not provide sufficient evidence against the null hypothesis at the chosen significance level. It does not prove H\u2080 is true\u2014only that there isn't enough evidence to conclude it is false."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PageHead
        title="Hypothesis Test Calculator - Calculate 360"
        description="Perform one-sample and two-sample t-tests with detailed results including test statistic, p-value, and decision. Free online statistics tool."
        path="/hypothesis-test"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Hypothesis Test Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Perform one-sample and two-sample t-tests to test hypotheses about population means.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-1">
              <Tabs defaultValue="one" className="w-full">
                <TabsList className="w-full grid grid-cols-2 h-auto p-1 bg-slate-100/50 rounded-xl gap-1">
                  <TabsTrigger value="one" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-one-sample">One-Sample t-test</TabsTrigger>
                  <TabsTrigger value="two" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-two-sample">Two-Sample t-test</TabsTrigger>
                </TabsList>

                <div className="p-6 md:p-8">
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
                    <TabsContent value="one" className="mt-0 space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          onClick={() => setOneUseSummary(false)}
                          data-testid="button-raw-data"
                          className={`px-3 py-1 rounded text-sm transition-colors ${!oneUseSummary ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          Enter Raw Data
                        </button>
                        <button
                          onClick={() => setOneUseSummary(true)}
                          data-testid="button-summary"
                          className={`px-3 py-1 rounded text-sm transition-colors ${oneUseSummary ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          Enter Summary
                        </button>
                      </div>

                      {!oneUseSummary ? (
                        <div>
                          <Label className="mb-2 block">Sample Data</Label>
                          <textarea
                            className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Enter numbers separated by commas, spaces, or new lines"
                            value={oneDataInput}
                            onChange={(e) => setOneDataInput(e.target.value)}
                            data-testid="input-data"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="mb-2 block">n</Label>
                            <Input type="number" value={oneN} onChange={(e) => setOneN(e.target.value)} data-testid="input-n" />
                          </div>
                          <div>
                            <Label className="mb-2 block">Mean (x\u0304)</Label>
                            <Input type="number" value={oneMean} onChange={(e) => setOneMean(e.target.value)} data-testid="input-mean" />
                          </div>
                          <div>
                            <Label className="mb-2 block">Std Dev (s)</Label>
                            <Input type="number" value={oneSD} onChange={(e) => setOneSD(e.target.value)} data-testid="input-sd" />
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="mb-2 block">Null Hypothesis Value (\u03BC\u2080)</Label>
                        <Input type="number" value={oneMu0} onChange={(e) => setOneMu0(e.target.value)} placeholder="e.g. 0" data-testid="input-mu0" />
                      </div>

                      {altButtons(oneAlt, setOneAlt)}
                      {alphaButtons(oneAlpha, setOneAlpha, oneCustomAlpha, setOneCustomAlpha)}

                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">How it's calculated</p>
                          <p>t = (x\u0304 - \u03BC\u2080) / (s/\u221An), with df = n - 1. The p-value is computed from the t-distribution.</p>
                        </div>
                      </div>

                      {oneResult && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${oneResult.t}-${oneResult.pValue}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                              <div className="bg-slate-50 rounded-lg p-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">t Statistic</p>
                                <p className="text-2xl font-bold text-primary" data-testid="result-t">{formatStat(oneResult.t, decimals)}</p>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">df</p>
                                <p className="text-2xl font-bold text-primary" data-testid="result-df">{formatStat(oneResult.df, decimals)}</p>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">p-value</p>
                                <p className="text-2xl font-bold text-primary" data-testid="result-pvalue">{formatStat(oneResult.pValue, decimals)}</p>
                              </div>
                            </div>
                            {activeOneAlpha > 0 && renderDecision(oneResult.pValue, activeOneAlpha)}
                            <div className="flex gap-2 justify-center mt-6">
                              <Button variant="outline" size="sm" onClick={() => { setOneDataInput(""); setOneN(""); setOneMean(""); setOneSD(""); setOneMu0(""); }} className="gap-2 text-muted-foreground" data-testid="button-reset">
                                <RefreshCcw className="w-4 h-4" /> Reset
                              </Button>
                              <Button size="sm" onClick={() => handleCopy(`t = ${formatStat(oneResult.t, decimals)}, df = ${formatStat(oneResult.df, decimals)}, p = ${formatStat(oneResult.pValue, decimals)}`)} className="gap-2 bg-slate-900 text-white" data-testid="button-copy">
                                <Copy className="w-4 h-4" /> Copy Result
                              </Button>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </TabsContent>

                    <TabsContent value="two" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Group A Data</Label>
                          <textarea
                            className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Enter numbers separated by commas, spaces, or new lines"
                            value={twoDataA}
                            onChange={(e) => setTwoDataA(e.target.value)}
                            data-testid="input-data-a"
                          />
                        </div>
                        <div>
                          <Label className="mb-2 block">Group B Data</Label>
                          <textarea
                            className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Enter numbers separated by commas, spaces, or new lines"
                            value={twoDataB}
                            onChange={(e) => setTwoDataB(e.target.value)}
                            data-testid="input-data-b"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className={`text-sm font-medium ${!twoEqualVar ? 'text-primary' : 'text-slate-400'}`}>Welch (unequal var)</span>
                        <Switch checked={twoEqualVar} onCheckedChange={setTwoEqualVar} data-testid="toggle-equal-var" />
                        <span className={`text-sm font-medium ${twoEqualVar ? 'text-primary' : 'text-slate-400'}`}>Pooled (equal var)</span>
                      </div>

                      {altButtons(twoAlt, setTwoAlt)}
                      {alphaButtons(twoAlpha, setTwoAlpha, twoCustomAlpha, setTwoCustomAlpha)}

                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">How it's calculated</p>
                          <p>t = (x\u0304\u2081 - x\u0304\u2082) / SE. Welch's test adjusts degrees of freedom for unequal variances. Pooled test assumes equal variances.</p>
                        </div>
                      </div>

                      {twoResult && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${twoResult.t}-${twoResult.pValue}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                              <div className="bg-slate-50 rounded-lg p-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">t Statistic</p>
                                <p className="text-2xl font-bold text-primary" data-testid="result-t-two">{formatStat(twoResult.t, decimals)}</p>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">df</p>
                                <p className="text-2xl font-bold text-primary" data-testid="result-df-two">{formatStat(twoResult.df, decimals)}</p>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">p-value</p>
                                <p className="text-2xl font-bold text-primary" data-testid="result-pvalue-two">{formatStat(twoResult.pValue, decimals)}</p>
                              </div>
                            </div>
                            {activeTwoAlpha > 0 && renderDecision(twoResult.pValue, activeTwoAlpha)}
                            <div className="flex gap-2 justify-center mt-6">
                              <Button variant="outline" size="sm" onClick={() => { setTwoDataA(""); setTwoDataB(""); }} className="gap-2 text-muted-foreground" data-testid="button-reset-two">
                                <RefreshCcw className="w-4 h-4" /> Reset
                              </Button>
                              <Button size="sm" onClick={() => handleCopy(`t = ${formatStat(twoResult.t, decimals)}, df = ${formatStat(twoResult.df, decimals)}, p = ${formatStat(twoResult.pValue, decimals)}`)} className="gap-2 bg-slate-900 text-white" data-testid="button-copy-two">
                                <Copy className="w-4 h-4" /> Copy Result
                              </Button>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}

                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-sm text-amber-800 mt-4">
                        <p className="font-semibold mb-1">Assumptions</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Both samples are independent and randomly selected.</li>
                          <li>Data should be approximately normally distributed (especially for small samples).</li>
                          <li>Use Welch's test when unsure about equal variances.</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </motion.div>
                </div>
              </Tabs>
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
                  Choose \u03B1 = 0.05 as a standard significance level.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Use Welch's test when sample sizes or variances differ.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  A two-sided test is more conservative than a one-sided test.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Always check that your data meets the assumptions of the test.
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
