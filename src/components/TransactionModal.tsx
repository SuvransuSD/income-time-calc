"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Minus, Check } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

export default function TransactionModal({ open, onOpenChange, onSuccess, stableExpenses = [] }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    type: "EXPENSE", // INCOME or EXPENSE
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  const toggleExpense = (id: string) => {
    if (selectedExpenses.includes(id)) {
      setSelectedExpenses(selectedExpenses.filter(e => e !== id));
    } else {
      setSelectedExpenses([...selectedExpenses, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("timecalc_token");
      
      // 1. Post the main transaction
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to add transaction");

      // 2. Post selected stable expenses as EXPENSE transactions
      if (formData.type === 'INCOME' && selectedExpenses.length > 0) {
        // Find the expenses details
        const expensesToProcess = stableExpenses.filter((e: any) => selectedExpenses.includes(e.id));
        
        for (const exp of expensesToProcess) {
           await fetch("/api/transactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
               amount: exp.amount,
               type: "EXPENSE",
               category: "Stable Expense", // Or exp.name
               description: `Auto-processed: ${exp.name}`,
               date: formData.date
            }),
          });
        }
      }

      setFormData({
        amount: "",
        type: "EXPENSE",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedExpenses([]);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("Error adding transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] p-8 bg-white dark:bg-slate-900 max-w-lg border-none max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-slate-950 dark:text-white text-2xl font-bold mb-2">Add Transaction</DialogTitle>
          <p className="text-slate-500 text-sm">Add your income or expenses here.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'INCOME' })}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                formData.type === 'INCOME' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" /> Income
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                formData.type === 'EXPENSE' ? 'bg-red-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Minus className="w-4 h-4" /> Expense
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="dark:text-slate-200 ml-1">Amount (₹)</Label>
              <Input
                id="amount"
                required
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="dark:text-slate-200 ml-1">Date</Label>
              <Input
                id="date"
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12 dark:text-white"
              />
            </div>
          </div>

          {/* Stable Expenses Selection */}
          {formData.type === 'INCOME' && stableExpenses.length > 0 && (
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                   Process Stable Expenses
                </Label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                   {stableExpenses.map((exp: any) => (
                      <div key={exp.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
                         <Checkbox 
                            id={exp.id} 
                            checked={selectedExpenses.includes(exp.id)}
                            onCheckedChange={() => toggleExpense(exp.id)}
                         />
                         <label
                            htmlFor={exp.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-200 flex-1 flex justify-between cursor-pointer"
                          >
                            <span>{exp.name}</span>
                            <span className="text-slate-500">₹{exp.amount}</span>
                          </label>
                      </div>
                   ))}
                </div>
                {selectedExpenses.length > 0 && (
                   <p className="text-xs text-emerald-600 mt-2 font-bold text-right">
                      Total Deductions: ₹{stableExpenses
                        .filter((e:any) => selectedExpenses.includes(e.id))
                        .reduce((acc: number, curr: any) => acc + curr.amount, 0)
                        .toLocaleString()
                      }
                   </p>
                )}
             </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category" className="dark:text-slate-200 ml-1">Category</Label>
            <Input
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12 dark:text-white"
              placeholder="e.g. Salary, Rent, Food, Travel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-slate-200 ml-1">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-12 dark:text-white"
              placeholder="What was this for?"
            />
          </div>

          <DialogFooter className="gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-2xl h-12 bg-slate-100 dark:bg-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border-none"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              className={`flex-1 rounded-2xl h-12 shadow-lg transition-all border-none ${
                formData.type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
