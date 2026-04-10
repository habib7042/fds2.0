"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export function AutoLogout() {
  const router = useRouter()
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    // 5 minutes in milliseconds
    const TIMEOUT_MS = 5 * 60 * 1000
    // Check every 10 seconds
    const CHECK_INTERVAL_MS = 10000

    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const checkInactivity = () => {
      const now = Date.now()
      if (now - lastActivityRef.current > TIMEOUT_MS) {
        // Check if logged in
        const adminToken = localStorage.getItem("adminToken")
        const memberAccount = localStorage.getItem("memberAccount")

        if (adminToken || memberAccount) {
            console.log("Auto-logout triggered due to inactivity")
            localStorage.removeItem("adminToken")
            localStorage.removeItem("memberAccount")
            router.push("/")
        }
      }
    }

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"]

    events.forEach(event => {
      window.addEventListener(event, updateActivity)
    })

    const intervalId = setInterval(checkInactivity, CHECK_INTERVAL_MS)

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity)
      })
      clearInterval(intervalId)
    }
  }, [router])

  return null
}
