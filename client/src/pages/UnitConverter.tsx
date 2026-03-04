import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, ArrowLeftRight, Star, Link as LinkIcon, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories: Record<string, { name: string; units: { id: string; label: string; toBase: number | ((v: number) => number); fromBase: number | ((v: number) => number) }[] }> = {
  length: {
    name: "Length",
    units: [
      { id: "mm", label: "Millimeter (mm)", toBase: 0.001, fromBase: 1000 },
      { id: "cm", label: "Centimeter (cm)", toBase: 0.01, fromBase: 100 },
      { id: "m", label: "Meter (m)", toBase: 1, fromBase: 1 },
      { id: "km", label: "Kilometer (km)", toBase: 1000, fromBase: 0.001 },
      { id: "in", label: "Inch (in)", toBase: 0.0254, fromBase: 39.3701 },
      { id: "ft", label: "Foot (ft)", toBase: 0.3048, fromBase: 3.28084 },
      { id: "yd", label: "Yard (yd)", toBase: 0.9144, fromBase: 1.09361 },
      { id: "mi", label: "Mile (mi)", toBase: 1609.34, fromBase: 0.000621371 },
      { id: "nmi", label: "Nautical Mile", toBase: 1852, fromBase: 0.000539957 },
    ],
  },
  area: {
    name: "Area",
    units: [
      { id: "sqmm", label: "Square mm", toBase: 1e-6, fromBase: 1e6 },
      { id: "sqcm", label: "Square cm", toBase: 1e-4, fromBase: 1e4 },
      { id: "sqm", label: "Square meter", toBase: 1, fromBase: 1 },
      { id: "ha", label: "Hectare", toBase: 10000, fromBase: 0.0001 },
      { id: "sqkm", label: "Square km", toBase: 1e6, fromBase: 1e-6 },
      { id: "sqin", label: "Square inch", toBase: 0.00064516, fromBase: 1550.0031 },
      { id: "sqft", label: "Square foot", toBase: 0.092903, fromBase: 10.7639 },
      { id: "sqyd", label: "Square yard", toBase: 0.836127, fromBase: 1.19599 },
      { id: "acre", label: "Acre", toBase: 4046.86, fromBase: 0.000247105 },
      { id: "sqmi", label: "Square mile", toBase: 2.59e6, fromBase: 3.861e-7 },
    ],
  },
  volume: {
    name: "Volume",
    units: [
      { id: "ml", label: "Milliliter (mL)", toBase: 0.001, fromBase: 1000 },
      { id: "l", label: "Liter (L)", toBase: 1, fromBase: 1 },
      { id: "cubcm", label: "Cubic cm", toBase: 0.001, fromBase: 1000 },
      { id: "cubm", label: "Cubic meter", toBase: 1000, fromBase: 0.001 },
      { id: "tsp", label: "Teaspoon", toBase: 0.00492892, fromBase: 202.884 },
      { id: "tbsp", label: "Tablespoon", toBase: 0.0147868, fromBase: 67.628 },
      { id: "floz", label: "Fluid ounce", toBase: 0.0295735, fromBase: 33.814 },
      { id: "cup", label: "Cup", toBase: 0.236588, fromBase: 4.22675 },
      { id: "pt", label: "Pint", toBase: 0.473176, fromBase: 2.11338 },
      { id: "qt", label: "Quart", toBase: 0.946353, fromBase: 1.05669 },
      { id: "gal", label: "Gallon", toBase: 3.78541, fromBase: 0.264172 },
    ],
  },
  mass: {
    name: "Mass/Weight",
    units: [
      { id: "mg", label: "Milligram (mg)", toBase: 0.001, fromBase: 1000 },
      { id: "g", label: "Gram (g)", toBase: 1, fromBase: 1 },
      { id: "kg", label: "Kilogram (kg)", toBase: 1000, fromBase: 0.001 },
      { id: "t", label: "Tonne", toBase: 1e6, fromBase: 1e-6 },
      { id: "oz", label: "Ounce (oz)", toBase: 28.3495, fromBase: 0.035274 },
      { id: "lb", label: "Pound (lb)", toBase: 453.592, fromBase: 0.00220462 },
      { id: "st", label: "Stone", toBase: 6350.29, fromBase: 0.000157473 },
    ],
  },
  temperature: {
    name: "Temperature",
    units: [
      { id: "c", label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
      { id: "f", label: "Fahrenheit (°F)", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { id: "k", label: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  speed: {
    name: "Speed",
    units: [
      { id: "ms", label: "Meters/second", toBase: 1, fromBase: 1 },
      { id: "kmh", label: "km/hour", toBase: 0.277778, fromBase: 3.6 },
      { id: "mph", label: "Miles/hour", toBase: 0.44704, fromBase: 2.23694 },
      { id: "kn", label: "Knot", toBase: 0.514444, fromBase: 1.94384 },
    ],
  },
  time: {
    name: "Time",
    units: [
      { id: "ms", label: "Millisecond", toBase: 0.001, fromBase: 1000 },
      { id: "s", label: "Second", toBase: 1, fromBase: 1 },
      { id: "min", label: "Minute", toBase: 60, fromBase: 1 / 60 },
      { id: "hr", label: "Hour", toBase: 3600, fromBase: 1 / 3600 },
      { id: "day", label: "Day", toBase: 86400, fromBase: 1 / 86400 },
      { id: "wk", label: "Week", toBase: 604800, fromBase: 1 / 604800 },
      { id: "mo", label: "Month (~30d)", toBase: 2592000, fromBase: 1 / 2592000 },
      { id: "yr", label: "Year (~365d)", toBase: 31536000, fromBase: 1 / 31536000 },
    ],
  },
  pressure: {
    name: "Pressure",
    units: [
      { id: "pa", label: "Pascal (Pa)", toBase: 1, fromBase: 1 },
      { id: "kpa", label: "Kilopascal (kPa)", toBase: 1000, fromBase: 0.001 },
      { id: "bar", label: "Bar", toBase: 100000, fromBase: 1e-5 },
      { id: "atm", label: "Atmosphere", toBase: 101325, fromBase: 9.8692e-6 },
      { id: "psi", label: "PSI", toBase: 6894.76, fromBase: 0.000145038 },
      { id: "mmhg", label: "mmHg", toBase: 133.322, fromBase: 0.00750062 },
    ],
  },
  energy: {
    name: "Energy",
    units: [
      { id: "j", label: "Joule (J)", toBase: 1, fromBase: 1 },
      { id: "kj", label: "Kilojoule (kJ)", toBase: 1000, fromBase: 0.001 },
      { id: "cal", label: "Calorie", toBase: 4.184, fromBase: 0.239006 },
      { id: "kcal", label: "Kilocalorie", toBase: 4184, fromBase: 0.000239006 },
      { id: "wh", label: "Watt-hour", toBase: 3600, fromBase: 0.000277778 },
      { id: "kwh", label: "Kilowatt-hour", toBase: 3.6e6, fromBase: 2.7778e-7 },
      { id: "btu", label: "BTU", toBase: 1055.06, fromBase: 0.000947817 },
    ],
  },
  power: {
    name: "Power",
    units: [
      { id: "w", label: "Watt (W)", toBase: 1, fromBase: 1 },
      { id: "kw", label: "Kilowatt (kW)", toBase: 1000, fromBase: 0.001 },
      { id: "hp", label: "Horsepower", toBase: 745.7, fromBase: 0.00134102 },
    ],
  },
  data: {
    name: "Data",
    units: [
      { id: "bit", label: "Bit", toBase: 1, fromBase: 1 },
      { id: "byte", label: "Byte", toBase: 8, fromBase: 0.125 },
      { id: "kb", label: "Kilobyte (KB)", toBase: 8000, fromBase: 0.000125 },
      { id: "mb", label: "Megabyte (MB)", toBase: 8e6, fromBase: 1.25e-7 },
      { id: "gb", label: "Gigabyte (GB)", toBase: 8e9, fromBase: 1.25e-10 },
      { id: "tb", label: "Terabyte (TB)", toBase: 8e12, fromBase: 1.25e-13 },
      { id: "kib", label: "Kibibyte (KiB)", toBase: 8192, fromBase: 0.000122070 },
      { id: "mib", label: "Mebibyte (MiB)", toBase: 8388608, fromBase: 1.1921e-7 },
      { id: "gib", label: "Gibibyte (GiB)", toBase: 8589934592, fromBase: 1.1642e-10 },
      { id: "tib", label: "Tebibyte (TiB)", toBase: 8796093022208, fromBase: 1.1369e-13 },
    ],
  },
  angle: {
    name: "Angle",
    units: [
      { id: "deg", label: "Degree (°)", toBase: 1, fromBase: 1 },
      { id: "rad", label: "Radian", toBase: 57.2958, fromBase: 0.0174533 },
    ],
  },
};

export default function UnitConverter() {
  const { toast } = useToast();
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [value, setValue] = useState("1");
  const [precision, setPrecision] = useState(4);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("unit_favorites");
    if (saved) setFavorites(JSON.parse(saved));
    
    const params = new URLSearchParams(window.location.search);
    if (params.get("cat")) setCategory(params.get("cat") || "length");
    if (params.get("from")) setFromUnit(params.get("from") || "m");
    if (params.get("to")) setToUnit(params.get("to") || "ft");
    if (params.get("v")) setValue(params.get("v") || "1");
    if (params.get("p")) setPrecision(parseInt(params.get("p") || "4"));
  }, []);

  useEffect(() => {
    const units = categories[category].units;
    setFromUnit(units[0].id);
    setToUnit(units[1]?.id || units[0].id);
  }, [category]);

  const convert = (val: number, from: string, to: string): number => {
    const cat = categories[category];
    const fromDef = cat.units.find((u) => u.id === from);
    const toDef = cat.units.find((u) => u.id === to);
    if (!fromDef || !toDef) return 0;

    let base: number;
    if (typeof fromDef.toBase === "function") {
      base = fromDef.toBase(val);
    } else {
      base = val * fromDef.toBase;
    }

    if (typeof toDef.fromBase === "function") {
      return toDef.fromBase(base);
    } else {
      return base * toDef.fromBase;
    }
  };

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    return convert(num, fromUnit, toUnit);
  }, [value, fromUnit, toUnit, category]);

  const quickConversions = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return [];
    return categories[category].units.slice(0, 8).map((u) => ({
      label: u.label,
      value: convert(num, fromUnit, u.id),
    }));
  }, [value, fromUnit, category]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleReset = () => {
    setValue("1");
    const units = categories[category].units;
    setFromUnit(units[0].id);
    setToUnit(units[1]?.id || units[0].id);
  };

  const copyResult = () => {
    if (result === null) return;
    navigator.clipboard.writeText(`${value} ${fromUnit} = ${result.toFixed(precision)} ${toUnit}`);
    toast({ title: "Result copied" });
  };

  const copyShareLink = () => {
    const params = new URLSearchParams({ cat: category, from: fromUnit, to: toUnit, v: value, p: precision.toString() });
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?${params}`);
    toast({ title: "Link copied" });
  };

  const toggleFavorite = () => {
    const key = `${category}:${fromUnit}:${toUnit}`;
    const updated = favorites.includes(key) ? favorites.filter((f) => f !== key) : [...favorites, key];
    setFavorites(updated);
    localStorage.setItem("unit_favorites", JSON.stringify(updated));
  };

  const loadFavorite = (fav: string) => {
    const [cat, from, to] = fav.split(":");
    setCategory(cat);
    setTimeout(() => {
      setFromUnit(from);
      setToUnit(to);
    }, 50);
  };

  const faqs = [
    { question: "Does it work offline?", answer: "Yes! All conversions are computed locally in your browser using built-in formulas. No internet required." },
    { question: "How accurate are conversions?", answer: "Conversions use standard scientific factors and are accurate to the precision selected. Temperature uses exact formulas." },
    { question: "What's the difference between MB and MiB?", answer: "MB (Megabyte) uses base-10 (1 MB = 1,000 KB). MiB (Mebibyte) uses base-2 (1 MiB = 1,024 KiB). Storage often uses MiB internally." },
    { question: "Why are months/years approximate?", answer: "Months vary (28-31 days) and years can be leap years. We use 30-day months and 365-day years as approximations." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Unit Converter</h1>
          <p className="text-lg text-muted-foreground">Convert length, mass, temperature, data, and more instantly.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted border-b pb-0">
                <Tabs value={category} onValueChange={setCategory} className="w-full overflow-x-auto">
                  <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
                    {Object.entries(categories).map(([key, cat]) => (
                      <TabsTrigger key={key} value={key} className="text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                        {cat.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="text-2xl font-bold h-14" placeholder="Enter value" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-end gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories[category].units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleSwap} className="rounded-full h-12 w-12">
                    <ArrowLeftRight className="h-5 w-5" />
                  </Button>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories[category].units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-card dark:bg-background text-white rounded-xl p-6 text-center">
                  <div className="text-muted-foreground text-sm mb-2">{value || "—"} {fromUnit} =</div>
                  <div className="text-4xl font-bold text-primary">{result !== null ? result.toFixed(precision) : "—"}</div>
                  <div className="text-xl text-muted-foreground mt-1">{toUnit}</div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={copyResult} variant="outline" className="gap-2 flex-1"><Copy className="h-4 w-4" /> Copy</Button>
                  <Button onClick={copyShareLink} variant="outline" className="gap-2 flex-1"><LinkIcon className="h-4 w-4" /> Share</Button>
                  <Button onClick={toggleFavorite} variant="outline" className="gap-2">
                    <Star className={`h-4 w-4 ${favorites.includes(`${category}:${fromUnit}:${toUnit}`) ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="gap-2"><RotateCcw className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted border-b"><CardTitle className="text-lg">Quick Conversions</CardTitle></CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickConversions.map((q, i) => (
                    <div key={i} className="bg-muted rounded-lg p-3 text-center">
                      <div className="text-xs text-muted-foreground truncate">{q.label}</div>
                      <div className="font-bold text-foreground">{q.value.toFixed(precision)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted border-b"><CardTitle className="text-lg">Settings</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Precision (decimals)</Label>
                  <div className="flex gap-2">
                    {[0, 2, 4, 6].map((p) => (
                      <button key={p} onClick={() => setPrecision(p)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${precision === p ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {favorites.length > 0 && (
              <Card className="border-border shadow-sm">
                <CardHeader className="bg-muted border-b"><CardTitle className="text-lg">Favorites</CardTitle></CardHeader>
                <CardContent className="p-4 space-y-2">
                  {favorites.map((fav) => {
                    const [cat, from, to] = fav.split(":");
                    return (
                      <button key={fav} onClick={() => loadFavorite(fav)} className="w-full text-left p-3 bg-muted hover:bg-muted rounded-lg text-sm flex items-center gap-2 transition-colors">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="truncate">{categories[cat]?.name}: {from} → {to}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            )}
            <AdSlot position="sidebar" />
          </div>
        </div>

        <section className="max-w-6xl mx-auto mt-12">
          <FAQSection title="Unit Converter FAQ" items={faqs} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
