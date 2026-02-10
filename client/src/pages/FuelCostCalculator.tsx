import { useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { ShareCopyButtons } from "@/components/ShareCopyButtons";
import { RememberInputs } from "@/components/RememberInputs";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { formatINR, formatNumber } from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Fuel } from "lucide-react";
import { useState } from "react";

export default function FuelCostCalculator() {
  const [activeTab, setActiveTab] = useState("trip-cost");

  const tripState = useCalculatorState(
    "fuel-trip",
    ["distance", "mileage", "fuelPrice"],
    { fuelPrice: "105" }
  );

  const mileageState = useCalculatorState(
    "fuel-mileage",
    ["distance", "fuelUsed"]
  );

  const fuelNeededState = useCalculatorState(
    "fuel-needed",
    ["distance", "mileage"]
  );

  const tripResults = useMemo(() => {
    const distance = parseFloat(tripState.values.distance) || 0;
    const mileage = parseFloat(tripState.values.mileage) || 0;
    const fuelPrice = parseFloat(tripState.values.fuelPrice) || 0;

    if (distance <= 0 || mileage <= 0 || fuelPrice <= 0) return null;

    const totalFuel = distance / mileage;
    const totalCost = totalFuel * fuelPrice;
    const costPerKm = totalCost / distance;

    return { totalFuel, totalCost, costPerKm };
  }, [tripState.values]);

  const mileageResult = useMemo(() => {
    const distance = parseFloat(mileageState.values.distance) || 0;
    const fuelUsed = parseFloat(mileageState.values.fuelUsed) || 0;

    if (distance <= 0 || fuelUsed <= 0) return null;

    return distance / fuelUsed;
  }, [mileageState.values]);

  const fuelNeededResult = useMemo(() => {
    const distance = parseFloat(fuelNeededState.values.distance) || 0;
    const mileage = parseFloat(fuelNeededState.values.mileage) || 0;

    if (distance <= 0 || mileage <= 0) return null;

    return distance / mileage;
  }, [fuelNeededState.values]);

  const currentState = activeTab === "trip-cost" ? tripState : activeTab === "mileage" ? mileageState : fuelNeededState;

  const hasResult = activeTab === "trip-cost"
    ? tripResults !== null
    : activeTab === "mileage"
    ? mileageResult !== null
    : fuelNeededResult !== null;

  const resultText = activeTab === "trip-cost" && tripResults
    ? `Fuel: ${formatNumber(tripResults.totalFuel)} L | Cost: ${formatINR(tripResults.totalCost)} | ${formatINR(tripResults.costPerKm)}/km`
    : activeTab === "mileage" && mileageResult
    ? `Mileage: ${formatNumber(mileageResult)} km/L`
    : activeTab === "fuel-needed" && fuelNeededResult
    ? `Fuel Needed: ${formatNumber(fuelNeededResult)} L`
    : "";

  const faqs = [
    {
      question: "How is fuel cost for a trip calculated?",
      answer: "Fuel cost is calculated by dividing the total distance (km) by your vehicle's mileage (km/L) to get the fuel required, then multiplying by the fuel price per liter. Formula: Cost = (Distance / Mileage) x Fuel Price.",
    },
    {
      question: "What is a good mileage for a car in India?",
      answer: "In India, a petrol car with 15-20 km/L is considered good mileage. Diesel cars typically offer 18-25 km/L. Hatchbacks and sedans generally have better mileage than SUVs.",
    },
    {
      question: "How can I improve my vehicle's mileage?",
      answer: "Maintain proper tire pressure, avoid sudden acceleration and braking, service your vehicle regularly, remove unnecessary weight, use the correct gear, and avoid excessive idling.",
    },
    {
      question: "What is the current fuel price in India?",
      answer: "Fuel prices in India vary by city and change frequently. Petrol typically ranges from &#8377;95-110/L and diesel from &#8377;87-95/L. Check your local fuel station for the latest prices and update the calculator accordingly.",
    },
    {
      question: "Does AC usage affect fuel consumption?",
      answer: "Yes, running AC can reduce mileage by 5-15% depending on the vehicle and conditions. At highway speeds above 80 km/h, AC may be more fuel-efficient than open windows due to reduced aerodynamic drag.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Fuel Cost & Mileage Calculator - Calculate 360"
        description="Calculate trip fuel cost, vehicle mileage, and fuel needed for any distance. Get cost per km and optimize your travel expenses."
        path="/fuel-cost"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                Fuel Cost & Mileage Calculator
              </h1>
              <p className="text-lg text-muted-foreground">
                Calculate trip fuel costs, check your vehicle's mileage, or find out how much fuel you need for a journey.
              </p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-slate-100/50 rounded-xl gap-1">
                  <TabsTrigger
                    value="trip-cost"
                    className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    data-testid="tab-trip-cost"
                  >
                    Trip Cost
                  </TabsTrigger>
                  <TabsTrigger
                    value="mileage"
                    className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    data-testid="tab-mileage"
                  >
                    Mileage
                  </TabsTrigger>
                  <TabsTrigger
                    value="fuel-needed"
                    className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    data-testid="tab-fuel-needed"
                  >
                    Fuel Needed
                  </TabsTrigger>
                </TabsList>

                <div className="p-6 md:p-8">
                  <TabsContent value="trip-cost" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="mb-2 block">Distance (km)</Label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={tripState.values.distance}
                          onChange={(e) => tripState.setValue("distance", e.target.value)}
                          className="input-field"
                          data-testid="input-trip-distance"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Mileage (km/L)</Label>
                        <Input
                          type="number"
                          placeholder="15"
                          value={tripState.values.mileage}
                          onChange={(e) => tripState.setValue("mileage", e.target.value)}
                          className="input-field"
                          data-testid="input-trip-mileage"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Fuel Price (&#8377;/L)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">&#8377;</span>
                          <Input
                            type="number"
                            placeholder="105"
                            value={tripState.values.fuelPrice}
                            onChange={(e) => tripState.setValue("fuelPrice", e.target.value)}
                            className="input-field pl-7"
                            data-testid="input-trip-fuel-price"
                          />
                        </div>
                      </div>
                    </div>

                    <RememberInputs checked={tripState.remember} onChange={tripState.setRemember} />

                    <div className="mt-8 pt-8 border-t border-dashed border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Fuel</div>
                          <div className="text-xl font-bold text-primary" data-testid="text-trip-fuel">
                            {tripResults ? `${formatNumber(tripResults.totalFuel)} L` : "—"}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Cost</div>
                          <div className="text-xl font-bold text-primary" data-testid="text-trip-cost">
                            {tripResults ? formatINR(tripResults.totalCost) : "—"}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cost per km</div>
                          <div className="text-xl font-bold text-primary" data-testid="text-trip-cost-per-km">
                            {tripResults ? formatINR(tripResults.costPerKm) : "—"}
                          </div>
                        </div>
                      </div>

                      <ShareCopyButtons
                        resultText={resultText}
                        shareParams={tripState.values}
                        onReset={tripState.resetAll}
                        hasResult={tripResults !== null}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="mileage" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Distance Travelled (km)</Label>
                        <Input
                          type="number"
                          placeholder="300"
                          value={mileageState.values.distance}
                          onChange={(e) => mileageState.setValue("distance", e.target.value)}
                          className="input-field"
                          data-testid="input-mileage-distance"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Fuel Used (L)</Label>
                        <Input
                          type="number"
                          placeholder="20"
                          value={mileageState.values.fuelUsed}
                          onChange={(e) => mileageState.setValue("fuelUsed", e.target.value)}
                          className="input-field"
                          data-testid="input-mileage-fuel-used"
                        />
                      </div>
                    </div>

                    <RememberInputs checked={mileageState.remember} onChange={mileageState.setRemember} />

                    <div className="mt-8 pt-8 border-t border-dashed border-border">
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
                          Your Mileage
                        </span>
                        <div className="text-4xl sm:text-5xl font-display font-bold text-primary mb-2" data-testid="text-mileage-result">
                          {mileageResult !== null ? `${formatNumber(mileageResult)} km/L` : "—"}
                        </div>
                      </div>

                      <ShareCopyButtons
                        resultText={resultText}
                        shareParams={mileageState.values}
                        onReset={mileageState.resetAll}
                        hasResult={mileageResult !== null}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="fuel-needed" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Distance (km)</Label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={fuelNeededState.values.distance}
                          onChange={(e) => fuelNeededState.setValue("distance", e.target.value)}
                          className="input-field"
                          data-testid="input-fuel-needed-distance"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Mileage (km/L)</Label>
                        <Input
                          type="number"
                          placeholder="15"
                          value={fuelNeededState.values.mileage}
                          onChange={(e) => fuelNeededState.setValue("mileage", e.target.value)}
                          className="input-field"
                          data-testid="input-fuel-needed-mileage"
                        />
                      </div>
                    </div>

                    <RememberInputs checked={fuelNeededState.remember} onChange={fuelNeededState.setRemember} />

                    <div className="mt-8 pt-8 border-t border-dashed border-border">
                      <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
                          Fuel Needed
                        </span>
                        <div className="text-4xl sm:text-5xl font-display font-bold text-primary mb-2" data-testid="text-fuel-needed-result">
                          {fuelNeededResult !== null ? `${formatNumber(fuelNeededResult)} L` : "—"}
                        </div>
                      </div>

                      <ShareCopyButtons
                        resultText={resultText}
                        shareParams={fuelNeededState.values}
                        onReset={fuelNeededState.resetAll}
                        hasResult={fuelNeededResult !== null}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <FAQSection title="Frequently Asked Questions" items={faqs} />
          </div>

          <aside className="space-y-8">
            <AdSlot position="sidebar" />
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Fuel className="w-5 h-5 text-primary" />
                Quick Reference
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Petrol hatchback: 15-22 km/L
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Diesel sedan: 18-25 km/L
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  SUV (petrol): 10-15 km/L
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">&#8226;</span>
                  Two-wheeler: 40-65 km/L
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
