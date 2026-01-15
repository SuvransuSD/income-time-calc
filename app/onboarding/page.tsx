"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StepName from "./StepName";
import StepIncome from "./StepIncome";
import StepGoal from "./StepGoal";
import StepComplete from "./StepComplete";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    incomeAmount: "",
    incomeType: "monthly",
    workHoursPerDay: 8,
    savingReason: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("timecalc_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/user", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const user = await res.json();
          setFormData(prev => ({ ...prev, name: user.name }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  const updateField = (field: string, value: any) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  if (loading) {
     return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
           {/* <Loader2 className="w-10 h-10 text-blue-600 animate-spin" /> */}
        </div>
     )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl shadow-blue-500/10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 overflow-hidden relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
           <div 
             className="h-full bg-blue-600 transition-all duration-500 ease-out" 
             style={{ width: `${(step / 3) * 100}%` }}
           ></div>
        </div>

        <div className="mt-4">
          {step === 1 && <StepIncome next={next} updateField={updateField} data={formData} />}
          {step === 2 && <StepGoal next={next} prev={prev} updateField={updateField} data={formData} />}
          {step === 3 && <StepComplete data={formData} />}
        </div>
      </div>
    </div>
  );
}

