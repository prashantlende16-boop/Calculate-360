import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { RememberInputs } from "@/components/RememberInputs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/calculatorUtils";
import { getRememberPref, setRememberPref, saveToLocalStorage, loadFromLocalStorage } from "@/lib/calculatorUtils";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, X } from "lucide-react";
import { useEffect } from "react";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function mixColor(c1: [number, number, number], c2: [number, number, number], ratio: number): [number, number, number] {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * ratio),
    Math.round(c1[1] + (c2[1] - c1[1]) * ratio),
    Math.round(c1[2] + (c2[2] - c1[2]) * ratio),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = relativeLuminance(...rgb1);
  const l2 = relativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export default function ColorTools() {
  const { toast } = useToast();
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [rInput, setRInput] = useState("59");
  const [gInput, setGInput] = useState("130");
  const [bInput, setBInput] = useState("246");
  const [pickerColor, setPickerColor] = useState("#3b82f6");

  const [paletteColor, setPaletteColor] = useState("#3b82f6");

  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const [remember, setRememberState] = useState(() => getRememberPref("color-tools"));

  useEffect(() => {
    if (remember) {
      const saved = loadFromLocalStorage("color-tools");
      if (saved) {
        if (saved.hexInput) setHexInput(saved.hexInput);
        if (saved.rInput) setRInput(saved.rInput);
        if (saved.gInput) setGInput(saved.gInput);
        if (saved.bInput) setBInput(saved.bInput);
        if (saved.paletteColor) setPaletteColor(saved.paletteColor);
        if (saved.fgColor) setFgColor(saved.fgColor);
        if (saved.bgColor) setBgColor(saved.bgColor);
      }
    }
  }, []);

  useEffect(() => {
    if (remember) {
      saveToLocalStorage("color-tools", { hexInput, rInput, gInput, bInput, paletteColor, fgColor, bgColor });
    }
  }, [hexInput, rInput, gInput, bInput, paletteColor, fgColor, bgColor, remember]);

  const setRemember = (val: boolean) => {
    setRememberPref("color-tools", val);
    setRememberState(val);
  };

  const hexRgb = useMemo(() => hexToRgb(hexInput), [hexInput]);
  const hexHsl = useMemo(() => hexRgb ? rgbToHsl(...hexRgb) : null, [hexRgb]);

  const rgbR = parseInt(rInput) || 0;
  const rgbG = parseInt(gInput) || 0;
  const rgbB = parseInt(bInput) || 0;
  const rgbHex = rgbToHex(rgbR, rgbG, rgbB);
  const rgbHsl = rgbToHsl(rgbR, rgbG, rgbB);

  const handlePickerChange = (val: string) => {
    setPickerColor(val);
    setHexInput(val);
    const rgb = hexToRgb(val);
    if (rgb) {
      setRInput(String(rgb[0]));
      setGInput(String(rgb[1]));
      setBInput(String(rgb[2]));
    }
  };

  const handleHexChange = (val: string) => {
    setHexInput(val);
    const rgb = hexToRgb(val);
    if (rgb) {
      setRInput(String(rgb[0]));
      setGInput(String(rgb[1]));
      setBInput(String(rgb[2]));
      setPickerColor(val);
    }
  };

  const handleRgbChange = (r: string, g: string, b: string) => {
    setRInput(r); setGInput(g); setBInput(b);
    const hex = rgbToHex(parseInt(r) || 0, parseInt(g) || 0, parseInt(b) || 0);
    setHexInput(hex);
    setPickerColor(hex);
  };

  const ratios = [0.1, 0.25, 0.4, 0.6, 0.8];
  const paletteRgb = hexToRgb(paletteColor);
  const tints = paletteRgb ? ratios.map((r) => mixColor(paletteRgb, [255, 255, 255], r)) : [];
  const shades = paletteRgb ? ratios.map((r) => mixColor(paletteRgb, [0, 0, 0], r)) : [];

  const fgRgb = hexToRgb(fgColor);
  const bgRgb = hexToRgb(bgColor);
  const ratio = fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : null;

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    toast({ title: "Copied to clipboard" });
  };

  const copyCssVars = () => {
    if (!paletteRgb) return;
    const lines = [
      `--color-base: ${paletteColor};`,
      ...tints.map((t, i) => `--color-tint-${(i + 1) * 100}: ${rgbToHex(...t)};`),
      ...shades.map((s, i) => `--color-shade-${(i + 1) * 100}: ${rgbToHex(...s)};`),
    ];
    copyToClipboard(lines.join("\n"));
    toast({ title: "CSS variables copied" });
  };

  const faqs = [
    {
      question: "How does HEX to RGB conversion work?",
      answer: "A HEX color like #3B82F6 is split into three pairs: 3B (red), 82 (green), F6 (blue). Each pair is converted from hexadecimal (base 16) to decimal (base 10) to get the RGB values (59, 130, 246)."
    },
    {
      question: "What is the WCAG contrast ratio?",
      answer: "The Web Content Accessibility Guidelines (WCAG) define minimum contrast ratios between foreground and background colors. Level AA requires 4.5:1 for normal text and 3:1 for large text. Level AAA requires 7:1 for normal text and 4.5:1 for large text."
    },
    {
      question: "What are tints and shades?",
      answer: "A tint is created by mixing a color with white, making it lighter. A shade is created by mixing a color with black, making it darker. Together they form a monochromatic color palette."
    },
    {
      question: "What is HSL color format?",
      answer: "HSL stands for Hue, Saturation, and Lightness. Hue is a degree on the color wheel (0-360), Saturation is a percentage (0-100%), and Lightness is also a percentage (0-100%). It's often more intuitive than RGB for choosing colors."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Color Tools - Converter, Palette Generator & Contrast Checker | Calculate 360"
        description="Free online color tools: convert between HEX, RGB, and HSL. Generate color palettes with tints and shades. Check WCAG contrast ratios for accessibility."
        path="/color-tools"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Color Tools
              </h1>
              <p className="text-lg text-muted-foreground">
                Convert colors, generate palettes, and check contrast ratios for accessibility.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <Tabs defaultValue="converter" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-slate-100/50 rounded-xl gap-1">
                  <TabsTrigger value="converter" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-converter">Converter</TabsTrigger>
                  <TabsTrigger value="palette" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-palette">Palette</TabsTrigger>
                  <TabsTrigger value="contrast" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-contrast">Contrast</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="converter" className="mt-0 space-y-6">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <Label className="mb-2 block">Color Picker</Label>
                        <input
                          type="color"
                          value={pickerColor}
                          onChange={(e) => handlePickerChange(e.target.value)}
                          className="w-16 h-10 rounded-md border border-slate-200 cursor-pointer"
                          data-testid="input-color-picker"
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label className="mb-2 block">HEX</Label>
                        <Input
                          value={hexInput}
                          onChange={(e) => handleHexChange(e.target.value)}
                          placeholder="#3b82f6"
                          className="input-field"
                          data-testid="input-hex"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="mb-2 block">R</Label>
                        <Input type="number" min="0" max="255" value={rInput} onChange={(e) => handleRgbChange(e.target.value, gInput, bInput)} className="input-field" data-testid="input-r" />
                      </div>
                      <div>
                        <Label className="mb-2 block">G</Label>
                        <Input type="number" min="0" max="255" value={gInput} onChange={(e) => handleRgbChange(rInput, e.target.value, bInput)} className="input-field" data-testid="input-g" />
                      </div>
                      <div>
                        <Label className="mb-2 block">B</Label>
                        <Input type="number" min="0" max="255" value={bInput} onChange={(e) => handleRgbChange(rInput, gInput, e.target.value)} className="input-field" data-testid="input-b" />
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg border border-slate-200" style={{ backgroundColor: hexInput }} data-testid="color-preview" />
                        <div className="space-y-1">
                          <p className="text-sm"><span className="text-muted-foreground">HEX:</span> <span className="font-mono font-bold" data-testid="text-hex-output">{hexRgb ? hexInput : "—"}</span></p>
                          <p className="text-sm"><span className="text-muted-foreground">RGB:</span> <span className="font-mono font-bold" data-testid="text-rgb-output">{hexRgb ? `rgb(${hexRgb[0]}, ${hexRgb[1]}, ${hexRgb[2]})` : "—"}</span></p>
                          <p className="text-sm"><span className="text-muted-foreground">HSL:</span> <span className="font-mono font-bold" data-testid="text-hsl-output">{hexHsl ? `hsl(${hexHsl[0]}, ${hexHsl[1]}%, ${hexHsl[2]}%)` : "—"}</span></p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="palette" className="mt-0 space-y-6">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <Label className="mb-2 block">Base Color</Label>
                        <input
                          type="color"
                          value={paletteColor}
                          onChange={(e) => setPaletteColor(e.target.value)}
                          className="w-16 h-10 rounded-md border border-slate-200 cursor-pointer"
                          data-testid="input-palette-picker"
                        />
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <Label className="mb-2 block">HEX</Label>
                        <Input value={paletteColor} onChange={(e) => setPaletteColor(e.target.value)} className="input-field" data-testid="input-palette-hex" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-sm mb-3">Tints (lighter)</h3>
                      <div className="flex gap-2 flex-wrap">
                        <SwatchBox color={paletteColor} label="Base" testId="swatch-base" />
                        {tints.map((t, i) => (
                          <SwatchBox key={`tint-${i}`} color={rgbToHex(...t)} label={`${ratios[i] * 100}%`} testId={`swatch-tint-${i}`} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-sm mb-3">Shades (darker)</h3>
                      <div className="flex gap-2 flex-wrap">
                        <SwatchBox color={paletteColor} label="Base" testId="swatch-shade-base" />
                        {shades.map((s, i) => (
                          <SwatchBox key={`shade-${i}`} color={rgbToHex(...s)} label={`${ratios[i] * 100}%`} testId={`swatch-shade-${i}`} />
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="gap-2" onClick={copyCssVars} data-testid="button-copy-css-vars">
                      <Copy className="w-4 h-4" /> Copy CSS Variables
                    </Button>
                  </TabsContent>

                  <TabsContent value="contrast" className="mt-0 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Foreground</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-md border border-slate-200 cursor-pointer" data-testid="input-fg-picker" />
                          <Input value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="input-field flex-1" data-testid="input-fg-hex" />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">Background</Label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-md border border-slate-200 cursor-pointer" data-testid="input-bg-picker" />
                          <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="input-field flex-1" data-testid="input-bg-hex" />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-6 border border-slate-200" style={{ backgroundColor: bgColor, color: fgColor }} data-testid="contrast-preview">
                      <p className="text-lg font-bold">Sample Text Preview</p>
                      <p className="text-sm mt-1">The quick brown fox jumps over the lazy dog.</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-lg font-bold mb-3" data-testid="text-contrast-ratio">
                        Contrast Ratio: {ratio !== null ? `${ratio.toFixed(2)}:1` : "—"}
                      </p>
                      {ratio !== null && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-bold text-sm">WCAG AA</h4>
                            <WcagResult label="Normal text" pass={ratio >= 4.5} testId="wcag-aa-normal" />
                            <WcagResult label="Large text" pass={ratio >= 3} testId="wcag-aa-large" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-bold text-sm">WCAG AAA</h4>
                            <WcagResult label="Normal text" pass={ratio >= 7} testId="wcag-aaa-normal" />
                            <WcagResult label="Large text" pass={ratio >= 4.5} testId="wcag-aaa-large" />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="mt-6">
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <AdSlot position="sidebar" />
          </aside>
        </div>

        <AdSlot position="bottom" className="mt-8" />
      </main>

      <Footer />
    </div>
  );
}

function SwatchBox({ color, label, testId }: { color: string; label: string; testId: string }) {
  return (
    <div className="text-center" data-testid={testId}>
      <div className="w-14 h-14 rounded-lg border border-slate-200" style={{ backgroundColor: color }} />
      <p className="text-[10px] font-mono text-muted-foreground mt-1">{color}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function WcagResult({ label, pass, testId }: { label: string; pass: boolean; testId: string }) {
  return (
    <div className="flex items-center gap-2 text-sm" data-testid={testId}>
      {pass ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-red-500" />
      )}
      <span className={pass ? "text-green-700" : "text-red-600"}>{label}: {pass ? "Pass" : "Fail"}</span>
    </div>
  );
}
