import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { copyToClipboard } from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Copy, Clock, Search } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  timezone: string;
}

function getTimezones(): string[] {
  try {
    return (Intl as any).supportedValuesOf("timeZone");
  } catch {
    return [
      "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
      "America/Anchorage", "Pacific/Honolulu", "America/Toronto", "America/Vancouver",
      "America/Mexico_City", "America/Sao_Paulo", "America/Argentina/Buenos_Aires",
      "America/Bogota", "America/Lima", "Europe/London", "Europe/Paris", "Europe/Berlin",
      "Europe/Madrid", "Europe/Rome", "Europe/Amsterdam", "Europe/Brussels",
      "Europe/Zurich", "Europe/Vienna", "Europe/Stockholm", "Europe/Oslo",
      "Europe/Warsaw", "Europe/Prague", "Europe/Budapest", "Europe/Bucharest",
      "Europe/Athens", "Europe/Helsinki", "Europe/Istanbul", "Europe/Moscow",
      "Africa/Cairo", "Africa/Lagos", "Africa/Johannesburg", "Africa/Nairobi",
      "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok",
      "Asia/Singapore", "Asia/Hong_Kong", "Asia/Shanghai", "Asia/Tokyo",
      "Asia/Seoul", "Asia/Taipei", "Asia/Jakarta", "Australia/Sydney",
      "Australia/Melbourne", "Australia/Perth", "Pacific/Auckland",
    ];
  }
}

const ALL_TIMEZONES = getTimezones();

