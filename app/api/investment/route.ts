import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? (verifyJWT(token) as any) : null;

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, expectedReturn, instrument } = body;

        if (!amount || !expectedReturn || !instrument) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const investment = await prisma.investment.create({
            data: {
                userId: decoded.userId,
                amount: parseFloat(amount),
                expectedReturn: parseFloat(expectedReturn),
                instrument,
            },
        });

        return NextResponse.json(investment);
    } catch (error: any) {
        console.error("Investment POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? (verifyJWT(token) as any) : null;

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const investments = await prisma.investment.findMany({
            where: { userId: decoded.userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(investments);
    } catch (error: any) {
        console.error("Investment GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
