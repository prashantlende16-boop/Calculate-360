import { useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { ShareCopyButtons } from "@/components/ShareCopyButtons";
import { RememberInputs } from "@/components/RememberInputs";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { formatINR, formatNumber } from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";

export default function AdsMetricsCalculator() {
  const { values, setValue, resetAll, remember, setRemember } = useCalculatorState(
    "ads-metrics",
    ["impressions", "clicks", "spend", "conversions"]
  );

  const impressions = parseFloat(values.impressions) || 0;
  const clicks = parseFloat(values.clicks) || 0;
  const spend = parseFloat(values.spend) || 0;
  const conversions = parseFloat(values.conversions) || 0;

  const metrics = useMemo(() => {
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : null;
    const cpc = clicks > 0 ? spend / clicks : null;
    const cpa = conversions > 0 ? spend / conversions : null;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : null;
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : null;

    return { cpm, cpc, cpa, ctr, cvr };
  }, [impressions, clicks, spend, conversions]);

  const hasResult = spend > 0 && (impressions > 0 || clicks > 0);

  const resultText = hasResult
    ? `CPM: ${metrics.cpm !== null ? formatINR(metrics.cpm) : "—"} | CPC: ${metrics.cpc !== null ? formatINR(metrics.cpc) : "—"} | CPA: ${metrics.cpa !== null ? formatINR(metrics.cpa) : "—"} | CTR: ${metrics.ctr !== null ? formatNumber(metrics.ctr) + "%" : "—"} | CVR: ${metrics.cvr !== null ? formatNumber(metrics.cvr) + "%" : "—"}`
    : "";

  const faqs = [
    {
      question: "What is CPM and how is it calculated?",
      answer: "CPM stands for Cost Per Mille (thousand impressions). It is calculated as (Total Spend / Total Impressions) x 1000. It tells you how much you pay for every 1,000 ad views.",
    },
    {
      question: "What is a good CTR (Click-Through Rate)?",
      answer: "A good CTR varies by platform and industry. For Google Search ads, 2-5% is considered good. For display ads, 0.5-1% is typical. Social media ads average 0.5-1.5%. Higher CTR indicates more relevant and engaging ads.",
    },
    {
      question: "What is the difference between CPC and CPA?",
      answer: "CPC (Cost Per Click) measures how much you pay for each click on your ad. CPA (Cost Per Acquisition) measures how much you pay for each conversion (sale, signup, etc.). CPA is typically higher than CPC since not every click converts.",
    },
    {
      question: "How can I reduce my CPA?",
      answer: "To reduce CPA: improve ad targeting to reach more relevant audiences, optimize landing pages for conversions, A/B test ad creatives, use negative keywords to filter irrelevant traffic, and refine your bidding strategy.",
    },
    {
      question: "What is CVR (Conversion Rate) and why does it matter?",
      answer: "CVR (Conversion Rate) is the percentage of clicks that result in a conversion. It is calculated as (Conversions / Clicks) x 100. A higher CVR means your landing page and offer are effective at converting visitors.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="CPM/CPC/CPA Calculator - Calculate 360"
        description="Calculate advertising metrics: CPM, CPC, CPA, CTR, and conversion rate from your campaign data."
        path="/ads-metrics"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                CPM / CPC / CPA Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Quickly calculate key advertising metrics from your campaign data — CPM, CPC, CPA, CTR, and CVR.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Impressions</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={values.impressions}
                    onChange={(e) => setValue("impressions", e.target.value)}
                    className="input-field"
                    data-testid="input-impressions"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Clicks</Label>
                  <Input
                    type="number"
                    placeholder="2500"
                    value={values.clicks}
                    onChange={(e) => setValue("clicks", e.target.value)}
                    className="input-field"
                    data-testid="input-clicks"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Total Spend</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">&#8377;</span>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={values.spend}
                      onChange={(e) => setValue("spend", e.target.value)}
                      className="input-field pl-7"
                      data-testid="input-spend"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Conversions</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={values.conversions}
                    onChange={(e) => setValue("conversions", e.target.value)}
                    className="input-field"
                    data-testid="input-conversions"
                  />
                </div>
              </div>

              <div className="mt-6">
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>

              <div className="mt-8 pt-8 border-t border-dashed border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard
                    label="CPM"
                    sublabel="Cost per 1,000 Impressions"
                    value={metrics.cpm !== null ? formatINR(metrics.cpm) : "—"}
                    testId="text-cpm"
                  />
                  <MetricCard
                    label="CPC"
                    sublabel="Cost per Click"
                    value={metrics.cpc !== null ? formatINR(metrics.cpc) : "—"}
                    testId="text-cpc"
                  />
                  <MetricCard
                    label="CPA"
                    sublabel="Cost per Acquisition"
                    value={metrics.cpa !== null ? formatINR(metrics.cpa) : "—"}
                    testId="text-cpa"
                  />
                  <MetricCard
                    label="CTR"
                    sublabel="Click-Through Rate"
                    value={metrics.ctr !== null ? `${formatNumber(metrics.ctr)}%` : "—"}
                    testId="text-ctr"
                  />
                  <MetricCard
                    label="CVR"
                    sublabel="Conversion Rate"
                    value={metrics.cvr !== null ? `${formatNumber(metrics.cvr)}%` : "—"}
                    testId="text-cvr"
                  />
                </div>

                <ShareCopyButtons
                  resultText={resultText}
                  shareParams={values}
                  onReset={resetAll}
                  hasResult={hasResult}
                />
              </div>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <AdSlot position="sidebar" />
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Formulas
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  CPM = (Spend / Impressions) x 1000
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  CPC = Spend / Clicks
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  CPA = Spend / Conversions
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  CTR = (Clicks / Impressions) x 100
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  CVR = (Conversions / Clicks) x 100
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

function MetricCard({ label, sublabel, value, testId }: { label: string; sublabel: string; value: string; testId: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 text-center">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{sublabel}</div>
      <div className="text-xl font-bold text-primary" data-testid={testId}>{value}</div>
      <div className="text-xs font-semibold text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
