import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subDays } from "date-fns";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? (verifyJWT(token) as any) : null;

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        const thirtyDaysAgo = subDays(now, 30);

        // Fetch ALL transactions for lifetime balance and rolling savings
        const allTransactions = await prisma.transaction.findMany({
            where: { userId: decoded.userId }
        });

        const lifetimeIncome = allTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
        const lifetimeExpense = allTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
        const purse = lifetimeIncome - lifetimeExpense;

        // Rolling 30-day savings
        const recentTransactions = allTransactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
        const rollingIncome = recentTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
        const rollingExpense = recentTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
        const rollingSavings = rollingIncome - rollingExpense;

        // Month-specific data for charts
        const currentMonthTransactions = allTransactions.filter(t => {
            const date = new Date(t.date);
            return date >= start && date <= end;
        });

        // Group by category (Current Month)
        const categorySummary = currentMonthTransactions.reduce((acc: any, curr) => {
            if (curr.type === 'EXPENSE') {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            }
            return acc;
        }, {});

        const categoryData = Object.keys(categorySummary).map(key => ({
            name: key,
            value: categorySummary[key]
        }));

        // Daily summary for the month
        const days = eachDayOfInterval({ start, end });
        const dailyData = days.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayTransactions = currentMonthTransactions.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dayStr);

            const income = dayTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
            const expense = dayTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

            return {
                date: format(day, "dd MMM"),
                income,
                expense
            };
        });

        const totalIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

        return NextResponse.json({
            categoryData,
            dailyData,
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            purse,
            rollingSavings
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
