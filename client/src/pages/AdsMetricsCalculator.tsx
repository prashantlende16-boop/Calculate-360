import { useMemo, useState } from "react";
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
import { BarChart3, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const allFields = [
  "impressions", "viewableImpressions", "reach",
  "clicks", "uniqueClicks",
  "spend", "revenue",
  "conversions", "leads", "orders",
  "viewThroughConversions", "channelConversions", "totalConversions",
  "starts", "views25", "views50", "views75", "completedViews", "views",
  "engagements", "sessions", "lpViews",
  "atc", "checkouts", "purchases",
  "testValue", "controlValue",
];

const inputGroups = [
  {
    label: "Core Campaign",
    fields: [
      { key: "impressions", label: "Impressions", placeholder: "100000" },
      { key: "viewableImpressions", label: "Viewable Impressions", placeholder: "80000" },
      { key: "reach", label: "Reach", placeholder: "60000" },
      { key: "clicks", label: "Clicks", placeholder: "2500" },
      { key: "uniqueClicks", label: "Unique Clicks", placeholder: "2200" },
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "revenue", label: "Revenue", placeholder: "200000", prefix: true },
    ],
  },
  {
    label: "Conversions & Orders",
    fields: [
      { key: "conversions", label: "Conversions", placeholder: "100" },
      { key: "leads", label: "Leads", placeholder: "150" },
      { key: "orders", label: "Orders", placeholder: "80" },
      { key: "viewThroughConversions", label: "View-through Conversions", placeholder: "25" },
      { key: "channelConversions", label: "Conversions from Channel", placeholder: "60" },
      { key: "totalConversions", label: "Total Conversions (all channels)", placeholder: "200" },
    ],
  },
  {
    label: "Video Metrics",
    fields: [
      { key: "starts", label: "Video Starts", placeholder: "5000" },
      { key: "views25", label: "25% Views", placeholder: "4000" },
      { key: "views50", label: "50% Views", placeholder: "3000" },
      { key: "views75", label: "75% Views", placeholder: "2000" },
      { key: "completedViews", label: "Completed Views", placeholder: "1500" },
      { key: "views", label: "Total Views", placeholder: "5000" },
    ],
  },
  {
    label: "Engagement & Funnel",
    fields: [
      { key: "engagements", label: "Engagements", placeholder: "3000" },
      { key: "sessions", label: "Sessions", placeholder: "8000" },
      { key: "lpViews", label: "Landing Page Views", placeholder: "2000" },
      { key: "atc", label: "Add to Cart (ATC)", placeholder: "500" },
      { key: "checkouts", label: "Checkouts", placeholder: "300" },
      { key: "purchases", label: "Purchases", placeholder: "200" },
    ],
  },
  {
    label: "Lift Testing",
    fields: [
      { key: "testValue", label: "Test Group Value", placeholder: "150" },
      { key: "controlValue", label: "Control Group Value", placeholder: "100" },
    ],
  },
];

interface MetricDef {
  name: string;
  fullForm: string;
  formula: string;
  calculate: (v: Record<string, number>) => number | null;
  format: "currency" | "percent" | "number" | "ratio";
}

