import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, LinkIcon, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const activityLevels = [
  { label: "Sedentary", value: 1.2 },
  { label: "Light", value: 1.375 },
  { label: "Moderate", value: 1.55 },
  { label: "Very Active", value: 1.725 },
  { label: "Extra Active", value: 1.9 },
];

export default function BMICalculator() {
  const { toast } = useToast();
  const [isMetric, setIsMetric] = useState(true);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [activityLevel, setActivityLevel] = useState("1.55");
  const [goal, setGoal] = useState("maintain");
  const [decimals, setDecimals] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unit = params.get("unit") || "metric";
    setIsMetric(unit === "metric");
    if (params.get("h")) setHeight(params.get("h") || "");
    if (params.get("w")) setWeight(params.get("w") || "");
    if (params.get("age")) setAge(params.get("age") || "");
    if (params.get("gender")) setGender(params.get("gender") || null);
    if (params.get("activity")) setActivityLevel(params.get("activity") || "1.55");
    if (params.get("goal")) setGoal(params.get("goal") || "maintain");
  }, []);

  const heightCm = useMemo(() => {
    if (isMetric) return parseFloat(height) || 0;
    const feet = parseFloat(heightFeet) || 0;
    const inches = parseFloat(heightInches) || 0;
    return (feet * 12 + inches) * 2.54;
  }, [isMetric, height, heightFeet, heightInches]);

  const weightKg = useMemo(() => {
    if (isMetric) return parseFloat(weight) || 0;
    return (parseFloat(weightLb) || 0) / 2.205;
  }, [isMetric, weight, weightLb]);

  const bmi = useMemo(() => {
    if (heightCm <= 0 || weightKg <= 0) return null;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }, [heightCm, weightKg]);

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: "Underweight", color: "bg-blue-500" };
    if (bmiValue < 25) return { label: "Normal", color: "bg-green-500" };
    if (bmiValue < 30) return { label: "Overweight", color: "bg-yellow-500" };
    return { label: "Obesity", color: "bg-red-500" };
  };

  const calculateCalories = useMemo(() => {
    if (!bmi || !age || !gender || gender === null) return null;
    const ageNum = parseInt(age) || 0;
    if (ageNum < 14) return { error: "For children/teens, BMI and calories need age-specific guidance." };
    
    const actMultiplier = parseFloat(activityLevel);
    let bmr = 0;

    if (gender === "male") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    } else if (gender === "female") {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    }

    const tdee = Math.round(bmr * actMultiplier);
    let target = tdee;
    let targetRange = null;

    if (goal === "lose") {
      targetRange = [tdee - 500, tdee - 300];
    } else if (goal === "gain") {
      targetRange = [tdee + 250, tdee + 400];
    }

    return { bmr, tdee, target, targetRange };
  }, [bmi, age, gender, activityLevel, goal, weightKg, heightCm]);

  const fallbackCalories = useMemo(() => {
    if (!bmi || calculateCalories) return null;
    const bmiVal = bmi;
    const category = getBMICategory(bmiVal);

    if (category.label === "Underweight") {
      return "Consider a small surplus (+250 to +400 kcal/day) unless maintaining.";
    } else if (category.label === "Normal") {
      return "Maintain your current intake; focus on balance.";
    } else {
      return "Consider a modest deficit (−300 to −500 kcal/day).";
    }
  }, [bmi, calculateCalories]);

  const healthyWeightMin = useMemo(() => {
    if (heightCm <= 0) return null;
    const heightM = heightCm / 100;
    return Math.round(18.5 * heightM * heightM * 10) / 10;
  }, [heightCm]);

  const healthyWeightMax = useMemo(() => {
    if (heightCm <= 0) return null;
    const heightM = heightCm / 100;
    return Math.round(24.9 * heightM * heightM * 10) / 10;
  }, [heightCm]);

  const handleReset = () => {
    setHeight("");
    setWeight("");
    setHeightFeet("");
    setHeightInches("");
    setWeightLb("");
    setAge("");
    setGender(null);
    setActivityLevel("1.55");
    setGoal("maintain");
  };

  const copyResult = () => {
    const category = bmi ? getBMICategory(bmi).label : "";
    const text = `BMI: ${bmi ? bmi.toFixed(decimals) : "—"} (${category})`;
    navigator.clipboard.writeText(text);
    toast({ title: "BMI copied" });
  };

  const copySummary = () => {
    const category = bmi ? getBMICategory(bmi).label : "";
    let text = `BMI: ${bmi ? bmi.toFixed(decimals) : "—"} (${category})`;
    if (calculateCalories && !calculateCalories.error) {
      text += `\nSuggested Daily Calories: ${calculateCalories.targetRange ? calculateCalories.targetRange[0] + "-" + calculateCalories.targetRange[1] : calculateCalories.target}`;
    }
    navigator.clipboard.writeText(text);
    toast({ title: "Summary copied" });
  };

  const copyShareLink = () => {
    const params = new URLSearchParams();
    params.set("unit", isMetric ? "metric" : "imperial");
    if (isMetric && height) params.set("h", height);
    if (!isMetric && heightFeet) params.set("h", `${heightFeet}'${heightInches || 0}"`);
    if (isMetric && weight) params.set("w", weight);
    if (!isMetric && weightLb) params.set("w", weightLb);
    if (age) params.set("age", age);
    if (gender) params.set("gender", gender);
    params.set("activity", activityLevel);
    params.set("goal", goal);
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Share link copied" });
  };

  const getBMIPosition = () => {
    if (!bmi) return 0;
    if (bmi < 18.5) return (bmi / 18.5) * 25;
    if (bmi < 25) return 25 + ((bmi - 18.5) / 6.5) * 25;
    if (bmi < 30) return 50 + ((bmi - 25) / 5) * 25;
    return 75 + Math.min((bmi - 30) / 10, 1) * 25;
  };

  const faqs = [
    {
      question: "What is BMI?",
      answer: "BMI (Body Mass Index) is a measure of body fat based on height and weight. It's calculated as weight (kg) divided by height (m) squared."
    },
    {
      question: "What is a healthy BMI range?",
      answer: "A BMI between 18.5 and 24.9 is generally considered normal or healthy. However, BMI doesn't account for muscle mass or other factors."
    },
    {
      question: "Are calorie suggestions accurate?",
      answer: "These are estimates based on standard formulas. Individual needs vary based on metabolism, fitness level, and other factors. Consult a professional for personalized advice."
    },
    {
      question: "Is BMI valid for athletes?",
      answer: "BMI may not be accurate for athletes due to higher muscle mass. Consider other body composition measures if you're very muscular."
    },
    {
      question: "Can children use BMI calculators?",
      answer: "Children and teens need age-specific BMI percentiles, not adult categories. Consult a healthcare provider for children under 14."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />
        
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">BMI Calculator</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calculate your Body Mass Index and get personalized daily calorie intake suggestions.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Body Measurements</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{isMetric ? "Metric" : "Imperial"}</span>
                  <Switch checked={isMetric} onCheckedChange={setIsMetric} />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6">
                  {isMetric ? (
                    <>
                      <div>
                        <Label className="mb-2 block">Height (cm)</Label>
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="170"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Weight (kg)</Label>
                        <Input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="70"
                          className="h-12"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="mb-2 block">Height</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-muted-foreground">Feet</span>
                            <Input
                              type="number"
                              value={heightFeet}
                              onChange={(e) => setHeightFeet(e.target.value)}
                              placeholder="5"
                              className="h-12"
                            />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Inches</span>
                            <Input
                              type="number"
                              value={heightInches}
                              onChange={(e) => setHeightInches(e.target.value)}
                              placeholder="10"
                              className="h-12"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">Weight (lb)</Label>
                        <Input
                          type="number"
                          value={weightLb}
                          onChange={(e) => setWeightLb(e.target.value)}
                          placeholder="154"
                          className="h-12"
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Age (years)</Label>
                      <Input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="30"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Gender</Label>
                      <Select value={gender || ""} onValueChange={setGender}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Activity Level</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {activityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value.toString()}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block">Goal</Label>
                    <div className="flex gap-4">
                      {[
                        { label: "Maintain", value: "maintain" },
                        { label: "Lose Weight", value: "lose" },
                        { label: "Gain Weight", value: "gain" },
                      ].map((g) => (
                        <button
                          key={g.value}
                          onClick={() => setGoal(g.value)}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                            goal === g.value
                              ? "bg-primary text-white shadow-md"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {bmi !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border shadow-sm overflow-hidden bg-card dark:bg-background text-white">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="text-muted-foreground uppercase tracking-widest text-sm font-medium">Your BMI</div>
                      <div className="text-5xl font-bold text-primary">{bmi.toFixed(decimals)}</div>
                      <div className="text-2xl font-medium text-muted-foreground">{getBMICategory(bmi).label}</div>

                      <div className="w-full pt-6 space-y-4">
                        <div className="h-8 bg-muted rounded-full overflow-hidden flex">
                          <div className="w-1/4 bg-blue-500"></div>
                          <div className="w-1/4 bg-green-500"></div>
                          <div className="w-1/4 bg-yellow-500"></div>
                          <div className="w-1/4 bg-red-500"></div>
                        </div>
                        <div className="relative h-2">
                          <div
                            className="absolute w-1 h-8 -top-3 bg-white rounded-full shadow-lg transition-all duration-300"
                            style={{ left: `${getBMIPosition()}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>Underweight</span>
                          <span>Normal</span>
                          <span>Overweight</span>
                          <span>Obesity</span>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground pt-4">
                        {isMetric
                          ? `BMI = ${weightKg.toFixed(1)} / (${(heightCm / 100).toFixed(2)})`
                          : `BMI = 703 × ${weightLb} / ${(parseFloat(heightFeet) * 12 + parseFloat(heightInches) || 0)}`}
                        ² = {bmi.toFixed(2)}
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
              </motion.div>
            )}

            {bmi !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border shadow-sm">
                  <CardHeader className="bg-muted border-b">
                    <CardTitle className="text-lg">Suggested Daily Calorie Intake</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {calculateCalories && !calculateCalories.error ? (
                      <>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Maintenance Calories (TDEE)</div>
                          <div className="text-3xl font-bold text-foreground">{calculateCalories.tdee} kcal/day</div>
                        </div>
                        {calculateCalories.targetRange ? (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Suggested Target</div>
                            <div className="text-2xl font-bold text-foreground">
                              {calculateCalories.targetRange[0]} – {calculateCalories.targetRange[1]} kcal/day
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Suggested Target</div>
                            <div className="text-2xl font-bold text-foreground">{calculateCalories.target} kcal/day</div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Estimates based on: height, weight, age, gender, activity level
                        </div>
                      </>
                    ) : age && gender ? (
                      <>
                        <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-sm text-red-800">
                          {calculateCalories?.error}
                        </div>
                        <div className="text-xs text-muted-foreground pt-2">
                          Consult a healthcare provider for age-specific guidance.
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-foreground leading-relaxed">
                          {fallbackCalories}
                        </div>
                        <div className="text-xs text-muted-foreground pt-2">
                          Provide age and gender for a more accurate estimate.
                        </div>
                      </>
                    )}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-xs text-blue-800">
                      <strong>Disclaimer:</strong> Estimates only. Individual needs vary based on metabolism, fitness level, and other factors. Consult a healthcare professional for personalized advice.
                    </div>
                    <Button onClick={copySummary} variant="secondary" className="w-full gap-2">
                      <Copy className="h-4 w-4" /> Copy Calorie Summary
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {healthyWeightMin && healthyWeightMax && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border shadow-sm">
                  <CardHeader className="bg-muted border-b">
                    <CardTitle className="text-lg">Healthy Weight Range</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">For your height ({isMetric ? `${heightCm} cm` : `${heightFeet}'${heightInches}"`}):</div>
                      <div className="text-2xl font-bold text-foreground">
                        {healthyWeightMin} – {healthyWeightMax} {isMetric ? "kg" : "lb"}
                      </div>
                      <div className="text-xs text-muted-foreground">Based on BMI 18.5–24.9 (normal weight range)</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted border-b">
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>BMI Decimals</Label>
                  <div className="flex gap-2">
                    {[1, 2].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDecimals(d)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                          decimals === d
                            ? "bg-primary text-white shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <AdSlot position="sidebar" />
          </div>
        </div>
      </main>

      <section className="max-w-5xl mx-auto w-full px-4 py-8">
        <FAQSection title="BMI & Nutrition FAQ" items={faqs} />
      </section>

      <Footer />
    </div>
  );
}
