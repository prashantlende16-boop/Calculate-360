import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalculatorResult } from "@/components/CalculatorResult";
import { FAQSection } from "@/components/FAQSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArrowRight, Percent, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function PercentageCalculator() {
  const [decimals, setDecimals] = useState(2);
  
  // Tab 1: X% of Y
  const [val1X, setVal1X] = useState("");
  const [val1Y, setVal1Y] = useState("");
  const res1 = val1X && val1Y ? ((parseFloat(val1X) / 100) * parseFloat(val1Y)).toFixed(decimals) : null;

  // Tab 2: What % is X of Y?
  const [val2X, setVal2X] = useState("");
  const [val2Y, setVal2Y] = useState("");
  const res2 = val2X && val2Y && parseFloat(val2Y) !== 0 ? ((parseFloat(val2X) / parseFloat(val2Y)) * 100).toFixed(decimals) + "%" : null;

  // Tab 3: % Increase/Decrease
  const [val3Old, setVal3Old] = useState("");
  const [val3New, setVal3New] = useState("");
  const diff3 = val3Old && val3New ? parseFloat(val3New) - parseFloat(val3Old) : 0;
  const pct3 = val3Old && parseFloat(val3Old) !== 0 ? ((diff3 / parseFloat(val3Old)) * 100).toFixed(decimals) + "%" : null;
  
  // Tab 4: Add/Subtract %
  const [val4Num, setVal4Num] = useState("");
  const [val4Pct, setVal4Pct] = useState("");
  const [isAdd, setIsAdd] = useState(true);
  const res4 = val4Num && val4Pct 
    ? (parseFloat(val4Num) * (1 + (isAdd ? 1 : -1) * (parseFloat(val4Pct) / 100))).toFixed(decimals)
    : null;

  // Tab 5: Find Original (Reverse)
  const [val5Final, setVal5Final] = useState("");
  const [val5Pct, setVal5Pct] = useState("");
  const [isIncrease, setIsIncrease] = useState(true); // Was it increased by X%?
  const res5 = val5Final && val5Pct
    ? (parseFloat(val5Final) / (1 + (isIncrease ? 1 : -1) * (parseFloat(val5Pct) / 100))).toFixed(decimals)
    : null;

  const faqs = [
    {
      question: "How do I calculate a percentage of a number?",
      answer: "To calculate a percentage of a number, multiply the percentage by the number and divide by 100. For example, 20% of 50 is (20 * 50) / 100 = 10."
    },
    {
      question: "How do I calculate percentage increase?",
      answer: "Subtract the old value from the new value, then divide by the old value and multiply by 100. Formula: ((New - Old) / Old) * 100."
    },
    {
      question: "What is the formula for percentage decrease?",
      answer: "Subtract the new value from the old value, divide by the old value, and multiply by 100. Or use the same formula as increase and get a negative result."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">

        <div className="space-y-8">
          {/* Main Calculator Area */}
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Percentage Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Free online tool to calculate percentages, increases, decreases, and reverse percentages.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-1">
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted/50 rounded-xl gap-1">
                  <TabsTrigger value="tab1" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">X% of Y</TabsTrigger>
                  <TabsTrigger value="tab2" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">What %</TabsTrigger>
                  <TabsTrigger value="tab3" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">% Change</TabsTrigger>
                  <TabsTrigger value="tab4" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">+/- %</TabsTrigger>
                  <TabsTrigger value="tab5" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Reverse</TabsTrigger>
                </TabsList>

                <div className="p-6 md:p-8">
                  {/* Rounding Controls */}
                  <div className="flex justify-end mb-6">
                    <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded-lg border border-border">
                      <span className="text-muted-foreground">Decimals:</span>
                      {[0, 2, 4].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDecimals(d)}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${decimals === d ? 'bg-primary text-white font-bold' : 'text-muted-foreground hover:bg-muted/80'}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Tab 1: X% of Y */}
                    <TabsContent value="tab1" className="mt-0 space-y-6">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-full">
                          <Label className="mb-2 block">Percentage (X)</Label>
                          <div className="relative">
                            <Input 
                              type="number" 
                              placeholder="20" 
                              value={val1X} 
                              onChange={(e) => setVal1X(e.target.value)} 
                              className="input-field pr-10"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          </div>
                        </div>
                        <span className="font-display font-bold text-muted-foreground text-lg pt-6">OF</span>
                        <div className="w-full">
                          <Label className="mb-2 block">Number (Y)</Label>
                          <Input 
                            type="number" 
                            placeholder="150" 
                            value={val1Y} 
                            onChange={(e) => setVal1Y(e.target.value)} 
                            className="input-field"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm text-primary/80 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>Formula: (Percentage ÷ 100) × Number</p>
                      </div>

                      <CalculatorResult 
                        label="Result" 
                        value={res1} 
                        onReset={() => { setVal1X(""); setVal1Y(""); }}
                      />
                    </TabsContent>

                    {/* Tab 2: What % is X of Y? */}
                    <TabsContent value="tab2" className="mt-0 space-y-6">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-full">
                          <Label className="mb-2 block">Number (X)</Label>
                          <Input type="number" value={val2X} onChange={(e) => setVal2X(e.target.value)} className="input-field" />
                        </div>
                        <span className="font-display font-bold text-muted-foreground text-lg pt-6">is what % of</span>
                        <div className="w-full">
                          <Label className="mb-2 block">Total (Y)</Label>
                          <Input type="number" value={val2Y} onChange={(e) => setVal2Y(e.target.value)} className="input-field" />
                        </div>
                      </div>
                      <CalculatorResult 
                        label="Percentage" 
                        value={res2} 
                        onReset={() => { setVal2X(""); setVal2Y(""); }}
                      />
                    </TabsContent>

                    {/* Tab 3: % Change */}
                    <TabsContent value="tab3" className="mt-0 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="mb-2 block">Old Value</Label>
                          <Input type="number" value={val3Old} onChange={(e) => setVal3Old(e.target.value)} className="input-field" />
                        </div>
                        <div>
                          <Label className="mb-2 block">New Value</Label>
                          <Input type="number" value={val3New} onChange={(e) => setVal3New(e.target.value)} className="input-field" />
                        </div>
                      </div>
                      <div className="flex justify-center my-2">
                        <ArrowRight className="text-muted-foreground w-6 h-6 rotate-90 md:rotate-0" />
                      </div>
                      <CalculatorResult 
                        label="Change" 
                        value={pct3} 
                        subtext={diff3 ? `Difference: ${diff3 > 0 ? '+' : ''}${diff3.toFixed(decimals)}` : undefined}
                        onReset={() => { setVal3Old(""); setVal3New(""); }}
                      />
                    </TabsContent>

                    {/* Tab 4: +/- % */}
                    <TabsContent value="tab4" className="mt-0 space-y-6">
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-center gap-4 bg-muted p-2 rounded-lg border border-border w-fit mx-auto">
                          <span className={`text-sm font-medium ${!isAdd ? 'text-muted-foreground' : 'text-primary'}`}>Add (+)</span>
                          <Switch checked={!isAdd} onCheckedChange={(c) => setIsAdd(!c)} />
                          <span className={`text-sm font-medium ${isAdd ? 'text-muted-foreground' : 'text-destructive'}`}>Subtract (-)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="mb-2 block">Number</Label>
                            <Input type="number" value={val4Num} onChange={(e) => setVal4Num(e.target.value)} className="input-field" />
                          </div>
                          <div>
                            <Label className="mb-2 block">Percentage</Label>
                            <div className="relative">
                              <Input type="number" value={val4Pct} onChange={(e) => setVal4Pct(e.target.value)} className="input-field pr-10" />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <CalculatorResult 
                        label={isAdd ? "Result after Increase" : "Result after Decrease"} 
                        value={res4} 
                        onReset={() => { setVal4Num(""); setVal4Pct(""); }}
                      />
                    </TabsContent>

                    {/* Tab 5: Reverse */}
                    <TabsContent value="tab5" className="mt-0 space-y-6">
                       <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-sm text-amber-800 mb-4">
                        <p><strong>Scenario:</strong> You have a final number, and you know it was result of a percentage change. You want to find the original number.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="mb-2 block">Final Value</Label>
                          <Input type="number" value={val5Final} onChange={(e) => setVal5Final(e.target.value)} className="input-field" />
                        </div>
                        <div>
                          <Label className="mb-2 block">Percentage Change</Label>
                          <div className="relative">
                            <Input type="number" value={val5Pct} onChange={(e) => setVal5Pct(e.target.value)} className="input-field pr-10" />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Label>Type of Change:</Label>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => setIsIncrease(true)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${isIncrease ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                          >
                            Was Increased
                          </button>
                          <button 
                            onClick={() => setIsIncrease(false)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${!isIncrease ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                          >
                            Was Decreased
                          </button>
                        </div>
                      </div>
                      <CalculatorResult 
                        label="Original Value" 
                        value={res5} 
                        onReset={() => { setVal5Final(""); setVal5Pct(""); }}
                      />
                    </TabsContent>
                  </motion.div>
                </div>
              </Tabs>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

        </div>
        
      </main>

      <Footer />
    </div>
  );
}
