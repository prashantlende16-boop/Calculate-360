import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { ShareCopyButtons } from "@/components/ShareCopyButtons";
import { RememberInputs } from "@/components/RememberInputs";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const faqs = [
  {
    question: "How is the healthy weight range calculated?",
    answer: "The healthy weight range is derived from the BMI (Body Mass Index) scale. A BMI between 18.5 and 24.9 is considered healthy. We calculate the corresponding weight range using: weight = BMI x (height in meters)\u00B2.",
  },
  {
    question: "What is the Devine formula?",
    answer: "The Devine formula (1974) is a clinical estimation originally developed for drug dosage calculations. For men: 50 + 2.3 kg per inch over 5 feet. For women: 45.5 + 2.3 kg per inch over 5 feet. It provides a single ideal weight estimate rather than a range.",
  },
  {
    question: "Is BMI a reliable measure of healthy weight?",
    answer: "BMI is a useful screening tool but has limitations. It does not account for muscle mass, bone density, age, or body composition. Athletes and muscular individuals may have a high BMI yet be very healthy. Use it as a general guideline, not a definitive measure.",
  },
  {
    question: "Why is gender optional in this calculator?",
    answer: "The BMI-based weight range applies regardless of gender. Gender is only needed for the Devine formula estimate, which uses different baseline values for men and women. If you don't specify gender, the Devine formula estimate will simply not be shown.",
  },
];

export default function IdealWeightCalculator() {
  const { values, setValue, resetAll, remember, setRemember } = useCalculatorState(
    "ideal-weight",
    ["heightCm", "feet", "inches", "gender"],
    { gender: "not_specified" }
  );

  const [heightMode, setHeightMode] = useState<"cm" | "ftin">("cm");

  const gender = values.gender || "not_specified";

  let heightCm = 0;
  if (heightMode === "cm") {
    heightCm = parseFloat(values.heightCm) || 0;
  } else {
    const feet = parseFloat(values.feet) || 0;
    const inches = parseFloat(values.inches) || 0;
    heightCm = (feet * 12 + inches) * 2.54;
  }

  const heightM = heightCm / 100;
  const hasHeight = heightCm > 0;

  const minWeight = hasHeight ? 18.5 * heightM * heightM : 0;
  const maxWeight = hasHeight ? 24.9 * heightM * heightM : 0;

  const totalInches = heightCm / 2.54;
  let devineWeight: number | null = null;
  if (hasHeight && gender === "male") {
    devineWeight = 50 + 2.3 * (totalInches - 60);
  } else if (hasHeight && gender === "female") {
    devineWeight = 45.5 + 2.3 * (totalInches - 60);
  }

  const resultText = hasHeight
    ? `Healthy weight range: ${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg (${(minWeight * 2.205).toFixed(1)} - ${(maxWeight * 2.205).toFixed(1)} lb)`
    : "";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Ideal Weight Range Calculator - Calculate 360"
        description="Find your healthy weight range based on your height using BMI guidelines and the Devine formula. Free online calculator."
        path="/ideal-weight"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Ideal Weight Range Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Find your healthy weight range based on your height and internationally recognized guidelines.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Height Input Mode</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={heightMode === "cm" ? "default" : "outline"}
                      onClick={() => setHeightMode("cm")}
                      data-testid="button-mode-cm"
                      className="toggle-elevate"
                    >
                      Centimeters
                    </Button>
                    <Button
                      variant={heightMode === "ftin" ? "default" : "outline"}
                      onClick={() => setHeightMode("ftin")}
                      data-testid="button-mode-ftin"
                      className="toggle-elevate"
                    >
                      Feet / Inches
                    </Button>
                  </div>
                </div>

                {heightMode === "cm" ? (
                  <div>
                    <Label className="mb-2 block">Height (cm)</Label>
                    <Input
                      type="number"
                      placeholder="170"
                      value={values.heightCm}
                      onChange={(e) => setValue("heightCm", e.target.value)}
                      className="input-field"
                      data-testid="input-height-cm"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Feet</Label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={values.feet}
                        onChange={(e) => setValue("feet", e.target.value)}
                        className="input-field"
                        data-testid="input-feet"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Inches</Label>
                      <Input
                        type="number"
                        placeholder="7"
                        value={values.inches}
                        onChange={(e) => setValue("inches", e.target.value)}
                        className="input-field"
                        data-testid="input-inches"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="mb-2 block">Gender (optional)</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={gender === "male" ? "default" : "outline"}
                      onClick={() => setValue("gender", "male")}
                      data-testid="button-gender-male"
                      className="toggle-elevate"
                    >
                      Male
                    </Button>
                    <Button
                      variant={gender === "female" ? "default" : "outline"}
                      onClick={() => setValue("gender", "female")}
                      data-testid="button-gender-female"
                      className="toggle-elevate"
                    >
                      Female
                    </Button>
                    <Button
                      variant={gender === "not_specified" ? "default" : "outline"}
                      onClick={() => setValue("gender", "not_specified")}
                      data-testid="button-gender-none"
                      className="toggle-elevate"
                    >
                      Not Specified
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-display font-bold text-lg mb-4" data-testid="text-results-heading">Results</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Healthy Weight Range (kg)</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-weight-kg">
                      {hasHeight ? `${minWeight.toFixed(1)} \u2013 ${maxWeight.toFixed(1)} kg` : "\u2014"}
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Healthy Weight Range (lb)</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-weight-lb">
                      {hasHeight ? `${(minWeight * 2.205).toFixed(1)} \u2013 ${(maxWeight * 2.205).toFixed(1)} lb` : "\u2014"}
                    </p>
                  </div>
                </div>

                {devineWeight !== null && devineWeight > 0 && (
                  <div className="mt-4 bg-white rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Devine Formula Estimate (reference only)</p>
                    <p className="text-xl font-bold text-primary" data-testid="text-devine">
                      {devineWeight.toFixed(1)} kg ({(devineWeight * 2.205).toFixed(1)} lb)
                    </p>
                  </div>
                )}

                <ShareCopyButtons
                  resultText={resultText}
                  shareParams={{
                    heightCm: heightMode === "cm" ? values.heightCm : String(Math.round(heightCm)),
                    gender,
                  }}
                  onReset={resetAll}
                  hasResult={hasHeight}
                />
              </div>

              <div className="mt-6 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>This calculator provides general guidelines only and is not a substitute for professional medical advice. Consult a healthcare provider for personalized recommendations.</p>
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
