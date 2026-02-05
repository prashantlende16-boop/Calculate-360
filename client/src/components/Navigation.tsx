import { Link, useLocation } from "wouter";
import { Calculator, CalendarClock, Home, Coins, ArrowLeftRight, Menu, X, Activity, QrCode, PersonStanding, Scale } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Percentage Calculator", icon: Calculator },
    { href: "/age", label: "Age Calculator", icon: CalendarClock },
    { href: "/home-loan", label: "Home Loan EMI", icon: Home },
    { href: "/home-loan-eligibility", label: "Loan Eligibility", icon: Home },
    { href: "/gold", label: "Jewelry Cost", icon: Coins },
    { href: "/currency", label: "Currency", icon: ArrowLeftRight },
    { href: "/bmi", label: "BMI Calculator", icon: Activity },
    { href: "/qr", label: "QR Generator", icon: QrCode },
    { href: "/body-fat", label: "Body Fat %", icon: PersonStanding },
    { href: "/units", label: "Unit Converter", icon: Scale },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-accent/5 via-background to-secondary/5 backdrop-blur-md">
      <div className="container mx-auto px-4 min-h-16 flex flex-wrap items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2 group mr-4">
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

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-wrap items-center gap-1 flex-1 justify-end">
          {links.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap hover:bg-muted/50",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-2 shadow-xl animate-in slide-in-from-top-2">
          {links.map((link) => {
             const isActive = location === link.href;
             const Icon = link.icon;
             return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center gap-3 hover:bg-muted/50",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
