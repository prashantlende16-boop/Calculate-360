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
import { parsePairedData, linearRegression, formatStat } from "@/lib/statsUtils";

export default function LinearRegressionCalculator() {
  const [dataInput, setDataInput] = useState("");
  const [decimals, setDecimals] = useState(4);
  const { toast } = useToast();

  const { pairs, errors } = useMemo(() => parsePairedData(dataInput), [dataInput]);

  const results = useMemo(() => {
    if (pairs.length < 2) return null;
    const reg = linearRegression(pairs);
    return { ...reg, n: pairs.length };
  }, [pairs]);

  const handleReset = () => {
    setDataInput("");
  };

  const handleCopy = () => {
    if (!results) return;
    const text = `Regression Equation: ŷ = ${formatStat(results.intercept, decimals)} + ${formatStat(results.slope, decimals)}x\nSlope (b): ${formatStat(results.slope, decimals)}\nIntercept (a): ${formatStat(results.intercept, decimals)}\nR²: ${formatStat(results.rSquared, decimals)}\nCorrelation (r): ${formatStat(results.r, decimals)}\nStandard Error: ${formatStat(results.standardError, decimals)}\nn: ${results.n}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Linear regression results copied" });
  };

  const svgChart = useMemo(() => {
    if (!results || pairs.length < 2) return null;

    const width = 400;
    const height = 300;
    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    const xs = pairs.map(p => p[0]);
    const ys = pairs.map(p => p[1]);
    let xMin = Math.min(...xs);
    let xMax = Math.max(...xs);
    let yMin = Math.min(...ys);
    let yMax = Math.max(...ys);

    const regLineY0 = results.intercept + results.slope * xMin;
    const regLineY1 = results.intercept + results.slope * xMax;
    yMin = Math.min(yMin, regLineY0, regLineY1);
    yMax = Math.max(yMax, regLineY0, regLineY1);

    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    xMin -= xRange * 0.05;
    xMax += xRange * 0.05;
    yMin -= yRange * 0.05;
    yMax += yRange * 0.05;

    const scaleX = (v: number) => pad.left + ((v - xMin) / (xMax - xMin)) * plotW;
    const scaleY = (v: number) => pad.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    const xTicks: number[] = [];
    const yTicks: number[] = [];
    const xStep = (xMax - xMin) / 5;
    const yStep = (yMax - yMin) / 5;
    for (let i = 0; i <= 5; i++) {
      xTicks.push(xMin + i * xStep);
      yTicks.push(yMin + i * yStep);
    }

    return { width, height, pad, scaleX, scaleY, xTicks, yTicks, xMin, xMax };
  }, [results, pairs]);

  const faqs = [
    {
      question: "What is linear regression?",
      answer: "Linear regression is a statistical method for modeling the relationship between a dependent variable (Y) and one or more independent variables (X). Simple linear regression fits a straight line ŷ = a + bx to the data, minimizing the sum of squared residuals."
    },
    {
      question: "How do I interpret R² (R-squared)?",
      answer: "R² indicates the proportion of variance in the dependent variable explained by the model. An R² of 0.85 means 85% of the variation in Y is explained by X. Values range from 0 to 1, with higher values indicating a better fit."
    },
    {
      question: "What does the standard error of estimate tell me?",
      answer: "The standard error of the estimate measures the average distance that observed values fall from the regression line. A smaller standard error indicates that data points are closer to the fitted line, meaning the model's predictions are more precise."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PageHead
        title="Linear Regression Calculator - Calculate 360"
        description="Free online linear regression calculator. Compute slope, intercept, R-squared, correlation coefficient, and visualize your data with an interactive scatter plot."
        path="/linear-regression"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Linear Regression Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Fit a line to your data and compute slope, intercept, R², and correlation coefficient.
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

              <div className="space-y-2">
                <Label>Enter X, Y Data Pairs</Label>
                <textarea
                  className="w-full min-h-[160px] p-3 rounded-lg border border-border bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={"Enter X,Y pairs, one per line\nExample:\n1, 2\n2, 4\n3, 5\n4, 4\n5, 7"}
                  value={dataInput}
                  onChange={(e) => setDataInput(e.target.value)}
                  data-testid="input-paired-data"
                />
              </div>

              <AnimatePresence>
                {errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-sm text-destructive bg-destructive/5 rounded-lg p-3 border border-destructive/10"
                  >
                    {errors.map((err) => (
                      <p key={err.line}>Line {err.line}: Invalid — "{err.text}"</p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {dataInput && pairs.length < 2 && errors.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">Enter at least 2 valid X,Y pairs to calculate.</p>
              )}

              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={handleReset} data-testid="button-reset">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" onClick={handleCopy} disabled={!results} data-testid="button-copy">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Result
                </Button>
              </div>

              <AnimatePresence>
                {results && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-primary/5 rounded-xl p-6 text-center border border-primary/10 mt-6">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Regression Equation</p>
                      <p className="text-xl font-bold font-mono text-primary" data-testid="result-equation">
                        ŷ = {formatStat(results.intercept, decimals)} + {formatStat(results.slope, decimals)}x
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Slope (b)</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-slope">{formatStat(results.slope, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Intercept (a)</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-intercept">{formatStat(results.intercept, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">R² Value</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-r-squared">{formatStat(results.rSquared, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Correlation (r)</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-r">{formatStat(results.r, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Std Error</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-std-error">{formatStat(results.standardError, decimals)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Data Points</p>
                        <p className="text-2xl font-bold text-primary" data-testid="result-n">{results.n}</p>
                      </div>
                    </div>

                    {svgChart && (
                      <div className="mt-6 bg-white rounded-xl border border-border p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 text-center">Scatter Plot with Regression Line</p>
                        <svg viewBox={`0 0 ${svgChart.width} ${svgChart.height}`} className="w-full" data-testid="chart-scatter">
                          {svgChart.yTicks.map((t, i) => (
                            <g key={`yg-${i}`}>
                              <line
                                x1={svgChart.pad.left}
                                y1={svgChart.scaleY(t)}
                                x2={svgChart.width - svgChart.pad.right}
                                y2={svgChart.scaleY(t)}
                                stroke="#e2e8f0"
                                strokeWidth={1}
                              />
                              <text
                                x={svgChart.pad.left - 6}
                                y={svgChart.scaleY(t) + 4}
                                textAnchor="end"
                                fontSize={10}
                                fill="#94a3b8"
                              >
                                {t.toFixed(1)}
                              </text>
                            </g>
                          ))}
                          {svgChart.xTicks.map((t, i) => (
                            <g key={`xg-${i}`}>
                              <line
                                x1={svgChart.scaleX(t)}
                                y1={svgChart.pad.top}
                                x2={svgChart.scaleX(t)}
                                y2={svgChart.height - svgChart.pad.bottom}
                                stroke="#e2e8f0"
                                strokeWidth={1}
                              />
                              <text
                                x={svgChart.scaleX(t)}
                                y={svgChart.height - svgChart.pad.bottom + 16}
                                textAnchor="middle"
                                fontSize={10}
                                fill="#94a3b8"
                              >
                                {t.toFixed(1)}
                              </text>
                            </g>
                          ))}

                          <line
                            x1={svgChart.pad.left}
                            y1={svgChart.height - svgChart.pad.bottom}
                            x2={svgChart.width - svgChart.pad.right}
                            y2={svgChart.height - svgChart.pad.bottom}
                            stroke="#cbd5e1"
                            strokeWidth={1}
                          />
                          <line
                            x1={svgChart.pad.left}
                            y1={svgChart.pad.top}
                            x2={svgChart.pad.left}
                            y2={svgChart.height - svgChart.pad.bottom}
                            stroke="#cbd5e1"
                            strokeWidth={1}
                          />

                          <text
                            x={svgChart.width / 2}
                            y={svgChart.height - 4}
                            textAnchor="middle"
                            fontSize={11}
                            fill="#64748b"
                          >
                            X
                          </text>
                          <text
                            x={12}
                            y={svgChart.height / 2}
                            textAnchor="middle"
                            fontSize={11}
                            fill="#64748b"
                            transform={`rotate(-90, 12, ${svgChart.height / 2})`}
                          >
                            Y
                          </text>

                          <line
                            x1={svgChart.scaleX(svgChart.xMin)}
                            y1={svgChart.scaleY(results.intercept + results.slope * svgChart.xMin)}
                            x2={svgChart.scaleX(svgChart.xMax)}
                            y2={svgChart.scaleY(results.intercept + results.slope * svgChart.xMax)}
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                          />

                          {pairs.map((p, i) => (
                            <circle
                              key={i}
                              cx={svgChart.scaleX(p[0])}
                              cy={svgChart.scaleY(p[1])}
                              r={4}
                              fill="hsl(var(--primary))"
                              opacity={0.8}
                            />
                          ))}
                        </svg>
                      </div>
                    )}

                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2 mt-6">
                      <Info className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">How it's calculated</p>
                        <p>Slope b = (n&Sigma;xy - &Sigma;x&Sigma;y) / (n&Sigma;x&sup2; - (&Sigma;x)&sup2;), Intercept a = ȳ - bx̄</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <AdSlot position="sidebar" />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4">Quick Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">*</span>
                  R² 0.7–1.0 indicates a strong linear relationship.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">*</span>
                  R² 0.3–0.7 suggests a moderate linear relationship.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">*</span>
                  R² 0.0–0.3 means a weak or no linear relationship.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">*</span>
                  A negative slope means Y decreases as X increases.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">*</span>
                  Enter data as "x, y" or "x y" — one pair per line.
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
