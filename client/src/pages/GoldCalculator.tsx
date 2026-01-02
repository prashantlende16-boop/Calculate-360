import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Calculator, Percent, Tag, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function GoldCalculator() {
  const { toast } = useToast();

  // Section 1: 10g Conversion
  const [rate24k10g, setRate24k10g] = useState("75000");
  const rate24k1g_sec1 = (parseFloat(rate24k10g) || 0) / 10;
  const rates10g = {
    "22k": rate24k1g_sec1 * 0.916 * 10,
    "18k": rate24k1g_sec1 * 0.75 * 10,
    "14k": rate24k1g_sec1 * 0.583 * 10,
  };

  // Section 2: 1g Conversion
  const rate24k1g = rate24k1g_sec1;
  const r1g = rate24k1g;
  const rates1g = {
    "22k": r1g * 0.916,
    "18k": r1g * 0.75,
    "14k": r1g * 0.583,
  };

  // Section 3: Jewelry Cost
  const [jewelryCarat, setJewelryCarat] = useState("22k");
  const [goldWeight, setGoldWeight] = useState("");
  const [makingChargeType, setMakingChargeType] = useState<"flat" | "percent">("flat");
  const [makingChargeValue, setMakingChargeValue] = useState("");
  const [otherCharges, setOtherCharges] = useState("");
  const [discount, setDiscount] = useState("");
  const [taxPercent, setTaxPercent] = useState("3");

  const selected1gRate = rates1g[jewelryCarat as keyof typeof rates1g] || 0;
  const weightNum = parseFloat(goldWeight) || 0;
  const goldValue = selected1gRate * weightNum;

  const makingCharge = useMemo(() => {
    const val = parseFloat(makingChargeValue) || 0;
    if (makingChargeType === "flat") {
      return val * weightNum;
    } else {
      return (val / 100) * goldValue;
    }
  }, [makingChargeType, makingChargeValue, weightNum, goldValue]);

  const otherChargesVal = parseFloat(otherCharges) || 0;
  const discountVal = parseFloat(discount) || 0;

  const totalCostBeforeTax = goldValue + makingCharge + otherChargesVal - discountVal;
  const tax = (totalCostBeforeTax * (parseFloat(taxPercent) || 0)) / 100;
  const finalCost = totalCostBeforeTax + tax;

  const faqs = [
    {
      question: "What is the purity of 22k gold?",
      answer: "22k gold contains 91.6% pure gold, while the remaining 8.4% consists of other metals like copper or zinc to provide strength for jewelry."
    },
    {
      question: "How is making charge calculated?",
      answer: "Making charges are calculated either as a flat rate per gram of gold weight or as a percentage of the total gold value. This cost covers the labor and design efforts."
    },
    {
      question: "What is the tax on gold jewelry?",
      answer: "The tax on gold jewelry varies by region. In India, a standard GST rate of 3% is typically applicable on the total value of gold jewelry."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
            <Coins className="w-8 h-8 text-yellow-500" /> Gold Jewelry Cost Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calculate gold rates for different carats and estimate the final price of jewelry including making charges and tax.
          </p>
        </header>

        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Section 1: 10g Rates */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center gap-3">
              <Calculator className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">10 Gram Gold Rate Conversion</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <Label className="mb-2 block">24K Gold Rate (per 10g) in ₹</Label>
                <Input 
                  type="number" 
                  value={rate24k10g} 
                  onChange={(e) => setRate24k10g(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-xs text-muted-foreground uppercase mb-1">22K (91.6%)</div>
                  <div className="text-xl font-bold text-slate-900">{formatCurrency(rates10g["22k"])}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-xs text-muted-foreground uppercase mb-1">18K (75%)</div>
                  <div className="text-xl font-bold text-slate-900">{formatCurrency(rates10g["18k"])}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-xs text-muted-foreground uppercase mb-1">14K (58.3%)</div>
                  <div className="text-xl font-bold text-slate-900">{formatCurrency(rates10g["14k"])}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: 1g Rates */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center gap-3">
              <Calculator className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">1 Gram Gold Rate Conversion</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <Label className="mb-2 block">24K Gold Rate (per 1g) in ₹</Label>
                <div className="text-2xl font-bold p-3 bg-slate-50 border rounded-lg text-primary">
                  {formatCurrency(rate24k1g)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Automatically calculated as (24K Rate per 10g / 10)</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-xs text-muted-foreground uppercase mb-1">22K (91.6%)</div>
                  <div className="text-xl font-bold text-slate-900">{formatCurrency(rates1g["22k"])}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-xs text-muted-foreground uppercase mb-1">18K (75%)</div>
                  <div className="text-xl font-bold text-slate-900">{formatCurrency(rates1g["18k"])}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <div className="text-xs text-muted-foreground uppercase mb-1">14K (58.3%)</div>
                  <div className="text-xl font-bold text-slate-900">{formatCurrency(rates1g["14k"])}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Jewelry Cost Calculation */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center gap-3">
              <Tag className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Jewelry Cost Calculation</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Purity (Carat)</Label>
                    <Select value={jewelryCarat} onValueChange={setJewelryCarat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="22k">22K (91.6%)</SelectItem>
                        <SelectItem value="18k">18K (75.0%)</SelectItem>
                        <SelectItem value="14k">14K (58.3%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Rate: {formatCurrency(selected1gRate)} / gram</p>
                  </div>

                  <div>
                    <Label className="mb-2 block">Gold Weight (Grams)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 12.5" 
                      value={goldWeight} 
                      onChange={(e) => setGoldWeight(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Making Charges</Label>
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
                      <button 
                        onClick={() => setMakingChargeType("flat")}
                        className={`flex-1 py-1 px-2 rounded-md text-sm transition-all ${makingChargeType === "flat" ? "bg-white shadow-sm font-semibold" : "text-muted-foreground"}`}
                      >Flat Rate (per g)</button>
                      <button 
                        onClick={() => setMakingChargeType("percent")}
                        className={`flex-1 py-1 px-2 rounded-md text-sm transition-all ${makingChargeType === "percent" ? "bg-white shadow-sm font-semibold" : "text-muted-foreground"}`}
                      >Percentage (%)</button>
                    </div>
                    <Input 
                      type="number" 
                      placeholder={makingChargeType === "flat" ? "e.g. 400" : "e.g. 12"} 
                      value={makingChargeValue} 
                      onChange={(e) => setMakingChargeValue(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Other Charges (Stone/Hallmarking) ₹</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 500" 
                      value={otherCharges} 
                      onChange={(e) => setOtherCharges(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Discount ₹</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 1000" 
                      value={discount} 
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Tax (%)</Label>
                    <Input 
                      type="number" 
                      placeholder="3" 
                      value={taxPercent} 
                      onChange={(e) => setTaxPercent(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-slate-400">Gold Value</span>
                      <span className="font-semibold">{formatCurrency(goldValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Making Charges</span>
                      <span>{formatCurrency(makingCharge)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Other Charges</span>
                      <span>{formatCurrency(otherChargesVal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-400">
                      <span>Discount</span>
                      <span>- {formatCurrency(discountVal)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <span className="text-slate-400">Total Cost (Excl. Tax)</span>
                      <span className="font-semibold">{formatCurrency(totalCostBeforeTax)}</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-400">
                      <span>Tax ({taxPercent}%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Final Price</div>
                    <div className="text-4xl font-bold text-yellow-500">{formatCurrency(finalCost)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AdSlot position="bottom" className="my-8" />
        <FAQSection title="Gold Rate FAQ" items={faqs} />
      </main>

      <Footer />
    </div>
  );
}
