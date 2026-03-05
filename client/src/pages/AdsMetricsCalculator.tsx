import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { CalculatorResult } from "@/components/CalculatorResult";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Info, Search } from "lucide-react";
import { formatINR, formatNumber } from "@/lib/calculatorUtils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricDef {
  id: string;
  name: string;
  fullForm: string;
  category: string;
  formula: string;
  formulaDisplay: string;
  fields: { key: string; label: string; placeholder: string; prefix?: boolean }[];
  calculate: (v: Record<string, number>) => number | null;
  formatResult: (val: number) => string;
}

const allMetrics: MetricDef[] = [
  {
    id: "frequency", name: "Frequency", fullForm: "", category: "Reach & Awareness",
    formula: "Impressions \u00f7 Reach", formulaDisplay: "Frequency = Impressions \u00f7 Reach",
    fields: [
      { key: "impressions", label: "Impressions", placeholder: "100000" },
      { key: "reach", label: "Reach", placeholder: "60000" },
    ],
    calculate: (v) => v.reach > 0 ? v.impressions / v.reach : null,
    formatResult: (val) => formatNumber(val),
  },
  {
    id: "viewability-rate", name: "Viewability Rate", fullForm: "", category: "Reach & Awareness",
    formula: "Viewable Impressions \u00f7 Impressions", formulaDisplay: "Viewability Rate = (Viewable Impressions \u00f7 Impressions) \u00d7 100",
    fields: [
      { key: "viewableImpressions", label: "Viewable Impressions", placeholder: "80000" },
      { key: "impressions", label: "Impressions", placeholder: "100000" },
    ],
    calculate: (v) => v.impressions > 0 ? (v.viewableImpressions / v.impressions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "ctr", name: "CTR", fullForm: "Click Through Rate", category: "Click Performance",
    formula: "Clicks \u00f7 Impressions", formulaDisplay: "CTR = (Clicks \u00f7 Impressions) \u00d7 100",
    fields: [
      { key: "clicks", label: "Clicks", placeholder: "2500" },
      { key: "impressions", label: "Impressions", placeholder: "100000" },
    ],
    calculate: (v) => v.impressions > 0 ? (v.clicks / v.impressions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "unique-ctr", name: "Unique CTR", fullForm: "", category: "Click Performance",
    formula: "Unique Clicks \u00f7 Reach", formulaDisplay: "Unique CTR = (Unique Clicks \u00f7 Reach) \u00d7 100",
    fields: [
      { key: "uniqueClicks", label: "Unique Clicks", placeholder: "2200" },
      { key: "reach", label: "Reach", placeholder: "60000" },
    ],
    calculate: (v) => v.reach > 0 ? (v.uniqueClicks / v.reach) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "cpc", name: "CPC", fullForm: "Cost Per Click", category: "Cost Metrics",
    formula: "Spend \u00f7 Clicks", formulaDisplay: "CPC = Spend \u00f7 Clicks",
    fields: [
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "clicks", label: "Clicks", placeholder: "2500" },
    ],
    calculate: (v) => v.clicks > 0 ? v.spend / v.clicks : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "cpm", name: "CPM", fullForm: "Cost Per Mille", category: "Cost Metrics",
    formula: "(Spend \u00f7 Impressions) \u00d7 1000", formulaDisplay: "CPM = (Spend \u00f7 Impressions) \u00d7 1000",
    fields: [
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "impressions", label: "Impressions", placeholder: "100000" },
    ],
    calculate: (v) => v.impressions > 0 ? (v.spend / v.impressions) * 1000 : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "vcpm", name: "vCPM", fullForm: "Viewable CPM", category: "Cost Metrics",
    formula: "(Spend \u00f7 Viewable Impressions) \u00d7 1000", formulaDisplay: "vCPM = (Spend \u00f7 Viewable Impressions) \u00d7 1000",
    fields: [
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "viewableImpressions", label: "Viewable Impressions", placeholder: "80000" },
    ],
    calculate: (v) => v.viewableImpressions > 0 ? (v.spend / v.viewableImpressions) * 1000 : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "cpa", name: "CPA", fullForm: "Cost Per Acquisition", category: "Cost Metrics",
    formula: "Spend \u00f7 Conversions", formulaDisplay: "CPA = Spend \u00f7 Conversions",
    fields: [
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "conversions", label: "Conversions", placeholder: "100" },
    ],
    calculate: (v) => v.conversions > 0 ? v.spend / v.conversions : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "cpl", name: "CPL", fullForm: "Cost Per Lead", category: "Cost Metrics",
    formula: "Spend \u00f7 Leads", formulaDisplay: "CPL = Spend \u00f7 Leads",
    fields: [
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "leads", label: "Leads", placeholder: "150" },
    ],
    calculate: (v) => v.leads > 0 ? v.spend / v.leads : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "cpv", name: "CPV", fullForm: "Cost Per View", category: "Cost Metrics",
    formula: "Spend \u00f7 Views", formulaDisplay: "CPV = Spend \u00f7 Views",
    fields: [
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "views", label: "Views", placeholder: "5000" },
    ],
    calculate: (v) => v.views > 0 ? v.spend / v.views : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "cpe", name: "CPE", fullForm: "Cost Per Engagement", category: "Cost Metrics",
    formula: "Spend \u00f7 Engagements", formulaDisplay: "CPE = Spend \u00f7 Engagements",
    fields: [
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "engagements", label: "Engagements", placeholder: "3000" },
    ],
    calculate: (v) => v.engagements > 0 ? v.spend / v.engagements : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "cost-per-reach", name: "Cost per Reach", fullForm: "", category: "Cost Metrics",
    formula: "Spend \u00f7 Reach", formulaDisplay: "Cost per Reach = Spend \u00f7 Reach",
    fields: [
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "reach", label: "Reach", placeholder: "60000" },
    ],
    calculate: (v) => v.reach > 0 ? v.spend / v.reach : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "ecpa", name: "eCPA", fullForm: "Effective CPA (Blended)", category: "Cost Metrics",
    formula: "Total Spend \u00f7 Total Conversions", formulaDisplay: "eCPA = Total Spend \u00f7 Total Conversions",
    fields: [
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
      { key: "conversions", label: "Total Conversions", placeholder: "100" },
    ],
    calculate: (v) => v.conversions > 0 ? v.spend / v.conversions : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "cvr", name: "CVR", fullForm: "Conversion Rate", category: "Conversion Metrics",
    formula: "Conversions \u00f7 Clicks", formulaDisplay: "CVR = (Conversions \u00f7 Clicks) \u00d7 100",
    fields: [
      { key: "conversions", label: "Conversions", placeholder: "100" },
      { key: "clicks", label: "Clicks", placeholder: "2500" },
    ],
    calculate: (v) => v.clicks > 0 ? (v.conversions / v.clicks) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "post-click-cvr", name: "Post-Click CVR", fullForm: "", category: "Conversion Metrics",
    formula: "Conversions \u00f7 Clicks", formulaDisplay: "Post-Click CVR = (Conversions \u00f7 Clicks) \u00d7 100",
    fields: [
      { key: "conversions", label: "Conversions", placeholder: "100" },
      { key: "clicks", label: "Clicks", placeholder: "2500" },
    ],
    calculate: (v) => v.clicks > 0 ? (v.conversions / v.clicks) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "post-view-cvr", name: "Post-View CVR", fullForm: "", category: "Conversion Metrics",
    formula: "View-through Conversions \u00f7 Impressions", formulaDisplay: "Post-View CVR = (View-through Conversions \u00f7 Impressions) \u00d7 100",
    fields: [
      { key: "viewThroughConversions", label: "View-through Conversions", placeholder: "25" },
      { key: "impressions", label: "Impressions", placeholder: "100000" },
    ],
    calculate: (v) => v.impressions > 0 ? (v.viewThroughConversions / v.impressions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "cvpm", name: "CvPm", fullForm: "Conversions per 1000 Impressions", category: "Conversion Metrics",
    formula: "(Conversions \u00f7 Impressions) \u00d7 1000", formulaDisplay: "CvPm = (Conversions \u00f7 Impressions) \u00d7 1000",
    fields: [
      { key: "conversions", label: "Conversions", placeholder: "100" },
      { key: "impressions", label: "Impressions", placeholder: "100000" },
    ],
    calculate: (v) => v.impressions > 0 ? (v.conversions / v.impressions) * 1000 : null,
    formatResult: (val) => formatNumber(val),
  },
  {
    id: "conv-rate-impression", name: "Conv. Rate (Impression)", fullForm: "Conversion Rate (Impression Based)", category: "Conversion Metrics",
    formula: "Conversions \u00f7 Impressions", formulaDisplay: "Conv. Rate = (Conversions \u00f7 Impressions) \u00d7 100",
    fields: [
      { key: "conversions", label: "Conversions", placeholder: "100" },
      { key: "impressions", label: "Impressions", placeholder: "100000" },
    ],
    calculate: (v) => v.impressions > 0 ? (v.conversions / v.impressions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "effective-frequency", name: "Effective Frequency", fullForm: "", category: "Conversion Metrics",
    formula: "Conversions \u00f7 Reach", formulaDisplay: "Effective Frequency = Conversions \u00f7 Reach",
    fields: [
      { key: "conversions", label: "Conversions", placeholder: "100" },
      { key: "reach", label: "Reach", placeholder: "60000" },
    ],
    calculate: (v) => v.reach > 0 ? v.conversions / v.reach : null,
    formatResult: (val) => formatNumber(val, 4),
  },
  {
    id: "roas", name: "ROAS", fullForm: "Return on Ad Spend", category: "Revenue & ROI",
    formula: "Revenue \u00f7 Spend", formulaDisplay: "ROAS = Revenue \u00f7 Spend",
    fields: [
      { key: "revenue", label: "Revenue", placeholder: "200000", prefix: true },
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
    ],
    calculate: (v) => v.spend > 0 ? v.revenue / v.spend : null,
    formatResult: (val) => `${formatNumber(val)}x`,
  },
  {
    id: "roi", name: "ROI", fullForm: "Return on Investment", category: "Revenue & ROI",
    formula: "(Revenue \u2212 Spend) \u00f7 Spend", formulaDisplay: "ROI = ((Revenue \u2212 Spend) \u00f7 Spend) \u00d7 100",
    fields: [
      { key: "revenue", label: "Revenue", placeholder: "200000", prefix: true },
      { key: "spend", label: "Total Spend", placeholder: "50000", prefix: true },
    ],
    calculate: (v) => v.spend > 0 ? ((v.revenue - v.spend) / v.spend) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "aov", name: "AOV", fullForm: "Avg Order Value", category: "Revenue & ROI",
    formula: "Revenue \u00f7 Orders", formulaDisplay: "AOV = Revenue \u00f7 Orders",
    fields: [
      { key: "revenue", label: "Revenue", placeholder: "200000", prefix: true },
      { key: "orders", label: "Orders", placeholder: "80" },
    ],
    calculate: (v) => v.orders > 0 ? v.revenue / v.orders : null,
    formatResult: (val) => formatINR(val),
  },
  {
    id: "25-view-rate", name: "25% View Rate", fullForm: "", category: "Video Performance",
    formula: "25% Views \u00f7 Starts", formulaDisplay: "25% View Rate = (25% Views \u00f7 Starts) \u00d7 100",
    fields: [
      { key: "views25", label: "25% Views", placeholder: "4000" },
      { key: "starts", label: "Video Starts", placeholder: "5000" },
    ],
    calculate: (v) => v.starts > 0 ? (v.views25 / v.starts) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "50-view-rate", name: "50% View Rate", fullForm: "", category: "Video Performance",
    formula: "50% Views \u00f7 Starts", formulaDisplay: "50% View Rate = (50% Views \u00f7 Starts) \u00d7 100",
    fields: [
      { key: "views50", label: "50% Views", placeholder: "3000" },
      { key: "starts", label: "Video Starts", placeholder: "5000" },
    ],
    calculate: (v) => v.starts > 0 ? (v.views50 / v.starts) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "75-view-rate", name: "75% View Rate", fullForm: "", category: "Video Performance",
    formula: "75% Views \u00f7 Starts", formulaDisplay: "75% View Rate = (75% Views \u00f7 Starts) \u00d7 100",
    fields: [
      { key: "views75", label: "75% Views", placeholder: "2000" },
      { key: "starts", label: "Video Starts", placeholder: "5000" },
    ],
    calculate: (v) => v.starts > 0 ? (v.views75 / v.starts) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "completion-rate", name: "100% Completion Rate", fullForm: "", category: "Video Performance",
    formula: "Completed Views \u00f7 Starts", formulaDisplay: "Completion Rate = (Completed Views \u00f7 Starts) \u00d7 100",
    fields: [
      { key: "completedViews", label: "Completed Views", placeholder: "1500" },
      { key: "starts", label: "Video Starts", placeholder: "5000" },
    ],
    calculate: (v) => v.starts > 0 ? (v.completedViews / v.starts) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "vtr", name: "VTR", fullForm: "View Through Rate", category: "Video Performance",
    formula: "Completed Views \u00f7 Impressions", formulaDisplay: "VTR = (Completed Views \u00f7 Impressions) \u00d7 100",
    fields: [
      { key: "completedViews", label: "Completed Views", placeholder: "1500" },
      { key: "impressions", label: "Impressions", placeholder: "100000" },
    ],
    calculate: (v) => v.impressions > 0 ? (v.completedViews / v.impressions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "engagement-rate", name: "Engagement Rate", fullForm: "", category: "Engagement & Funnel",
    formula: "Engagements \u00f7 Impressions", formulaDisplay: "Engagement Rate = (Engagements \u00f7 Impressions) \u00d7 100",
    fields: [
      { key: "engagements", label: "Engagements", placeholder: "3000" },
      { key: "impressions", label: "Impressions", placeholder: "100000" },
    ],
    calculate: (v) => v.impressions > 0 ? (v.engagements / v.impressions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "lp-view-rate", name: "Landing Page View Rate", fullForm: "", category: "Engagement & Funnel",
    formula: "LP Views \u00f7 Clicks", formulaDisplay: "LP View Rate = (LP Views \u00f7 Clicks) \u00d7 100",
    fields: [
      { key: "lpViews", label: "Landing Page Views", placeholder: "2000" },
      { key: "clicks", label: "Clicks", placeholder: "2500" },
    ],
    calculate: (v) => v.clicks > 0 ? (v.lpViews / v.clicks) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "atc-rate", name: "Add to Cart Rate", fullForm: "", category: "Engagement & Funnel",
    formula: "ATC \u00f7 Sessions", formulaDisplay: "ATC Rate = (Add to Cart \u00f7 Sessions) \u00d7 100",
    fields: [
      { key: "atc", label: "Add to Cart (ATC)", placeholder: "500" },
      { key: "sessions", label: "Sessions", placeholder: "8000" },
    ],
    calculate: (v) => v.sessions > 0 ? (v.atc / v.sessions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "checkout-rate", name: "Checkout Rate", fullForm: "", category: "Engagement & Funnel",
    formula: "Checkouts \u00f7 ATC", formulaDisplay: "Checkout Rate = (Checkouts \u00f7 ATC) \u00d7 100",
    fields: [
      { key: "checkouts", label: "Checkouts", placeholder: "300" },
      { key: "atc", label: "Add to Cart (ATC)", placeholder: "500" },
    ],
    calculate: (v) => v.atc > 0 ? (v.checkouts / v.atc) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "purchase-rate", name: "Purchase Rate", fullForm: "", category: "Engagement & Funnel",
    formula: "Purchases \u00f7 Sessions", formulaDisplay: "Purchase Rate = (Purchases \u00f7 Sessions) \u00d7 100",
    fields: [
      { key: "purchases", label: "Purchases", placeholder: "200" },
      { key: "sessions", label: "Sessions", placeholder: "8000" },
    ],
    calculate: (v) => v.sessions > 0 ? (v.purchases / v.sessions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "share-of-attribution", name: "Share of Attribution", fullForm: "", category: "Attribution & Lift",
    formula: "Channel Conversions \u00f7 Total Conversions", formulaDisplay: "Share of Attribution = (Channel Conversions \u00f7 Total Conversions) \u00d7 100",
    fields: [
      { key: "channelConversions", label: "Conversions from Channel", placeholder: "60" },
      { key: "totalConversions", label: "Total Conversions", placeholder: "200" },
    ],
    calculate: (v) => v.totalConversions > 0 ? (v.channelConversions / v.totalConversions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "incremental-lift", name: "Incremental Lift", fullForm: "", category: "Attribution & Lift",
    formula: "(Test \u2212 Control) \u00f7 Control", formulaDisplay: "Incremental Lift = ((Test \u2212 Control) \u00f7 Control) \u00d7 100",
    fields: [
      { key: "testValue", label: "Test Group Value", placeholder: "150" },
      { key: "controlValue", label: "Control Group Value", placeholder: "100" },
    ],
    calculate: (v) => v.controlValue > 0 ? ((v.testValue - v.controlValue) / v.controlValue) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
  {
    id: "blended-ctr", name: "Blended CTR", fullForm: "", category: "Attribution & Lift",
    formula: "Total Clicks \u00f7 Total Impressions", formulaDisplay: "Blended CTR = (Total Clicks \u00f7 Total Impressions) \u00d7 100",
    fields: [
      { key: "clicks", label: "Total Clicks", placeholder: "5000" },
      { key: "impressions", label: "Total Impressions", placeholder: "200000" },
    ],
    calculate: (v) => v.impressions > 0 ? (v.clicks / v.impressions) * 100 : null,
    formatResult: (val) => `${formatNumber(val)}%`,
  },
];

const categories = Array.from(new Set(allMetrics.map((m) => m.category)));

const referenceTable = allMetrics.map((m) => ({
  metric: m.name,
  fullForm: m.fullForm,
  formula: m.formula,
}));

export default function AdsMetricsCalculator() {
  const [selectedId, setSelectedId] = useState(allMetrics[0].id);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const selectMetric = (id: string) => {
    setSelectedId(id);
    setInputValues({});
  };

  const selected = allMetrics.find((m) => m.id === selectedId) || allMetrics[0];

  const setField = (key: string, val: string) => {
    setInputValues((prev) => ({ ...prev, [key]: val }));
  };

  const resetFields = () => {
    const cleared: Record<string, string> = {};
    for (const f of selected.fields) {
      cleared[f.key] = "";
    }
    setInputValues((prev) => ({ ...prev, ...cleared }));
  };

  const result = useMemo(() => {
    const numVals: Record<string, number> = {};
    for (const f of selected.fields) {
      numVals[f.key] = parseFloat(inputValues[f.key] || "") || 0;
    }
    const allFilled = selected.fields.every((f) => (parseFloat(inputValues[f.key] || "") || 0) > 0);
    if (!allFilled) return null;
    return selected.calculate(numVals);
  }, [selected, inputValues]);

  const formattedResult = result !== null ? selected.formatResult(result) : null;

  const filteredMetrics = searchQuery.trim()
    ? allMetrics.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.fullForm.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allMetrics;

  const filteredCategories = categories.filter((cat) =>
    filteredMetrics.some((m) => m.category === cat)
  );

  const faqs = [
    {
      question: "What is CPM and how is it calculated?",
      answer: "CPM stands for Cost Per Mille (thousand impressions). It is calculated as (Total Spend / Total Impressions) x 1000. It tells you how much you pay for every 1,000 ad views.",
    },
    {
      question: "What is a good CTR (Click-Through Rate)?",
      answer: "A good CTR varies by platform and industry. For Google Search ads, 2-5% is considered good. For display ads, 0.5-1% is typical. Social media ads average 0.5-1.5%.",
    },
    {
      question: "What is the difference between CPC and CPA?",
      answer: "CPC (Cost Per Click) measures how much you pay for each click on your ad. CPA (Cost Per Acquisition) measures how much you pay for each conversion. CPA is typically higher than CPC since not every click converts.",
    },
    {
      question: "What is ROAS and how does it differ from ROI?",
      answer: "ROAS (Return on Ad Spend) = Revenue / Spend, showing gross return per rupee spent (e.g., 4x means you earn \u20B94 for every \u20B91 spent). ROI = (Revenue - Spend) / Spend, showing net profit percentage. ROAS of 4x equals ROI of 300%.",
    },
    {
      question: "What is vCPM (Viewable CPM)?",
      answer: "vCPM is the cost per 1,000 viewable impressions. An impression is 'viewable' when at least 50% of the ad is visible on screen for at least 1 second (display) or 2 seconds (video). vCPM is typically higher than CPM.",
    },
    {
      question: "How can I reduce my CPA?",
      answer: "To reduce CPA: improve ad targeting to reach more relevant audiences, optimize landing pages for conversions, A/B test ad creatives, use negative keywords to filter irrelevant traffic, and refine your bidding strategy.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Ad Metrics Calculator - CPM, CPC, CPA, ROAS & 35+ Metrics - Calculate 360"
        description="Calculate 35+ advertising metrics: CPM, CPC, CPA, CTR, CVR, ROAS, ROI, VTR, engagement rate, funnel metrics and more from your campaign data."
        path="/ads-metrics"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">

        <div className="space-y-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2" data-testid="text-page-title">
                Ad Metrics Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Select a metric, enter the required values, and get your result instantly.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-1">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-56 lg:w-64 border-b md:border-b-0 md:border-r border-border p-3 max-h-[420px] overflow-y-auto shrink-0">
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search metrics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
                      data-testid="input-search-metrics"
                    />
                  </div>
                  {filteredCategories.map((cat) => (
                    <div key={cat} className="mb-3">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">{cat}</div>
                      {filteredMetrics
                        .filter((m) => m.category === cat)
                        .map((m) => (
                          <button
                            key={m.id}
                            onClick={() => selectMetric(m.id)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors",
                              selectedId === m.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                            data-testid={`button-metric-${m.id}`}
                          >
                            {m.name}
                            {m.fullForm && <span className="text-xs text-muted-foreground ml-1 hidden lg:inline">({m.fullForm})</span>}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>

                <div className="flex-1 p-6 md:p-8">
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl font-display font-bold text-foreground" data-testid="text-selected-metric">
                        {selected.name}
                      </h2>
                      {selected.fullForm && (
                        <p className="text-sm text-muted-foreground mt-0.5">{selected.fullForm}</p>
                      )}
                    </div>

                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 text-sm text-primary/80 flex items-start gap-2 mb-6">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>Formula: {selected.formulaDisplay}</p>
                    </div>

                    <div className={cn(
                      "gap-4",
                      selected.fields.length === 2 ? "flex flex-col md:flex-row items-end" : "grid grid-cols-1 sm:grid-cols-2"
                    )}>
                      {selected.fields.map((field, i) => (
                        <div key={field.key} className="w-full">
                          <Label className="mb-2 block">{field.label}</Label>
                          <div className="relative">
                            {field.prefix && (
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">&#8377;</span>
                            )}
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              placeholder={field.placeholder}
                              value={inputValues[field.key] || ""}
                              onChange={(e) => setField(field.key, e.target.value)}
                              className={cn("input-field", field.prefix && "pl-7")}
                              data-testid={`input-${field.key}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <CalculatorResult
                      label={selected.name}
                      value={formattedResult}
                      onReset={resetFields}
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mt-8">
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

          <aside className="space-y-8">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Quick Reference
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
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  ROAS = Revenue / Spend
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  ROI = (Revenue - Spend) / Spend
                </li>
              </ul>
            </div>
          </aside>
        </div>

      </main>

      <Footer />
    </div>
  );
}