const metricDefinitions: { category: string; metrics: MetricDef[] }[] = [
  {
    category: "Reach & Awareness",
    metrics: [
      { name: "Frequency", fullForm: "", formula: "Impressions / Reach", calculate: (v) => v.reach > 0 ? v.impressions / v.reach : null, format: "number" },
      { name: "Viewability Rate", fullForm: "", formula: "Viewable Impressions / Impressions", calculate: (v) => v.impressions > 0 ? (v.viewableImpressions / v.impressions) * 100 : null, format: "percent" },
      { name: "Cost per Reach", fullForm: "", formula: "Spend / Reach", calculate: (v) => v.reach > 0 ? v.spend / v.reach : null, format: "currency" },
    ],
  },
  {
    category: "Click Performance",
    metrics: [
      { name: "CTR", fullForm: "Click Through Rate", formula: "Clicks / Impressions", calculate: (v) => v.impressions > 0 ? (v.clicks / v.impressions) * 100 : null, format: "percent" },
      { name: "Unique CTR", fullForm: "", formula: "Unique Clicks / Reach", calculate: (v) => v.reach > 0 ? (v.uniqueClicks / v.reach) * 100 : null, format: "percent" },
      { name: "Blended CTR", fullForm: "", formula: "Total Clicks / Total Impressions", calculate: (v) => v.impressions > 0 ? (v.clicks / v.impressions) * 100 : null, format: "percent" },
    ],
  },
  {
    category: "Cost Metrics",
    metrics: [
      { name: "CPC", fullForm: "Cost Per Click", formula: "Spend / Clicks", calculate: (v) => v.clicks > 0 ? v.spend / v.clicks : null, format: "currency" },
      { name: "CPM", fullForm: "Cost Per Mille", formula: "(Spend / Impressions) x 1000", calculate: (v) => v.impressions > 0 ? (v.spend / v.impressions) * 1000 : null, format: "currency" },
      { name: "vCPM", fullForm: "Viewable CPM", formula: "(Spend / Viewable Impressions) x 1000", calculate: (v) => v.viewableImpressions > 0 ? (v.spend / v.viewableImpressions) * 1000 : null, format: "currency" },
      { name: "CPA", fullForm: "Cost Per Acquisition", formula: "Spend / Conversions", calculate: (v) => v.conversions > 0 ? v.spend / v.conversions : null, format: "currency" },
      { name: "CPL", fullForm: "Cost Per Lead", formula: "Spend / Leads", calculate: (v) => v.leads > 0 ? v.spend / v.leads : null, format: "currency" },
      { name: "CPV", fullForm: "Cost Per View", formula: "Spend / Views", calculate: (v) => v.views > 0 ? v.spend / v.views : null, format: "currency" },
      { name: "CPE", fullForm: "Cost Per Engagement", formula: "Spend / Engagements", calculate: (v) => v.engagements > 0 ? v.spend / v.engagements : null, format: "currency" },
      { name: "eCPA", fullForm: "Effective CPA (Blended)", formula: "Total Spend / Total Conversions", calculate: (v) => v.conversions > 0 ? v.spend / v.conversions : null, format: "currency" },
    ],
  },
  {
    category: "Conversion Metrics",
    metrics: [
      { name: "CVR", fullForm: "Conversion Rate", formula: "Conversions / Clicks", calculate: (v) => v.clicks > 0 ? (v.conversions / v.clicks) * 100 : null, format: "percent" },
      { name: "Post-Click CVR", fullForm: "", formula: "Conversions / Clicks", calculate: (v) => v.clicks > 0 ? (v.conversions / v.clicks) * 100 : null, format: "percent" },
      { name: "Post-View CVR", fullForm: "", formula: "View-through Conversions / Impressions", calculate: (v) => v.impressions > 0 ? (v.viewThroughConversions / v.impressions) * 100 : null, format: "percent" },
      { name: "CvPm", fullForm: "Conversions per 1000 Impressions", formula: "(Conversions / Impressions) x 1000", calculate: (v) => v.impressions > 0 ? (v.conversions / v.impressions) * 1000 : null, format: "number" },
      { name: "Conv. Rate (Impression)", fullForm: "Conversion Rate (Impression Based)", formula: "Conversions / Impressions", calculate: (v) => v.impressions > 0 ? (v.conversions / v.impressions) * 100 : null, format: "percent" },
      { name: "Effective Frequency", fullForm: "", formula: "Conversions / Reach", calculate: (v) => v.reach > 0 ? v.conversions / v.reach : null, format: "number" },
    ],
  },
  {
    category: "Revenue & ROI",
    metrics: [
      { name: "ROAS", fullForm: "Return on Ad Spend", formula: "Revenue / Spend", calculate: (v) => v.spend > 0 ? v.revenue / v.spend : null, format: "ratio" },
      { name: "ROI", fullForm: "Return on Investment", formula: "(Revenue - Spend) / Spend", calculate: (v) => v.spend > 0 ? ((v.revenue - v.spend) / v.spend) * 100 : null, format: "percent" },
      { name: "AOV", fullForm: "Avg Order Value", formula: "Revenue / Orders", calculate: (v) => v.orders > 0 ? v.revenue / v.orders : null, format: "currency" },
    ],
  },
  {
    category: "Video Performance",
    metrics: [
      { name: "25% View Rate", fullForm: "", formula: "25% Views / Starts", calculate: (v) => v.starts > 0 ? (v.views25 / v.starts) * 100 : null, format: "percent" },
      { name: "50% View Rate", fullForm: "", formula: "50% Views / Starts", calculate: (v) => v.starts > 0 ? (v.views50 / v.starts) * 100 : null, format: "percent" },
      { name: "75% View Rate", fullForm: "", formula: "75% Views / Starts", calculate: (v) => v.starts > 0 ? (v.views75 / v.starts) * 100 : null, format: "percent" },
      { name: "100% Completion Rate", fullForm: "", formula: "Completed Views / Starts", calculate: (v) => v.starts > 0 ? (v.completedViews / v.starts) * 100 : null, format: "percent" },
      { name: "VTR", fullForm: "View Through Rate", formula: "Completed Views / Impressions", calculate: (v) => v.impressions > 0 ? (v.completedViews / v.impressions) * 100 : null, format: "percent" },
    ],
  },
  {
    category: "Engagement & Funnel",
    metrics: [
      { name: "Engagement Rate", fullForm: "", formula: "Engagements / Impressions", calculate: (v) => v.impressions > 0 ? (v.engagements / v.impressions) * 100 : null, format: "percent" },
      { name: "Landing Page View Rate", fullForm: "", formula: "LP Views / Clicks", calculate: (v) => v.clicks > 0 ? (v.lpViews / v.clicks) * 100 : null, format: "percent" },
      { name: "Add to Cart Rate", fullForm: "", formula: "ATC / Sessions", calculate: (v) => v.sessions > 0 ? (v.atc / v.sessions) * 100 : null, format: "percent" },
      { name: "Checkout Rate", fullForm: "", formula: "Checkouts / ATC", calculate: (v) => v.atc > 0 ? (v.checkouts / v.atc) * 100 : null, format: "percent" },
      { name: "Purchase Rate", fullForm: "", formula: "Purchases / Sessions", calculate: (v) => v.sessions > 0 ? (v.purchases / v.sessions) * 100 : null, format: "percent" },
    ],
  },
  {
    category: "Attribution & Lift",
    metrics: [
      { name: "Share of Attribution", fullForm: "", formula: "Channel Conversions / Total Conversions", calculate: (v) => v.totalConversions > 0 ? (v.channelConversions / v.totalConversions) * 100 : null, format: "percent" },
      { name: "Incremental Lift", fullForm: "", formula: "(Test - Control) / Control", calculate: (v) => v.controlValue > 0 ? ((v.testValue - v.controlValue) / v.controlValue) * 100 : null, format: "percent" },
    ],
  },
];

