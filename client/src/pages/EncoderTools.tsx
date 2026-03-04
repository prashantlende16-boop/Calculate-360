import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { RememberInputs } from "@/components/RememberInputs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { copyToClipboard } from "@/lib/calculatorUtils";
import { getRememberPref, setRememberPref, saveToLocalStorage, loadFromLocalStorage } from "@/lib/calculatorUtils";
import { useToast } from "@/hooks/use-toast";
import { Copy, AlertCircle } from "lucide-react";
import { useEffect } from "react";

function base64Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
}

function base64Decode(input: string): string {
  const bytes = Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function EncoderTools() {
  const { toast } = useToast();
  const [b64EncInput, setB64EncInput] = useState("");
  const [b64DecInput, setB64DecInput] = useState("");
  const [urlEncInput, setUrlEncInput] = useState("");
  const [urlDecInput, setUrlDecInput] = useState("");
  const [remember, setRememberState] = useState(() => getRememberPref("encoder-tools"));

  useEffect(() => {
    if (remember) {
      const saved = loadFromLocalStorage("encoder-tools");
      if (saved) {
        if (saved.b64EncInput) setB64EncInput(saved.b64EncInput);
        if (saved.b64DecInput) setB64DecInput(saved.b64DecInput);
        if (saved.urlEncInput) setUrlEncInput(saved.urlEncInput);
        if (saved.urlDecInput) setUrlDecInput(saved.urlDecInput);
      }
    }
  }, []);

  useEffect(() => {
    if (remember) {
      saveToLocalStorage("encoder-tools", { b64EncInput, b64DecInput, urlEncInput, urlDecInput });
    }
  }, [b64EncInput, b64DecInput, urlEncInput, urlDecInput, remember]);

  const setRemember = (val: boolean) => {
    setRememberPref("encoder-tools", val);
    setRememberState(val);
  };

  const getOutput = (type: string, input: string): { result: string; error: string | null } => {
    if (!input.trim()) return { result: "", error: null };
    try {
      switch (type) {
        case "b64enc":
          return { result: base64Encode(input), error: null };
        case "b64dec":
          return { result: base64Decode(input), error: null };
        case "urlenc":
          return { result: encodeURIComponent(input), error: null };
        case "urldec":
          return { result: decodeURIComponent(input), error: null };
        default:
          return { result: "", error: null };
      }
    } catch {
      return { result: "", error: "Invalid input for this operation." };
    }
  };

  const b64EncOut = getOutput("b64enc", b64EncInput);
  const b64DecOut = getOutput("b64dec", b64DecInput);
  const urlEncOut = getOutput("urlenc", urlEncInput);
  const urlDecOut = getOutput("urldec", urlDecInput);

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    toast({ title: "Copied to clipboard" });
  };

  const faqs = [
    {
      question: "What is Base64 encoding?",
      answer: "Base64 is a binary-to-text encoding scheme that represents binary data as a string of ASCII characters. It is commonly used to embed binary data in text-based formats like JSON, XML, or HTML, and for encoding email attachments."
    },
    {
      question: "What is URL encoding?",
      answer: "URL encoding (percent-encoding) replaces unsafe characters in a URL with a '%' followed by two hexadecimal digits. For example, a space becomes '%20'. This ensures special characters don't break URL syntax."
    },
    {
      question: "Does this tool handle Unicode text?",
      answer: "Yes. For Base64, we use TextEncoder/TextDecoder to properly handle Unicode characters including emojis and non-Latin scripts. URL encoding uses the built-in encodeURIComponent which handles Unicode natively."
    },
    {
      question: "Is my data sent to a server?",
      answer: "No. All encoding and decoding happens entirely in your browser using JavaScript. Your data never leaves your device."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Base64 & URL Encoder/Decoder | Calculate 360"
        description="Free online Base64 and URL encoder/decoder. Encode and decode text instantly with Unicode support. No data sent to any server."
        path="/encoder-tools"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Base64 & URL Encoder/Decoder
              </h1>
              <p className="text-lg text-muted-foreground">
                Encode and decode Base64 and URL strings instantly. Supports Unicode.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <Tabs defaultValue="b64enc" className="w-full">
                <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl gap-1">
                  <TabsTrigger value="b64enc" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-b64-encode">Base64 Encode</TabsTrigger>
                  <TabsTrigger value="b64dec" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-b64-decode">Base64 Decode</TabsTrigger>
                  <TabsTrigger value="urlenc" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-url-encode">URL Encode</TabsTrigger>
                  <TabsTrigger value="urldec" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-url-decode">URL Decode</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                  <TabsContent value="b64enc" className="mt-0">
                    <EncoderTab
                      inputLabel="Text to encode"
                      outputLabel="Base64 output"
                      input={b64EncInput}
                      onInputChange={setB64EncInput}
                      output={b64EncOut}
                      onCopy={handleCopy}
                      inputTestId="textarea-b64-encode-input"
                      outputTestId="textarea-b64-encode-output"
                      copyTestId="button-copy-b64-encode"
                    />
                  </TabsContent>
                  <TabsContent value="b64dec" className="mt-0">
                    <EncoderTab
                      inputLabel="Base64 to decode"
                      outputLabel="Decoded text"
                      input={b64DecInput}
                      onInputChange={setB64DecInput}
                      output={b64DecOut}
                      onCopy={handleCopy}
                      inputTestId="textarea-b64-decode-input"
                      outputTestId="textarea-b64-decode-output"
                      copyTestId="button-copy-b64-decode"
                    />
                  </TabsContent>
                  <TabsContent value="urlenc" className="mt-0">
                    <EncoderTab
                      inputLabel="Text to URL encode"
                      outputLabel="URL encoded output"
                      input={urlEncInput}
                      onInputChange={setUrlEncInput}
                      output={urlEncOut}
                      onCopy={handleCopy}
                      inputTestId="textarea-url-encode-input"
                      outputTestId="textarea-url-encode-output"
                      copyTestId="button-copy-url-encode"
                    />
                  </TabsContent>
                  <TabsContent value="urldec" className="mt-0">
                    <EncoderTab
                      inputLabel="URL encoded text to decode"
                      outputLabel="Decoded text"
                      input={urlDecInput}
                      onInputChange={setUrlDecInput}
                      output={urlDecOut}
                      onCopy={handleCopy}
                      inputTestId="textarea-url-decode-input"
                      outputTestId="textarea-url-decode-output"
                      copyTestId="button-copy-url-decode"
                    />
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
            <AdSlot position="sidebar" />
          </aside>
        </div>

        <AdSlot position="bottom" className="mt-8" />
      </main>

      <Footer />
    </div>
  );
}

function EncoderTab({
  inputLabel,
  outputLabel,
  input,
  onInputChange,
  output,
  onCopy,
  inputTestId,
  outputTestId,
  copyTestId,
}: {
  inputLabel: string;
  outputLabel: string;
  input: string;
  onInputChange: (val: string) => void;
  output: { result: string; error: string | null };
  onCopy: (text: string) => void;
  inputTestId: string;
  outputTestId: string;
  copyTestId: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">{inputLabel}</Label>
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter text..."
          className="min-h-[120px] resize-y"
          data-testid={inputTestId}
        />
      </div>
      <div>
        <Label className="mb-2 block">{outputLabel}</Label>
        <Textarea
          value={output.error ? "" : output.result}
          readOnly
          className="min-h-[120px] resize-y bg-muted"
          data-testid={outputTestId}
        />
        {output.error && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span data-testid="text-error">{output.error}</span>
          </div>
        )}
      </div>
      {output.result && !output.error && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopy(output.result)}
          className="gap-2"
          data-testid={copyTestId}
        >
          <Copy className="w-4 h-4" /> Copy Output
        </Button>
      )}
    </div>
  );
}
