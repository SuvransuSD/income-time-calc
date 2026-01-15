import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StepName({ next, updateField, data }: any) {
  return (
    <div className="animate-in">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 mx-auto">
        <User className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold mb-2 text-center text-slate-800 dark:text-white">Welcome aboard!</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400 text-center">To get started, let's learn a bit about you. What should we call you?</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 ml-1 text-slate-700 dark:text-slate-300">Your Name</label>
          <Input
            autoFocus
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="rounded-2xl px-4 py-6 text-lg"
            placeholder="e.g. John Doe"
          />
        </div>

        <Button
          disabled={!data.name.trim()}
          onClick={next}
          className="w-full font-semibold py-6 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-[0.98]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
