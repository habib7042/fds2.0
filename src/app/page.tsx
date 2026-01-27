"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Handshake, ArrowRight, ShieldCheck, Lock, X } from "lucide-react"
import Link from "next/link"
import { InstallPWA } from "@/components/install-pwa"
import { Keypad } from "@/components/ui/keypad"
import { toast } from "sonner"

export default function LoginPage() {
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")

  // Member Login States
  const [mobileNumber, setMobileNumber] = useState("")
  const [pin, setPin] = useState("")
  const [isNumberSaved, setIsNumberSaved] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("savedMobileNumber")
    if (saved) {
      setMobileNumber(saved)
      setIsNumberSaved(true)
    }
  }, [])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      })

      if (response.ok) {
        const { token } = await response.json()
        localStorage.setItem("adminToken", token)
        router.push("/admin")
      } else {
        const { error } = await response.json()
        setError(error || "Login failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mobileNumber) {
      setError("Mobile number is required")
      return
    }
    if (!pin) {
      setError("PIN is required")
      return
    }
    
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/member-login", {
        method: "POST",
        headers: {
           "Content-Type": "application/json"
        },
        body: JSON.stringify({
           phone: mobileNumber,
           pin
        })
      })

      if (response.ok) {
        const data = await response.json()
        const member = data.member
        // Keep localStorage for client-side convenience/legacy checks
        // But cookie is the main auth now
        localStorage.setItem("memberAccount", member.accountNumber)
        localStorage.setItem("savedMobileNumber", mobileNumber)
        router.push(`/member/${member.accountNumber}`)
      } else {
        const data = await response.json()
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChangeNumber = () => {
    setMobileNumber("")
    setPin("")
    setIsNumberSaved(false)
    localStorage.removeItem("savedMobileNumber")
  }

  const handlePinInput = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num)
    }
  }

  const handlePinDelete = () => {
    setPin(prev => prev.slice(0, -1))
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left Side - Hero/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 lg:bg-primary/10 flex-col justify-between p-12 relative overflow-hidden">
        <div className="z-10">
           <div className="flex items-center gap-3 mb-8">
             <img src="/logo.png" alt="FDS Logo" className="w-16 h-16 object-contain" />
             <span className="text-3xl font-bold tracking-tight">FDS</span>
           </div>
           <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
             বন্ধুত্ব ও সহযোগিতার <br /> এক অনন্য বন্ধন
           </h1>
           <p className="text-lg text-muted-foreground max-w-md">
             Friends Development Society (FDS) - একটি শক্তিশালী আর্থিক ভিত্তি গড়ার লক্ষ্যে আমাদের সম্মিলিত প্রচেষ্টা।
           </p>
        </div>

        <div className="z-10 mt-12 space-y-8">
           <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-green-600" /> নিরাপদ
              </div>
              <div className="flex items-center gap-2">
                 <Lock className="w-5 h-5 text-blue-600" /> সুরক্ষিত
              </div>
              <div className="flex items-center gap-2">
                 <Handshake className="w-5 h-5 text-primary" /> বিশ্বস্ত
              </div>
           </div>

           <InstallPWA />
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl opacity-50"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative">
         <div className="absolute top-6 right-6 md:hidden">
             <img src="/logo.png" alt="FDS Logo" className="w-12 h-12 object-contain" />
         </div>

         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md space-y-8"
         >
            <div className="text-center md:text-left space-y-2">
               <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold tracking-tight"
               >
                  স্বাগতম
               </motion.h2>
               <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground"
               >
                  আপনার একাউন্টে প্রবেশ করতে তথ্য প্রদান করুন
               </motion.p>
            </div>

            <Card className="border-0 shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10 overflow-hidden">
               <CardContent className="pt-6">
                  <Tabs defaultValue="member" className="w-full">
                     <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 bg-muted/50 rounded-lg">
                        <TabsTrigger value="member" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">সদস্য</TabsTrigger>
                        <TabsTrigger value="admin" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">অ্যাডমিন</TabsTrigger>
                     </TabsList>

                     <TabsContent value="admin">
                        <form onSubmit={handleAdminLogin} className="space-y-4">
                           <div className="space-y-2">
                              <Label htmlFor="username">ইউজারনেম</Label>
                              <Input
                                 id="username"
                                 type="text"
                                 value={adminUsername}
                                 onChange={(e) => setAdminUsername(e.target.value)}
                                 required
                                 placeholder="admin"
                                 className="h-10"
                              />
                           </div>
                           <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                 <Label htmlFor="password">পাসওয়ার্ড</Label>
                              </div>
                              <Input
                                 id="password"
                                 type="password"
                                 value={adminPassword}
                                 onChange={(e) => setAdminPassword(e.target.value)}
                                 required
                                 placeholder="••••••••"
                                 className="h-10"
                              />
                           </div>
                           <Button type="submit" className="w-full h-10 text-base" disabled={loading}>
                              {loading ? "লগইন হচ্ছে..." : "লগইন"}
                           </Button>
                        </form>
                     </TabsContent>

                     <TabsContent value="member">
                        <form onSubmit={handleMemberLogin} className="space-y-4">
                           <div className="space-y-2">
                              <Label htmlFor="mobileNumber">মোবাইল নম্বর</Label>
                              {isNumberSaved ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground flex items-center font-medium">
                                    {mobileNumber}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleChangeNumber}
                                    className="text-muted-foreground hover:text-destructive shrink-0"
                                    title="Change Number"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Input
                                   id="mobileNumber"
                                   type="tel"
                                   value={mobileNumber}
                                   onChange={(e) => setMobileNumber(e.target.value)}
                                   placeholder="017xxxxxxxx"
                                   required
                                   className="h-10"
                                />
                              )}
                           </div>

                           <div className="space-y-2">
                              <Label htmlFor="pin">পিন কোড</Label>
                              <Input
                                 id="pin"
                                 type="password"
                                 value={pin}
                                 readOnly
                                 placeholder="****"
                                 className="text-center text-xl tracking-widest h-12"
                                 onClick={(e) => e.currentTarget.blur()}
                              />
                           </div>

                           {/* Keypad */}
                           <Keypad
                              onInput={handlePinInput}
                              onDelete={handlePinDelete}
                              className="my-4"
                           />

                           <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                              {loading ? "যাচাই করা হচ্ছে..." : "লগইন"}
                           </Button>
                        </form>
                     </TabsContent>
                  </Tabs>

                  {error && (
                     <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                     </Alert>
                  )}
               </CardContent>
            </Card>

            <div className="text-center pt-4 flex flex-col items-center gap-4">
               <Link href="/policy" className="inline-flex items-center text-sm font-medium text-primary hover:underline transition-all group">
                  আমাদের নীতি ও বিধিমালা পড়ুন <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
               </Link>

               {/* Mobile only PWA install button */}
               <div className="md:hidden">
                  <InstallPWA />
               </div>
            </div>
         </motion.div>

         <div className="absolute bottom-6 text-center text-xs text-muted-foreground w-full px-6">
            © 2025 Friends Development Society. All rights reserved.
         </div>
      </div>
    </div>
  )
}
