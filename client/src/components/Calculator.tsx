import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RotateCcw, ArrowRight, Percent, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Mode = "percentageOf" | "whatPercentage" | "increaseDecrease" | "addSubtract" | "reverse";

export function Calculator() {
  const [mode, setMode] = useState<Mode>("percentageOf");
  const [decimals, setDecimals] = useState<string>("2");

  const modes = [
    { id: "percentageOf", label: "X% of Y" },
    { id: "whatPercentage", label: "What % is X of Y?" },
    { id: "increaseDecrease", label: "% Change" },
    { id: "addSubtract", label: "+/- %" },
    { id: "reverse", label: "Reverse %" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mobile Tab Select */}
      <div className="md:hidden mb-6">
        <label className="text-sm font-semibold text-muted-foreground mb-2 block ml-1">Calculation Mode</label>
        <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <SelectTrigger className="w-full bg-white border-border/60 shadow-sm">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            {modes.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex flex-wrap gap-2 mb-8 bg-secondary/50 p-1.5 rounded-2xl border border-secondary">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as Mode)}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
              mode === m.id
                ? "bg-white text-primary shadow-md shadow-black/5 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-t-4 border-t-primary">
            <CardContent className="pt-8">
              <div className="flex justify-end mb-6">
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Precision</span>
                   <Select value={decimals} onValueChange={setDecimals}>
                    <SelectTrigger className="w-[110px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 Decimals</SelectItem>
                      <SelectItem value="2">2 Decimals</SelectItem>
                      <SelectItem value="4">4 Decimals</SelectItem>
                    </SelectContent>
                  </Select>
                 </div>
              </div>

              {mode === "percentageOf" && <PercentageOf decimals={parseInt(decimals)} />}
              {mode === "whatPercentage" && <WhatPercentage decimals={parseInt(decimals)} />}
              {mode === "increaseDecrease" && <IncreaseDecrease decimals={parseInt(decimals)} />}
              {mode === "addSubtract" && <AddSubtract decimals={parseInt(decimals)} />}
              {mode === "reverse" && <ReversePercentage decimals={parseInt(decimals)} />}

            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Shared Components for Calculator Sub-modes ---

function ResultBox({ 
  value, 
  formula, 
  label = "Result" 
}: { 
  value: string | number | null, 
  formula: string,
  label?: string 
}) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (value === null) return;
    navigator.clipboard.writeText(String(value));
    toast({
      title: "Copied to clipboard!",
      description: `${value} has been copied.`,
    });
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-20 group-hover:opacity-30 transition duration-500 blur"></div>
        <div className="relative bg-white rounded-xl p-6 border border-border/50">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</h4>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1" onClick={handleCopy} disabled={value === null}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-4xl md:text-5xl font-bold text-slate-900 font-display tracking-tight break-all">
            {value === null ? "—" : value}
          </div>
        </div>
      </div>
      
      <div className="bg-secondary/50 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-sm text-foreground mb-1">Formula</h5>
          <p className="text-sm text-muted-foreground font-mono">{formula}</p>
        </div>
      </div>
    </div>
  );
}

// --- Mode Components ---

function PercentageOf({ decimals }: { decimals: number }) {
  const [percentage, setPercentage] = useState("");
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const p = parseFloat(percentage);
    const n = parseFloat(number);
    if (!isNaN(p) && !isNaN(n)) {
      setResult(parseFloat(((p / 100) * n).toFixed(decimals)));
    } else {
      setResult(null);
    }
  }, [percentage, number, decimals]);

  const handleReset = () => {
    setPercentage("");
    setNumber("");
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Percentage (X)</label>
          <div className="relative">
            <Input 
              type="number" 
              placeholder="e.g. 20" 
              value={percentage} 
              onChange={(e) => setPercentage(e.target.value)}
              className="pr-10"
            />
            <Percent className="absolute right-3 top-3.5 w-5 h-5 text-muted-foreground/50" />
          </div>
        </div>
        <div className="hidden md:flex pb-3 text-muted-foreground font-medium">of</div>
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Number (Y)</label>
          <Input 
            type="number" 
            placeholder="e.g. 1500" 
            value={number} 
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      <ResultBox 
        value={result} 
        formula={`(${percentage || "X"} / 100) × ${number || "Y"}`}
      />
    </div>
  );
}

function WhatPercentage({ decimals }: { decimals: number }) {
  const [part, setPart] = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const p = parseFloat(part);
    const t = parseFloat(total);
    if (!isNaN(p) && !isNaN(t) && t !== 0) {
      setResult(parseFloat(((p / t) * 100).toFixed(decimals)));
    } else {
      setResult(null);
    }
  }, [part, total, decimals]);

  const handleReset = () => {
    setPart("");
    setTotal("");
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Part (X)</label>
          <Input 
            type="number" 
            placeholder="e.g. 50" 
            value={part} 
            onChange={(e) => setPart(e.target.value)}
          />
        </div>
        <div className="hidden md:flex pb-3 text-muted-foreground font-medium">is what % of</div>
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Total (Y)</label>
          <Input 
            type="number" 
            placeholder="e.g. 200" 
            value={total} 
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      <ResultBox 
        value={result !== null ? `${result}%` : null} 
        formula={`(${part || "X"} / ${total || "Y"}) × 100`}
      />
    </div>
  );
}

