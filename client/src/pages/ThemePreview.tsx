import { Layout } from "@/components/Layout";
import { ArrowLeft, Check, AlertTriangle, Info, X, Search, Bell, Star, Heart, Zap } from "lucide-react";
import { Link } from "wouter";

const COLORS = {
  hotPink: { rgb: "225, 0, 93", hex: "#e1005d", label: "Hot Pink", role: "Primary" },
  orange: { rgb: "238, 118, 8", hex: "#ee7608", label: "Orange", role: "Warning" },
  gold: { rgb: "253, 195, 0", hex: "#fdc300", label: "Gold", role: "Warning Alt" },
  lime: { rgb: "162, 198, 23", hex: "#a2c617", label: "Lime Green", role: "Success" },
  teal: { rgb: "59, 179, 146", hex: "#3bb392", label: "Teal", role: "Secondary" },
  blue: { rgb: "52, 134, 186", hex: "#3486ba", label: "Blue", role: "Accent" },
  magenta: { rgb: "157, 36, 91", hex: "#9d245b", label: "Dark Magenta", role: "Destructive" },
  indigo: { rgb: "54, 48, 97", hex: "#363061", label: "Dark Indigo", role: "Dark BG" },
  darkGray: { rgb: "74, 74, 74", hex: "#4a4a4a", label: "Dark Gray", role: "Foreground" },
  lightGray: { rgb: "219, 219, 218", hex: "#dbdbda", label: "Light Gray", role: "Border" },
  blueAlt: { rgb: "52, 135, 187", hex: "#3487bb", label: "Blue Alt", role: "Ring/Focus" },
};

