import { IndianRupee, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StepIncome({ next, prev, updateField, data }: any) {
  return (
    <div className="animate-in">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 mx-auto">
        <IndianRupee className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-2 text-center text-slate-800 dark:text-white">Income Details</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400 text-center">How much do you earn? This helps us calculate your time's true value.</p>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            type="button"
            variant={data.incomeType === 'monthly' ? "default" : "outline"}
            onClick={() => updateField("incomeType", "monthly")}
            className="rounded-xl py-6"
          >
            Monthly
          </Button>
          <Button 
            type="button"
            variant={data.incomeType === 'yearly' ? "default" : "outline"}
            onClick={() => updateField("incomeType", "yearly")}
            className="rounded-xl py-6"
          >
            Yearly
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 ml-1 text-slate-700 dark:text-slate-300">Earnings Amount (₹)</label>
          <div className="relative">
            <Input
              type="number"
              value={data.incomeAmount}
              onChange={(e) => updateField("incomeAmount", e.target.value)}
              className="pl-10 py-6 rounded-2xl text-lg"
              placeholder="0.00"
            />
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 ml-1 text-slate-700 dark:text-slate-300">Daily Work Hours</label>
          <div className="relative">
            <Input
              type="number"
              min="1"
              max="24"
              value={data.workHoursPerDay}
              onChange={(e) => updateField("workHoursPerDay", e.target.value)}
              className="pl-10 py-6 rounded-2xl text-lg"
            />
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <p className="mt-2 text-xs text-slate-500 ml-1">Standard work day is usually 8-9 hours.</p>
        </div>

        <div className="flex gap-4 pt-2">
          {prev && (
            <Button onClick={prev} variant="secondary" className="flex-1 py-6 rounded-2xl">
              Back
            </Button>
          )}
          <Button
            disabled={!data.incomeAmount}
            onClick={next}
            className={`py-6 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-[0.98] ${prev ? 'flex-[2]' : 'w-full'}`}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
