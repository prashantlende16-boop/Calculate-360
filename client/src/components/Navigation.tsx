import { Link, useLocation } from "wouter";
import { Calculator, CalendarClock, Home, Coins, ArrowLeftRight, Menu, X, Activity, QrCode, PersonStanding, Scale, Target, BarChart3, Fuel, Split, PartyPopper, Flame, Weight, Droplets, Moon as MoonIcon, Sun, FileText, Code, Palette, Shuffle, Globe, ChevronDown, Building2, TrendingUp, Sigma, TestTube, ArrowDownUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const categories = [
  {
    label: "Finance",
    links: [
      { href: "/", label: "Percentage", icon: Calculator },
      { href: "/home-loan", label: "Home Loan EMI", icon: Home },
      { href: "/home-loan-eligibility", label: "Loan Eligibility", icon: Home },
      { href: "/gold", label: "Jewelry Cost", icon: Coins },
      { href: "/currency", label: "Currency", icon: ArrowLeftRight },
      { href: "/savings-goal", label: "Savings Goal", icon: Target },
      { href: "/ads-metrics", label: "Ads Metrics", icon: BarChart3 },
      { href: "/construction-cost", label: "Construction Cost", icon: Building2 },
    ],
  },
  {
    label: "Health",
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
    links: [
      { href: "/fuel-cost", label: "Fuel Cost", icon: Fuel },
      { href: "/trip-splitter", label: "Trip Splitter", icon: Split },
      { href: "/event-budget", label: "Event Budget", icon: PartyPopper },
      { href: "/timezone-meeting", label: "Time Zones", icon: Globe },
    ],
  },
  {
    label: "Statistics",
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

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentPage = allLinks.find((l) => l.href === location);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4 min-h-16 flex items-center justify-between py-2 gap-2">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground block leading-none">
              Calculate 360
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Fast & Simple
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-muted/50",
                dropdownOpen ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="button-tools-dropdown"
            >
              <Menu className="w-4 h-4" />
              All Tools
              <ChevronDown className={cn("w-3 h-3 transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-[640px] bg-background rounded-xl shadow-xl border border-border p-4 grid grid-cols-2 gap-4 z-50">
                {categories.map((cat) => (
                  <div key={cat.label}>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                      {cat.label}
                    </h4>
                    <div className="space-y-0.5">
                      {cat.links.map((link) => {
                        const isActive = location === link.href;
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setDropdownOpen(false)}
                            className={cn(
                              "px-2 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 hover:bg-muted/50",
                              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentPage && location !== "/" && (
            <div className="px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary flex items-center gap-2">
              <currentPage.icon className="w-4 h-4" />
              {currentPage.label}
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            data-testid="button-theme-toggle"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <MoonIcon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
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

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 shadow-xl animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.label} className="mb-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {cat.label}
              </h4>
              <div className="space-y-0.5">
                {cat.links.map((link) => {
                  const isActive = location === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 flex items-center gap-3 hover:bg-muted/50",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