const referenceTable = [
  { metric: "Frequency", fullForm: "", formula: "Impressions \u00f7 Reach" },
  { metric: "Viewability Rate", fullForm: "", formula: "Viewable Impressions \u00f7 Impressions" },
  { metric: "CTR", fullForm: "Click Through Rate", formula: "Clicks \u00f7 Impressions" },
  { metric: "Unique CTR", fullForm: "", formula: "Unique Clicks \u00f7 Reach" },
  { metric: "CPC", fullForm: "Cost Per Click", formula: "Spend \u00f7 Clicks" },
  { metric: "CPM", fullForm: "Cost Per Mille", formula: "(Spend \u00f7 Impressions) \u00d7 1000" },
  { metric: "vCPM", fullForm: "Viewable CPM", formula: "(Spend \u00f7 Viewable Impressions) \u00d7 1000" },
  { metric: "CPA", fullForm: "Cost Per Acquisition", formula: "Spend \u00f7 Conversions" },
  { metric: "CPL", fullForm: "Cost Per Lead", formula: "Spend \u00f7 Leads" },
  { metric: "CVR", fullForm: "Conversion Rate", formula: "Conversions \u00f7 Clicks" },
  { metric: "Post-Click CVR", fullForm: "", formula: "Conversions \u00f7 Clicks" },
  { metric: "Post-View CVR", fullForm: "", formula: "View-through Conversions \u00f7 Impressions" },
  { metric: "CvPm", fullForm: "Conversions per 1000 Impressions", formula: "(Conversions \u00f7 Impressions) \u00d7 1000" },
  { metric: "Conv. Rate (Impression)", fullForm: "Conversion Rate (Impression Based)", formula: "Conversions \u00f7 Impressions" },
  { metric: "ROAS", fullForm: "Return on Ad Spend", formula: "Revenue \u00f7 Spend" },
  { metric: "ROI", fullForm: "Return on Investment", formula: "(Revenue \u2212 Spend) \u00f7 Spend" },
  { metric: "AOV", fullForm: "Avg Order Value", formula: "Revenue \u00f7 Orders" },
  { metric: "25% View Rate", fullForm: "", formula: "25% Views \u00f7 Starts" },
  { metric: "50% View Rate", fullForm: "", formula: "50% Views \u00f7 Starts" },
  { metric: "75% View Rate", fullForm: "", formula: "75% Views \u00f7 Starts" },
  { metric: "100% Completion Rate", fullForm: "", formula: "Completed Views \u00f7 Starts" },
  { metric: "VTR", fullForm: "View Through Rate", formula: "Completed Views \u00f7 Impressions" },
  { metric: "CPV", fullForm: "Cost Per View", formula: "Spend \u00f7 Views" },
  { metric: "Engagement Rate", fullForm: "", formula: "Engagements \u00f7 Impressions" },
  { metric: "CPE", fullForm: "Cost Per Engagement", formula: "Spend \u00f7 Engagements" },
  { metric: "Share of Attribution", fullForm: "", formula: "Channel Conversions \u00f7 Total Conversions" },
  { metric: "Landing Page View Rate", fullForm: "", formula: "LP Views \u00f7 Clicks" },
  { metric: "Add to Cart Rate", fullForm: "", formula: "ATC \u00f7 Sessions" },
  { metric: "Checkout Rate", fullForm: "", formula: "Checkouts \u00f7 ATC" },
  { metric: "Purchase Rate", fullForm: "", formula: "Purchases \u00f7 Sessions" },
  { metric: "Effective Frequency", fullForm: "", formula: "Conversions \u00f7 Reach" },
  { metric: "Cost per Reach", fullForm: "", formula: "Spend \u00f7 Reach" },
  { metric: "Incremental Lift", fullForm: "", formula: "(Test \u2212 Control) \u00f7 Control" },
  { metric: "eCPA", fullForm: "Effective CPA (Blended)", formula: "Total Spend \u00f7 Total Conversions" },
  { metric: "Blended CTR", fullForm: "", formula: "Total Clicks \u00f7 Total Impressions" },
];