export default function ThemePreview() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors" data-testid="link-back-home">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold font-display mb-2" data-testid="text-preview-title">
          Theme Color Preview
        </h1>
        <p className="text-muted-foreground mb-10">
          Preview how the new color palette would look across the app before applying changes.
        </p>

        <section className="mb-12">
          <h2 className="text-xl font-bold font-display mb-4">Color Swatches</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.values(COLORS).map((c) => (
              <div key={c.hex} className="rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: COLORS.lightGray.hex }}>
                <div className="h-20" style={{ backgroundColor: c.hex }} />
                <div className="p-3 bg-white">
                  <p className="font-semibold text-sm" style={{ color: COLORS.darkGray.hex }}>{c.label}</p>
                  <p className="text-xs font-mono" style={{ color: COLORS.darkGray.hex }}>{c.hex}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: COLORS.blue.hex }}>{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <section>
            <h2 className="text-xl font-bold font-display mb-4">Current Theme</h2>
            <div className="rounded-2xl border border-border p-6 bg-white space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-foreground">Calculate 360</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="px-5 py-2.5 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/30 text-sm">Primary Button</button>
                <button className="px-5 py-2.5 rounded-xl font-semibold bg-secondary text-secondary-foreground border text-sm">Secondary</button>
                <button className="px-5 py-2.5 rounded-xl font-semibold bg-destructive text-white text-sm">Destructive</button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Active</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Success</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Warning</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Error</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Info</span>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Sample input field..."
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="rounded-xl border border-border p-4">
                <h3 className="font-semibold text-foreground mb-1">Sample Card</h3>
                <p className="text-sm text-muted-foreground">This shows how content looks in the current theme with default colors.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold font-display mb-4">New Theme Preview</h2>
            <div className="rounded-2xl p-6 space-y-6" style={{ backgroundColor: "#ffffff", border: `1px solid ${COLORS.lightGray.hex}` }}>
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: `1px solid ${COLORS.lightGray.hex}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: COLORS.hotPink.hex, boxShadow: `0 10px 15px -3px ${COLORS.hotPink.hex}33` }}>
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg" style={{ color: COLORS.darkGray.hex }}>Calculate 360</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: COLORS.hotPink.hex, boxShadow: `0 10px 15px -3px ${COLORS.hotPink.hex}4D` }}>Primary Button</button>
                <button className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: COLORS.teal.hex, boxShadow: `0 10px 15px -3px ${COLORS.teal.hex}4D` }}>Secondary</button>
                <button className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: COLORS.magenta.hex }}>Destructive</button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.hotPink.hex}15`, color: COLORS.hotPink.hex }}>Active</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.lime.hex}20`, color: "#6b8c00" }}><Check className="w-3 h-3 inline mr-1" />Success</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.orange.hex}20`, color: COLORS.orange.hex }}><AlertTriangle className="w-3 h-3 inline mr-1" />Warning</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.magenta.hex}20`, color: COLORS.magenta.hex }}><X className="w-3 h-3 inline mr-1" />Error</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.blue.hex}20`, color: COLORS.blue.hex }}><Info className="w-3 h-3 inline mr-1" />Info</span>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Sample input field..."
                  className="w-full px-4 py-3 rounded-xl transition-all"
                  style={{ backgroundColor: "#ffffff", border: `1px solid ${COLORS.lightGray.hex}`, color: COLORS.darkGray.hex, outline: "none" }}
                  onFocus={(e) => { e.target.style.borderColor = COLORS.blueAlt.hex; e.target.style.boxShadow = `0 0 0 4px ${COLORS.blueAlt.hex}1A`; }}
                  onBlur={(e) => { e.target.style.borderColor = COLORS.lightGray.hex; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div className="rounded-xl p-4" style={{ border: `1px solid ${COLORS.lightGray.hex}` }}>
                <h3 className="font-semibold mb-1" style={{ color: COLORS.darkGray.hex }}>Sample Card</h3>
                <p className="text-sm" style={{ color: "#717171" }}>This shows how content looks with the new color palette applied.</p>
              </div>
            </div>
          </section>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-bold font-display mb-4">Navigation Preview</h2>
          <div className="rounded-2xl overflow-hidden shadow-lg" style={{ border: `1px solid ${COLORS.lightGray.hex}` }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#ffffff", borderBottom: `1px solid ${COLORS.lightGray.hex}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COLORS.hotPink.hex }}>
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-bold" style={{ color: COLORS.darkGray.hex }}>Calculate 360</span>
              </div>
              <div className="flex items-center gap-6 text-sm font-medium">
                <span className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${COLORS.hotPink.hex}12`, color: COLORS.hotPink.hex }}>Finance</span>
                <span style={{ color: "#717171" }}>Health</span>
                <span style={{ color: "#717171" }}>Utilities</span>
                <span style={{ color: "#717171" }}>Statistics</span>
              </div>
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4" style={{ color: "#717171" }} />
                <Bell className="w-4 h-4" style={{ color: "#717171" }} />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold font-display mb-4">Calculator Card Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Star className="w-5 h-5" />, title: "Percentage Calculator", desc: "Calculate percentages, increases, and differences instantly.", color: COLORS.hotPink.hex },
              { icon: <Heart className="w-5 h-5" />, title: "BMI Calculator", desc: "Check your Body Mass Index and get health insights.", color: COLORS.teal.hex },
              { icon: <Zap className="w-5 h-5" />, title: "EMI Calculator", desc: "Plan your home loan with monthly EMI breakdowns.", color: COLORS.blue.hex },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl p-6 transition-all hover:shadow-xl cursor-pointer group" style={{ backgroundColor: "#ffffff", border: `1px solid ${COLORS.lightGray.hex}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: card.color }}>
                  {card.icon}
                </div>
                <h3 className="font-bold mb-2" style={{ color: COLORS.darkGray.hex }}>{card.title}</h3>
                <p className="text-sm" style={{ color: "#717171" }}>{card.desc}</p>
                <span className="inline-block mt-4 text-sm font-semibold" style={{ color: card.color }}>Try it →</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold font-display mb-4">Dark Mode Preview</h2>
          <div className="rounded-2xl p-6 space-y-6" style={{ backgroundColor: COLORS.indigo.hex }}>
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: COLORS.hotPink.hex }}>
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">Calculate 360</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: COLORS.hotPink.hex }}>Primary Button</button>
              <button className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ backgroundColor: COLORS.teal.hex }}>Secondary</button>
              <button className="px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.15)" }}>Outline</button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.hotPink.hex}30`, color: "#ff6b9e" }}>Active</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.lime.hex}25`, color: "#c8e64a" }}>Success</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.orange.hex}25`, color: "#f5a54a" }}>Warning</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${COLORS.blue.hex}30`, color: "#6fb8e0" }}>Info</span>
            </div>

            <div>
              <input
                type="text"
                placeholder="Sample input in dark mode..."
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
                readOnly
              />
            </div>

            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 className="font-semibold mb-1 text-white">Sample Card (Dark)</h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Content on dark indigo background with the new palette.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold font-display mb-4">Typography & Text Colors</h2>
          <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#ffffff", border: `1px solid ${COLORS.lightGray.hex}` }}>
            <h3 className="text-2xl font-bold font-display" style={{ color: COLORS.darkGray.hex }}>Heading Text (Dark Gray)</h3>
            <p style={{ color: "#717171" }}>Body text would use a slightly lighter shade for comfortable reading on white backgrounds.</p>
            <p>
              <a href="#" style={{ color: COLORS.hotPink.hex, textDecoration: "underline", textUnderlineOffset: "3px" }} onClick={e => e.preventDefault()}>Primary link (Hot Pink)</a>
              {" · "}
              <a href="#" style={{ color: COLORS.blue.hex, textDecoration: "underline", textUnderlineOffset: "3px" }} onClick={e => e.preventDefault()}>Accent link (Blue)</a>
              {" · "}
              <a href="#" style={{ color: COLORS.teal.hex, textDecoration: "underline", textUnderlineOffset: "3px" }} onClick={e => e.preventDefault()}>Secondary link (Teal)</a>
            </p>
            <div className="flex gap-4 items-center pt-2">
              <span className="text-3xl font-bold" style={{ color: COLORS.hotPink.hex }}>₹ 12,500</span>
              <span className="text-lg font-semibold" style={{ color: COLORS.lime.hex }}>+15.3%</span>
              <span className="text-lg font-semibold" style={{ color: COLORS.magenta.hex }}>-8.7%</span>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold font-display mb-4">Full Palette Summary</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${COLORS.lightGray.hex}` }}>
            {Object.values(COLORS).map((c, i) => (
              <div key={c.hex} className="flex items-center gap-4 px-6 py-3" style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa", borderBottom: i < Object.values(COLORS).length - 1 ? `1px solid ${COLORS.lightGray.hex}` : "none" }}>
                <div className="w-10 h-10 rounded-lg shadow-sm flex-shrink-0" style={{ backgroundColor: c.hex }} />
                <div className="flex-1">
                  <span className="font-semibold text-sm" style={{ color: COLORS.darkGray.hex }}>{c.label}</span>
                  <span className="text-xs ml-2" style={{ color: "#999" }}>({c.role})</span>
                </div>
                <span className="font-mono text-xs" style={{ color: "#999" }}>{c.hex}</span>
                <span className="font-mono text-xs" style={{ color: "#999" }}>RGB({c.rgb})</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
}
