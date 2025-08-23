"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Users, 
  DollarSign, 
  Clock, 
  Shield, 
  TrendingUp, 
  Eye,
  Heart,
  Building2,
  Handshake,
  Calculator,
  ArrowRight,
  CheckCircle,
  Star
} from "lucide-react"

export default function Home() {
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
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
    if (accountNumber.length !== 4) {
      setError("Account number must be 4 digits")
      return
    }
    
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/member/${accountNumber}`)
      if (response.ok) {
        const member = await response.json()
        localStorage.setItem("memberAccount", accountNumber)
        router.push(`/member/${accountNumber}`)
      } else {
        setError("Member not found")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full">
                  <Handshake className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-4">
              Friends Development Society
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light">
              বন্ধুত্ব, সহযোগিতা এবং সমৃদ্ধির প্রতীক
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">আমাদের উদ্দেশ্য</h2>
              <Star className="w-8 h-8 text-yellow-400 ml-3" />
            </div>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
              FDS একটি স্বেচ্ছাসেবী বন্ধুসমিতি, যার মূল উদ্দেশ্য বন্ধুদের পারস্পরিক সহযোগিতা, 
              অর্থ সঞ্চয়, এবং ভবিষ্যতে সম্মিলিত কোনো হালাল উদ্যোগ গ্রহণের জন্য একটি শক্তিশালী আর্থিক ভিত্তি তৈরি করা।
            </p>
          </div>
        </motion.div>

        {/* Key Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white h-full hover:bg-white/10 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">সদস্য সংখ্যা</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  ১৫-২০ জন
                </div>
                <p className="text-gray-400">প্রাথমিক সদস্য সংখ্যা</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white h-full hover:bg-white/10 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">মাসিক চাঁদা</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  ৫০০ টাকা
                </div>
                <p className="text-gray-400">প্রতি মাসের ১০ তারিখের মধ্যে</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-white h-full hover:bg-white/10 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">অর্থ উত্তোলন</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  ৩ বছর
                </div>
                <p className="text-gray-400">পরে উত্তোলনযোগ্য</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Rules and Regulations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-yellow-400 mr-3" />
                <h2 className="text-3xl font-bold text-white">নীতি ও বিধিমালা</h2>
                <Shield className="w-8 h-8 text-yellow-400 ml-3" />
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="membership" className="border-white/10">
                <AccordionTrigger className="text-lg font-semibold text-white hover:text-purple-400 transition-colors">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-3 text-purple-400" />
                    ২. সদস্যসংখ্যা ও যোগদান
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <ul className="space-y-3 ml-8">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>FDS-এ প্রাথমিক সদস্য সংখ্যা ১৫-২০ জন</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>সদস্য হতে হলে সবাইকে নিয়মিত মাসিক চাঁদা প্রদান করতে হবে</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>নতুন সদস্য যোগ হলে পূর্ব সদস্যদের সর্বসম্মত মতামত প্রয়োজন</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contribution" className="border-white/10">
                <AccordionTrigger className="text-lg font-semibold text-white hover:text-purple-400 transition-colors">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-3 text-green-400" />
                    ৩. মাসিক চাঁদা ও ফান্ড পরিচালনা
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <ul className="space-y-3 ml-8">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>প্রত্যেক সদস্য প্রতি মাসে ৫০০ টাকা করে চাঁদা প্রদান করবেন</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>নির্ধারিত তারিখ (প্রত্যেক মাসের ১০ তারিখের মধ্যে) চাঁদা জমা দিতে হবে</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>চাঁদা একটি নির্দিষ্ট ব্যাঙ্ক বা মোবাইল ব্যাংক একাউন্টে জমা হবে</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="withdrawal" className="border-white/10">
                <AccordionTrigger className="text-lg font-semibold text-white hover:text-purple-400 transition-colors">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-3 text-blue-400" />
                    ৪. অর্থ উত্তোলনের নীতি
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <ul className="space-y-3 ml-8">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>ফান্ডে জমাকৃত অর্থ সদস্যগণ ৩ বছর পূর্ণ হওয়ার আগে উত্তোলন করতে পারবেন না</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>সদস্যপদ বাতিল হলেও ৩ বছর পূর্ণ না হলে কোনো টাকা উত্তোলন করা যাবে না</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>৩ বছর পূর্ণ হলে সকল সদস্য নিজ নিজ অংশ ফেরত পাওয়ার অধিকারী হবেন</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cancellation" className="border-white/10">
                <AccordionTrigger className="text-lg font-semibold text-white hover:text-purple-400 transition-colors">
                  <div className="flex items-center">
                    <Calculator className="w-5 h-5 mr-3 text-red-400" />
                    ৫. সদস্যপদ বাতিল
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <ul className="space-y-3 ml-8">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>সদস্য ইচ্ছায় সদস্যপদ বাতিল করতে পারেন, তবে তার জমাকৃত অর্থ ৩ বছর পূর্ণ না হওয়া পর্যন্ত আটকে থাকবে</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>৩ মাস পরপর চাঁদা না দিলে সদস্যকে নোটিশ দিয়ে সদস্যপদ বাতিল করা হতে পারে</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>বাতিল সদস্য ৩ বছর পূর্ণ হলে তার জমাকৃত অর্থ ফেরত পাবেন, তবে কোনো সুদ প্রদান করা হবে না</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="transparency" className="border-white/10">
                <AccordionTrigger className="text-lg font-semibold text-white hover:text-purple-400 transition-colors">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-3 text-cyan-400" />
                    ৬. হিসাব ও স্বচ্ছতা
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  <ul className="space-y-3 ml-8">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>প্রতিমাসে ফান্ডের অবস্থা সম্পর্কে সদস্যদের জানানো হবে</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>একজন দায়িত্বশীল কোষাধ্যক্ষ নির্বাচিত হবেন যিনি সুষ্ঠুভাবে হিসাব রাখবেন</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span>বছরে অন্তত একবার অডিট করে সদস্যদের সামনে উপস্থাপন করতে হবে</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </motion.div>

        {/* Login Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-md mx-auto mb-16"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">লগইন</h2>
              <p className="text-gray-400">আপনার একাউন্টে লগইন করুন</p>
            </div>

            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger value="admin" className="text-white hover:bg-white/10 data-[state=active]:bg-purple-600">
                  হিসাবরক্ষক
                </TabsTrigger>
                <TabsTrigger value="member" className="text-white hover:bg-white/10 data-[state=active]:bg-purple-600">
                  সদস্য
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="mt-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="px-0">
                    <CardTitle className="text-lg text-white">হিসাবরক্ষক লগইন</CardTitle>
                    <CardDescription className="text-gray-400">
                      ইউজারনেম এবং পাসওয়ার্ড দিয়ে লগইন করুন
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">ইউজারনেম</Label>
                        <Input
                          id="username"
                          type="text"
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          required
                          className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">পাসওয়ার্ড</Label>
                        <Input
                          id="password"
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                          className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-400"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold" 
                        disabled={loading}
                      >
                        {loading ? "লগইন হচ্ছে..." : "লগইন"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="member" className="mt-6">
                <Card className="border-0 shadow-none bg-transparent">
                  <CardHeader className="px-0">
                    <CardTitle className="text-lg text-white">সদস্য একাউন্ট</CardTitle>
                    <CardDescription className="text-gray-400">
                      আপনার 4 ডিজিট একাউন্ট নম্বর দিয়ে লগইন করুন
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <form onSubmit={handleMemberLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber" className="text-white">একাউন্ট নম্বর</Label>
                        <Input
                          id="accountNumber"
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          maxLength={4}
                          placeholder="1234"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-400"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold" 
                        disabled={loading}
                      >
                        {loading ? "খোঁজা হচ্ছে..." : "একাউন্ট দেখুন"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4 bg-red-500/10 border-red-500/20">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mb-16"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <Heart className="w-8 h-8 text-red-400 mr-3" />
              <h3 className="text-2xl font-bold text-white">আমাদের প্রতিশ্রুতি</h3>
              <Heart className="w-8 h-8 text-red-400 ml-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Handshake className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">ভ্রাতৃত্ববোধ</h4>
                  <p className="text-gray-400">ইসলামী ভ্রাতৃত্ববোধ ও সহযোগিতা</p>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">আর্থিক স্থিতিশীলতা</h4>
                  <p className="text-gray-400">হালাল উপায়ে আর্থিক নিরাপত্তা</p>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">স্বচ্ছতা</h4>
                  <p className="text-gray-400">সম্পূর্ণ স্বচ্ছতা ও জবাবদিহিতা</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Closing Statement */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mb-16"
        >
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/30 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-yellow-400 mr-3" />
              <Star className="w-6 h-6 text-yellow-400 mr-3" />
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
              "আল্লাহ্‌ তা'আলার ওপর ভরসা করে আমরা আমাদের এই সমাজের কার্যক্রম শুরু করছি। 
              তিনি যেন আমাদের সবাইকে হালাল পথে চলার তাওফিক দান করেন এবং এই উদ্যোগকে কল্যাণ ও বরকতের মাধ্যমে কবুল করেন।"
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-lg border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
              <Handshake className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="text-xl font-bold text-white mb-2"
          >
            Friends Development Society (FDS)
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="text-gray-400 mb-4"
          >
            বন্ধুত্ব, সহযোগিতা এবং সমৃদ্ধির প্রতীক
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="text-gray-500 text-sm"
          >
            © 2025 FDS. সর্বস্বত্ব সংরক্ষিত।
          </motion.p>
        </div>
      </footer>

      {/* Custom Animation Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}