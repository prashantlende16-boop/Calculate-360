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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

const ACTIVITY_LEVELS = [
  { value: "1.2", label: "Sedentary (little or no exercise)" },
  { value: "1.375", label: "Lightly Active (1-3 days/week)" },
  { value: "1.55", label: "Moderately Active (3-5 days/week)" },
  { value: "1.725", label: "Very Active (6-7 days/week)" },
  { value: "1.9", label: "Extra Active (intense daily exercise)" },
];

const faqs = [
  {
    question: "What is BMR and how is it calculated?",
    answer: "BMR (Basal Metabolic Rate) is the number of calories your body needs at rest to maintain basic life functions like breathing and circulation. We use the Mifflin-St Jeor equation, which is considered one of the most accurate formulas: Men: 10 x weight(kg) + 6.25 x height(cm) - 5 x age + 5; Women: 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161.",
  },
  {
    question: "What is TDEE?",
    answer: "TDEE (Total Daily Energy Expenditure) is the total number of calories you burn per day, including all activities. It is calculated by multiplying your BMR by an activity multiplier that reflects your lifestyle and exercise habits.",
  },
  {
    question: "How accurate is this calculator?",
    answer: "The Mifflin-St Jeor equation is considered accurate to within 10% for most people. However, individual metabolism can vary based on genetics, muscle mass, hormones, and other factors. Use this as a starting point and adjust based on real-world results.",
  },
  {
    question: "What are macronutrients and why do they matter?",
    answer: "Macronutrients (macros) are protein, carbohydrates, and fat. Each plays a crucial role: protein supports muscle repair and growth, carbohydrates provide energy, and fats support hormone production and nutrient absorption. Balancing them helps optimize body composition and energy levels.",
  },
  {
    question: "How many calories should I eat to lose or gain weight?",
    answer: "For weight loss, a moderate deficit of 300-500 calories below your TDEE is generally recommended. For weight gain, a surplus of 250-400 calories above TDEE is a good starting point. Extreme deficits or surpluses are not recommended without medical supervision.",
  },
];

export default function BmrTdeeCalculator() {
  const { values, setValue, resetAll, remember, setRemember } = useCalculatorState(
    "bmr-tdee",
    ["gender", "age", "height", "weight", "activity", "goal"],
    { gender: "male", activity: "1.55", goal: "maintain" }
  );

  const age = parseFloat(values.age);
  const height = parseFloat(values.height);
  const weight = parseFloat(values.weight);
  const activity = parseFloat(values.activity || "1.55");
  const gender = values.gender || "male";
  const goal = values.goal || "maintain";

  const hasInputs = values.age && values.height && values.weight && !isNaN(age) && !isNaN(height) && !isNaN(weight) && age > 0 && height > 0 && weight > 0;

  let bmr = 0;
  let tdee = 0;
  let calorieTarget = "";
  let macros = { protein: "", carbs: "", fat: "" };

  if (hasInputs) {
    bmr = gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    tdee = bmr * activity;

    if (goal === "lose") {
      calorieTarget = `${Math.round(tdee - 500)} - ${Math.round(tdee - 300)} kcal/day`;
    } else if (goal === "gain") {
      calorieTarget = `${Math.round(tdee + 250)} - ${Math.round(tdee + 400)} kcal/day`;
    } else {
      calorieTarget = `${Math.round(tdee)} kcal/day`;
    }

    const targetCal = goal === "lose" ? tdee - 400 : goal === "gain" ? tdee + 325 : tdee;
    macros = {
      protein: `${Math.round((targetCal * 0.275) / 4)}g (25-30%)`,
      carbs: `${Math.round((targetCal * 0.50) / 4)}g (45-55%)`,
      fat: `${Math.round((targetCal * 0.25) / 9)}g (20-30%)`,
    };
  }

  const resultText = hasInputs
    ? `BMR: ${Math.round(bmr)} kcal | TDEE: ${Math.round(tdee)} kcal | Target: ${calorieTarget}`
    : "";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="BMR & TDEE Calculator - Calculate 360"
        description="Calculate your Basal Metabolic Rate and Total Daily Energy Expenditure using the Mifflin-St Jeor formula. Get personalized calorie and macro recommendations."
        path="/bmr-tdee"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                BMR & TDEE Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Estimate your daily calorie needs based on your body stats and activity level.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Gender</Label>
                  <div className="flex gap-2">
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
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="mb-2 block">Age (years)</Label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={values.age}
                      onChange={(e) => setValue("age", e.target.value)}
                      className="input-field"
                      data-testid="input-age"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Height (cm)</Label>
                    <Input
                      type="number"
                      placeholder="175"
                      value={values.height}
                      onChange={(e) => setValue("height", e.target.value)}
                      className="input-field"
                      data-testid="input-height"
                    />
                  </div>
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
                </div>

                <div>
                  <Label className="mb-2 block">Activity Level</Label>
                  <Select
                    value={values.activity || "1.55"}
                    onValueChange={(v) => setValue("activity", v)}
                  >
                    <SelectTrigger data-testid="select-activity" className="w-full">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Goal</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(["lose", "maintain", "gain"] as const).map((g) => (
                      <Button
                        key={g}
                        variant={goal === g ? "default" : "outline"}
                        onClick={() => setValue("goal", g)}
                        data-testid={`button-goal-${g}`}
                        className="toggle-elevate capitalize"
                      >
                        {g === "lose" ? "Lose Weight" : g === "gain" ? "Gain Weight" : "Maintain"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-display font-bold text-lg mb-4" data-testid="text-results-heading">Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Basal Metabolic Rate (BMR)</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-bmr">
                      {hasInputs ? `${Math.round(bmr)} kcal/day` : "\u2014"}
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Total Daily Energy Expenditure (TDEE)</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-tdee">
                      {hasInputs ? `${Math.round(tdee)} kcal/day` : "\u2014"}
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Suggested Calorie Target</p>
                    <p className="text-2xl font-bold text-primary" data-testid="text-calorie-target">
                      {hasInputs ? calorieTarget : "\u2014"}
                    </p>
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Macro Guidelines</p>
                    {hasInputs ? (
                      <div className="space-y-1 text-sm" data-testid="text-macros">
                        <p><span className="font-medium">Protein:</span> {macros.protein}</p>
                        <p><span className="font-medium">Carbs:</span> {macros.carbs}</p>
                        <p><span className="font-medium">Fat:</span> {macros.fat}</p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-foreground">{"\u2014"}</p>
                    )}
                  </div>
                </div>

                <ShareCopyButtons
                  resultText={resultText}
                  shareParams={{ gender, age: values.age, height: values.height, weight: values.weight, activity: values.activity, goal }}
                  onReset={resetAll}
                  hasResult={!!hasInputs}
                />
              </div>

              <div className="mt-6 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>This calculator is for informational purposes only. Consult a healthcare professional before making significant dietary changes.</p>
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
