import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const count = await db.member.count()
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
