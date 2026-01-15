import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { verifyJWT } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = token ? (verifyJWT(token) as any) : null;
    const userIdFromToken = decoded?.userId;

    const body = await req.json();
    const { userId, name, incomeAmount, incomeType, workHoursPerDay, savingReason } = body;

    const finalUserId = userId || userIdFromToken;

    if (!finalUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsedIncome = parseFloat(incomeAmount);
    if (isNaN(parsedIncome)) {
      return NextResponse.json({ error: "Invalid income amount" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: finalUserId },
      data: {
        name,
        incomeAmount: parsedIncome,
        incomeType,
        workHoursPerDay: parseInt(workHoursPerDay) || 8,
        savingReason,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("User update error:", error);
    return NextResponse.json({
      error: error.message,
      code: error.code
    }, { status: 500 });
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        goals: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = token ? (verifyJWT(token) as any) : null;

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, incomeAmount, incomeType, workHoursPerDay, currentPassword, newPassword } = body;

    const updateData: any = {
      name,
      incomeAmount: parseFloat(incomeAmount),
      incomeType,
      workHoursPerDay: parseInt(workHoursPerDay),
    };

    // Password Change Logic
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user || !user.password) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 403 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("User update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