function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "America/New_York";
  }
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${suffix}`;
}

function getLocalTimeForTimezone(date: Date, hour: number, minute: number, sourceTz: string, targetTz: string): { hour: number; minute: number; formatted: string; nextDay: boolean; prevDay: boolean } {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);

  const sourceFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: sourceTz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const sourceParts = sourceFormatter.formatToParts(d);
  const getVal = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find(p => p.type === type)?.value || "0";

  const sourceDate = new Date(
    parseInt(getVal(sourceParts, "year")),
    parseInt(getVal(sourceParts, "month")) - 1,
    parseInt(getVal(sourceParts, "day")),
    parseInt(getVal(sourceParts, "hour")),
    parseInt(getVal(sourceParts, "minute")),
    parseInt(getVal(sourceParts, "second"))
  );

  const targetFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: targetTz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });

  const actualFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: sourceTz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  });

  const sourceOffset = getTimezoneOffsetMinutes(d, sourceTz);
  const targetOffset = getTimezoneOffsetMinutes(d, targetTz);
  const diffMinutes = targetOffset - sourceOffset;

  const targetTime = new Date(sourceDate.getTime() + diffMinutes * 60000);

  const targetHour = targetTime.getHours();
  const targetMinute = targetTime.getMinutes();

  const sourceDay = sourceDate.getDate();
  const targetDay = targetTime.getDate();

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: targetTz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const formatted = timeFormatter.format(d);

  return {
    hour: targetHour,
    minute: targetMinute,
    formatted,
    nextDay: targetDay > sourceDay,
    prevDay: targetDay < sourceDay,
  };
}

function getTimezoneOffsetMinutes(date: Date, tz: string): number {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: tz });
  const utcDate = new Date(utcStr);
  const tzDate = new Date(tzStr);
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

function TimezoneSelect({ value, onChange, testId }: { value: string; onChange: (tz: string) => void; testId: string }) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return ALL_TIMEZONES;
    const lower = search.toLowerCase();
    return ALL_TIMEZONES.filter(tz => tz.toLowerCase().includes(lower));
  }, [search]);

  return (
    <div className="relative" data-testid={testId}>
      <div
        className="flex items-center border border-input rounded-md bg-background cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="w-4 h-4 text-muted-foreground ml-3 shrink-0" />
        <input
          type="text"
          className="w-full px-2 py-2 text-sm bg-transparent outline-none"
          placeholder="Search timezone..."
          value={isOpen ? search : value.replace(/_/g, " ")}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setSearch(""); }}
          data-testid={`${testId}-input`}
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No timezones found</div>
          ) : (
            filtered.slice(0, 50).map(tz => (
              <button
                key={tz}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover-elevate ${tz === value ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}
                onClick={() => { onChange(tz); setIsOpen(false); setSearch(""); }}
                data-testid={`${testId}-option-${tz}`}
              >
                {tz.replace(/_/g, " ")}
              </button>
            ))
          )}
        </div>
      )}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setSearch(""); }} />
      )}
    </div>
  );
}

export default function TimezoneMeeting() {
  const { toast } = useToast();
  const [myTimezone, setMyTimezone] = useState(getUserTimezone());
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "", timezone: "Europe/London" },
  ]);
  const [meetingDate, setMeetingDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [meetingHour, setMeetingHour] = useState(9);
  const [duration, setDuration] = useState("60");
  const [preferredStart, setPreferredStart] = useState(9);
  const [preferredEnd, setPreferredEnd] = useState(18);

  const addParticipant = () => {
    setParticipants(prev => [
      ...prev,
      { id: Date.now().toString(), name: "", timezone: "America/New_York" },
    ]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const updateParticipant = (id: string, field: "name" | "timezone", value: string) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const allTimezones = useMemo(() => {
    return [
      { name: "You", timezone: myTimezone },
      ...participants.map(p => ({ name: p.name || `Participant`, timezone: p.timezone })),
    ];
  }, [myTimezone, participants]);

  const meetingResults = useMemo(() => {
    const baseDate = new Date(meetingDate + "T12:00:00");
    return allTimezones.map(({ name, timezone }) => {
      const result = getLocalTimeForTimezone(baseDate, meetingHour, 0, myTimezone, timezone);
      const isOutside = result.hour < preferredStart || result.hour >= preferredEnd;
      return {
        name,
        timezone,
        ...result,
        isOutside,
      };
    });
  }, [allTimezones, meetingDate, meetingHour, myTimezone, preferredStart, preferredEnd]);

  const overlapHours = useMemo(() => {
    const baseDate = new Date(meetingDate + "T12:00:00");
    const hours: { hour: number; allInRange: boolean }[] = [];

    for (let h = 0; h < 24; h++) {
      const allInRange = allTimezones.every(({ timezone }) => {
        const result = getLocalTimeForTimezone(baseDate, h, 0, myTimezone, timezone);
        return result.hour >= preferredStart && result.hour < preferredEnd;
      });
      hours.push({ hour: h, allInRange });
    }
    return hours;
  }, [allTimezones, meetingDate, myTimezone, preferredStart, preferredEnd]);

  const handleCopySchedule = () => {
    const durationMin = parseInt(duration);
    const durationStr = durationMin >= 60 ? `${durationMin / 60}h` : `${durationMin}min`;
    let text = `Meeting Schedule - ${meetingDate}\n`;
    text += `Duration: ${durationStr}\n\n`;
    meetingResults.forEach(r => {
      const dayLabel = r.nextDay ? " (+1 day)" : r.prevDay ? " (-1 day)" : "";
      const warning = r.isOutside ? " [Outside preferred hours]" : "";
      text += `${r.name} (${r.timezone.replace(/_/g, " ")}): ${r.formatted}${dayLabel}${warning}\n`;
    });
    copyToClipboard(text);
    toast({ title: "Copied to clipboard", description: "Meeting schedule has been copied." });
  };

  const faqs = [
    {
      question: "How do I find the best meeting time across time zones?",
      answer: "Set your preferred working hours (e.g., 9 AM to 6 PM), add all participants with their time zones, and look at the business hours overlap section. Green-highlighted hours indicate times when all participants are within their preferred working hours.",
    },
    {
      question: "Does this tool account for Daylight Saving Time (DST)?",
      answer: "Yes, this tool uses your browser's built-in Intl.DateTimeFormat API which automatically handles Daylight Saving Time transitions. Make sure to set the correct meeting date, as DST rules vary by date and region.",
    },
    {
      question: "How many participants can I add?",
      answer: "You can add as many participants as needed. Each participant can have their own timezone and an optional label to help you identify them in the results table.",
    },
    {
      question: "What do the colored indicators in the overlap chart mean?",
      answer: "Green blocks indicate hours when ALL participants are within the preferred working hours range. Gray blocks indicate hours when at least one participant would be outside preferred hours. This helps you quickly identify the best meeting windows.",
    },
    {
      question: "Can I share the meeting schedule with others?",
      answer: "Yes! Use the 'Copy Schedule' button to copy a formatted text summary of all participants' local times. You can then paste this into an email, chat message, or calendar invite.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Meeting Time Zone Planner - Calculate 360"
        description="Find the best meeting time across multiple time zones. Compare local times for participants worldwide."
        path="/timezone-meeting"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Meeting Time Zone Planner
              </h1>
              <p className="text-lg text-muted-foreground">
                Find the best meeting time across multiple time zones. Compare local times for participants worldwide.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block font-medium">Your Timezone</Label>
                  <TimezoneSelect
                    value={myTimezone}
                    onChange={setMyTimezone}
                    testId="select-my-timezone"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-medium">Participants</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addParticipant}
                      data-testid="button-add-participant"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {participants.map((p, idx) => (
                      <div key={p.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="w-full sm:w-1/3">
                          <Label className="text-xs text-muted-foreground mb-1 block">Name (optional)</Label>
                          <Input
                            value={p.name}
                            onChange={e => updateParticipant(p.id, "name", e.target.value)}
                            placeholder={`Participant ${idx + 1}`}
                            data-testid={`input-participant-name-${idx}`}
                          />
                        </div>
                        <div className="w-full sm:flex-1">
                          <Label className="text-xs text-muted-foreground mb-1 block">Timezone</Label>
                          <TimezoneSelect
                            value={p.timezone}
                            onChange={tz => updateParticipant(p.id, "timezone", tz)}
                            testId={`select-participant-timezone-${idx}`}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeParticipant(p.id)}
                          data-testid={`button-remove-participant-${idx}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {participants.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No participants added. Click "Add" to add a participant.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block font-medium">Meeting Date</Label>
                    <Input
                      type="date"
                      value={meetingDate}
                      onChange={e => setMeetingDate(e.target.value)}
                      data-testid="input-meeting-date"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium">Meeting Time (Your Time)</Label>
                    <select
                      value={meetingHour}
                      onChange={e => setMeetingHour(parseInt(e.target.value))}
                      className="w-full border border-input rounded-md bg-background px-3 py-2 text-sm"
                      data-testid="select-meeting-hour"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{formatHour(i)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="mb-2 block font-medium">Duration</Label>
                    <select
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full border border-input rounded-md bg-background px-3 py-2 text-sm"
                      data-testid="select-duration"
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium">Preferred Start</Label>
                    <select
                      value={preferredStart}
                      onChange={e => setPreferredStart(parseInt(e.target.value))}
                      className="w-full border border-input rounded-md bg-background px-3 py-2 text-sm"
                      data-testid="select-preferred-start"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{formatHour(i)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="mb-2 block font-medium">Preferred End</Label>
                    <select
                      value={preferredEnd}
                      onChange={e => setPreferredEnd(parseInt(e.target.value))}
                      className="w-full border border-input rounded-md bg-background px-3 py-2 text-sm"
                      data-testid="select-preferred-end"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{formatHour(i)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Meeting Times
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySchedule}
                    data-testid="button-copy-schedule"
                  >
                    <Copy className="w-4 h-4 mr-1" /> Copy Schedule
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="table-meeting-times">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Participant</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Timezone</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Local Time</th>
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetingResults.map((r, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-border/50 ${r.isOutside ? "bg-amber-50/50" : ""}`}
                          data-testid={`row-participant-${idx}`}
                        >
                          <td className="py-3 px-3 font-medium text-foreground">{r.name}</td>
                          <td className="py-3 px-3 text-muted-foreground text-xs">{r.timezone.replace(/_/g, " ")}</td>
                          <td className="py-3 px-3 font-medium text-foreground">
                            {r.formatted}
                            {r.nextDay && <span className="text-xs text-amber-600 ml-1">(+1 day)</span>}
                            {r.prevDay && <span className="text-xs text-amber-600 ml-1">(-1 day)</span>}
                          </td>
                          <td className="py-3 px-3">
                            {r.isOutside ? (
                              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-md" data-testid={`status-outside-${idx}`}>
                                Outside hours
                              </span>
                            ) : (
                              <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-md" data-testid={`status-ok-${idx}`}>
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <h2 className="text-xl font-display font-bold text-foreground mb-4">
                  Business Hours Overlap
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Hours shown in your timezone ({myTimezone.replace(/_/g, " ")}). Green = all participants within preferred hours.
                </p>
                <div className="grid grid-cols-12 gap-1" data-testid="overlap-chart">
                  {overlapHours.map(({ hour, allInRange }) => (
                    <div
                      key={hour}
                      className={`text-center py-2 rounded text-xs font-medium ${
                        allInRange
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                      title={`${formatHour(hour)} - ${allInRange ? "All available" : "Not all available"}`}
                      data-testid={`overlap-hour-${hour}`}
                    >
                      {hour}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-100 border border-green-200 rounded" />
                    All available
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded" />
                    Not all available
                  </div>
                </div>
              </div>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <AdSlot position="sidebar" />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4">Quick Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Schedule meetings during overlapping business hours to respect everyone's work-life balance.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Consider rotating meeting times if no perfect overlap exists.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Always share the meeting time in each participant's local timezone to avoid confusion.
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <AdSlot position="bottom" className="mt-8" />
      </main>

      <Footer />
    </div>
  );
}