function formatMetricValue(val: number | null, format: string): string {
  if (val === null || isNaN(val)) return "\u2014";
  switch (format) {
    case "currency": return formatINR(val);
    case "percent": return `${formatNumber(val)}%`;
    case "ratio": return `${formatNumber(val)}x`;
    default: return formatNumber(val);
  }
}

function CollapsibleSection({ label, defaultOpen, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-border/50 rounded-xl overflow-visible">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-slate-50/50 transition-colors"
        data-testid={`button-section-${label.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {label}
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function AdsMetricsCalculator() {
  const { values, setValue, resetAll, remember, setRemember } = useCalculatorState(
    "ads-metrics",
    allFields
  );

  const numVals = useMemo(() => {
    const result: Record<string, number> = {};
    for (const f of allFields) {
      result[f] = parseFloat(values[f]) || 0;
    }
    return result;
  }, [values]);

  const computedCategories = useMemo(() => {
    return metricDefinitions.map((cat) => ({
      ...cat,
      metrics: cat.metrics.map((m) => ({
        ...m,
        value: m.calculate(numVals),
      })),
    }));
  }, [numVals]);

  const hasAnyInput = allFields.some((f) => values[f] !== "" && values[f] !== undefined && parseFloat(values[f]) > 0);
  const hasResult = hasAnyInput;

  const computedMetrics = computedCategories.flatMap((c) => c.metrics);
  const calculatedMetrics = computedMetrics.filter((m) => m.value !== null);

  const resultText = calculatedMetrics.length > 0
    ? calculatedMetrics.map((m) => `${m.name}: ${formatMetricValue(m.value, m.format)}`).join("\n")
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
      question: "What is ROAS and how does it differ from ROI?",
      answer: "ROAS (Return on Ad Spend) = Revenue / Spend, showing gross return per rupee spent (e.g., 4x means you earn 4 for every 1 spent). ROI = (Revenue - Spend) / Spend, showing net profit percentage. ROAS of 4x equals ROI of 300%.",
    },
    {
      question: "What is vCPM (Viewable CPM)?",
      answer: "vCPM is the cost per 1,000 viewable impressions. An impression is 'viewable' when at least 50% of the ad is visible on screen for at least 1 second (display) or 2 seconds (video). vCPM is typically higher than CPM since not all impressions are viewable.",
    },
    {
      question: "How can I reduce my CPA?",
      answer: "To reduce CPA: improve ad targeting to reach more relevant audiences, optimize landing pages for conversions, A/B test ad creatives, use negative keywords to filter irrelevant traffic, and refine your bidding strategy.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Ad Metrics Calculator - CPM, CPC, CPA, ROAS & 40+ Metrics - Calculate 360"
        description="Calculate 40+ advertising metrics: CPM, CPC, CPA, CTR, CVR, ROAS, ROI, VTR, engagement rate, funnel metrics and more from your campaign data."
        path="/ads-metrics"
      />

      <main className="container mx-auto px-4 py-8 flex-grow max-w-6xl">
        <AdSlot position="top" className="mb-8" />

        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2" data-testid="text-page-title">
            Ad Metrics Calculator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter your campaign data below. Only fill in the fields you have &mdash; the calculator will compute every metric possible from your inputs.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h2 className="font-display font-semibold text-lg text-foreground">Campaign Inputs</h2>
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>

              <div className="space-y-2">
                {inputGroups.map((group, gi) => (
                  <CollapsibleSection key={group.label} label={group.label} defaultOpen={gi === 0}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {group.fields.map((field) => (
                        <div key={field.key}>
                          <Label htmlFor={`input-${field.key}`} className="text-xs text-muted-foreground">{field.label}</Label>
                          <div className="relative mt-0.5">
                            {field.prefix && (
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">&#8377;</span>
                            )}
                            <Input
                              id={`input-${field.key}`}
                              type="number"
                              min="0"
                              step="any"
                              placeholder={field.placeholder}
                              value={values[field.key]}
                              onChange={(e) => setValue(field.key, e.target.value)}
                              className={cn("text-sm", field.prefix && "pl-6")}
                              data-testid={`input-${field.key}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">
                Calculated Metrics
                {calculatedMetrics.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">({calculatedMetrics.length} metrics)</span>
                )}
              </h2>

              {!hasAnyInput && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Enter campaign data above to see your metrics here.
                </p>
              )}

              {hasAnyInput && (
                <div className="space-y-6">
                  {computedCategories.map((cat) => {
                    const hasValues = cat.metrics.some((m) => m.value !== null);
                    if (!hasValues) return null;
                    return (
                      <div key={cat.category}>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{cat.category}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {cat.metrics.map((m) => {
                            if (m.value === null) return null;
                            return (
                              <div key={m.name} className="bg-slate-50 rounded-lg p-3 text-center border border-border/40">
                                <div className="text-xs text-muted-foreground mb-0.5 truncate" title={m.fullForm || m.name}>
                                  {m.fullForm || m.name}
                                </div>
                                <div className="text-lg font-bold text-primary" data-testid={`text-metric-${m.name.replace(/[\s/%().]/g, "-").toLowerCase()}`}>
                                  {formatMetricValue(m.value, m.format)}
                                </div>
                                <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">{m.name}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <ShareCopyButtons
                resultText={resultText}
                shareParams={values}
                onReset={resetAll}
                hasResult={hasResult}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <h2 className="font-display font-semibold text-lg text-foreground mb-4">
                All Ad Metrics &amp; Formulas Reference
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-reference">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-3 font-medium">Metric</th>
                      <th className="pb-2 pr-3 font-medium">Full Form</th>
                      <th className="pb-2 font-medium">Formula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referenceTable.map((row, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="py-2 pr-3 font-medium text-foreground whitespace-nowrap">{row.metric}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{row.fullForm || "\u2014"}</td>
                        <td className="py-2 text-muted-foreground">{row.formula}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="hidden lg:block w-[200px] shrink-0">
            <div className="sticky top-20">
              <AdSlot position="sidebar" />
            </div>
          </aside>
        </div>

        <AdSlot position="bottom" className="mt-8" />
      </main>

      <Footer />
    </div>
  );
}
