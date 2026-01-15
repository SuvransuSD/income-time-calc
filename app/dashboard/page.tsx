"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Clock, 
  IndianRupee, 
  TrendingUp, 
  LogOut,
  History,
  Calculator,
  Loader2,
  Wallet,
  CheckCircle2,
  Target,
  User,
  Trash2,
  RotateCcw,
  XCircle,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { GoalDeleteDialog } from "@/components/GoalDeleteDialog";
import GoalEditModal from "@/components/GoalEditModal";
import TransactionModal from "@/components/TransactionModal";
import ProfileModal from "@/components/ProfileModal";
import { SpendingAreaChart, CategoryPieChart } from "@/components/SpendingCharts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationManager } from "@/components/NotificationManager";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Goals
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");

  // Transaction Summary State
  const [summary, setSummary] = useState<any>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [stableExpenses, setStableExpenses] = useState<any[]>([]);

  // Investment State
  const [investments, setInvestments] = useState<any[]>([]);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [investAmount, setInvestAmount] = useState("");
  const [investReturn, setInvestReturn] = useState("");
  const [investInstrument, setInvestInstrument] = useState("");

  // Trash State
  const [showTrash, setShowTrash] = useState(false);
  const [deletedGoals, setDeletedGoals] = useState<any[]>([]);

  const fetchUserData = async () => {
    const token = localStorage.getItem("timecalc_token");
    if (!token) {
      router.push("/login"); // Initial check can still redirect to login if no token
      return;
    }

    try {
      // Fetch User & Active Goals
      const res = await fetch(`/api/user`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data || data.error) {
        if (res.status === 401) {
          localStorage.removeItem("timecalc_token");
          router.push("/login");
        } else {
          router.push("/onboarding");
        }
        return;
      }
      setUser(data);

      // Fetch Stable Expenses
      const expRes = await fetch("/api/user/stable-expenses", {
         headers: { "Authorization": `Bearer ${token}` }
      });
      if (expRes.ok) {
         setStableExpenses(await expRes.json());
      }

      // Fetch Investments
      const investRes = await fetch("/api/investment", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const investData = await investRes.json();
      if (investRes.ok) {
        setInvestments(investData);
      }

      // Fetch Transaction Summary
      const summaryRes = await fetch("/api/transactions/summary", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // Fetch Deleted Goals
      const trashRes = await fetch("/api/goal?deleted=true", {
         headers: { "Authorization": `Bearer ${token}` }
      });
      if (trashRes.ok) {
         setDeletedGoals(await trashRes.json());
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemCost) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("timecalc_token");
      const res = await fetch("/api/goal", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          itemName,
          itemCost: parseFloat(itemCost)
        }),
      });

      if (!res.ok) throw new Error("Failed to add goal");
      
      setItemName("");
      setItemCost("");
      setShowModal(false);
      fetchUserData(); // Refresh data
    } catch (err) {
      console.error(err);
      alert("Error adding purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit State
  const [editingGoal, setEditingGoal] = useState<any | null>(null);

  // ... (rest of component logic)

  const handleAddInvestment = async (e: React.FormEvent) => {
    if (!investAmount || !investReturn || !investInstrument) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("timecalc_token");
      const res = await fetch("/api/investment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(investAmount),
          expectedReturn: parseFloat(investReturn),
          instrument: investInstrument
        }),
      });

      if (!res.ok) throw new Error("Failed to add investment");
      
      setInvestAmount("");
      setInvestReturn("");
      setInvestInstrument("");
      setShowInvestmentModal(false);
      fetchUserData(); 
    } catch (err) {
      console.error(err);
      alert("Error adding investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete State
  const [deleteData, setDeleteData] = useState<{id: string, permanent: boolean} | null>(null);

  const handleDeleteClick = (id: string, permanent: boolean = false) => {
    setDeleteData({ id, permanent });
  };

  const confirmDelete = async () => {
     if (!deleteData) return;
     const { id, permanent } = deleteData;
     
     try {
       const token = localStorage.getItem("timecalc_token");
       const url = permanent 
         ? `/api/goal/${id}?permanent=true`
         : `/api/goal/${id}`;
         
       const res = await fetch(url, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
       });

       if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error || "Failed");
       }
       fetchUserData();
     } catch (err: any) {
        alert(err.message);
     } finally {
        setDeleteData(null);
     }
  };

  const restoreGoal = async (id: string) => {
     try {
       const token = localStorage.getItem("timecalc_token");
       const res = await fetch(`/api/goal/${id}`, {
          method: "PATCH",
          headers: { 
             "Content-Type": "application/json",
             "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ restore: true })
       });

       if (!res.ok) throw new Error("Failed");
       fetchUserData();
     } catch (err) {
        alert("Failed to restore goal");
     }
  };


  const logout = () => {
    localStorage.removeItem("timecalc_token");
    localStorage.removeItem("timecalc_user_id");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Calculation for Display
  const workDaysPerMonth = 22;
  const workHoursPerDay = user?.workHoursPerDay || 8;
  const workHoursPerMonth = workDaysPerMonth * workHoursPerDay;
  const workHoursPerYear = 12 * workHoursPerMonth;
  let hourlyRate = 0;
  if (user?.incomeType === "monthly") {
    hourlyRate = user.incomeAmount / workHoursPerMonth;
  } else if (user?.incomeAmount) {
    hourlyRate = user.incomeAmount / workHoursPerYear;
  }

  /**
   * Complex Time Cost Projection Logic
   */
  const calculateTimeToAchieveWithRaise = (goalCost: number) => {
    const currentPurse = summary?.purse || 0;
    let remaining = goalCost - currentPurse;
    
    if (remaining <= 0) return { months: 0, text: "Ready!" };

    // Base Monthly Income from Onboarding
    let monthlyIncome = user.incomeType === 'monthly' 
      ? user.incomeAmount 
      : (user.incomeAmount / 12);
    
    const currentMonthlySavings = summary?.rollingSavings || 0;
    const derivedExpenses = Math.max(0, monthlyIncome - currentMonthlySavings);

    let months = 0;
    let projectionIncome = monthlyIncome;
    let projectionSavings = currentMonthlySavings;

    // Safety limit of 30 years to prevent inf loops
    while (remaining > 0 && months < 360) {
      months++;
      remaining -= projectionSavings;

      // Apply 30% raise every 12 months
      if (months % 12 === 0) {
        projectionIncome *= 1.30;
        // Savings increase because income increases while expenses stay flat
        projectionSavings = projectionIncome - derivedExpenses;
      }
    }

    if (months < 1) return { months, text: "~Days" };
    if (months >= 360) return { months, text: "Long Term" };
    
    return { months, text: `${months} Months` };
  };

  return (
    <div className="w-full min-h-screen px-4 py-8 md:px-8 lg:px-12 md:py-12">
      <TransactionModal 
        open={showTransactionModal} 
        onOpenChange={setShowTransactionModal} 
        onSuccess={fetchUserData} 
        stableExpenses={stableExpenses}
      />

      <ProfileModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal} 
        user={user} 
        stableExpenses={stableExpenses}
        onSuccess={fetchUserData} 
      />

      <NotificationManager 
         goals={user?.goals} 
         currentPurse={summary?.purse || 0} 
      />

      <GoalDeleteDialog
         open={!!deleteData}
         onOpenChange={(open) => !open && setDeleteData(null)}
         onConfirm={confirmDelete}
         isPermanent={deleteData?.permanent}
      />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {user?.name}! 🚀
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Current work schedule: {user?.workHoursPerDay}h / day • {user?.incomeType} income
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <ThemeToggle />
          <Button
            onClick={() => setShowProfileModal(true)}
            variant="outline"
            size="icon"
            className="rounded-2xl h-12 w-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            onClick={() => setShowTransactionModal(true)}
            variant="outline"
            className="rounded-2xl px-6 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200 font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Spending
          </Button>
          <Button 
            onClick={() => setShowInvestmentModal(true)}
            variant="outline"
            className="rounded-2xl px-6 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200 font-bold"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Invest
          </Button>
          <Button 
            onClick={() => setShowModal(true)}
            className="rounded-2xl px-6 h-12 shadow-lg shadow-blue-600/20 active:scale-95 bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            <Calculator className="w-5 h-5 mr-2" />
            Time Cost
          </Button>
          <Button 
            onClick={logout}
            variant="outline"
            className="rounded-2xl h-12 w-12 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl overflow-hidden pt-4">
          <CardContent className="p-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Your Hourly Rate</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              ₹{hourlyRate.toFixed(2)}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl overflow-hidden pt-4">
          <CardContent className="p-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Savings (Purse)</p>
            <h2 className={`text-3xl font-bold ${summary?.purse >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              ₹{summary?.purse?.toLocaleString() || 0}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl overflow-hidden pt-4">
          <CardContent className="p-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-4">
              <IndianRupee className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Monthly Balance</p>
            <h2 className={`text-3xl font-bold ${summary?.balance >= 0 ? 'text-amber-600' : 'text-red-500'}`}>
              ₹{summary?.balance?.toLocaleString() || 0}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl overflow-hidden pt-4">
          <CardContent className="p-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 mb-4">
              <Calculator className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Purchases Tracked</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {user?.goals?.length || 0}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 dark:text-white">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Monthly Spending Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingAreaChart data={summary?.dailyData} />
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-slate-900 p-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 dark:text-white">
              <Plus className="w-5 h-5 text-purple-500" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={summary?.categoryData} />
          </CardContent>
        </Card>
      </div>


      {/* Investments Section */}
      <div className="mb-12">
         <div className="flex items-center gap-2 mb-6 ml-2">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            <h3 className="text-xl font-bold dark:text-white">Investment Portfolio</h3>
         </div>

         {!investments.length ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-slate-500">Start investing to see your money grow!</p>
              <Button variant="link" onClick={() => setShowInvestmentModal(true)}>Add your first investment</Button>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments.map((inv) => {
                 const growth1Yr = inv.amount * Math.pow(1 + inv.expectedReturn / 100, 1);
                 const growth5Yr = inv.amount * Math.pow(1 + inv.expectedReturn / 100, 5);
                 const growth10Yr = inv.amount * Math.pow(1 + inv.expectedReturn / 100, 10);

                 return (
                   <Card key={inv.id} className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl overflow-hidden">
                     <CardHeader className="pb-2">
                       <div className="flex justify-between items-start">
                         <div>
                           <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">{inv.instrument}</p>
                           <CardTitle className="text-2xl font-bold dark:text-white flex items-center">
                             <IndianRupee className="w-5 h-5 text-slate-400 mr-1" />
                             {inv.amount.toLocaleString()}
                           </CardTitle>
                         </div>
                         <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                           {inv.expectedReturn}% Return
                         </div>
                       </div>
                     </CardHeader>
                     <CardContent>
                       <div className="space-y-3 mt-4">
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500">1 Year</span>
                           <span className="font-bold dark:text-slate-200">₹{Math.round(growth1Yr).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500">5 Years</span>
                           <span className="font-bold text-emerald-600">₹{Math.round(growth5Yr).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500">10 Years</span>
                           <span className="font-bold text-blue-600">₹{Math.round(growth10Yr).toLocaleString()}</span>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 );
              })}
            </div>
         )}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* History List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6 ml-2">
            <div className="flex items-center gap-2">
               <History className="w-5 h-5 text-slate-400" />
               <h3 className="text-xl font-bold dark:text-white">{showTrash ? "Trash Bin" : "Calculation History"}</h3>
            </div>
            <Button 
               variant="ghost" 
               size="sm"
               onClick={() => setShowTrash(!showTrash)}
               className={`gap-2 ${showTrash ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
               {showTrash ? "Back to Goals" : <><Trash2 className="w-4 h-4" /> Trash Bin</>}
            </Button>
          </div>
          
          <div className="space-y-4">
             {showTrash ? (
                // Trash View
                deletedGoals.length === 0 ? (
                   <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                     <p className="text-slate-500">Trash is empty.</p>
                   </div>
                ) : (
                   deletedGoals.map((goal: any) => (
                      <Card key={goal.id} className="rounded-3xl border-none shadow-sm bg-slate-100/50 dark:bg-slate-900/50 opacity-75 hover:opacity-100 transition-all">
                         <CardContent className="p-6 flex items-center justify-between">
                            <div>
                               <h4 className="font-bold text-lg dark:text-white line-through text-slate-500">{goal.itemName}</h4>
                               <p className="text-slate-500 text-sm">₹{goal.itemCost.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                               <Button size="sm" variant="outline" onClick={() => restoreGoal(goal.id)} className="gap-2">
                                  <RotateCcw className="w-4 h-4"/> Restore
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="destructive" 
                                 onClick={() => handleDeleteClick(goal.id, true)} 
                                 className="gap-2"
                              >
                                  <XCircle className="w-4 h-4"/> Delete
                               </Button>
                            </div>
                         </CardContent>
                      </Card>
                   ))
                )
             ) : (
                // Active Goals View
                !user?.goals || user.goals.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                    <p className="text-slate-500">No purchases calculated yet. Try adding one!</p>
                  </div>
                ) : (
                  user.goals.map((goal: any) => {
                    const currentPurse = summary?.purse || 0;
                    const progress = Math.min(Math.max((currentPurse / goal.itemCost) * 100, 0), 100);
                    const isAchievable = currentPurse >= goal.itemCost;
                    const projection = calculateTimeToAchieveWithRaise(goal.itemCost);
                    
                    return (
                      <Card key={goal.id} className="rounded-3xl border-none shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden hover:bg-white dark:hover:bg-slate-900 transition-all border border-transparent hover:border-blue-500/20 group/card">
                        <CardContent className="p-6 flex flex-col gap-6 animate-in">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <h4 className="font-bold text-lg dark:text-white">{goal.itemName}</h4>
                                {isAchievable && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              </div>
                              <p className="text-slate-500 text-sm flex items-center gap-1 font-medium">
                                <IndianRupee className="w-3.5 h-3.5" /> 
                                {goal.itemCost.toLocaleString()}
                              </p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700">
                                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Hours</p>
                                  <p className="font-bold text-blue-600">{goal.hoursRequired.toFixed(1)}h</p>
                                </div>
                                <div className="text-center px-4">
                                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Work Days</p>
                                  <p className="font-bold text-emerald-600">{goal.daysRequired.toFixed(1)}d</p>
                                </div>
                              </div>

                              <div className={`p-4 rounded-2xl min-w-[140px] text-center border transition-all ${
                                isAchievable 
                                  ? 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/50' 
                                  : 'bg-blue-600/5 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/50 relative overflow-hidden group'
                              }`}>
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <p className={`text-[10px] uppercase tracking-wider font-bold ${
                                    isAchievable ? 'text-emerald-600' : 'text-blue-600 dark:text-blue-400'
                                  }`}>
                                    {isAchievable ? 'Status' : 'Projected Wait'}
                                  </p>
                                </div>
                                
                                <p className={`font-bold ${isAchievable ? 'text-emerald-600' : 'text-blue-600 dark:text-blue-400'}`}>
                                  {projection.text}
                                </p>
                              </div>

                              <Button 
                                 size="icon" 
                                 variant="ghost" 
                                 onClick={() => handleDeleteClick(goal.id)}
                                 className="opacity-0 group-hover/card:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>


                          {/* Progress Bar Container */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                              <div className="flex items-center gap-2">
                                 <span className="text-slate-500">Savings Progress</span>
                                 <span className={`px-2 py-0.5 rounded-full text-[10px] ${isAchievable ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                   ₹{currentPurse.toLocaleString()} / ₹{goal.itemCost.toLocaleString()}
                                 </span>
                              </div>
                              <span className={isAchievable ? 'text-emerald-600' : 'text-blue-600'}>{progress.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)] ${
                                  isAchievable ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )
             )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-blue-600 text-white shadow-xl shadow-blue-600/20 border-none rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Growth Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-blue-100 leading-relaxed text-sm">
                Our projections now include a <span className="font-bold text-white">30% annual salary raise</span>. We assume you'll keep your expenses steady and put your extra earnings toward your goals.
              </p>
              <div className="mt-6 pt-6 border-t border-blue-500/50 text-left">
                <p className="text-xs font-medium text-blue-200 mb-2 uppercase tracking-widest">Calculated Motivation:</p>
                <p className="italic font-serif text-lg">
                  "{user?.savingReason || 'Perspective is the best way to save.'}"
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-none shadow-sm rounded-3xl p-6">
             <h3 className="font-bold text-sm mb-4 text-slate-500 uppercase tracking-wider">How we calculate</h3>
             <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                   <p className="text-slate-600 dark:text-slate-400">Time to reach is based on your <span className="font-bold dark:text-white">rolling 30-day savings</span>.</p>
                </li>
                <li className="flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                   <p className="text-slate-600 dark:text-slate-400">A <span className="font-bold dark:text-white">30% increment</span> is applied to your income every 12 months.</p>
                </li>
                <li className="flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                   <p className="text-slate-600 dark:text-slate-400">Expenses are assumed to remain <span className="font-bold dark:text-white">constant</span> to maximize savings.</p>
                </li>
             </ul>
          </Card>
        </div>
      </div>

      {/* Modal - Shadcn Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-[2rem] p-8 bg-white dark:bg-slate-900 max-w-lg border-none">
          <DialogHeader>
            <DialogTitle className="text-slate-950 dark:text-white text-2xl font-bold mb-2">Calculate New Item</DialogTitle>
            <p className="text-slate-500 text-sm">Input the details of something you want to buy.</p>
          </DialogHeader>
          
          <form onSubmit={handleAddGoal} className="space-y-6 pt-4">
            <div>
              <label className="text-slate-950 dark:text-slate-200 block text-sm font-medium mb-1 ml-1">Item Name</label>
              <Input 
                autoFocus
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="dark:text-white py-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4"
                placeholder="e.g. New iPhone, Shoes, Coffee"
              />
            </div>
            
            <div>
              <label className="text-slate-950 dark:text-slate-200 block text-sm font-medium mb-1 ml-1">Cost (₹)</label>
              <div className="relative">
                <Input 
                  required
                  type="number"
                  value={itemCost}
                  onChange={(e) => setItemCost(e.target.value)}
                  className="dark:text-white pl-10 pr-4 py-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none"
                  placeholder="0.00"
                />
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <DialogFooter className="gap-4 pt-4 sm:flex-row flex-row">
              <Button 
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-2xl py-6 bg-slate-100 dark:bg-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border-none"
              >
                Cancel
              </Button>
              <Button 
                disabled={isSubmitting}
                className="flex-[2] rounded-2xl py-6 shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all border-none"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "See Time Cost"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Investment Modal */}
      <Dialog open={showInvestmentModal} onOpenChange={setShowInvestmentModal}>
        <DialogContent className="rounded-[2rem] p-8 bg-white dark:bg-slate-900 max-w-lg border-none">
          <DialogHeader>
            <DialogTitle className="text-slate-950 dark:text-white text-2xl font-bold mb-2">Add Investment</DialogTitle>
            <p className="text-slate-500 text-sm">Track your assets and see them grow over time.</p>
          </DialogHeader>
          
          <form onSubmit={handleAddInvestment} className="space-y-6 pt-4">
            <div>
              <label className="text-slate-950 dark:text-slate-200 block text-sm font-medium mb-1 ml-1">Instrument Type</label>
              <Input 
                autoFocus
                required
                value={investInstrument}
                onChange={(e) => setInvestInstrument(e.target.value)}
                className="dark:text-white py-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4"
                placeholder="e.g. Mutual Fund, Stocks, Gold"
              />
            </div>

            <div>
              <label className="text-slate-950 dark:text-slate-200 block text-sm font-medium mb-1 ml-1">Invested Amount (₹)</label>
              <div className="relative">
                <Input 
                  required
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="dark:text-white pl-10 pr-4 py-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none"
                  placeholder="0.00"
                />
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-slate-950 dark:text-slate-200 block text-sm font-medium mb-1 ml-1">Expected Annual Return (%)</label>
              <Input 
                required
                type="number"
                value={investReturn}
                onChange={(e) => setInvestReturn(e.target.value)}
                className="dark:text-white py-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4"
                placeholder="e.g. 12"
              />
            </div>

            <DialogFooter className="gap-4 pt-4 sm:flex-row flex-row">
              <Button 
                type="button"
                variant="secondary"
                onClick={() => setShowInvestmentModal(false)}
                className="flex-1 rounded-2xl py-6 bg-slate-100 dark:bg-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border-none"
              >
                Cancel
              </Button>
              <Button 
                disabled={isSubmitting}
                className="flex-[2] rounded-2xl py-6 shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all border-none"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Growing"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
