import Link from "next/link";
import { ArrowRight, Clock, IndianRupee, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          TimeValue
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-8 border border-blue-500/20 animate-in">
          <Clock className="w-4 h-4" />
          <span>Understand your time's value</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent animate-in" style={{ animationDelay: '0.1s' }}>
          Don't just spend money.<br />Spend your <span className="text-blue-600">time</span> wisely.
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 animate-in" style={{ animationDelay: '0.2s' }}>
          Calculate exactly how many hours of hard work that next purchase will cost you. 
          Perspective is the best way to save.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-in" style={{ animationDelay: '0.3s' }}>
          <Button asChild size="lg" className="rounded-2xl px-10 h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/register">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-2xl px-10 h-14 text-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <Link href="/login">
              Login
            </Link>
          </Button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full animate-in" style={{ animationDelay: '0.4s' }}>
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm border-none">
            <CardContent className="p-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-4">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Income Mapping</h3>
              <p className="text-slate-600 dark:text-slate-400">Map your salary to your actual work hours to find your hourly rate.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm border-none">
            <CardContent className="p-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Time Cost</h3>
              <p className="text-slate-600 dark:text-slate-400">See prices as hours and days. A ₹50,000 phone isn't just money, it's weeks of life.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm border-none">
            <CardContent className="p-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Smart Savings</h3>
              <p className="text-slate-600 dark:text-slate-400">Make better financial decisions by understanding the effort behind every rupee.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
