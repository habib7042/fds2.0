import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { type, amount, description, target, memberId } = await request.json()

    if (!type || !amount || !target) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // target can be 'all' or 'specific'
    let count = 0;

    if (target === 'all') {
        const members = await db.member.findMany();
        const operations = members.map(m => db.accountAdjustment.create({
            data: {
                memberId: m.id,
                type,
                amount: parseFloat(amount),
                description
            }
        }));
        await db.$transaction(operations);
        count = members.length;
    } else if (target === 'specific' && memberId) {
        await db.accountAdjustment.create({
            data: {
                memberId,
                type,
                amount: parseFloat(amount),
                description
            }
        });
        count = 1;
    } else {
        return NextResponse.json({ error: "Invalid target" }, { status: 400 })
    }

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error("Adjustment error:", error)
    return NextResponse.json({ error: "Failed to create adjustment" }, { status: 500 })
  }
}
