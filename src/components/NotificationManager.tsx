"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  X, 
  Quote, 
  ChevronRight,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const MOTIVATIONAL_QUOTES = [
   "Do not save what is left after spending, but spend what is left after saving. – Warren Buffett",
   "A penny saved is a penny earned. – Benjamin Franklin",
   "Financial freedom is available to all those who learn about it and work for it. – Robert Kiyosaki",
   "The habit of saving is itself an education. – T.T. Munger",
   "Never spend your money before you have it. – Thomas Jefferson",
   "Compound interest is the eighth wonder of the world. – Einstein",
   "You must gain control over your money, or the lack of it will forever control you. – Dave Ramsey",
   "If you're saving, you're succeeding. – Steve Burkholder",
   "It's not your salary that makes you rich, it's your spending habits.",
   "Beware of little expenses; a small leak will sink a great ship. – Benjamin Franklin"
];

export function NotificationManager({ goals, currentPurse }: { goals: any[], currentPurse: number }) {
   const [activeNotification, setActiveNotification] = useState<any>(null);
   const [quote, setQuote] = useState("");

   // Cycle quotes
   useEffect(() => {
      setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
      const interval = setInterval(() => {
         setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
      }, 30000); // New quote every 30s
      return () => clearInterval(interval);
   }, []);

   // Check goals progress
   useEffect(() => {
      if (!goals || goals.length === 0) return;

      const checkProgress = () => {
         const closestGoal = goals
            .filter((g: any) => currentPurse < g.itemCost) // Only unachieved
            .sort((a: any, b: any) => (a.itemCost - currentPurse) - (b.itemCost - currentPurse))[0];

         if (closestGoal) {
            const progress = (currentPurse / closestGoal.itemCost) * 100;
            if (progress > 50 && progress < 100) {
               setActiveNotification({
                  type: 'progress',
                  title: 'Keep Going!',
                  message: `You are ${progress.toFixed(0)}% of the way to ${closestGoal.itemName}! Just ₹${(closestGoal.itemCost - currentPurse).toLocaleString()} to go.`,
                  goalId: closestGoal.id
               });
               // Auto dismiss after 8s
               setTimeout(() => setActiveNotification(null), 8000);
            }
         }
      };

      // Check initially and then every 2 minutes
      const timeout = setTimeout(checkProgress, 5000); 
      const interval = setInterval(checkProgress, 120000); 
      
      return () => {
         clearTimeout(timeout);
         clearInterval(interval);
      };
   }, [goals, currentPurse]);

   return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
         {/* Quote Widget - Always Visible */}
         <Card className="pointer-events-auto w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-right-10 rounded-2xl">
            <CardContent className="p-4 relative">
               <div className="absolute -top-3 -left-3 bg-blue-600 rounded-full p-2 text-white shadow-lg">
                  <Quote className="w-4 h-4" />
               </div>
               <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic pt-2">
                  "{quote}"
               </p>
            </CardContent>
         </Card>

         {/* Progress Notification */}
         {activeNotification && (
            <div className="pointer-events-auto w-80 bg-emerald-600 text-white rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-10 fade-in duration-300 flex gap-3 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20 rounded-full" onClick={() => setActiveNotification(null)}>
                     <X className="w-4 h-4" />
                  </Button>
               </div>
               <div className="bg-white/20 p-3 rounded-xl h-fit">
                  <Target className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="font-bold text-sm mb-1">{activeNotification.title}</h4>
                  <p className="text-xs text-white/90 leading-relaxed">
                     {activeNotification.message}
                  </p>
               </div>
            </div>
         )}
      </div>
   );
}
