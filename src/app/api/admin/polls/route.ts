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
    let { question, options, creatorId } = await request.json()

    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: "Invalid poll data" }, { status: 400 })
    }

    // If creatorId is not provided, try to find the first admin
    if (!creatorId) {
      const admin = await db.admin.findFirst()
      if (admin) {
        creatorId = admin.id
      } else {
        return NextResponse.json({ error: "No admin found to create poll" }, { status: 500 })
      }
    }

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
