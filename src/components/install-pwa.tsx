"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false)
  const [promptInstall, setPromptInstall] = useState<any>(null)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setSupportsPWA(true)
      setPromptInstall(e)
    }
    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault()
    if (!promptInstall) {
      toast.info("অ্যাপটি ইতোমধ্যে ইনস্টল করা আছে অথবা আপনার ব্রাউজার এটি সমর্থন করে না।")
      return
    }
    promptInstall.prompt()
    promptInstall.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        toast.success("অ্যাপ ইনস্টল প্রক্রিয়া শুরু হয়েছে")
      } else {
        toast.error("ইনস্টলেশন বাতিল করা হয়েছে")
      }
      setPromptInstall(null)
    })
  }

  // Only show button if install is possible
  if (!supportsPWA) {
    return null
  }

  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
    >
      <Download className="w-4 h-4" />
      Download App (FDD 2.0)
    </Button>
  )
}
