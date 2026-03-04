import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { ShareCopyButtons } from "@/components/ShareCopyButtons";
import { RememberInputs } from "@/components/RememberInputs";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Clock } from "lucide-react";

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;
const CYCLES = [4, 5, 6];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function subtractMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60000);
}

function parseTimeString(timeStr: string): Date | null {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}

function getCurrentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

const faqs = [
  {
    question: "What is a sleep cycle?",
    answer: "A sleep cycle is a complete sequence of sleep stages (light sleep, deep sleep, and REM sleep) that lasts approximately 90 minutes. Most adults go through 4-6 cycles per night. Waking up at the end of a cycle tends to leave you feeling more refreshed.",
  },
  {
    question: "Why does the calculator add 15 minutes?",
    answer: "On average, it takes about 15 minutes for a person to fall asleep after lying down. This buffer ensures the sleep cycles are calculated from the time you actually fall asleep, not from when you get into bed.",
  },
  {
    question: "How many sleep cycles do I need?",
    answer: "Most adults need 5-6 sleep cycles (7.5 to 9 hours) per night for optimal health. Four cycles (6 hours) is the minimum for basic functioning but is not recommended long-term. Five to six cycles are highlighted as recommended.",
  },
  {
    question: "Why do I feel groggy even after 8 hours of sleep?",
    answer: "Grogginess often occurs when you wake up in the middle of a deep sleep phase. By timing your alarm to coincide with the end of a complete 90-minute cycle, you're more likely to wake during lighter sleep and feel refreshed.",
  },
  {
    question: "Does this calculator account for individual differences?",
    answer: "Sleep cycles average 90 minutes but can range from 80-120 minutes depending on the individual. This calculator uses the 90-minute average as a general guideline. If you consistently feel groggy, try adjusting your wake time by 10-15 minutes.",
  },
];

export default function SleepCyclePlanner() {
  const { values, setValue, resetAll, remember, setRemember } = useCalculatorState(
    "sleep-cycle",
    ["mode", "wakeTime"],
    { mode: "wake", wakeTime: "07:00" }
  );

  const [sleepNowTime, setSleepNowTime] = useState(getCurrentTimeString);
  const mode = values.mode || "wake";

  const results = useMemo(() => {
    if (mode === "wake") {
      const wakeDate = parseTimeString(values.wakeTime);
      if (!wakeDate) return [];
      return CYCLES.map((cycles) => {
        const totalMinutes = cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
        const bedtime = subtractMinutes(wakeDate, totalMinutes);
        return {
          cycles,
          time: formatTime(bedtime),
          hours: (cycles * CYCLE_MINUTES) / 60,
          recommended: cycles >= 5,
        };
      });
    } else {
      const nowDate = parseTimeString(sleepNowTime);
      if (!nowDate) return [];
      const fallAsleepTime = addMinutes(nowDate, FALL_ASLEEP_MINUTES);
      return CYCLES.map((cycles) => {
        const totalMinutes = cycles * CYCLE_MINUTES;
        const wakeTime = addMinutes(fallAsleepTime, totalMinutes);
        return {
          cycles,
          time: formatTime(wakeTime),
          hours: (cycles * CYCLE_MINUTES) / 60,
          recommended: cycles >= 5,
        };
      });
    }
  }, [mode, values.wakeTime, sleepNowTime]);

  const handleSleepNow = () => {
    setSleepNowTime(getCurrentTimeString());
  };

  const resultText = results.length > 0
    ? results.map((r) => `${r.cycles} cycles (${r.hours}h): ${r.time}`).join(" | ")
    : "";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Sleep Cycle Planner - Calculate 360"
        description="Plan your sleep schedule using 90-minute sleep cycles. Find the best bedtime or wake time for more restful sleep."
        path="/sleep-cycle"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Sleep Cycle Planner
              </h1>
              <p className="text-lg text-muted-foreground">
                Time your sleep to wake up at the end of a cycle and feel more refreshed.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Mode</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={mode === "wake" ? "default" : "outline"}
                      onClick={() => setValue("mode", "wake")}
                      data-testid="button-mode-wake"
                      className="toggle-elevate gap-2"
                    >
                      <Sun className="w-4 h-4" />
                      I want to wake up at...
                    </Button>
                    <Button
                      variant={mode === "sleep" ? "default" : "outline"}
                      onClick={() => {
                        setValue("mode", "sleep");
                        handleSleepNow();
                      }}
                      data-testid="button-mode-sleep"
                      className="toggle-elevate gap-2"
                    >
                      <Moon className="w-4 h-4" />
                      I want to sleep now
                    </Button>
                  </div>
                </div>

                {mode === "wake" ? (
                  <div>
                    <Label className="mb-2 block">Wake-up Time</Label>
                    <input
                      type="time"
                      value={values.wakeTime || "07:00"}
                      onChange={(e) => setValue("wakeTime", e.target.value)}
                      className="flex h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      data-testid="input-wake-time"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div>
                      <Label className="mb-2 block">Current Time</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg border border-border">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-lg font-medium" data-testid="text-current-time">{sleepNowTime}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleSleepNow} data-testid="button-refresh-time">
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-display font-bold text-lg mb-4" data-testid="text-results-heading">
                  {mode === "wake" ? "Recommended Bedtimes" : "Recommended Wake Times"}
                </h3>

                <div className="space-y-3">
                  {results.map((r) => (
                    <div
                      key={r.cycles}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        r.recommended
                          ? "bg-primary/5 border-primary/20"
                          : "bg-white border-border"
                      }`}
                      data-testid={`result-cycle-${r.cycles}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          r.recommended ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          <span className="font-bold text-sm">{r.cycles}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {r.cycles} cycles ({r.hours} hours)
                          </p>
                          {r.recommended && (
                            <span className="text-xs text-primary font-medium">Recommended</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-foreground" data-testid={`text-time-${r.cycles}`}>
                        {r.time}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Includes a 15-minute buffer to fall asleep. Each cycle is approximately 90 minutes.
                </p>

                <ShareCopyButtons
                  resultText={resultText}
                  shareParams={{ mode, wakeTime: values.wakeTime }}
                  onReset={resetAll}
                  hasResult={results.length > 0}
                />
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
