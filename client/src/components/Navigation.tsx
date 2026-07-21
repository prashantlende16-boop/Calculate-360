import { Link, useLocation } from "wouter";
import {
  Calculator, CalendarClock, Home, Coins, ArrowLeftRight, Menu, X, Activity, QrCode,
  PersonStanding, Scale, Target, BarChart3, Fuel, Split, PartyPopper, Flame, Weight,
  Droplets, Moon as MoonIcon, Sun, FileText, Code, Palette, Shuffle, Globe, ChevronDown,
  Building2, TrendingUp, Sigma, TestTube, ArrowDownUp, MoreHorizontal, Briefcase,
} from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const categories = [
  {
    label: "Finance",
    icon: Calculator,
    links: [
      { href: "/", label: "Percentage", icon: Calculator },
      { href: "/home-loan", label: "Home Loan EMI", icon: Home },
      { href: "/home-loan-eligibility", label: "Loan Eligibility", icon: Home },
      { href: "/gold", label: "Jewelry Cost", icon: Coins },
      { href: "/currency", label: "Currency", icon: ArrowLeftRight },
      { href: "/savings-goal", label: "Savings Goal", icon: Target },
      { href: "/ads-metrics", label: "Ads Metrics", icon: BarChart3 },
      { href: "/construction-cost", label: "Construction Cost", icon: Building2 },
      { href: "/rental-yield", label: "Rental Yield", icon: TrendingUp },
      { href: "/property-value", label: "Property Value", icon: Building2 },
      { href: "/business-startup", label: "Startup Cost", icon: Briefcase },
    ],
  },
  {
    label: "Health",
    icon: Activity,
    links: [
      { href: "/bmi", label: "BMI Calculator", icon: Activity },
      { href: "/body-fat", label: "Body Fat %", icon: PersonStanding },
      { href: "/bmr-tdee", label: "BMR / TDEE", icon: Flame },
      { href: "/ideal-weight", label: "Ideal Weight", icon: Weight },
      { href: "/water-intake", label: "Water Intake", icon: Droplets },
      { href: "/sleep-cycle", label: "Sleep Cycle", icon: MoonIcon },
    ],
  },
  {
    label: "Utilities",
    icon: Scale,
    links: [
      { href: "/age", label: "Age Calculator", icon: CalendarClock },
      { href: "/qr", label: "QR Generator", icon: QrCode },
      { href: "/units", label: "Unit Converter", icon: Scale },
      { href: "/word-counter", label: "Word Counter", icon: FileText },
      { href: "/encoder-tools", label: "Encoder", icon: Code },
      { href: "/color-tools", label: "Color Tools", icon: Palette },
      { href: "/random-data", label: "Random Data", icon: Shuffle },
    ],
  },
  {
    label: "Travel & Events",
    icon: Fuel,
    links: [
      { href: "/fuel-cost", label: "Fuel Cost", icon: Fuel },
      { href: "/trip-splitter", label: "Trip Splitter", icon: Split },
      { href: "/event-budget", label: "Event Budget", icon: PartyPopper },
      { href: "/timezone-meeting", label: "Time Zones", icon: Globe },
    ],
  },
  {
    label: "Statistics",
    icon: BarChart3,
    links: [
      { href: "/mean-median-mode", label: "Mean/Median/Mode", icon: BarChart3 },
      { href: "/standard-deviation", label: "Std Deviation", icon: Sigma },
      { href: "/variance", label: "Variance", icon: TrendingUp },
      { href: "/coefficient-of-variation", label: "Coeff. of Variation", icon: Calculator },
      { href: "/skewness", label: "Skewness", icon: TrendingUp },
      { href: "/kurtosis", label: "Kurtosis", icon: BarChart3 },
      { href: "/confidence-interval", label: "Confidence Interval", icon: ArrowDownUp },
      { href: "/p-value", label: "P-Value", icon: Calculator },
      { href: "/hypothesis-test", label: "Hypothesis Test", icon: TestTube },
      { href: "/difference-in-means", label: "Diff in Means", icon: ArrowLeftRight },
      { href: "/linear-regression", label: "Linear Regression", icon: TrendingUp },
    ],
  },
];

const allLinks = categories.flatMap((c) => c.links);

