import { Layout } from "@/components/Layout";
import { Calculator } from "@/components/Calculator";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Calculate 360",
    "url": "https://calculate360.com",
    "description": "A fast and simple percentage calculator for calculating percentage increase, difference, and more.",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any"
  };

  return (
    <Layout>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Top Ad Slot */}
        <div className="mb-8 md:mb-12 max-w-4xl mx-auto">
          <AdPlaceholder size="banner" label="Ad Space (Top Banner)" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8 md:gap-12">
          {/* Main Content Area */}
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-bold font-display mb-4 tracking-tight text-foreground">
                Master Your Numbers
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Calculate percentages, find differences, and solve reverse percentage problems instantly.
              </p>
            </section>

            {/* The Calculator */}
            <section className="relative z-10">
              <div className="absolute inset-x-0 -top-20 -bottom-20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 -z-10 rounded-[3rem] blur-3xl opacity-40" />
              <Calculator />
            </section>

            {/* SEO Content / FAQ */}
            <section className="max-w-3xl mx-auto pt-8">
              <h3 className="text-2xl font-bold font-display text-foreground mb-6">Frequently Asked Questions</h3>
              
              <Card className="border-none shadow-lg bg-white/50 backdrop-blur">
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left font-medium">How do I calculate a percentage of a number?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        To calculate a percentage of a number, multiply the percentage by the number and divide by 100. For example, to find 20% of 500: (20 / 100) × 500 = 100.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left font-medium">How do I calculate percentage increase?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        Subtract the original value from the new value, divide that difference by the original value, and multiply by 100. <br/>
                        Formula: <code>((New - Old) / Old) × 100</code>.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left font-medium">What is the formula for reverse percentage?</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        If you have a final number after a percentage increase and want to find the original: <code>Final / (1 + Percentage/100)</code>. <br/>
                        For a decrease: <code>Final / (1 - Percentage/100)</code>.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 hidden lg:block">
             <div className="sticky top-24 space-y-8">
               <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 overflow-hidden relative">
                 <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                 <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/10 rounded-full blur-lg"></div>
                 <CardContent className="pt-8 relative z-10">
                   <h3 className="text-xl font-bold font-display mb-2">Did you know?</h3>
                   <p className="text-primary-foreground/80 text-sm leading-relaxed">
                     The term "percent" comes from the Latin per centum, meaning "by the hundred".
                   </p>
                 </CardContent>
               </Card>
               
               <AdPlaceholder size="sidebar" label="Ad Space (Sidebar)" />
             </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
