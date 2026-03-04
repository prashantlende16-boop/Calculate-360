import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
import { normalCDF, tCDF, chiSquareCDF, formatStat } from "@/lib/statsUtils";

export default function PValueCalculator() {
  const [decimals, setDecimals] = useState(4);
  const { toast } = useToast();

  const [zStat, setZStat] = useState("");
  const [zTail, setZTail] = useState<"left" | "right" | "two">("two");

  const [tStat, setTStat] = useState("");
  const [tDf, setTDf] = useState("");
  const [tTail, setTTail] = useState<"left" | "right" | "two">("two");

  const [chiStat, setChiStat] = useState("");
  const [chiDf, setChiDf] = useState("");

  const zPValue = useMemo(() => {
    const z = parseFloat(zStat);
    if (!isFinite(z)) return null;
    let p: number;
    if (zTail === "left") p = normalCDF(z);
    else if (zTail === "right") p = 1 - normalCDF(z);
    else p = 2 * (1 - normalCDF(Math.abs(z)));
    return p;
  }, [zStat, zTail]);

  const tPValue = useMemo(() => {
    const t = parseFloat(tStat);
    const df = parseFloat(tDf);
    if (!isFinite(t) || !isFinite(df) || df <= 0) return null;
    let p: number;
    if (tTail === "left") p = tCDF(t, df);
    else if (tTail === "right") p = 1 - tCDF(t, df);
    else p = 2 * (1 - tCDF(Math.abs(t), df));
    return p;
  }, [tStat, tDf, tTail]);

  const chiPValue = useMemo(() => {
    const x = parseFloat(chiStat);
    const df = parseFloat(chiDf);
    if (!isFinite(x) || x < 0 || !isFinite(df) || df <= 0) return null;
    return 1 - chiSquareCDF(x, df);
  }, [chiStat, chiDf]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "P-value copied" });
  };

  const interpret = (p: number | null) => {
    if (p === null) return null;
    const levels = [0.01, 0.05, 0.10];
    const results = levels.map((a) => ({
      alpha: a,
      reject: p < a,
    }));
    return results;
  };

  const tailButtons = (current: string, setCurrent: (v: "left" | "right" | "two") => void) => (
    <div className="space-y-2">
      <Label className="mb-1 block">Tail Type</Label>
      <div className="flex flex-wrap items-center gap-2">
        {([["left", "Left-tailed"], ["right", "Right-tailed"], ["two", "Two-tailed"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setCurrent(val)}
            data-testid={`button-tail-${val}`}
            className={`px-3 py-1 rounded text-sm transition-colors ${current === val ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderPValue = (p: number | null, onReset: () => void, copyLabel: string) => {
    if (p === null) return null;
    const interpretation = interpret(p);
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={p.toString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-muted rounded-lg p-4 text-center col-span-1 md:col-span-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">P-Value</p>
              <p className="text-3xl font-bold text-primary" data-testid="result-pvalue">{formatStat(p, decimals)}</p>
              {p < 0.0001 && <p className="text-xs text-muted-foreground mt-1">{p.toExponential(4)}</p>}
            </div>
          </div>

          {interpretation && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Interpretation: If p &lt; α then reject H₀</p>
              <div className="grid grid-cols-3 gap-2">
                {interpretation.map(({ alpha, reject }) => (
                  <div key={alpha} className={`rounded-lg p-3 text-center text-sm ${reject ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className="text-xs text-muted-foreground mb-1">α = {alpha}</p>
                    <p className={`font-semibold ${reject ? 'text-green-700' : 'text-amber-700'}`} data-testid={`result-decision-${alpha}`}>
                      {reject ? "Reject H₀" : "Fail to Reject"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center mt-6">
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2 text-muted-foreground" data-testid="button-reset">
              <RefreshCcw className="w-4 h-4" /> Reset
            </Button>
            <Button size="sm" onClick={() => handleCopy(`${copyLabel} p-value: ${formatStat(p, decimals)}`)} className="gap-2 bg-card dark:bg-background text-white" data-testid="button-copy">
              <Copy className="w-4 h-4" /> Copy Result
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const faqs = [
    {
      question: "What is a p-value?",
      answer: "A p-value is the probability of observing a test statistic as extreme as, or more extreme than, the one calculated from your data, assuming the null hypothesis is true. A small p-value suggests evidence against the null hypothesis."
    },
    {
      question: "What does it mean to reject H₀?",
      answer: "Rejecting the null hypothesis (H₀) means the data provides sufficient evidence that the effect or difference you're testing for is statistically significant at your chosen significance level (α). It does not prove H₀ is false."
    },
    {
      question: "When should I use a one-tailed vs two-tailed test?",
      answer: "Use a one-tailed test when you have a specific directional hypothesis (e.g., mean > 5). Use a two-tailed test when you're testing for any difference in either direction (e.g., mean ≠ 5). Two-tailed tests are more conservative and more commonly used."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <PageHead
        title="P-Value Calculator - Calculate 360"
        description="Calculate p-values from z-scores, t-statistics, or chi-square statistics. Free online hypothesis testing tool."
        path="/p-value"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                P-Value Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Calculate p-values from test statistics for z-tests, t-tests, and chi-square tests.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-1">
              <Tabs defaultValue="z" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl gap-1">
                  <TabsTrigger value="z" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-z">Z-test</TabsTrigger>
                  <TabsTrigger value="t" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-t">t-test</TabsTrigger>
                  <TabsTrigger value="chi" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-chi">Chi-square</TabsTrigger>
                </TabsList>

                <div className="p-6 md:p-8">
                  <div className="flex justify-end mb-6">
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
                    <TabsContent value="z" className="mt-0 space-y-6">
                      <div>
                        <Label className="mb-2 block">Z Statistic</Label>
                        <Input type="number" value={zStat} onChange={(e) => setZStat(e.target.value)} placeholder="e.g. 1.96" data-testid="input-z-stat" />
                      </div>
                      {tailButtons(zTail, setZTail)}
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">How it's calculated</p>
                          <p>Uses the standard normal (Z) distribution CDF to compute the area in the specified tail(s).</p>
                        </div>
                      </div>
                      {renderPValue(zPValue, () => setZStat(""), "Z-test")}
                    </TabsContent>

                    <TabsContent value="t" className="mt-0 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">t Statistic</Label>
                          <Input type="number" value={tStat} onChange={(e) => setTStat(e.target.value)} placeholder="e.g. 2.45" data-testid="input-t-stat" />
                        </div>
                        <div>
                          <Label className="mb-2 block">Degrees of Freedom</Label>
                          <Input type="number" value={tDf} onChange={(e) => setTDf(e.target.value)} placeholder="e.g. 29" data-testid="input-t-df" />
                        </div>
                      </div>
                      {tailButtons(tTail, setTTail)}
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">How it's calculated</p>
                          <p>Uses the Student's t-distribution CDF with the specified degrees of freedom.</p>
                        </div>
                      </div>
                      {renderPValue(tPValue, () => { setTStat(""); setTDf(""); }, "t-test")}
                    </TabsContent>

                    <TabsContent value="chi" className="mt-0 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Chi-square Statistic</Label>
                          <Input type="number" value={chiStat} onChange={(e) => setChiStat(e.target.value)} placeholder="e.g. 7.88" data-testid="input-chi-stat" />
                        </div>
                        <div>
                          <Label className="mb-2 block">Degrees of Freedom</Label>
                          <Input type="number" value={chiDf} onChange={(e) => setChiDf(e.target.value)} placeholder="e.g. 3" data-testid="input-chi-df" />
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-sm text-amber-800">
                        Chi-square tests are always right-tailed.
                      </div>
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">How it's calculated</p>
                          <p>P(X² ≥ observed) using the chi-square CDF. Always computes the right-tail probability.</p>
                        </div>
                      </div>
                      {renderPValue(chiPValue, () => { setChiStat(""); setChiDf(""); }, "Chi-square")}
                    </TabsContent>
                  </motion.div>
                </div>
              </Tabs>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <AdSlot position="sidebar" />
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4">Quick Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  A p-value less than 0.05 is commonly considered statistically significant.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Z-tests assume known population σ; t-tests are for unknown σ.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Chi-square tests are used for categorical data and goodness-of-fit.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Statistical significance does not imply practical significance.
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
