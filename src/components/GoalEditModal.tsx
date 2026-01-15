"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, IndianRupee } from "lucide-react";

interface GoalEditModalProps {
  goal: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function GoalEditModal({ goal, open, onOpenChange, onSuccess }: GoalEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");

  useEffect(() => {
    if (goal) {
      setItemName(goal.itemName);
      setItemCost(goal.itemCost.toString());
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("timecalc_token");
      const res = await fetch(`/api/goal/${goal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          itemName,
          itemCost: parseFloat(itemCost)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] p-8 bg-white dark:bg-slate-900 border-none max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold dark:text-white">Edit Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <Label className="dark:text-slate-300">Item Name</Label>
            <Input 
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-1 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white px-4"
            />
          </div>
          
          <div>
            <Label className="dark:text-slate-300">Cost (₹)</Label>
            <div className="relative mt-1">
              <Input 
                required
                type="number"
                value={itemCost}
                onChange={(e) => setItemCost(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white"
              />
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl h-12"
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={loading}
                className="flex-[2] rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
