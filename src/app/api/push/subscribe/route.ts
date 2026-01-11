import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { subscription, memberId } = await request.json()

    if (!subscription || !memberId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Check if subscription already exists for this endpoint
    const existing = await db.pushSubscription.findFirst({
        where: { endpoint: subscription.endpoint }
    });

    if (existing) {
        // Update memberId if changed
        if (existing.memberId !== memberId) {
            await db.pushSubscription.update({
                where: { id: existing.id },
                data: { memberId }
            });
        }
    } else {
        await db.pushSubscription.create({
            data: {
                memberId,
                endpoint: subscription.endpoint,
                keys: subscription.keys
            }
        });
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
