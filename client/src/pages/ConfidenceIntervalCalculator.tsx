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
import {
  parseDataInput,
  mean,
  stdDev,
  tInterval,
  zInterval,
  proportionCI,
  formatStat,
} from "@/lib/statsUtils";

export default function ConfidenceIntervalCalculator() {
  const [decimals, setDecimals] = useState(4);
  const { toast } = useToast();

  const [tDataInput, setTDataInput] = useState("");
  const [tUseSummary, setTUseSummary] = useState(false);
  const [tN, setTN] = useState("");
  const [tMean, setTMean] = useState("");
  const [tSD, setTSD] = useState("");
  const [tConfidence, setTConfidence] = useState(95);
  const [tCustomConf, setTCustomConf] = useState("");

  const [zDataInput, setZDataInput] = useState("");
  const [zUseSummary, setZUseSummary] = useState(false);
  const [zN, setZN] = useState("");
  const [zMean, setZMean] = useState("");
  const [zSigma, setZSigma] = useState("");
  const [zConfidence, setZConfidence] = useState(95);
  const [zCustomConf, setZCustomConf] = useState("");

  const [pSuccesses, setPSuccesses] = useState("");
  const [pN, setPN] = useState("");
  const [pConfidence, setPConfidence] = useState(95);
  const [pCustomConf, setPCustomConf] = useState("");

  const tConf = tConfidence === 0 ? parseFloat(tCustomConf) || 0 : tConfidence;
  const zConf = zConfidence === 0 ? parseFloat(zCustomConf) || 0 : zConfidence;
  const pConf = pConfidence === 0 ? parseFloat(pCustomConf) || 0 : pConfidence;

  const tResult = useMemo(() => {
    let n: number, m: number, s: number;
    if (tUseSummary) {
      n = parseFloat(tN);
      m = parseFloat(tMean);
      s = parseFloat(tSD);
      if (!n || !isFinite(m) || !isFinite(s) || n < 2) return null;
    } else {
      const { values } = parseDataInput(tDataInput);
      if (values.length < 2) return null;
      n = values.length;
      m = mean(values);
      s = stdDev(values, false);
    }
    if (tConf <= 0 || tConf >= 100) return null;
    const ci = tInterval(m, s, n, tConf);
    return { lower: ci.lower, upper: ci.upper, margin: ci.margin, n, mean: m, sd: s };
  }, [tDataInput, tUseSummary, tN, tMean, tSD, tConf]);

  const zResult = useMemo(() => {
    let n: number, m: number, sigma: number;
    if (zUseSummary) {
      n = parseFloat(zN);
      m = parseFloat(zMean);
      sigma = parseFloat(zSigma);
      if (!n || !isFinite(m) || !isFinite(sigma) || n < 1) return null;
    } else {
      const { values } = parseDataInput(zDataInput);
      if (values.length < 1) return null;
      n = values.length;
      m = mean(values);
      sigma = parseFloat(zSigma);
      if (!isFinite(sigma) || sigma <= 0) return null;
    }
    if (zConf <= 0 || zConf >= 100) return null;
    const ci = zInterval(m, sigma, n, zConf);
    return { lower: ci.lower, upper: ci.upper, margin: ci.margin, n, mean: m, sd: sigma };
  }, [zDataInput, zUseSummary, zN, zMean, zSigma, zConf]);

  const pResult = useMemo(() => {
    const successes = parseFloat(pSuccesses);
    const n = parseFloat(pN);
    if (!isFinite(successes) || !isFinite(n) || n < 1 || successes < 0 || successes > n) return null;
    if (pConf <= 0 || pConf >= 100) return null;
    const ci = proportionCI(successes, n, pConf);
    return { lower: ci.lower, upper: ci.upper, margin: ci.margin, pHat: ci.pHat, n };
  }, [pSuccesses, pN, pConf]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Result copied" });
  };

  const faqs = [
    {
      question: "What is a confidence interval?",
      answer: "A confidence interval is a range of values that is likely to contain the true population parameter with a certain level of confidence. For example, a 95% CI means if we repeated the study many times, about 95% of the intervals would contain the true parameter."
    },
    {
      question: "When should I use a t-interval vs a z-interval?",
      answer: "Use a t-interval when the population standard deviation is unknown (most common case). Use a z-interval when the population standard deviation (σ) is known. The t-interval accounts for the extra uncertainty from estimating σ with the sample standard deviation."
    },
    {
      question: "What does the margin of error represent?",
      answer: "The margin of error is half the width of the confidence interval. It represents the maximum expected difference between the sample estimate and the true population parameter at the given confidence level."
    }
  ];

  const confButtons = (current: number, setCurrent: (v: number) => void, custom: string, setCustom: (v: string) => void) => (
    <div className="space-y-2">
      <Label className="mb-1 block">Confidence Level</Label>
      <div className="flex flex-wrap items-center gap-2">
        {[90, 95, 99].map((c) => (
          <button
            key={c}
            onClick={() => setCurrent(c)}
            data-testid={`button-conf-${c}`}
            className={`px-3 py-1 rounded text-sm transition-colors ${current === c ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {c}%
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
            placeholder="e.g. 97"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-24"
            data-testid="input-custom-conf"
          />
        )}
      </div>
    </div>
  );

  const renderResults = (result: { lower: number; upper: number; margin: number; n: number; mean?: number; sd?: number; pHat?: number } | null, type: string) => {
    if (!result) return null;
    const copyText = type === "proportion"
      ? `CI: [${formatStat(result.lower, decimals)}, ${formatStat(result.upper, decimals)}]\nMargin of Error: ${formatStat(result.margin, decimals)}\np̂: ${formatStat(result.pHat!, decimals)}\nn: ${result.n}`
      : `CI: [${formatStat(result.lower, decimals)}, ${formatStat(result.upper, decimals)}]\nMargin of Error: ${formatStat(result.margin, decimals)}\nMean: ${formatStat(result.mean!, decimals)}\nSD: ${formatStat(result.sd!, decimals)}\nn: ${result.n}`;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${result.lower}-${result.upper}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Lower Bound</p>
              <p className="text-2xl font-bold text-primary" data-testid="result-lower">{formatStat(result.lower, decimals)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Upper Bound</p>
              <p className="text-2xl font-bold text-primary" data-testid="result-upper">{formatStat(result.upper, decimals)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Margin of Error</p>
              <p className="text-2xl font-bold text-primary" data-testid="result-margin">{formatStat(result.margin, decimals)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">n</p>
              <p className="text-2xl font-bold text-primary" data-testid="result-n">{result.n}</p>
            </div>
            {type !== "proportion" && result.mean !== undefined && (
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mean</p>
                <p className="text-2xl font-bold text-primary" data-testid="result-mean">{formatStat(result.mean, decimals)}</p>
              </div>
            )}
            {type !== "proportion" && result.sd !== undefined && (
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{type === "z" ? "σ" : "SD"}</p>
                <p className="text-2xl font-bold text-primary" data-testid="result-sd">{formatStat(result.sd, decimals)}</p>
              </div>
            )}
            {type === "proportion" && result.pHat !== undefined && (
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">p&#x0302;</p>
                <p className="text-2xl font-bold text-primary" data-testid="result-phat">{formatStat(result.pHat, decimals)}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-center mt-6">
            <Button variant="outline" size="sm" onClick={() => {
              if (type === "t") { setTDataInput(""); setTN(""); setTMean(""); setTSD(""); }
              else if (type === "z") { setZDataInput(""); setZN(""); setZMean(""); setZSigma(""); }
              else { setPSuccesses(""); setPN(""); }
            }} className="gap-2 text-muted-foreground" data-testid="button-reset">
              <RefreshCcw className="w-4 h-4" /> Reset
            </Button>
            <Button size="sm" onClick={() => handleCopy(copyText)} className="gap-2 bg-slate-900 text-white" data-testid="button-copy">
              <Copy className="w-4 h-4" /> Copy Result
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const dataInputToggle = (useSummary: boolean, setUseSummary: (v: boolean) => void) => (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={() => setUseSummary(false)}
        data-testid="button-raw-data"
        className={`px-3 py-1 rounded text-sm transition-colors ${!useSummary ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
      >
        Enter Raw Data
      </button>
      <button
        onClick={() => setUseSummary(true)}
        data-testid="button-summary"
        className={`px-3 py-1 rounded text-sm transition-colors ${useSummary ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
      >
        Enter Summary
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PageHead
        title="Confidence Interval Calculator - Calculate 360"
        description="Calculate confidence intervals for means and proportions using t-interval, z-interval, or proportion methods. Free online statistics calculator."
        path="/confidence-interval"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Confidence Interval Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Calculate confidence intervals for means and proportions with adjustable confidence levels.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-1">
              <Tabs defaultValue="t" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-slate-100/50 rounded-xl gap-1">
                  <TabsTrigger value="t" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-t">t Interval</TabsTrigger>
                  <TabsTrigger value="z" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-z">Z Interval</TabsTrigger>
                  <TabsTrigger value="proportion" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-proportion">Proportion</TabsTrigger>
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
                    <TabsContent value="t" className="mt-0 space-y-6">
                      {dataInputToggle(tUseSummary, setTUseSummary)}
                      {!tUseSummary ? (
                        <div>
                          <Label className="mb-2 block">Data Values</Label>
                          <textarea
                            className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Enter numbers separated by commas, spaces, or new lines"
                            value={tDataInput}
                            onChange={(e) => setTDataInput(e.target.value)}
                            data-testid="input-data"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="mb-2 block">n</Label>
                            <Input type="number" value={tN} onChange={(e) => setTN(e.target.value)} data-testid="input-n" />
                          </div>
                          <div>
                            <Label className="mb-2 block">Mean (x̄)</Label>
                            <Input type="number" value={tMean} onChange={(e) => setTMean(e.target.value)} data-testid="input-mean" />
                          </div>
                          <div>
                            <Label className="mb-2 block">Std Dev (s)</Label>
                            <Input type="number" value={tSD} onChange={(e) => setTSD(e.target.value)} data-testid="input-sd" />
                          </div>
                        </div>
                      )}
                      {confButtons(tConfidence, setTConfidence, tCustomConf, setTCustomConf)}
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">How it's calculated</p>
                          <p>x̄ ± t*(s/√n), where t* is the critical value from the t-distribution with n-1 degrees of freedom.</p>
                        </div>
                      </div>
                      {renderResults(tResult, "t")}
                    </TabsContent>

                    <TabsContent value="z" className="mt-0 space-y-6">
                      {dataInputToggle(zUseSummary, setZUseSummary)}
                      {!zUseSummary ? (
                        <div className="space-y-4">
                          <div>
                            <Label className="mb-2 block">Data Values</Label>
                            <textarea
                              className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              placeholder="Enter numbers separated by commas, spaces, or new lines"
                              value={zDataInput}
                              onChange={(e) => setZDataInput(e.target.value)}
                              data-testid="input-data-z"
                            />
                          </div>
                          <div>
                            <Label className="mb-2 block">Known Population σ</Label>
                            <Input type="number" value={zSigma} onChange={(e) => setZSigma(e.target.value)} placeholder="Population standard deviation" data-testid="input-sigma" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="mb-2 block">n</Label>
                            <Input type="number" value={zN} onChange={(e) => setZN(e.target.value)} data-testid="input-n-z" />
                          </div>
                          <div>
                            <Label className="mb-2 block">Mean (x̄)</Label>
                            <Input type="number" value={zMean} onChange={(e) => setZMean(e.target.value)} data-testid="input-mean-z" />
                          </div>
                          <div>
                            <Label className="mb-2 block">Known σ</Label>
                            <Input type="number" value={zSigma} onChange={(e) => setZSigma(e.target.value)} data-testid="input-sigma-z" />
                          </div>
                        </div>
                      )}
                      {confButtons(zConfidence, setZConfidence, zCustomConf, setZCustomConf)}
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">How it's calculated</p>
                          <p>x̄ ± z*(σ/√n), where z* is the critical value from the standard normal distribution and σ is the known population standard deviation.</p>
                        </div>
                      </div>
                      {renderResults(zResult, "z")}
                    </TabsContent>

                    <TabsContent value="proportion" className="mt-0 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Successes (x)</Label>
                          <Input type="number" value={pSuccesses} onChange={(e) => setPSuccesses(e.target.value)} placeholder="e.g. 45" data-testid="input-successes" />
                        </div>
                        <div>
                          <Label className="mb-2 block">Sample Size (n)</Label>
                          <Input type="number" value={pN} onChange={(e) => setPN(e.target.value)} placeholder="e.g. 100" data-testid="input-n-prop" />
                        </div>
                      </div>
                      {confButtons(pConfidence, setPConfidence, pCustomConf, setPCustomConf)}
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">How it's calculated</p>
                          <p>p̂ ± z*√(p̂(1-p̂)/n), where p̂ = x/n is the sample proportion.</p>
                        </div>
                      </div>
                      {renderResults(pResult ? { ...pResult, mean: undefined, sd: undefined } : null, "proportion")}
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
                  Use the t-interval when σ is unknown (most real-world scenarios).
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Higher confidence levels produce wider intervals.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Larger sample sizes yield narrower, more precise intervals.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  For proportions, ensure np̂ ≥ 10 and n(1-p̂) ≥ 10 for the normal approximation.
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
