import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, RefreshCw, QrCode, Wifi, Contact, CreditCard, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function QRCodeGenerator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("text");
  
  // Text/URL state
  const [text, setText] = useState("");
  const [isUrl, setIsUrl] = useState(false);
  
  // WiFi state
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  
  // Contact (vCard) state
  const [vName, setVName] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vCompany, setVCompany] = useState("");
  const [vTitle, setVTitle] = useState("");
  const [vWebsite, setVWebsite] = useState("");
  
  // UPI state
  const [upiId, setUpiId] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  
  // Customization state
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState("M");
  const [margin, setMargin] = useState(4);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isTransparent, setIsTransparent] = useState(false);
  const [renderType, setRenderType] = useState("canvas");
  
  const [showEncoded, setShowEncoded] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const encodedData = (() => {
    switch (activeTab) {
      case "text":
        return text || "Enter data to generate QR";
      case "wifi":
        return `WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden};;`;
      case "contact":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vName}\nTEL:${vPhone}\nEMAIL:${vEmail}\nORG:${vCompany}\nTITLE:${vTitle}\nURL:${vWebsite}\nEND:VCARD`;
      case "upi":
        const upiParams = new URLSearchParams();
        upiParams.set("pa", upiId);
        if (payeeName) upiParams.set("pn", payeeName);
        if (amount) upiParams.set("am", amount);
        if (remark) upiParams.set("tn", remark);
        return `upi://pay?${upiParams.toString()}`;
      default:
        return "";
    }
  })();

  const downloadQR = () => {
    if (renderType === "canvas") {
      const canvas = qrRef.current?.querySelector("canvas");
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-code-${activeTab}.png`;
        link.click();
      }
    } else {
      const svg = qrRef.current?.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-code-${activeTab}.svg`;
        link.click();
      }
    }
  };

  const copyEncoded = () => {
    navigator.clipboard.writeText(encodedData);
    toast({ title: "Encoded data copied" });
  };

  const handleReset = () => {
    setText("");
    setWifiSsid("");
    setWifiPassword("");
    setVName("");
    setVPhone("");
    setVEmail("");
    setUpiId("");
    setAmount("");
    toast({ title: "All fields reset" });
  };

  const faqs = [
    {
      question: "What is error correction?",
      answer: "Error correction allows a QR code to remain scannable even if it's partially damaged or covered. Higher levels (Q, H) allow more damage but result in a denser code."
    },
    {
      question: "Can I generate Wi-Fi QR codes?",
      answer: "Yes! Use the Wi-Fi tab to enter your network details. When scanned, most smartphones will automatically prompt the user to connect."
    },
    {
      question: "Are QR codes created offline?",
      answer: "Yes, this tool generates QR codes 100% in your browser. No data is sent to any server, making it secure for private information like passwords."
    },
    {
      question: "Why does my QR not scan?",
      answer: "Check if the size is too small, contrast is too low (e.g., light foreground on white background), or if there's enough margin (quiet zone) around it."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />
        
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <QrCode className="w-8 h-8 text-primary" /> QR Code Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create custom QR codes for text, URLs, Wi-Fi networks, and contact details instantly.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border shadow-sm">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                    <TabsTrigger value="text" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 flex-1"><QrCode className="w-4 h-4 mr-2" /> Text/URL</TabsTrigger>
                    <TabsTrigger value="wifi" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 flex-1"><Wifi className="w-4 h-4 mr-2" /> Wi-Fi</TabsTrigger>
                    <TabsTrigger value="contact" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 flex-1"><Contact className="w-4 h-4 mr-2" /> Contact</TabsTrigger>
                    <TabsTrigger value="upi" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 flex-1"><CreditCard className="w-4 h-4 mr-2" /> UPI</TabsTrigger>
                  </TabsList>
                  
                  <div className="p-6">
                    <TabsContent value="text" className="mt-0 space-y-4">
                      <div className="space-y-2">
                        <Label>Content (Text or URL)</Label>
                        <Textarea 
                          placeholder="https://example.com" 
                          value={text} 
                          onChange={(e) => setText(e.target.value)}
                          className="min-h-[120px] text-lg"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={isUrl} onCheckedChange={setIsUrl} id="is-url" />
                        <Label htmlFor="is-url">Treat as URL</Label>
                      </div>
                    </TabsContent>

                    <TabsContent value="wifi" className="mt-0 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Network Name (SSID)</Label>
                          <Input value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder="Home-WiFi" />
                        </div>
                        <div className="space-y-2">
                          <Label>Password</Label>
                          <Input type="password" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                          <Label>Security</Label>
                          <Select value={wifiSecurity} onValueChange={setWifiSecurity}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WPA">WPA/WPA2</SelectItem>
                              <SelectItem value="WEP">WEP</SelectItem>
                              <SelectItem value="nopass">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <Switch checked={wifiHidden} onCheckedChange={setWifiHidden} id="wifi-hidden" />
                          <Label htmlFor="wifi-hidden">Hidden Network</Label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="contact" className="mt-0 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Full Name</Label><Input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="John Doe" /></div>
                        <div className="space-y-2"><Label>Phone</Label><Input value={vPhone} onChange={(e) => setVPhone(e.target.value)} placeholder="+1 234 567 890" /></div>
                        <div className="space-y-2"><Label>Email</Label><Input type="email" value={vEmail} onChange={(e) => setVEmail(e.target.value)} placeholder="john@example.com" /></div>
                        <div className="space-y-2"><Label>Company</Label><Input value={vCompany} onChange={(e) => setVCompany(e.target.value)} placeholder="Acme Corp" /></div>
                        <div className="space-y-2"><Label>Title</Label><Input value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="Software Engineer" /></div>
                        <div className="space-y-2"><Label>Website</Label><Input value={vWebsite} onChange={(e) => setVWebsite(e.target.value)} placeholder="www.johndoe.com" /></div>
                      </div>
                    </TabsContent>

                    <TabsContent value="upi" className="mt-0 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>UPI ID (VPA)</Label><Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="example@upi" /></div>
                        <div className="space-y-2"><Label>Payee Name</Label><Input value={payeeName} onChange={(e) => setPayeeName(e.target.value)} placeholder="Receiver Name" /></div>
                        <div className="space-y-2"><Label>Amount (Optional)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
                        <div className="space-y-2"><Label>Remark (Optional)</Label><Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Payment for service" /></div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="bg-muted border-b"><CardTitle className="text-lg">Appearance & Settings</CardTitle></CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>QR Size</Label>
                    <Select value={size.toString()} onValueChange={(v) => setSize(parseInt(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128 x 128</SelectItem>
                        <SelectItem value="256">256 x 256</SelectItem>
                        <SelectItem value="512">512 x 512</SelectItem>
                        <SelectItem value="1024">1024 x 1024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Error Correction</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">L (Low - 7%)</SelectItem>
                        <SelectItem value="M">M (Medium - 15%)</SelectItem>
                        <SelectItem value="Q">Q (Quartile - 25%)</SelectItem>
                        <SelectItem value="H">H (High - 30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Margin (Quiet Zone)</Label>
                    <Input type="number" min="0" max="10" value={margin} onChange={(e) => setMargin(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>QR Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-12 h-10 p-1" />
                      <Input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={isTransparent} className="w-12 h-10 p-1" />
                      <Input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={isTransparent} className="flex-1" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch checked={isTransparent} onCheckedChange={setIsTransparent} id="transparent" />
                    <Label htmlFor="transparent">Transparent Background</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-sm sticky top-24">
              <CardHeader className="bg-muted border-b flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg">Preview</CardTitle>
                <div className="flex bg-muted rounded-lg p-1">
                  <button onClick={() => setRenderType("canvas")} className={`px-3 py-1 text-xs rounded-md transition-all ${renderType === "canvas" ? "bg-white shadow-sm font-bold" : "text-muted-foreground hover:bg-muted"}`}>PNG</button>
                  <button onClick={() => setRenderType("svg")} className={`px-3 py-1 text-xs rounded-md transition-all ${renderType === "svg" ? "bg-white shadow-sm font-bold" : "text-muted-foreground hover:bg-muted"}`}>SVG</button>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center">
                <div ref={qrRef} className="bg-card p-4 rounded-xl shadow-inner border mb-6 relative group overflow-hidden">
                  {renderType === "canvas" ? (
                    <QRCodeCanvas
                      value={encodedData}
                      size={256}
                      level={level as any}
                      marginSize={margin}
                      fgColor={fgColor}
                      bgColor={isTransparent ? "transparent" : bgColor}
                    />
                  ) : (
                    <QRCodeSVG
                      value={encodedData}
                      size={256}
                      level={level as any}
                      marginSize={margin}
                      fgColor={fgColor}
                      bgColor={isTransparent ? "transparent" : bgColor}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 text-xs font-bold px-3 py-1 rounded-full text-foreground border shadow-sm">Real-time Preview</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <Button onClick={downloadQR} className="w-full gap-2 h-11">
                    <Download className="w-4 h-4" /> Download {renderType.toUpperCase()}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={copyEncoded} variant="outline" className="gap-2"><Copy className="w-4 h-4" /> Content</Button>
                    <Button onClick={handleReset} variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> Reset</Button>
                  </div>
                </div>

                <div className="w-full mt-6 pt-6 border-t border-border">
                  <button 
                    onClick={() => setShowEncoded(!showEncoded)}
                    className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>Show Encoded Data</span>
                    {showEncoded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {showEncoded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <div className="bg-muted p-3 rounded-lg text-xs font-mono break-all text-foreground leading-relaxed border border-border">
                          {encodedData}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 space-y-8">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">How to use the QR Generator</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">1</div>
                <h3 className="font-bold text-foreground">Select Type</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Choose from Text, URL, WiFi, or Contact. Each type automatically formats your data correctly for scanning.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">2</div>
                <h3 className="font-bold text-foreground">Customize Style</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Change colors, size, and margin. Use the transparent background option for cleaner integration with your designs.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">3</div>
                <h3 className="font-bold text-foreground">Download & Share</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Download as PNG for web use or SVG for high-quality printing. All generation happens locally for your privacy.</p>
              </div>
            </div>
          </div>

          <FAQSection title="QR Code Generator FAQ" items={faqs} />
          <AdSlot position="bottom" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