function IncreaseDecrease({ decimals }: { decimals: number }) {
  const [oldVal, setOldVal] = useState("");
  const [newVal, setNewVal] = useState("");
  const [percentChange, setPercentChange] = useState<number | null>(null);
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const o = parseFloat(oldVal);
    const n = parseFloat(newVal);
    if (!isNaN(o) && !isNaN(n) && o !== 0) {
      setPercentChange(parseFloat(((n - o) / o * 100).toFixed(decimals)));
      setDiff(parseFloat((n - o).toFixed(decimals)));
    } else {
      setPercentChange(null);
      setDiff(null);
    }
  }, [oldVal, newVal, decimals]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Initial Value</label>
          <Input 
            type="number" 
            placeholder="e.g. 100" 
            value={oldVal} 
            onChange={(e) => setOldVal(e.target.value)}
          />
        </div>
        <div className="hidden md:flex pb-3 text-muted-foreground"><ArrowRight className="w-5 h-5" /></div>
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">New Value</label>
          <Input 
            type="number" 
            placeholder="e.g. 150" 
            value={newVal} 
            onChange={(e) => setNewVal(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={() => { setOldVal(""); setNewVal(""); }} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      {percentChange !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <ResultBox 
            value={`${percentChange > 0 ? "+" : ""}${percentChange}%`} 
            formula={`((${newVal} - ${oldVal}) / ${oldVal}) × 100`}
            label="Percentage Change"
          />
           <ResultBox 
            value={`${diff && diff > 0 ? "+" : ""}${diff}`} 
            formula={`${newVal} - ${oldVal}`}
            label="Difference"
          />
        </div>
      )}
      
      {percentChange === null && (
         <ResultBox 
            value={null} 
            formula={`((New - Old) / Old) × 100`}
          />
      )}
    </div>
  );
}

function AddSubtract({ decimals }: { decimals: number }) {
  const [number, setNumber] = useState("");
  const [percent, setPercent] = useState("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const n = parseFloat(number);
    const p = parseFloat(percent);
    if (!isNaN(n) && !isNaN(p)) {
      const multiplier = operation === "add" ? (1 + p/100) : (1 - p/100);
      setResult(parseFloat((n * multiplier).toFixed(decimals)));
    } else {
      setResult(null);
    }
  }, [number, percent, operation, decimals]);

  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-secondary p-1 rounded-xl">
          <button 
            onClick={() => setOperation("add")}
            className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", operation === "add" ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
          >
            Increase (+)
          </button>
          <button 
            onClick={() => setOperation("subtract")}
            className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", operation === "subtract" ? "bg-white shadow-sm text-destructive" : "text-muted-foreground")}
          >
            Decrease (-)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Number</label>
          <Input 
            type="number" 
            placeholder="e.g. 500" 
            value={number} 
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <div className="hidden md:flex pb-3 font-medium text-muted-foreground">
          {operation === "add" ? "plus" : "minus"}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Percentage</label>
          <div className="relative">
             <Input 
              type="number" 
              placeholder="e.g. 15" 
              value={percent} 
              onChange={(e) => setPercent(e.target.value)}
              className="pr-10"
            />
             <Percent className="absolute right-3 top-3.5 w-5 h-5 text-muted-foreground/50" />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={() => { setNumber(""); setPercent(""); }} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      <ResultBox 
        value={result} 
        formula={`${number || "N"} × (1 ${operation === "add" ? "+" : "-"} ${percent || "P"}/100)`}
      />
    </div>
  );
}

function ReversePercentage({ decimals }: { decimals: number }) {
  const [finalVal, setFinalVal] = useState("");
  const [percent, setPercent] = useState("");
  const [type, setType] = useState<"increase" | "decrease">("increase");
  const [original, setOriginal] = useState<number | null>(null);

  useEffect(() => {
    const f = parseFloat(finalVal);
    const p = parseFloat(percent);
    
    if (!isNaN(f) && !isNaN(p)) {
      let res;
      if (type === "increase") {
        // Original * (1 + p/100) = Final => Original = Final / (1 + p/100)
        res = f / (1 + p/100);
      } else {
        // Original * (1 - p/100) = Final => Original = Final / (1 - p/100)
        res = f / (1 - p/100);
      }
      setOriginal(parseFloat(res.toFixed(decimals)));
    } else {
      setOriginal(null);
    }
  }, [finalVal, percent, type, decimals]);

  return (
    <div>
      <div className="space-y-2 mb-6">
        <label className="text-sm font-medium ml-1">This result is after a...</label>
        <Select value={type} onValueChange={(v) => setType(v as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="increase">Percentage Increase</SelectItem>
            <SelectItem value="decrease">Percentage Decrease</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Final Value</label>
          <Input 
            type="number" 
            placeholder="e.g. 120" 
            value={finalVal} 
            onChange={(e) => setFinalVal(e.target.value)}
          />
        </div>
        <div className="hidden md:flex pb-3 font-medium text-muted-foreground">
          by
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium ml-1">Percentage</label>
          <div className="relative">
             <Input 
              type="number" 
              placeholder="e.g. 20" 
              value={percent} 
              onChange={(e) => setPercent(e.target.value)}
              className="pr-10"
            />
             <Percent className="absolute right-3 top-3.5 w-5 h-5 text-muted-foreground/50" />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="ghost" onClick={() => { setFinalVal(""); setPercent(""); }} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      <ResultBox 
        value={original} 
        label="Original Value"
        formula={`${finalVal || "Final"} / (1 ${type === "increase" ? "+" : "-"} ${percent || "P"}/100)`}
      />
    </div>
  );
}
