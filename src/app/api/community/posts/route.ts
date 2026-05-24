import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { put } from "@vercel/blob"
import * as jose from "jose"

const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key_change_me'
)

async function getMemberIdFromToken(request: NextRequest) {
  const cookie = request.cookies.get("member_session")?.value
  if (!cookie) return null
  try {
    const { payload } = await jose.jwtVerify(cookie, jwtSecret)
    if (!payload.id || typeof payload.id !== "string") return null
    return payload.id
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const posts = await db.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            accountNumber: true
          }
        },
        likes: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Fetch posts error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromToken(request)
    if (!memberId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const content = formData.get("content") as string
    const imageFile = formData.get("image") as File | null
    const authorId = memberId

    if (!content && !imageFile) {
      return NextResponse.json({ error: "Content or image is required" }, { status: 400 })
    }

    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      const blob = await put(`community/posts/${Date.now()}-${imageFile.name}`, imageFile, {
        access: 'public',
      })
      imageUrl = blob.url
    }

    const post = await db.post.create({
      data: {
        content: content || "",
        image: imageUrl,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        likes: true,
        comments: true
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
