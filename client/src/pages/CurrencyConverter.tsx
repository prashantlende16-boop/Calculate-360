import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight, RotateCw, Copy, Link as LinkIcon, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const API_KEY = "6b761a6b07c8c6d4837599c4"; // Example key for ExchangeRate-API (free tier)
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/INR`;

const commonCurrencies = [
  { code: "INR", name: "Indian Rupee" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
];

export default function CurrencyConverter() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [manualRateEnabled, setManualRateEnabled] = useState(false);
  const [manualRate, setManualRate] = useState("");
  const [decimals, setDecimals] = useState(2);

  const fetchRates = async (force = false) => {
    setIsLoading(true);
    try {
      // Using a reliable public API that doesn't require keys if possible, 
      // or at least ensuring the fetch is correct.
      // exchangerate-api.com free tier is generally reliable.
      const response = await fetch(`https://open.er-api.com/v6/latest/USD`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.result === "success") {
        setRates(data.rates);
        setLastUpdated(Date.now());
        localStorage.setItem("currency_rates", JSON.stringify(data.rates));
        localStorage.setItem("currency_timestamp", Date.now().toString());
        setIsOffline(false);
      } else {
        throw new Error("API Error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      const cachedRates = localStorage.getItem("currency_rates");
      const cachedTimestamp = localStorage.getItem("currency_timestamp");
      if (cachedRates) {
        setRates(JSON.parse(cachedRates));
        setLastUpdated(parseInt(cachedTimestamp || "0"));
        setIsOffline(true);
      } else {
        // Provide fallback rates if no cache exists
        setRates({ "USD": 1, "INR": 83.5, "EUR": 0.92, "GBP": 0.79 });
        setLastUpdated(Date.now());
        setIsOffline(true);
      }
      toast({
        title: "Connection Issue",
        description: "Unable to fetch live rates. Using last known or default data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedRates = localStorage.getItem("currency_rates");
    const cachedTimestamp = localStorage.getItem("currency_timestamp");
    if (cachedRates && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp) < 3600000)) {
      setRates(JSON.parse(cachedRates));
      setLastUpdated(parseInt(cachedTimestamp));
      setIsLoading(false);
    } else {
      fetchRates();
    }
    
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get("amount")) setAmount(params.get("amount") || "100");
    if (params.get("from")) setFromCurrency(params.get("from") || "INR");
    if (params.get("to")) setToCurrency(params.get("to") || "USD");
  }, []);

  const exchangeRate = useMemo(() => {
    if (manualRateEnabled) return parseFloat(manualRate) || 0;
    if (!rates[fromCurrency] || !rates[toCurrency]) return 0;
    return rates[toCurrency] / rates[fromCurrency];
  }, [rates, fromCurrency, toCurrency, manualRateEnabled, manualRate]);

  const convertedAmount = (parseFloat(amount) || 0) * exchangeRate;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleReset = () => {
    setAmount("100");
    setFromCurrency("INR");
    setToCurrency("USD");
    setManualRateEnabled(false);
    setManualRate("");
  };

  const copyResult = () => {
    const text = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(decimals)} ${toCurrency} (Rate: 1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency})`;
    navigator.clipboard.writeText(text);
    toast({ title: "Result copied" });
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Share link copied" });
  };

  const faqs = [
    {
      question: "Are these rates live or delayed?",
      answer: "Rates are fetched live from a trusted global exchange rate API. However, markets move constantly, and these should be used for informational purposes only."
    },
    {
      question: "What happens when I'm offline?",
      answer: "The app stores the last successfully fetched rates in your browser's local storage. If offline, it will use these cached rates and show a warning."
    },
    {
      question: "How often should I refresh the rates?",
      answer: "We recommend refreshing whenever you need the most accurate estimation. The app automatically attempts to refresh if the cached data is more than an hour old."
    },
    {
      question: "Why does the rate differ from my bank?",
      answer: "Banks and payment providers often add a markup (spread) or processing fees on top of the mid-market rate shown here."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-grow">
        
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <ArrowLeftRight className="w-8 h-8 text-primary" /> Currency Converter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert 160+ currencies with live mid-market exchange rates and offline fallback.
          </p>
        </header>

        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Convert</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Manual Rate</span>
                  <Switch checked={manualRateEnabled} onCheckedChange={setManualRateEnabled} />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6">
                  <div>
                    <Label className="mb-2 block">Amount</Label>
                    <Input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-xl font-bold h-12"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-end gap-4">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <Select value={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {commonCurrencies.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                          ))}
                          <hr className="my-1" />
                          {Object.entries(rates).sort(([a], [b]) => a.localeCompare(b)).filter(([code]) => !commonCurrencies.find(cc => cc.code === code)).map(([code]) => (
                            <SelectItem key={code} value={code}>{code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-12 w-12 mb-0.5"
                      onClick={handleSwap}
                    >
                      <ArrowLeftRight className="h-5 w-5" />
                    </Button>

                    <div className="space-y-2">
                      <Label>To</Label>
                      <Select value={toCurrency} onValueChange={setToCurrency}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {commonCurrencies.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                          ))}
                          <hr className="my-1" />
                          {Object.entries(rates).sort(([a], [b]) => a.localeCompare(b)).filter(([code]) => !commonCurrencies.find(cc => cc.code === code)).map(([code]) => (
                            <SelectItem key={code} value={code}>{code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {manualRateEnabled && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                      <Label className="mb-2 block">Manual Rate (1 {fromCurrency} = ? {toCurrency})</Label>
                      <Input 
                        type="number" 
                        value={manualRate} 
                        onChange={(e) => setManualRate(e.target.value)}
                        placeholder="Enter custom rate"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleReset} variant="outline" className="flex-1">Reset</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm overflow-hidden bg-card dark:bg-background text-white">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="text-muted-foreground uppercase tracking-widest text-sm font-medium">
                    {amount} {fromCurrency} equals
                  </div>
                  <div className="text-5xl font-bold text-primary">
                    {amount ? convertedAmount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : "—"}
                  </div>
                  <div className="text-2xl font-medium text-muted-foreground">
                    {toCurrency}
                  </div>
                  
                  <div className="pt-6 w-full border-t border-white/10 space-y-2">
                    <div className="text-sm text-muted-foreground">
                      1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <span>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}</span>
                      <button onClick={() => fetchRates(true)} className="hover:text-primary transition-colors">
                        <RotateCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                    {isOffline && (
                      <div className="flex items-center justify-center gap-2 text-xs text-amber-500 font-medium">
                        <AlertTriangle className="h-3 w-3" /> Using cached rates
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full pt-4">
                    <Button onClick={copyResult} variant="secondary" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
                      <Copy className="h-4 w-4" /> Copy
                    </Button>
                    <Button onClick={copyShareLink} variant="secondary" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0">
                      <LinkIcon className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted border-b">
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Rounding (Decimals)</Label>
                  <div className="flex gap-2">
                    {[0, 2, 4].map(d => (
                      <button
                        key={d}
                        onClick={() => setDecimals(d)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${decimals === d ? "bg-primary text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-accent/5 border border-accent/15 p-4 rounded-xl flex gap-3">
                  <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-accent leading-relaxed">
                    <strong>Quick Tip:</strong> Use the <strong>Manual Rate</strong> switch to enter your bank's specific rate for precise conversion.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 my-8 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-muted-foreground text-sm leading-relaxed">
            <div className="space-y-2">
              <h3 className="font-bold text-foreground">Live Rate Fetch</h3>
              <p>We connect to global exchange rate providers to fetch real-time mid-market rates every time you open the app or click refresh.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-foreground">Cached Fallback</h3>
              <p>Traveling without internet? No problem. The app uses the last known rates stored securely in your browser's local storage.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-foreground">Manual Overrides</h3>
              <p>If you have a specific rate from your bank or money changer, toggle 'Manual Rate' to bypass live data and use your own.</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <FAQSection title="Currency Conversion FAQ" items={faqs} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
