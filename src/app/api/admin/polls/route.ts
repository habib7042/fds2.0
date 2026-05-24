import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const polls = await db.poll.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true }
            }
          }
        },
        _count: {
          select: { votes: true }
        }
      }
    })

    return NextResponse.json(polls)
  } catch (error) {
    console.error("Fetch polls error:", error)
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.substring(7)
    let authenticatedAdminId = ""
    try {
      const decoded = Buffer.from(token, "base64").toString()
      const [adminId] = decoded.split(":")
      if (!adminId) throw new Error("Invalid token format")
      const admin = await db.admin.findUnique({ where: { id: adminId } })
      if (!admin) throw new Error("Admin not found")
      authenticatedAdminId = admin.id
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    let { question, options, creatorId } = await request.json()

    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: "Invalid poll data" }, { status: 400 })
    }

    creatorId = authenticatedAdminId

    const poll = await db.poll.create({
      data: {
        question,
        creatorId,
        options: {
          create: options.map((opt: string) => ({ text: opt }))
        }
      },
      include: {
        options: true
      }
    })

    return NextResponse.json(poll)
  } catch (error) {
    console.error("Create poll error:", error)
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.substring(7)
    try {
      const decoded = Buffer.from(token, "base64").toString()
      const [adminId] = decoded.split(":")
      if (!adminId) throw new Error("Invalid token format")
      const admin = await db.admin.findUnique({ where: { id: adminId } })
      if (!admin) throw new Error("Admin not found")
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id, isActive } = await request.json()

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid update data" }, { status: 400 })
    }

    const poll = await db.poll.update({
      where: { id },
      data: { isActive },
      include: {
        options: true
      }
    })

    return NextResponse.json(poll)
  } catch (error) {
    console.error("Update poll error:", error)
    return NextResponse.json({ error: "Failed to update poll" }, { status: 500 })
  }
}
