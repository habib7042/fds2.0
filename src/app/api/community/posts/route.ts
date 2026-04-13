import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { put } from "@vercel/blob"

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
    const formData = await request.formData()
    const content = formData.get("content") as string
    const authorId = formData.get("authorId") as string
    const imageFile = formData.get("image") as File | null

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
