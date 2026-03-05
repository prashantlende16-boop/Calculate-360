import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { RememberInputs } from "@/components/RememberInputs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { copyToClipboard } from "@/lib/calculatorUtils";
import { getRememberPref, setRememberPref } from "@/lib/calculatorUtils";
import { useToast } from "@/hooks/use-toast";
import { Copy, Shuffle, AlertTriangle } from "lucide-react";

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Emma", "Oliver", "Ava", "Liam",
  "Sophia", "Noah", "Isabella", "Ethan", "Mia", "Lucas", "Charlotte", "Mason",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePassword(length: number, uppercase: boolean, lowercase: boolean, numbers: boolean, symbols: boolean): string {
  let chars = "";
  if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
  if (numbers) chars += "0123456789";
  if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

function getPasswordStrength(length: number, types: number): { label: string; color: string } {
  const score = (length >= 16 ? 2 : length >= 12 ? 1 : 0) + (types >= 4 ? 2 : types >= 3 ? 1 : 0);
  if (score >= 4) return { label: "Very Strong", color: "bg-green-500" };
  if (score >= 3) return { label: "Strong", color: "bg-green-400" };
  if (score >= 2) return { label: "Medium", color: "bg-yellow-500" };
  return { label: "Weak", color: "bg-red-500" };
}

export default function RandomDataGenerator() {
  const { toast } = useToast();
  const [remember, setRememberState] = useState(() => getRememberPref("random-data"));

  const setRemember = (val: boolean) => {
    setRememberPref("random-data", val);
    setRememberState(val);
  };

  const [nameCount, setNameCount] = useState("5");
  const [nameOutput, setNameOutput] = useState("");

  const [emailCount, setEmailCount] = useState("5");
  const [emailOutput, setEmailOutput] = useState("");

  const [pwLength, setPwLength] = useState(16);
  const [pwUpper, setPwUpper] = useState(true);
  const [pwLower, setPwLower] = useState(true);
  const [pwNumbers, setPwNumbers] = useState(true);
  const [pwSymbols, setPwSymbols] = useState(false);
  const [pwOutput, setPwOutput] = useState("");

  const [uuidCount, setUuidCount] = useState("5");
  const [uuidOutput, setUuidOutput] = useState("");

  const [numMin, setNumMin] = useState("1");
  const [numMax, setNumMax] = useState("100");
  const [numCount, setNumCount] = useState("5");
  const [numOutput, setNumOutput] = useState("");

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    toast({ title: "Copied to clipboard" });
  };

  const generateNames = () => {
    const n = Math.min(Math.max(parseInt(nameCount) || 1, 1), 1000);
    const names = Array.from({ length: n }, () => `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`);
    setNameOutput(names.join("\n"));
  };

  const generateEmails = () => {
    const n = Math.min(Math.max(parseInt(emailCount) || 1, 1), 1000);
    const emails = Array.from({ length: n }, () => {
      const first = randomItem(FIRST_NAMES).toLowerCase();
      const last = randomItem(LAST_NAMES).toLowerCase();
      const num = Math.floor(Math.random() * 999);
      return `${first}.${last}${num}@example.com`;
    });
    setEmailOutput(emails.join("\n"));
  };

  const generatePw = () => {
    const pw = generatePassword(pwLength, pwUpper, pwLower, pwNumbers, pwSymbols);
    setPwOutput(pw);
  };

  const pwTypes = [pwUpper, pwLower, pwNumbers, pwSymbols].filter(Boolean).length;
  const pwStrength = getPasswordStrength(pwLength, pwTypes);

  const generateUuids = () => {
    const n = Math.min(Math.max(parseInt(uuidCount) || 1, 1), 1000);
    const uuids = Array.from({ length: n }, () => crypto.randomUUID());
    setUuidOutput(uuids.join("\n"));
  };

  const generateNumbers = () => {
    const min = parseInt(numMin) || 0;
    const max = parseInt(numMax) || 100;
    const count = Math.min(Math.max(parseInt(numCount) || 1, 1), 1000);
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const nums = Array.from({ length: count }, () => Math.floor(Math.random() * (hi - lo + 1)) + lo);
    setNumOutput(nums.join("\n"));
  };

  const faqs = [
    {
      question: "Are the generated passwords secure?",
      answer: "The passwords are generated using Math.random() which is not cryptographically secure. For real-world security-critical passwords, use a dedicated password manager. This tool is best for generating test data or temporary passwords."
    },
    {
      question: "Are UUIDs generated here truly unique?",
      answer: "Yes, UUIDs are generated using crypto.randomUUID() which produces cryptographically random UUIDs (version 4). The probability of collision is astronomically low."
    },
    {
      question: "Can I use the generated data in production?",
      answer: "This tool is designed for testing purposes. The generated names and emails are fictional. Do not use them as real personal data. Emails use the @example.com domain which is reserved for documentation and testing."
    },
    {
      question: "Is there a limit to how many items I can generate?",
      answer: "You can generate up to 1,000 items at a time. This limit prevents browser performance issues while still providing plenty of test data."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Random Data Generator - Names, Emails, Passwords, UUIDs | Calculate 360"
        description="Generate random names, emails, passwords, UUIDs, and numbers for testing. Free online tool with copy functionality."
        path="/random-data"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">

        <div className="space-y-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Random Data Generator
              </h1>
              <p className="text-lg text-muted-foreground">
                Generate random names, emails, passwords, UUIDs, and numbers for testing.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4 text-sm text-amber-700 bg-amber-50 rounded-lg p-3 border border-amber-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>For testing purposes only. Do not use for real personal data.</span>
              </div>

              <Tabs defaultValue="names" className="w-full">
                <TabsList className="w-full grid grid-cols-3 md:grid-cols-5 h-auto p-1 bg-muted/50 rounded-xl gap-1">
                  <TabsTrigger value="names" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-names">Names</TabsTrigger>
                  <TabsTrigger value="emails" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-emails">Emails</TabsTrigger>
                  <TabsTrigger value="passwords" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-passwords">Passwords</TabsTrigger>
                  <TabsTrigger value="uuids" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-uuids">UUIDs</TabsTrigger>
                  <TabsTrigger value="numbers" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-numbers">Numbers</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="names" className="mt-0 space-y-4">
                    <div className="flex items-end gap-4 flex-wrap">
                      <div className="w-32">
                        <Label className="mb-2 block">Count</Label>
                        <Input type="number" min="1" max="1000" value={nameCount} onChange={(e) => setNameCount(e.target.value)} className="input-field" data-testid="input-name-count" />
                      </div>
                      <Button onClick={generateNames} className="gap-2" data-testid="button-generate-names">
                        <Shuffle className="w-4 h-4" /> Generate
                      </Button>
                    </div>
                    <OutputArea value={nameOutput} onCopy={handleCopy} testId="output-names" copyTestId="button-copy-names" />
                  </TabsContent>

                  <TabsContent value="emails" className="mt-0 space-y-4">
                    <div className="flex items-end gap-4 flex-wrap">
                      <div className="w-32">
                        <Label className="mb-2 block">Count</Label>
                        <Input type="number" min="1" max="1000" value={emailCount} onChange={(e) => setEmailCount(e.target.value)} className="input-field" data-testid="input-email-count" />
                      </div>
                      <Button onClick={generateEmails} className="gap-2" data-testid="button-generate-emails">
                        <Shuffle className="w-4 h-4" /> Generate
                      </Button>
                    </div>
                    <OutputArea value={emailOutput} onCopy={handleCopy} testId="output-emails" copyTestId="button-copy-emails" />
                  </TabsContent>

                  <TabsContent value="passwords" className="mt-0 space-y-4">
                    <div>
                      <Label className="mb-2 block">Length: {pwLength}</Label>
                      <Slider
                        value={[pwLength]}
                        onValueChange={(v) => setPwLength(v[0])}
                        min={8}
                        max={64}
                        step={1}
                        className="my-4"
                        data-testid="slider-pw-length"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={pwUpper} onCheckedChange={(c) => setPwUpper(!!c)} data-testid="checkbox-uppercase" />
                        Uppercase (A-Z)
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={pwLower} onCheckedChange={(c) => setPwLower(!!c)} data-testid="checkbox-lowercase" />
                        Lowercase (a-z)
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={pwNumbers} onCheckedChange={(c) => setPwNumbers(!!c)} data-testid="checkbox-numbers" />
                        Numbers (0-9)
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={pwSymbols} onCheckedChange={(c) => setPwSymbols(!!c)} data-testid="checkbox-symbols" />
                        Symbols (!@#...)
                      </label>
                    </div>
                    <Button onClick={generatePw} className="gap-2" data-testid="button-generate-password">
                      <Shuffle className="w-4 h-4" /> Generate Password
                    </Button>
                    {pwOutput && (
                      <div className="space-y-3">
                        <div className="bg-muted rounded-xl p-4 border border-border font-mono text-sm break-all" data-testid="output-password">
                          {pwOutput}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Strength:</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pwStrength.color}`}
                              style={{ width: pwStrength.label === "Weak" ? "25%" : pwStrength.label === "Medium" ? "50%" : pwStrength.label === "Strong" ? "75%" : "100%" }}
                              data-testid="pw-strength-bar"
                            />
                          </div>
                          <span className="text-sm font-medium" data-testid="text-pw-strength">{pwStrength.label}</span>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleCopy(pwOutput)} data-testid="button-copy-password">
                          <Copy className="w-4 h-4" /> Copy
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="uuids" className="mt-0 space-y-4">
                    <div className="flex items-end gap-4 flex-wrap">
                      <div className="w-32">
                        <Label className="mb-2 block">Count</Label>
                        <Input type="number" min="1" max="1000" value={uuidCount} onChange={(e) => setUuidCount(e.target.value)} className="input-field" data-testid="input-uuid-count" />
                      </div>
                      <Button onClick={generateUuids} className="gap-2" data-testid="button-generate-uuids">
                        <Shuffle className="w-4 h-4" /> Generate
                      </Button>
                    </div>
                    <OutputArea value={uuidOutput} onCopy={handleCopy} testId="output-uuids" copyTestId="button-copy-uuids" />
                  </TabsContent>

                  <TabsContent value="numbers" className="mt-0 space-y-4">
                    <div className="flex items-end gap-4 flex-wrap">
                      <div className="w-24">
                        <Label className="mb-2 block">Min</Label>
                        <Input type="number" value={numMin} onChange={(e) => setNumMin(e.target.value)} className="input-field" data-testid="input-num-min" />
                      </div>
                      <div className="w-24">
                        <Label className="mb-2 block">Max</Label>
                        <Input type="number" value={numMax} onChange={(e) => setNumMax(e.target.value)} className="input-field" data-testid="input-num-max" />
                      </div>
                      <div className="w-24">
                        <Label className="mb-2 block">Count</Label>
                        <Input type="number" min="1" max="1000" value={numCount} onChange={(e) => setNumCount(e.target.value)} className="input-field" data-testid="input-num-count" />
                      </div>
                      <Button onClick={generateNumbers} className="gap-2" data-testid="button-generate-numbers">
                        <Shuffle className="w-4 h-4" /> Generate
                      </Button>
                    </div>
                    <OutputArea value={numOutput} onCopy={handleCopy} testId="output-numbers" copyTestId="button-copy-numbers" />
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
          </aside>
        </div>

      </main>

      <Footer />
    </div>
  );
}

function OutputArea({ value, onCopy, testId, copyTestId }: { value: string; onCopy: (text: string) => void; testId: string; copyTestId: string }) {
  if (!value) return null;
  return (
    <div className="space-y-2">
      <Textarea value={value} readOnly className="min-h-[120px] resize-y bg-muted font-mono text-sm" data-testid={testId} />
      <Button variant="outline" size="sm" className="gap-2" onClick={() => onCopy(value)} data-testid={copyTestId}>
        <Copy className="w-4 h-4" /> Copy All
      </Button>
    </div>
  );
}
