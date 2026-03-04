import { useState, useEffect, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { RememberInputs } from "@/components/RememberInputs";
import { Textarea } from "@/components/ui/textarea";
import { getRememberPref, setRememberPref, saveToLocalStorage, loadFromLocalStorage } from "@/lib/calculatorUtils";
import { FileText, Type, AlignLeft, Clock, BookOpen } from "lucide-react";

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 2) return 1;
  let count = 0;
  let prevVowel = false;
  const vowels = "aeiouy";
  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i]);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith("e") && count > 1) count--;
  return Math.max(count, 1);
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const [remember, setRememberState] = useState(() => getRememberPref("word-counter"));

  useEffect(() => {
    if (remember) {
      const saved = loadFromLocalStorage("word-counter");
      if (saved?.text) setText(saved.text);
    }
  }, []);

  useEffect(() => {
    if (remember) {
      saveToLocalStorage("word-counter", { text });
    }
  }, [text, remember]);

  const setRemember = (val: boolean) => {
    setRememberPref("word-counter", val);
    setRememberState(val);
  };

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const readingTime = words > 0 ? Math.ceil(words / 200) : 0;

    let fleschScore: number | null = null;
    let gradeLevel: string = "—";

    if (words > 0 && sentences > 0) {
      const wordList = text.trim().split(/\s+/);
      const totalSyllables = wordList.reduce((sum, w) => sum + countSyllables(w), 0);
      fleschScore = 206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words);
      fleschScore = Math.round(fleschScore * 10) / 10;

      if (fleschScore >= 90) gradeLevel = "5th grade (Very Easy)";
      else if (fleschScore >= 80) gradeLevel = "6th grade (Easy)";
      else if (fleschScore >= 70) gradeLevel = "7th grade (Fairly Easy)";
      else if (fleschScore >= 60) gradeLevel = "8th-9th grade (Standard)";
      else if (fleschScore >= 50) gradeLevel = "10th-12th grade (Fairly Difficult)";
      else if (fleschScore >= 30) gradeLevel = "College (Difficult)";
      else gradeLevel = "College Graduate (Very Difficult)";
    }

    return { chars, charsNoSpaces, words, sentences, paragraphs, readingTime, fleschScore, gradeLevel };
  }, [text]);

  const faqs = [
    {
      question: "How is reading time calculated?",
      answer: "Reading time is estimated based on an average reading speed of 200 words per minute. The total word count is divided by 200 and rounded up to the nearest minute."
    },
    {
      question: "What is the Flesch Reading Ease score?",
      answer: "The Flesch Reading Ease score rates text on a 100-point scale. Higher scores indicate easier-to-read text. The formula considers average sentence length and average number of syllables per word."
    },
    {
      question: "How are syllables counted?",
      answer: "Syllables are counted using a simple vowel-group method: consecutive vowels (a, e, i, o, u, y) are counted as one syllable. A silent 'e' at the end of a word is subtracted if the word has more than one syllable. This is an approximation and may not be 100% accurate for all words."
    },
    {
      question: "What counts as a sentence?",
      answer: "A sentence is detected by splitting the text on period (.), exclamation mark (!), or question mark (?) characters. Multiple consecutive punctuation marks are treated as a single sentence boundary."
    },
    {
      question: "What counts as a paragraph?",
      answer: "A paragraph is defined as a block of text separated by one or more blank lines. Single line breaks within text are not treated as paragraph separators."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Word & Character Counter with Readability Analysis | Calculate 360"
        description="Free online word counter, character counter, and readability analyzer. Get instant stats including Flesch Reading Ease score, grade level, and reading time."
        path="/word-counter"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Word & Character Counter
              </h1>
              <p className="text-lg text-muted-foreground">
                Analyze your text with live word count, character count, readability score, and reading time estimate.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <Textarea
                placeholder="Paste or type your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] text-base resize-y"
                data-testid="textarea-input"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <StatCard icon={<Type className="w-4 h-4" />} label="Characters" value={stats.chars} testId="stat-characters" />
                <StatCard icon={<Type className="w-4 h-4" />} label="Chars (no spaces)" value={stats.charsNoSpaces} testId="stat-chars-no-spaces" />
                <StatCard icon={<FileText className="w-4 h-4" />} label="Words" value={stats.words} testId="stat-words" />
                <StatCard icon={<AlignLeft className="w-4 h-4" />} label="Sentences" value={stats.sentences} testId="stat-sentences" />
                <StatCard icon={<AlignLeft className="w-4 h-4" />} label="Paragraphs" value={stats.paragraphs} testId="stat-paragraphs" />
                <StatCard icon={<Clock className="w-4 h-4" />} label="Reading Time" value={stats.readingTime > 0 ? `${stats.readingTime} min` : "—"} testId="stat-reading-time" />
              </div>

              <div className="mt-6 p-4 bg-muted rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-bold text-sm">Readability Analysis</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Flesch Reading Ease</span>
                    <span className="text-2xl font-bold text-foreground" data-testid="stat-flesch-score">
                      {stats.fleschScore !== null ? stats.fleschScore : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Grade Level</span>
                    <span className="text-sm font-medium text-foreground" data-testid="stat-grade-level">
                      {stats.gradeLevel}
                    </span>
                  </div>
                </div>
              </div>

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

function StatCard({ icon, label, value, testId }: { icon: React.ReactNode; label: string; value: string | number; testId: string }) {
  return (
    <div className="bg-muted rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-xl font-bold text-foreground" data-testid={testId}>{value}</span>
    </div>
  );
}
