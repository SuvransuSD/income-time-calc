import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { verifyJWT } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = token ? (verifyJWT(token) as any) : null;

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemName, itemCost } = body;

    if (!itemName || !itemCost) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = decoded.userId;

    // Fetch user to calculate time cost
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const workDaysPerMonth = 22;
    const workHoursPerMonth = workDaysPerMonth * user.workHoursPerDay;
    const workHoursPerYear = 12 * workHoursPerMonth;

    let hourlyRate = 0;
    if (user.incomeType === "monthly") {
      hourlyRate = user.incomeAmount / workHoursPerMonth;
    } else {
      hourlyRate = user.incomeAmount / workHoursPerYear;
    }

    const hoursRequired = itemCost / hourlyRate;
    const daysRequired = hoursRequired / user.workHoursPerDay;

    const goal = await prisma.goal.create({
      data: {
        userId,
        itemName,
        itemCost: parseFloat(itemCost),
        hoursRequired,
        daysRequired,
      },
    });

    return NextResponse.json(goal);
  } catch (error: any) {
    console.error("Goal creation error:", error);
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

    const { searchParams } = new URL(req.url);
    const showDeleted = searchParams.get("deleted") === "true";

    const goals = await prisma.goal.findMany({
      where: {
        userId: decoded.userId,
        deletedAt: showDeleted ? { not: null } : null
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(goals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

