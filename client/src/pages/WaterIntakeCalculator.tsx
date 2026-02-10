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
    question: "How much water should I drink daily?",
    answer: "A common guideline is about 33 ml per kg of body weight. For a 70 kg person, that's roughly 2.3 liters per day. However, individual needs vary based on activity level, climate, diet, and health conditions.",
  },
  {
    question: "Does coffee or tea count toward water intake?",
    answer: "Yes, coffee and tea do contribute to hydration despite being mild diuretics. However, plain water remains the best choice. Highly caffeinated or sugary drinks are less ideal for hydration.",
  },
  {
    question: "How do I know if I'm drinking enough water?",
    answer: "Check the color of your urine: pale yellow indicates good hydration, dark yellow suggests you need more fluids. Other signs of dehydration include thirst, dry mouth, fatigue, and headaches.",
  },
  {
    question: "Should I drink more water when exercising?",
    answer: "Yes. Physical activity increases water loss through sweat. For moderate exercise, add about 500 ml; for intense or prolonged exercise, add 750 ml or more. In hot climates, increase intake further.",
  },
];

export default function WaterIntakeCalculator() {
  const { values, setValue, resetAll, remember, setRemember } = useCalculatorState(
    "water-intake",
    ["weight", "activity", "climate"],
    { activity: "low", climate: "normal" }
  );

  const weight = parseFloat(values.weight);
  const activity = values.activity || "low";
  const climate = values.climate || "normal";
  const hasWeight = values.weight && !isNaN(weight) && weight > 0;

  let totalMl = 0;
  if (hasWeight) {
    totalMl = weight * 33;
    if (activity === "medium") totalMl += 500;
    if (activity === "high") totalMl += 750;
    if (climate === "hot") totalMl += 500;
  }

  const totalLiters = totalMl / 1000;
  const glasses = Math.ceil(totalMl / 250);

  const resultText = hasWeight
    ? `Daily water target: ${totalLiters.toFixed(1)}L (${glasses} glasses)`
    : "";

  const filledGlasses = hasWeight ? glasses : 0;
  const maxDisplayGlasses = Math.min(filledGlasses, 20);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Water Intake Calculator - Calculate 360"
        description="Calculate your recommended daily water intake based on your weight, activity level, and climate. Free online hydration calculator."
        path="/water-intake"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Water Intake Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Find out how much water you should drink daily based on your body and lifestyle.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Weight (kg)</Label>
                  <Input
                    type="number"
                    placeholder="70"
                    value={values.weight}
                    onChange={(e) => setValue("weight", e.target.value)}
                    className="input-field"
                    data-testid="input-weight"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Activity Level</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(["low", "medium", "high"] as const).map((level) => (
                      <Button
                        key={level}
                        variant={activity === level ? "default" : "outline"}
                        onClick={() => setValue("activity", level)}
                        data-testid={`button-activity-${level}`}
                        className="toggle-elevate capitalize"
                      >
                        {level === "low" ? "Low" : level === "medium" ? "Medium" : "High"}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Low = little exercise, Medium = 3-5 days/week, High = daily intense exercise
                  </p>
                </div>

                <div>
                  <Label className="mb-2 block">Climate</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={climate === "normal" ? "default" : "outline"}
                      onClick={() => setValue("climate", "normal")}
                      data-testid="button-climate-normal"
                      className="toggle-elevate"
                    >
                      Normal
                    </Button>
                    <Button
                      variant={climate === "hot" ? "default" : "outline"}
                      onClick={() => setValue("climate", "hot")}
                      data-testid="button-climate-hot"
                      className="toggle-elevate"
                    >
                      Hot
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h3 className="font-display font-bold text-lg mb-4" data-testid="text-results-heading">Results</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-slate-100">
                    <p className="text-sm text-muted-foreground mb-1">Daily Water Target</p>
                    <p className="text-2xl font-bold text-slate-900" data-testid="text-water-liters">
                      {hasWeight ? `${totalLiters.toFixed(1)} liters` : "\u2014"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hasWeight ? `${Math.round(totalMl)} ml` : ""}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-100">
                    <p className="text-sm text-muted-foreground mb-1">Glasses (250ml each)</p>
                    <p className="text-2xl font-bold text-primary" data-testid="text-water-glasses">
                      {hasWeight ? `${glasses} glasses` : "\u2014"}
                    </p>
                  </div>
                </div>

                {hasWeight && (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-3">Visual Guide</p>
                    <div className="flex flex-wrap gap-2" data-testid="visual-glasses">
                      {Array.from({ length: maxDisplayGlasses }).map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-10 bg-blue-400 rounded-md border border-blue-500 flex items-end justify-center"
                          title={`Glass ${i + 1}`}
                        >
                          <div className="w-4 h-1 bg-blue-200 rounded-full mb-1" />
                        </div>
                      ))}
                      {filledGlasses > 20 && (
                        <span className="flex items-center text-sm text-muted-foreground">+{filledGlasses - 20} more</span>
                      )}
                    </div>
                  </div>
                )}

                <ShareCopyButtons
                  resultText={resultText}
                  shareParams={{ weight: values.weight, activity, climate }}
                  onReset={resetAll}
                  hasResult={!!hasWeight}
                />
              </div>

              <div className="mt-6 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>This is a general hydration guideline and not medical advice. Individual water needs vary. Consult a healthcare professional for personalized recommendations.</p>
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
