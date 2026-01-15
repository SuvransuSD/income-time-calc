import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: { goalId: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? (verifyJWT(token) as any) : null;

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const permanent = searchParams.get("permanent") === "true";
        const goalId = params.goalId;

        if (permanent) {
            // Check if it belongs to user first (for safety) 
            // Although deleteMany with userId works too
            const deleted = await prisma.goal.deleteMany({
                where: {
                    id: goalId,
                    userId: decoded.userId
                }
            });
            if (deleted.count === 0) {
                return NextResponse.json({ error: "Goal not found" }, { status: 404 });
            }
        } else {
            // Soft Delete
            const updated = await prisma.goal.updateMany({
                where: {
                    id: goalId,
                    userId: decoded.userId
                },
                data: { deletedAt: new Date() }
            });
            if (updated.count === 0) {
                return NextResponse.json({ error: "Goal not found" }, { status: 404 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { goalId: string } }
) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? (verifyJWT(token) as any) : null;

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const goalId = params.goalId;
        const body = await req.json();

        if (body.restore) {
            const updated = await prisma.goal.updateMany({
                where: {
                    id: goalId,
                    userId: decoded.userId
                },
                data: { deletedAt: null }
            });
            if (updated.count === 0) {
                return NextResponse.json({ error: "Goal not found" }, { status: 404 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
