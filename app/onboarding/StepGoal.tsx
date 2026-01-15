import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StepGoal({ next, prev, updateField, data }: any) {
  return (
    <div className="animate-in">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 mx-auto">
        <Target className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-2 text-center text-slate-800 dark:text-white">Saving Goals</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400 text-center">Why do you want to calculate your time cost? Is there something you're eyeing?</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 ml-1 text-slate-700 dark:text-slate-300">Your Motivation</label>
          <textarea
            value={data.savingReason}
            onChange={(e) => updateField("savingReason", e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg text-slate-800 dark:text-white placeholder:text-slate-400 min-h-[120px]"
            placeholder="Example: I want to keep track of my luxury spends or buy a new laptop..."
          />
        </div>

        <div className="flex gap-4">
          <Button onClick={prev} variant="secondary" className="flex-1 py-6 rounded-2xl">
            Back
          </Button>
          <Button
            onClick={next}
            className="flex-[2] py-6 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            I'm Ready
          </Button>
        </div>
      </div>
    </div>
  );
}
