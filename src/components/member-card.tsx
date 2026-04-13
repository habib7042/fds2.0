"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Share2, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas"
import { toast } from "sonner"

interface MemberCardProps {
  member: {
    name: string
    accountNumber: string
    balance: number
  }
}

export function MemberCard({ member }: MemberCardProps) {
  const [showBalance, setShowBalance] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const toBengaliNumber = (num: number | string) => {
    if (num === undefined || num === null) return "০"
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
    return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)])
  }

  const handleShare = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
           // Ensure fonts and elements are ready
           const clonedCard = clonedDoc.querySelector('[data-card-container]') as HTMLElement
           if (clonedCard) {
              clonedCard.style.transform = 'none'
              clonedCard.style.boxShadow = 'none'
           }
        }
      })

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("কার্ড তৈরি করতে সমস্যা হয়েছে")
          return
        }

        const fileName = `fds-card-${member.accountNumber}.jpg`
        const file = new File([blob], fileName, { type: "image/jpeg" })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'FDS Member Card',
              text: 'Here is my FDS Member Card'
            })
            toast.success("কার্ড শেয়ার করা হয়েছে")
          } catch (shareError) {
             console.error("Error sharing:", shareError)
             // Fallback to download if sharing fails or is cancelled
             const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
             const a = document.createElement("a")
             a.href = dataUrl
             a.download = fileName
             document.body.appendChild(a)
             a.click()
             document.body.removeChild(a)
             toast.success("কার্ড ডাউনলোড হয়েছে")
          }
        } else {
          // Fallback to download
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
          const a = document.createElement("a")
          a.href = dataUrl
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          toast.success("কার্ড ডাউনলোড হয়েছে")
        }
      }, "image/jpeg", 0.9)
    } catch (err) {
      console.error(err)
      toast.error("কার্ড ডাউনলোড করতে সমস্যা হয়েছে")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={cardRef}
        data-card-container="true"
        className="relative aspect-[1.586/1] w-full rounded-2xl p-6 text-white overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-blue-500/10 mix-blend-overlay z-0"></div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
           <svg width="100%" height="100%">
              <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                 <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" />
           </svg>
        </div>

        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-medium opacity-70 mb-1 tracking-widest uppercase">FDS Member Card</div>
              <div className="text-xl font-bold tracking-tight">Friends Development Society</div>
            </div>
            <Wifi className="h-6 w-6 opacity-80 rotate-90" />
          </div>

          <div className="flex items-center gap-4 my-4">
             <div className="w-12 h-9 bg-gradient-to-br from-amber-200 to-yellow-500 rounded-md relative overflow-hidden flex items-center justify-center shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                <div className="w-8 h-6 border border-black/20 rounded-sm grid grid-cols-2 gap-[1px]">
                   <div className="border-r border-black/20"></div>
                   <div></div>
                </div>
             </div>
             <Wifi className="h-6 w-6 opacity-60" />
          </div>

          <div className="space-y-4">
             <div className="flex items-end justify-between">
                <div className="space-y-1">
                   <div className="text-xs opacity-70">Account Number</div>
                   <div className="font-mono text-xl tracking-wider">
                      {member.accountNumber.split('').map((d, i) => (
                         <span key={i} className="mx-[1px]">{toBengaliNumber(d)}</span>
                      ))}
                   </div>
                </div>

                <div className="text-right">
                   <div className="text-xs opacity-70 mb-1">Balance</div>
                   <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold font-mono">
                         {showBalance ? `৳${toBengaliNumber(member.balance.toFixed(2))}` : '৳••••••'}
                      </span>
                   </div>
                </div>
             </div>

             <div className="flex justify-between items-end">
                <div>
                   <div className="text-xs opacity-70 uppercase tracking-wider">Card Holder</div>
                   <div className="font-medium text-lg max-w-[200px]" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                      {member.name}
                   </div>
                </div>
                <div className="text-xs opacity-50 font-mono">VALID PERMANENT</div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-4">
         <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="rounded-full"
         >
            {showBalance ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showBalance ? 'ব্যালেন্স লুকান' : 'ব্যালেন্স দেখুন'}
         </Button>
         <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="rounded-full"
         >
            <Share2 className="h-4 w-4 mr-2" /> কার্ড শেয়ার
         </Button>
      </div>
    </div>
  )
}
