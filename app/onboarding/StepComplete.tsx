"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function StepComplete({ data }: any) {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [error, setError] = useState("");

  useEffect(() => {
    const saveUser = async () => {
      try {
        const token = localStorage.getItem("timecalc_token");
        const res = await fetch("/api/user", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data),
        });


        if (!res.ok) throw new Error("Failed to save user data");
        
        const userData = await res.json();
        // Save userId to localStorage for persistence
        localStorage.setItem("timecalc_user_id", userData.id);
        
        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err: any) {
        setStatus("error");
        setError(err.message);
      }
    };

    saveUser();
  }, [data, router]);

  return (
    <div className="text-center py-8">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <h2 className="text-2xl font-bold">Setting up your profile...</h2>
          <p className="text-slate-600">Calculating your time's true value.</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 animate-in">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          <h2 className="text-2xl font-bold text-emerald-600">All set, {data.name}!</h2>
          <p className="text-slate-600">Redirecting you to your dashboard...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 animate-in text-red-600">
          <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
          <p className="text-slate-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
