import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { memberId, month, year, amount, description } = await request.json()

    if (!memberId || !month || !year || !amount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const existingContribution = await db.contribution.findFirst({
      where: {
        memberId,
        month,
        year
      }
    })

    if (existingContribution) {
      return NextResponse.json(
        { error: "Contribution for this month already exists" },
        { status: 400 }
      )
    }

    const contribution = await db.contribution.create({
      data: {
        memberId,
        month,
        year,
        amount: parseFloat(amount),
        description
      }
    })

    // Fetch member details and balance info for SMS
    try {
      const member = await db.member.findUnique({
        where: { id: memberId },
        include: {
          contributions: true,
          adjustments: true
        }
      })

      if (member && member.phone) {
        // Calculate balance
        const totalContributions = member.contributions.reduce((sum, c) => sum + Number(c.amount), 0)
        const totalAdjustments = member.adjustments.reduce((sum, a) => {
          if (a.type === 'CHARGE') return sum - Number(a.amount)
          if (a.type === 'INTEREST') return sum + Number(a.amount)
          return sum
        }, 0)

        const fundAdjustments = await db.fundAdjustment.findMany()
        const memberCount = await db.member.count()

        const globalAdjustmentsShare = fundAdjustments.reduce((sum, a) => {
          if (a.type === 'CHARGE') return sum - (Number(a.amount) / memberCount)
          if (a.type === 'INTEREST') return sum + (Number(a.amount) / memberCount)
          return sum
        }, 0)

        const balance = totalContributions + totalAdjustments + globalAdjustmentsShare

        // Format phone number
        let phone = member.phone.trim()
        if (phone.startsWith('01')) {
          phone = '+88' + phone
        }

        // Send SMS
        const smsMessage = `Hello, ${member.name}, ${amount} has successfully deposit to your account. Your total balance is now ${balance.toFixed(2)}. Thank you.\nAhasan Habib\nAccountant(FDS)`

        await fetch('https://fdsapi.wasmer.app/api/v1/send.php', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SMS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: [phone],
            message: smsMessage
          })
        }).catch(e => console.error("SMS sending failed:", e))
      }
    } catch (e) {
      console.error("Failed to process SMS notification:", e)
    }

    return NextResponse.json(contribution)
  } catch (error) {
    console.error("Contribution creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}