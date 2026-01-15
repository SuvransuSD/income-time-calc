import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? (verifyJWT(token) as any) : null;

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const expenses = await prisma.stableExpense.findMany({
            where: { userId: decoded.userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(expenses);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? (verifyJWT(token) as any) : null;

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, amount } = body;

        if (!name || !amount) {
            return NextResponse.json({ error: "Missing name or amount" }, { status: 400 });
        }

        const expense = await prisma.stableExpense.create({
            data: {
                userId: decoded.userId,
                name,
                amount: parseFloat(amount)
            }
        });

        return NextResponse.json(expense);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? (verifyJWT(token) as any) : null;

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await prisma.stableExpense.deleteMany({
            where: {
                id,
                userId: decoded.userId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
