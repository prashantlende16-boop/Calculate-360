import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { FAQSection } from "@/components/FAQSection";
import { PageHead } from "@/components/PageHead";
import { ShareCopyButtons } from "@/components/ShareCopyButtons";
import { RememberInputs } from "@/components/RememberInputs";
import { formatINR } from "@/lib/calculatorUtils";
import {
  getRememberPref,
  setRememberPref,
  saveToLocalStorage,
  loadFromLocalStorage,
} from "@/lib/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Users, Receipt } from "lucide-react";

interface Expense {
  id: string;
  payer: string;
  amount: string;
  description: string;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface PersonSummary {
  name: string;
  paid: number;
  share: number;
  net: number;
}

const STORAGE_KEY = "trip-splitter";

export default function TripSplitter() {
  const [remember, setRememberState] = useState(() => getRememberPref(STORAGE_KEY));
  const [participants, setParticipants] = useState<string[]>(() => {
    if (getRememberPref(STORAGE_KEY)) {
      const saved = loadFromLocalStorage(STORAGE_KEY);
      if (saved?.participants) {
        try { return JSON.parse(saved.participants); } catch { /* ignore */ }
      }
    }
    return [""];
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (getRememberPref(STORAGE_KEY)) {
      const saved = loadFromLocalStorage(STORAGE_KEY);
      if (saved?.expenses) {
        try { return JSON.parse(saved.expenses); } catch { /* ignore */ }
      }
    }
    return [];
  });
  const [newParticipant, setNewParticipant] = useState("");

  const setRemember = useCallback((val: boolean) => {
    setRememberPref(STORAGE_KEY, val);
    setRememberState(val);
  }, []);

  useEffect(() => {
    if (remember) {
      saveToLocalStorage(STORAGE_KEY, {
        participants: JSON.stringify(participants),
        expenses: JSON.stringify(expenses),
      });
    }
  }, [participants, expenses, remember]);

  const validParticipants = participants.filter((p) => p.trim() !== "");

  const addParticipant = () => {
    const name = newParticipant.trim();
    if (name && !participants.includes(name)) {
      setParticipants([...participants, name]);
      setNewParticipant("");
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const addExpense = () => {
    setExpenses([
      ...expenses,
      { id: Date.now().toString(), payer: validParticipants[0] || "", amount: "", description: "" },
    ]);
  };

  const updateExpense = (id: string, field: keyof Expense, value: string) => {
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const validExpenses = expenses.filter(
    (e) => e.payer && parseFloat(e.amount) > 0 && validParticipants.includes(e.payer)
  );

  const hasResults = validParticipants.length >= 2 && validExpenses.length > 0;

  const summaries: PersonSummary[] = hasResults
    ? (() => {
        const totalExpenses = validExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
        const perPersonShare = totalExpenses / validParticipants.length;
        return validParticipants.map((name) => {
          const paid = validExpenses
            .filter((e) => e.payer === name)
            .reduce((s, e) => s + parseFloat(e.amount), 0);
          return { name, paid, share: perPersonShare, net: paid - perPersonShare };
        });
      })()
    : [];

  const settlements: Settlement[] = hasResults
    ? (() => {
        const balances = summaries.map((s) => ({ name: s.name, balance: s.net }));
        const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b, balance: -b.balance }));
        const creditors = balances.filter((b) => b.balance > 0).map((b) => ({ ...b }));
        debtors.sort((a, b) => b.balance - a.balance);
        creditors.sort((a, b) => b.balance - a.balance);
        const result: Settlement[] = [];
        let i = 0;
        let j = 0;
        while (i < debtors.length && j < creditors.length) {
          const amount = Math.min(debtors[i].balance, creditors[j].balance);
          if (amount > 0.01) {
            result.push({ from: debtors[i].name, to: creditors[j].name, amount });
          }
          debtors[i].balance -= amount;
          creditors[j].balance -= amount;
          if (debtors[i].balance < 0.01) i++;
          if (creditors[j].balance < 0.01) j++;
        }
        return result;
      })()
    : [];

  const totalSpent = validExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  const resultText = hasResults
    ? settlements.map((s) => `${s.from} owes ${s.to}: ${formatINR(s.amount)}`).join(", ")
    : "";

  const resetAll = () => {
    setParticipants([""]);
    setExpenses([]);
    setNewParticipant("");
  };

  const faqs = [
    {
      question: "How does the trip expense splitter work?",
      answer:
        "Add all participants, then log each expense with who paid. The calculator totals everything, divides equally among all participants, and shows the minimum number of transfers needed to settle up.",
    },
    {
      question: "What does 'minimized settlements' mean?",
      answer:
        "Instead of everyone paying everyone else, the algorithm reduces the number of transactions to the minimum needed. For example, if A owes B and B owes C, A can pay C directly.",
    },
    {
      question: "Can I split expenses unequally?",
      answer:
        "Currently, all expenses are split equally among all participants. For custom splits, you can add separate expense entries with adjusted amounts.",
    },
    {
      question: "Does this work for international trips?",
      answer:
        "This calculator uses Indian Rupees (INR). For international trips, convert all expenses to a single currency before entering them.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navigation />
      <PageHead
        title="Trip Expense Splitter - Calculate 360"
        description="Split trip expenses fairly among friends. Add participants, log expenses, and see who owes whom with minimized settlements."
        path="/trip-splitter"
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <AdSlot position="top" className="mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Trip Expense Splitter
              </h1>
              <p className="text-lg text-muted-foreground">
                Split group expenses fairly and find out who owes whom with minimized settlements.
              </p>
            </header>

            <div className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <RememberInputs checked={remember} onChange={setRemember} />
              </div>

              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-display font-bold text-foreground">Participants</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {validParticipants.map((name, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-medium"
                        data-testid={`participant-tag-${index}`}
                      >
                        {name}
                        <button
                          onClick={() => removeParticipant(participants.indexOf(name))}
                          className="ml-1 text-primary/60 hover:text-primary"
                          data-testid={`button-remove-participant-${index}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter participant name"
                      value={newParticipant}
                      onChange={(e) => setNewParticipant(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                      className="input-field"
                      data-testid="input-participant-name"
                    />
                    <Button onClick={addParticipant} className="gap-2" data-testid="button-add-participant">
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-display font-bold text-foreground">Expenses</h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addExpense}
                      disabled={validParticipants.length === 0}
                      className="gap-2"
                      data-testid="button-add-expense"
                    >
                      <Plus className="w-4 h-4" /> Add Expense
                    </Button>
                  </div>

                  {expenses.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6" data-testid="text-no-expenses">
                      No expenses added yet. Add participants first, then add expenses.
                    </p>
                  )}

                  <div className="space-y-3">
                    {expenses.map((expense, idx) => (
                      <div
                        key={expense.id}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 p-4 bg-muted rounded-lg border border-border"
                        data-testid={`expense-row-${idx}`}
                      >
                        <div>
                          <Label className="mb-1 block text-xs">Paid by</Label>
                          <select
                            value={expense.payer}
                            onChange={(e) => updateExpense(expense.id, "payer", e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid={`select-payer-${idx}`}
                          >
                            <option value="">Select payer</option>
                            {validParticipants.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="mb-1 block text-xs">Amount (&#8377;)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={expense.amount}
                            onChange={(e) => updateExpense(expense.id, "amount", e.target.value)}
                            className="input-field"
                            data-testid={`input-expense-amount-${idx}`}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeExpense(expense.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-remove-expense-${idx}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="border-t border-border pt-6">
                  <h2 className="text-lg font-display font-bold text-foreground mb-4">Results</h2>

                  {!hasResults ? (
                    <p className="text-center text-muted-foreground py-4" data-testid="text-incomplete">
                      &#x2014;
                    </p>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                        <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                        <p className="text-2xl font-display font-bold text-primary" data-testid="text-total-spent">
                          {formatINR(totalSpent)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Per person share: {formatINR(totalSpent / validParticipants.length)}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-3">Summary per Person</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm" data-testid="table-summary">
                            <thead>
                              <tr className="border-b border-border text-left">
                                <th className="py-2 pr-4 font-medium text-muted-foreground">Name</th>
                                <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Paid</th>
                                <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Share</th>
                                <th className="py-2 font-medium text-muted-foreground text-right">Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {summaries.map((s, i) => (
                                <tr key={s.name} className="border-b border-border/50" data-testid={`row-summary-${i}`}>
                                  <td className="py-2 pr-4 font-medium">{s.name}</td>
                                  <td className="py-2 pr-4 text-right">{formatINR(s.paid)}</td>
                                  <td className="py-2 pr-4 text-right">{formatINR(s.share)}</td>
                                  <td
                                    className={`py-2 text-right font-medium ${
                                      s.net > 0 ? "text-green-600" : s.net < 0 ? "text-red-600" : ""
                                    }`}
                                  >
                                    {s.net > 0 ? "+" : ""}
                                    {formatINR(s.net)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-3">Settlements</h3>
                        {settlements.length === 0 ? (
                          <p className="text-sm text-muted-foreground">All settled! No payments needed.</p>
                        ) : (
                          <div className="space-y-2">
                            {settlements.map((s, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100"
                                data-testid={`settlement-${i}`}
                              >
                                <span className="text-sm font-medium text-foreground">
                                  {s.from} pays {s.to}
                                </span>
                                <span className="font-display font-bold text-amber-700">
                                  {formatINR(s.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <ShareCopyButtons
                        resultText={resultText}
                        shareParams={{}}
                        onReset={resetAll}
                        hasResult={hasResults}
                      />
                    </div>
                  )}
                </div>
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
