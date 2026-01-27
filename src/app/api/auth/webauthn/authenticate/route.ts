import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server"
import { isoBase64URL } from "@simplewebauthn/server/helpers"

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || "localhost"
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action, accountNumber, authResponse } = body

        if (action === "generate-options") {
            if (!accountNumber) return NextResponse.json({ error: "Account number required" }, { status: 400 })

            const member = await db.member.findUnique({
                where: { accountNumber },
                include: { authenticators: true }
            })

            if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

            const options = await generateAuthenticationOptions({
                rpID: RP_ID,
                allowCredentials: member.authenticators.map(auth => ({
                    id: auth.credentialID,
                    type: "public-key",
                    transports: auth.transports ? JSON.parse(auth.transports) : undefined,
                })),
                userVerification: "preferred",
            })

            await db.member.update({
                where: { id: member.id },
                data: { webAuthnChallenge: options.challenge }
            })

            return NextResponse.json(options)
        }

        if (action === "verify") {
            if (!accountNumber || !authResponse) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

            const member = await db.member.findUnique({
                where: { accountNumber },
                include: { authenticators: true }
            })

            if (!member || !member.webAuthnChallenge) return NextResponse.json({ error: "Invalid session" }, { status: 400 })

            const authenticator = member.authenticators.find(auth => auth.credentialID === authResponse.id)
            if (!authenticator) return NextResponse.json({ error: "Authenticator not registered" }, { status: 400 })

            let verification
            try {
                verification = await verifyAuthenticationResponse({
                    response: authResponse,
                    expectedChallenge: member.webAuthnChallenge,
                    expectedOrigin: ORIGIN,
                    expectedRPID: RP_ID,
                    authenticator: {
                        credentialPublicKey: isoBase64URL.toBuffer(authenticator.credentialPublicKey),
                        credentialID: isoBase64URL.toBuffer(authenticator.credentialID),
                        counter: Number(authenticator.counter), // Convert BigInt
                        transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined
                    },
                })
            } catch (error) {
                console.error(error)
                return NextResponse.json({ error: "Verification failed" }, { status: 400 })
            }

            if (verification.verified) {
                const { authenticationInfo } = verification
                const { newCounter } = authenticationInfo

                await db.authenticator.update({
                    where: { id: authenticator.id },
                    data: { counter: BigInt(newCounter) }
                })

                await db.member.update({
                    where: { id: member.id },
                    data: { webAuthnChallenge: null }
                })

                return NextResponse.json({ success: true, member })
            }

            return NextResponse.json({ error: "Verification failed" }, { status: 400 })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    } catch (error) {
        console.error("WebAuthn Auth Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
