import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Copy, Link as LinkIcon, Info, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function BodyFatEstimator() {
  const { toast } = useToast();
  const [gender, setGender] = useState("male");
  const [isMetric, setIsMetric] = useState(true);
  const [height, setHeight] = useState("");
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [weight, setWeight] = useState("");
  const [decimals, setDecimals] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gender")) setGender(params.get("gender") || "male");
    if (params.get("unit")) setIsMetric(params.get("unit") === "metric");
    if (params.get("h")) setHeight(params.get("h") || "");
    if (params.get("neck")) setNeck(params.get("neck") || "");
    if (params.get("waist")) setWaist(params.get("waist") || "");
    if (params.get("weight")) setWeight(params.get("weight") || "");
  }, []);

  const toInches = (val: string) => {
    const num = parseFloat(val) || 0;
    return isMetric ? num / 2.54 : num;
  };

  const bodyFat = useMemo(() => {
    const h = toInches(height);
    const n = toInches(neck);
    const w = toInches(waist);
    const hp = toInches(hip);

    if (h <= 0 || n <= 0 || w <= 0) return null;

    if (gender === "male") {
      if (w - n <= 0) return null;
      return 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
    } else {
      if (hp <= 0 || w + hp - n <= 0) return null;
      return 163.205 * Math.log10(w + hp - n) - 97.684 * Math.log10(h) - 78.387;
    }
  }, [gender, height, neck, waist, hip, isMetric]);

  const getCategory = (bf: number) => {
    if (gender === "male") {
      if (bf < 6) return { label: "Essential Fat", color: "bg-blue-500", range: "2-5%" };
      if (bf < 14) return { label: "Athletes", color: "bg-green-500", range: "6-13%" };
      if (bf < 18) return { label: "Fitness", color: "bg-emerald-500", range: "14-17%" };
      if (bf < 25) return { label: "Average", color: "bg-yellow-500", range: "18-24%" };
      return { label: "Obese", color: "bg-red-500", range: "25%+" };
    } else {
      if (bf < 14) return { label: "Essential Fat", color: "bg-blue-500", range: "10-13%" };
      if (bf < 21) return { label: "Athletes", color: "bg-green-500", range: "14-20%" };
      if (bf < 25) return { label: "Fitness", color: "bg-emerald-500", range: "21-24%" };
      if (bf < 32) return { label: "Average", color: "bg-yellow-500", range: "25-31%" };
      return { label: "Obese", color: "bg-red-500", range: "32%+" };
    }
  };

  const handleReset = () => {
    setHeight("");
    setNeck("");
    setWaist("");
    setHip("");
    setWeight("");
  };

  const copyResult = () => {
    if (bodyFat === null) return;
    const text = `Body Fat Estimate: ${bodyFat.toFixed(decimals)}% (${getCategory(bodyFat).label})`;
    navigator.clipboard.writeText(text);
    toast({ title: "Result copied" });
  };

  const copyShareLink = () => {
    const params = new URLSearchParams();
    params.set("gender", gender);
    params.set("unit", isMetric ? "metric" : "imperial");
    params.set("h", height);
    params.set("neck", neck);
    params.set("waist", waist);
    if (hip) params.set("hip", hip);
    if (weight) params.set("weight", weight);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied" });
  };

  const faqs = [
    { question: "Is the US Navy method accurate?", answer: "It is a widely used estimation method. While not as precise as DEXA scans, it provides a reliable baseline for tracking progress over time using just a tape measure." },
    { question: "Where to measure?", answer: "Neck: below the larynx, sloping slightly downward. Waist: at the navel for men, at the narrowest point for women. Hips (women): at the widest point." },
    { question: "Why does it differ from scales?", answer: "Smart scales use bioelectrical impedance, which can be affected by hydration levels. The Navy method uses physical dimensions which are often more consistent for tracking fat loss." }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Body Fat % Estimator</h1>
          <p className="text-lg text-muted-foreground">US Navy Method – Reliable estimation through simple measurements.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted border-b flex flex-row items-center justify-between">
                <Tabs value={gender} onValueChange={setGender} className="w-48">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="male">Male</TabsTrigger>
                    <TabsTrigger value="female">Female</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase">{isMetric ? "Metric" : "Imperial"}</span>
                  <Switch checked={isMetric} onCheckedChange={setIsMetric} />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Height ({isMetric ? "cm" : "in"})</Label>
                    <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
                  </div>
                  <div className="space-y-2">
                    <Label>Neck ({isMetric ? "cm" : "in"})</Label>
                    <Input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} placeholder="38" />
                  </div>
                  <div className="space-y-2">
                    <Label>Waist ({isMetric ? "cm" : "in"})</Label>
                    <Input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="85" />
                  </div>
                  {gender === "female" && (
                    <div className="space-y-2">
                      <Label>Hip ({isMetric ? "cm" : "in"})</Label>
                      <Input type="number" value={hip} onChange={(e) => setHip(e.target.value)} placeholder="90" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Weight ({isMetric ? "kg" : "lb"}) - Optional</Label>
                    <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75" />
                  </div>
                </div>
                <Button variant="outline" onClick={handleReset} className="w-full">Reset</Button>
              </CardContent>
            </Card>

            {bodyFat !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-card dark:bg-background text-white border-none shadow-lg">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="text-muted-foreground uppercase tracking-widest text-sm">Estimated Body Fat</div>
                    <div className="text-6xl font-bold text-primary">{bodyFat.toFixed(decimals)}%</div>
                    <div className="text-2xl text-muted-foreground font-medium">{getCategory(bodyFat).label}</div>
                    
                    {weight && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div className="text-sm">
                          <div className="text-muted-foreground">Fat Mass</div>
                          <div className="font-bold">{(parseFloat(weight) * bodyFat / 100).toFixed(1)} {isMetric ? "kg" : "lb"}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">Lean Mass</div>
                          <div className="font-bold">{(parseFloat(weight) * (1 - bodyFat / 100)).toFixed(1)} {isMetric ? "kg" : "lb"}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button onClick={copyResult} variant="secondary" className="flex-1 gap-2"><Copy className="h-4 w-4" /> Copy</Button>
                      <Button onClick={copyShareLink} variant="secondary" className="flex-1 gap-2"><LinkIcon className="h-4 w-4" /> Share</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted border-b"><CardTitle className="text-lg">How to Measure</CardTitle></CardHeader>
              <CardContent className="p-6 text-sm space-y-3 text-muted-foreground">
                <div className="flex gap-3"><Ruler className="h-5 w-5 text-primary shrink-0" /> <p><strong>Neck:</strong> Measure below the larynx with the tape slanting slightly downward to the front.</p></div>
                <div className="flex gap-3"><Ruler className="h-5 w-5 text-primary shrink-0" /> <p><strong>Waist:</strong> Men: at navel level. Women: at the narrowest point of the torso.</p></div>
                {gender === "female" && <div className="flex gap-3"><Ruler className="h-5 w-5 text-primary shrink-0" /> <p><strong>Hips:</strong> Measure at the widest point of the buttocks.</p></div>}
              </CardContent>
            </Card>
            <AdSlot position="sidebar" />
          </div>
        </div>

        <section className="max-w-5xl mx-auto mt-12">
          <FAQSection title="Body Fat Estimator FAQ" items={faqs} />
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-800 italic">Disclaimer: This calculator provides an estimate only. Body composition varies significantly between individuals. This is not medical advice.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
