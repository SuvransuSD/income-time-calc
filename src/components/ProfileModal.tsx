import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Lock, Briefcase, Clock, IndianRupee, Eye, EyeOff, Check, X, Wallet, Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  stableExpenses?: any[];
  onSuccess: () => void;
}

export default function ProfileModal({ open, onOpenChange, user, stableExpenses = [], onSuccess }: ProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeType, setIncomeType] = useState("monthly");
  const [workHoursPerDay, setWorkHoursPerDay] = useState("");
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState<boolean | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [showCurrPass, setShowCurrPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  // Expense States
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [addingExpense, setAddingExpense] = useState(false);

  useEffect(() => {
    if (user && open) {
      setName(user.name || "");
      setIncomeAmount(user.incomeAmount?.toString() || "");
      setIncomeType(user.incomeType || "monthly");
      setWorkHoursPerDay(user.workHoursPerDay?.toString() || "8");
      
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangePasswordMode(false);
      setCurrentPasswordValid(null);
      setPasswordsMatch(null);

      // Reset expense fields
      setNewExpenseName("");
      setNewExpenseAmount("");
    }
  }, [user, open]);

  const verifyCurrentPassword = async () => {
    if (!currentPassword) return;
    setVerifyingPassword(true);
    try {
      const token = localStorage.getItem("timecalc_token");
      const res = await fetch("/api/user/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password: currentPassword })
      });
      
      if (res.ok) {
        setCurrentPasswordValid(true);
      } else {
        setCurrentPasswordValid(false);
      }
    } catch (err) {
      console.error(err);
      setCurrentPasswordValid(false);
    } finally {
      setVerifyingPassword(false);
    }
  };

  useEffect(() => {
    if (newPassword && confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (changePasswordMode) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill all password fields");
        setLoading(false);
        return;
      }
      if (newPassword === currentPassword) {
        alert("New password cannot be the same as the current password");
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("New passwords do not match");
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("timecalc_token");
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          incomeAmount,
          incomeType,
          workHoursPerDay,
          currentPassword: changePasswordMode ? currentPassword : undefined,
          newPassword: changePasswordMode ? newPassword : undefined
        })
      });

      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error || "Failed to update profile");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!newExpenseName || !newExpenseAmount) return;
    setAddingExpense(true);
    try {
      const token = localStorage.getItem("timecalc_token");
      const res = await fetch("/api/user/stable-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newExpenseName,
          amount: newExpenseAmount
        })
      });

      if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add expense");
      }
      
      onSuccess(); // Refresh parent
      setNewExpenseName("");
      setNewExpenseAmount("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingExpense(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm("Remove this stable expense?")) return;
    try {
      const token = localStorage.getItem("timecalc_token");
      await fetch(`/api/user/stable-expenses?id=${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      onSuccess();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2rem] p-0 bg-white dark:bg-slate-900 border-none max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 pb-4">
            <DialogHeader>
            <DialogTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <User className="w-6 h-6 text-blue-500" />
                Edit Profile
            </DialogTitle>
            </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">General</TabsTrigger>
                    <TabsTrigger value="work" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Work</TabsTrigger>
                    <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Expenses</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                <div className="space-y-2">
                    <Label className="dark:text-slate-300">Full Name</Label>
                    <div className="relative">
                    <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white"
                        placeholder="Your Name"
                    />
                    <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {!changePasswordMode ? (
                   <Button 
                     type="button" 
                     variant="outline" 
                     onClick={() => setChangePasswordMode(true)}
                     className="w-full h-12 rounded-xl border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-500 dark:hover:text-blue-400"
                   >
                     <Lock className="w-4 h-4 mr-2" />
                     Change Password
                   </Button>
                ) : (
                   <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="dark:text-slate-300 font-bold">Secure Password Change</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setChangePasswordMode(false)}
                          className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                      
                      {/* Password Fields */}
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Current Password</Label>
                        <div className="relative">
                          <Input 
                            type={showCurrPass ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              setCurrentPasswordValid(null); 
                            }}
                            onBlur={verifyCurrentPassword}
                            className={`pl-9 pr-10 h-10 rounded-lg bg-white dark:bg-slate-900 dark:text-white text-sm ${
                              currentPasswordValid === false ? "border-red-500 focus-visible:ring-red-500" : 
                              currentPasswordValid === true ? "border-emerald-500 focus-visible:ring-emerald-500" : 
                              "border-slate-200 dark:border-slate-700"
                            }`}
                            placeholder="To verify it's you"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowCurrPass(!showCurrPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showCurrPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {verifyingPassword && <p className="text-[10px] text-blue-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Verifying...</p>}
                        {currentPasswordValid === false && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><X className="w-3 h-3"/> Incorrect password</p>}
                        {currentPasswordValid === true && <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3 h-3"/> Verified</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">New Password</Label>
                        <div className="relative">
                          <Input 
                            type={showNewPass ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`pl-9 pr-10 h-10 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 dark:text-white text-sm ${
                               currentPassword && newPassword && currentPassword === newPassword 
                               ? "border-red-500 focus-visible:ring-red-500" 
                               : "border-slate-200 dark:border-slate-700"
                            }`}
                            placeholder="Min 6 characters"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Confirm New Password</Label>
                        <div className="relative">
                          <Input 
                            type={showConfPass ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`pl-9 pr-10 h-10 rounded-lg bg-white dark:bg-slate-900 dark:text-white text-sm ${
                               passwordsMatch === false ? "border-red-500 focus-visible:ring-red-500" : 
                               passwordsMatch === true ? "border-emerald-500 focus-visible:ring-emerald-500" :
                               "border-slate-200 dark:border-slate-700"
                            }`}
                            placeholder="Retype new password"
                          />
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <button
                            type="button"
                            onClick={() => setShowConfPass(!showConfPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showConfPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                   </div>
                )}
                </TabsContent>

                <TabsContent value="work" className="space-y-4">
                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Income Type</Label>
                        <Select value={incomeType} onValueChange={setIncomeType}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white px-4">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                            <SelectItem value="monthly">Monthly Salary</SelectItem>
                            <SelectItem value="yearly">Yearly Package</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Income Amount</Label>
                        <div className="relative">
                        <Input 
                            type="number"
                            value={incomeAmount}
                            onChange={(e) => setIncomeAmount(e.target.value)}
                            className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white"
                            placeholder="0.00"
                        />
                        <IndianRupee className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="dark:text-slate-300">Work Hours Per Day</Label>
                        <div className="relative">
                        <Input 
                            type="number"
                            value={workHoursPerDay}
                            onChange={(e) => setWorkHoursPerDay(e.target.value)}
                            className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none dark:text-white"
                            placeholder="8"
                        />
                        <Clock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4">
                    <div className="space-y-4">
                       <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Add New Stable Expense</Label>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                             <Input 
                                placeholder="Name (e.g. Rent)"
                                value={newExpenseName}
                                onChange={(e) => setNewExpenseName(e.target.value)}
                                className="h-10 rounded-lg bg-white dark:bg-slate-900 text-sm"
                             />
                             <div className="relative">
                                <Input 
                                    type="number"
                                    placeholder="Amount"
                                    value={newExpenseAmount}
                                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                                    className="pl-8 h-10 rounded-lg bg-white dark:bg-slate-900 text-sm"
                                />
                                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                             </div>
                          </div>
                          <Button 
                             onClick={addExpense}
                             disabled={addingExpense || !newExpenseName || !newExpenseAmount}
                             size="sm"
                             className="w-full rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                          >
                             {addingExpense ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Plus className="w-4 h-4 mr-1"/> Add Expense</>}
                          </Button>
                       </div>

                       <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {stableExpenses.map((exp: any) => (
                             <div key={exp.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                      <Wallet className="w-4 h-4" />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold dark:text-white">{exp.name}</p>
                                      <p className="text-xs text-slate-500">₹{exp.amount}</p>
                                   </div>
                                </div>
                                <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => deleteExpense(exp.id)}
                                   className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </Button>
                             </div>
                          ))}
                          {stableExpenses.length === 0 && (
                             <p className="text-center text-slate-400 text-sm py-4">No stable expenses added yet.</p>
                          )}
                       </div>
                    </div>
                </TabsContent>
            </Tabs>

            <DialogFooter className="pt-2">
                <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile Changes"}
                </Button>
            </DialogFooter>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
