import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalculatorResult } from "@/components/CalculatorResult";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { 
  differenceInYears, 
  differenceInMonths, 
  differenceInDays, 
  addYears, 
  isValid, 
  parseISO, 
  format,
  nextDay,
  isAfter,
  differenceInWeeks
} from "date-fns";
import { Cake, CalendarDays, Users } from "lucide-react";

export default function AgeCalculator() {
  
  // Tab 1: Exact Age
  const [dob, setDob] = useState("");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  
  let ageResult = null;
  let ageDetails = null;

  if (dob && asOfDate) {
    const start = parseISO(dob);
    const end = parseISO(asOfDate);
    
    if (isValid(start) && isValid(end) && !isAfter(start, end)) {
      const years = differenceInYears(end, start);
      const months = differenceInMonths(end, start) % 12;
      // Approximate days for remainder
      const tempDate = new Date(start);
      tempDate.setFullYear(start.getFullYear() + years);
      tempDate.setMonth(start.getMonth() + months);
      const days = differenceInDays(end, tempDate);
      
      ageResult = `${years} years, ${months} months, ${days} days`;

      const totalDays = differenceInDays(end, start);
      ageDetails = (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 w-full max-w-2xl mx-auto">
          <div className="bg-muted p-4 rounded-xl text-center border border-border">
            <div className="text-2xl font-bold text-foreground">{years}</div>
            <div className="text-xs text-muted-foreground uppercase">Years</div>
          </div>
          <div className="bg-muted p-4 rounded-xl text-center border border-border">
            <div className="text-2xl font-bold text-foreground">{differenceInMonths(end, start)}</div>
            <div className="text-xs text-muted-foreground uppercase">Months</div>
          </div>
          <div className="bg-muted p-4 rounded-xl text-center border border-border">
             <div className="text-2xl font-bold text-foreground">{differenceInWeeks(end, start)}</div>
             <div className="text-xs text-muted-foreground uppercase">Weeks</div>
          </div>
          <div className="bg-muted p-4 rounded-xl text-center border border-border">
            <div className="text-2xl font-bold text-foreground">{totalDays.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground uppercase">Days</div>
          </div>
        </div>
      );
    } else if (isAfter(start, end)) {
        ageResult = "Date of birth cannot be in the future relative to 'As of' date.";
    }
  }

  // Tab 2: Next Birthday
  const [nbDob, setNbDob] = useState("");
  let nextBirthdayResult = null;
  let nextBirthdaySubtext = "";
  
  if (nbDob) {
    const birthDate = parseISO(nbDob);
    const today = new Date();
    if (isValid(birthDate)) {
      let nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (isAfter(today, nextBday)) {
        nextBday = addYears(nextBday, 1);
      }
      const daysLeft = differenceInDays(nextBday, today);
      const weekday = format(nextBday, 'EEEE');
      
      nextBirthdayResult = `${daysLeft} Days`;
      nextBirthdaySubtext = `Your next birthday will be on a ${weekday}`;
    }
  }

  // Tab 3: Age Difference
  const [p1Dob, setP1Dob] = useState("");
  const [p2Dob, setP2Dob] = useState("");
  let diffResult = null;
  let diffSubtext = "";

  if (p1Dob && p2Dob) {
    const d1 = parseISO(p1Dob);
    const d2 = parseISO(p2Dob);
    if (isValid(d1) && isValid(d2)) {
      const isP1Older = isAfter(d2, d1); // d1 is before d2
      const older = isP1Older ? d1 : d2;
      const younger = isP1Older ? d2 : d1;
      
      const years = differenceInYears(younger, older);
      const months = differenceInMonths(younger, older) % 12;
      const tempDate = new Date(older);
      tempDate.setFullYear(older.getFullYear() + years);
      tempDate.setMonth(older.getMonth() + months);
      const days = differenceInDays(younger, tempDate);

      diffResult = `${years}y ${months}m ${days}d`;
      diffSubtext = isP1Older ? "Person 1 is older" : "Person 2 is older";
    }
  }

  const faqs = [
    {
      question: "How is age calculated?",
      answer: "Age is calculated by counting the number of full years, months, and days between the date of birth and the current date."
    },
    {
      question: "Does this calculator account for leap years?",
      answer: "Yes, our algorithm correctly accounts for leap years when calculating the exact number of days."
    },
    {
      question: "Can I calculate age for a future date?",
      answer: "Yes, simply change the 'Age at the Date of' field to any future date to see how old you will be then."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Age Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Calculate your exact age, find out when your next birthday is, or compare ages between two people.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-1">
              <Tabs defaultValue="exact" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl gap-1">
                  <TabsTrigger value="exact" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 justify-center">
                    <Cake className="w-4 h-4 hidden sm:block" /> Exact Age
                  </TabsTrigger>
                  <TabsTrigger value="next" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 justify-center">
                    <CalendarDays className="w-4 h-4 hidden sm:block" /> Next Birthday
                  </TabsTrigger>
                  <TabsTrigger value="diff" className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 justify-center">
                    <Users className="w-4 h-4 hidden sm:block" /> Age Diff
                  </TabsTrigger>
                </TabsList>

                <div className="p-6 md:p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Exact Age Tab */}
                    <TabsContent value="exact" className="mt-0 space-y-8">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="mb-2 block">Date of Birth</Label>
                          <Input 
                            type="date" 
                            value={dob} 
                            onChange={(e) => setDob(e.target.value)} 
                            className="input-field"
                          />
                        </div>
                        <div>
                          <Label className="mb-2 block">Age at the Date of</Label>
                          <Input 
                            type="date" 
                            value={asOfDate} 
                            onChange={(e) => setAsOfDate(e.target.value)} 
                            className="input-field"
                          />
                        </div>
                      </div>

                      <CalculatorResult 
                        label="Your Age" 
                        value={ageResult || ""} 
                        isError={ageResult?.includes("cannot be")}
                        onReset={() => { setDob(""); setAsOfDate(new Date().toISOString().split('T')[0]); }}
                      />
                      
                      {ageResult && !ageResult.includes("cannot be") && ageDetails}
                    </TabsContent>

                    {/* Next Birthday Tab */}
                    <TabsContent value="next" className="mt-0 space-y-8">
                      <div className="max-w-md mx-auto">
                        <Label className="mb-2 block">Date of Birth</Label>
                        <Input 
                          type="date" 
                          value={nbDob} 
                          onChange={(e) => setNbDob(e.target.value)} 
                          className="input-field"
                        />
                      </div>
                      <CalculatorResult 
                        label="Time Remaining" 
                        value={nextBirthdayResult || ""} 
                        subtext={nextBirthdaySubtext}
                        onReset={() => setNbDob("")}
                      />
                    </TabsContent>

                    {/* Age Difference Tab */}
                    <TabsContent value="diff" className="mt-0 space-y-8">
                       <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="mb-2 block">Person 1 DOB</Label>
                          <Input 
                            type="date" 
                            value={p1Dob} 
                            onChange={(e) => setP1Dob(e.target.value)} 
                            className="input-field"
                          />
                        </div>
                        <div>
                          <Label className="mb-2 block">Person 2 DOB</Label>
                          <Input 
                            type="date" 
                            value={p2Dob} 
                            onChange={(e) => setP2Dob(e.target.value)} 
                            className="input-field"
                          />
                        </div>
                      </div>
                      <CalculatorResult 
                        label="Age Difference" 
                        value={diffResult || ""} 
                        subtext={diffSubtext}
                        onReset={() => { setP1Dob(""); setP2Dob(""); }}
                      />
                    </TabsContent>
                  </motion.div>
                </div>
              </Tabs>
            </div>

            <FAQSection title="Age & Birthdays FAQ" items={faqs} />
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
