"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface GoalDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPermanent?: boolean;
}

export function GoalDeleteDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isPermanent = false 
}: GoalDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[2rem] bg-white dark:bg-slate-900 border-none max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold dark:text-white">
            {isPermanent ? "Delete forever?" : "Move to Trash?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 text-base leading-relaxed">
            {isPermanent ? (
               "This action cannot be undone. Are you sure you want to permanently erase this goal from your history?"
            ) : (
               <div className="space-y-4">
                  <p>Wait! Before you delete, ask yourself:</p>
                  <ul className="list-disc pl-4 space-y-1">
                     <li>Is this no longer something you really want?</li>
                     <li>Have your priorities shifted to something better?</li>
                     <li>Could you just postpone it instead?</li>
                  </ul>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                     "Goals are dreams with deadlines."
                  </p>
               </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="rounded-xl h-12 border-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
            Keep it
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="rounded-xl h-12 bg-red-500 hover:bg-red-600 text-white font-bold"
          >
            {isPermanent ? "Delete Forever" : "Yes, I'm sure"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
