import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        const decoded = token ? (verifyJWT(token) as any) : null;

        if (!decoded?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 }); // Using 401 for incorrect auth
        }

    } catch (error: any) {
        console.error("Password verification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