function CategoryDropdown({
  cat,
  location,
  onClose,
  align = "left",
}: {
  cat: (typeof categories)[0];
  location: string;
  onClose: () => void;
  align?: "left" | "right";
}) {
  const cols = cat.links.length > 5 ? 2 : 1;
  const width = cols === 2 ? "w-[380px]" : "w-[220px]";
  return (
    <div
      className={cn(
        "absolute top-full mt-2 bg-background rounded-xl shadow-xl border border-border p-3 z-50",
        width,
        align === "right" ? "right-0" : "left-0"
      )}
    >
      <div className={cn("grid gap-0.5", cols === 2 ? "grid-cols-2" : "grid-cols-1")}>
        {cat.links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "px-2.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover:bg-muted/60",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [moreStartIdx, setMoreStartIdx] = useState(categories.length);

  const navRef = useRef<HTMLDivElement>(null);
  const catContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { theme, toggleTheme } = useTheme();

  useLayoutEffect(() => {
    const container = catContainerRef.current;
    if (!container) return;

    const compute = () => {
      const available = container.offsetWidth;
      const MORE_BTN_W = 90;
      const GAP = 4;
      let used = 0;
      let count = 0;

      for (let i = 0; i < categories.length; i++) {
        const el = itemRefs.current[i];
        if (!el) break;
        const w = el.offsetWidth + GAP;
        const isLast = i === categories.length - 1;

        if (isLast) {
          if (used + w <= available) count = categories.length;
        } else {
          if (used + w + MORE_BTN_W <= available) {
            used += w;
            count = i + 1;
          } else {
            break;
          }
        }
      }

      setMoreStartIdx(count || 1);
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenCat(null);
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const visibleCats = categories.slice(0, moreStartIdx);
  const hiddenCats = categories.slice(moreStartIdx);
  const activeCategory = categories.find((c) => c.links.some((l) => l.href === location));

  function toggleCat(label: string) {
    setMoreOpen(false);
    setOpenCat((prev) => (prev === label ? null : label));
  }

  function toggleMore() {
    setOpenCat(null);
    setMoreOpen((prev) => !prev);
  }

  function closeAll() {
    setOpenCat(null);
    setMoreOpen(false);
  }

  return (
    <nav ref={navRef} className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4 min-h-16 flex items-center gap-3 py-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="/logo-square.png"
            alt="Calculate 360"
            className="w-9 h-9 rounded-xl object-contain group-hover:scale-105 transition-transform duration-200"
          />
          <div className="hidden sm:block">
            <span className="font-display font-bold text-lg tracking-tight text-foreground block leading-none">
              Calculate 360
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Fast & Simple
            </span>
          </div>
        </Link>

        {/* Desktop category nav */}
        <div
          ref={catContainerRef}
          className="hidden md:flex items-center gap-1 flex-1 min-w-0"
        >
          {categories.map((cat, i) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory?.label === cat.label;
            const isOpen = openCat === cat.label;
            const isVisible = i < moreStartIdx;

            return (
              <div
                key={cat.label}
                className={cn("relative shrink-0", !isVisible && "invisible pointer-events-none absolute")}
              >
                <button
                  ref={(el) => { itemRefs.current[i] = el; }}
                  onClick={() => toggleCat(cat.label)}
                  data-testid={`button-cat-${cat.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    isOpen && !isActive && "bg-muted/50 text-foreground"
                  )}
                >
                  <CatIcon className="w-3.5 h-3.5 shrink-0" />
                  {cat.label}
                  <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                  <CategoryDropdown cat={cat} location={location} onClose={closeAll} />
                )}
              </div>
            );
          })}

          {/* More button */}
          {hiddenCats.length > 0 && (
            <div className="relative shrink-0">
              <button
                onClick={toggleMore}
                data-testid="button-more-dropdown"
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap",
                  hiddenCats.some((c) => c.label === activeCategory?.label)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  moreOpen && "bg-muted/50 text-foreground"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
                More
                <ChevronDown className={cn("w-3 h-3 transition-transform", moreOpen && "rotate-180")} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full mt-2 bg-background rounded-xl shadow-xl border border-border p-3 z-50 w-[420px] max-h-[80vh] overflow-y-auto">
                  <div className="space-y-4">
                    {hiddenCats.map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <div key={cat.label}>
                          <div className="flex items-center gap-2 mb-1.5 px-1">
                            <CatIcon className="w-3.5 h-3.5 text-primary" />
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              {cat.label}
                            </h4>
                          </div>
                          <div className={cn("grid gap-0.5", cat.links.length > 5 ? "grid-cols-2" : "grid-cols-1")}>
                            {cat.links.map((link) => {
                              const isActive = location === link.href;
                              const Icon = link.icon;
                              return (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  onClick={closeAll}
                                  className={cn(
                                    "px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover:bg-muted/60",
                                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  <Icon className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{link.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme toggle (desktop) */}
        <button
          onClick={toggleTheme}
          className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          data-testid="button-theme-toggle"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <MoonIcon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 text-foreground"
            data-testid="button-theme-toggle-mobile"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <MoonIcon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            className="p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="button-mobile-menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background shadow-xl max-h-[80vh] overflow-y-auto">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isExpanded = expandedMobile === cat.label;
            const isCatActive = activeCategory?.label === cat.label;
            return (
              <div key={cat.label} className="border-b border-border/50 last:border-0">
                <button
                  onClick={() => setExpandedMobile(isExpanded ? null : cat.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold transition-colors",
                    isCatActive ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CatIcon className="w-4 h-4" />
                    {cat.label}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </button>

                {isExpanded && (
                  <div className="bg-muted/20 px-4 pb-3 pt-1">
                    <div className="grid grid-cols-2 gap-0.5">
                      {cat.links.map((link) => {
                        const isActive = location === link.href;
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => { setIsOpen(false); setExpandedMobile(null); }}
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}
