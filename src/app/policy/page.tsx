"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import {
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Eye,
  Building2,
  Handshake,
  Calculator,
  Star
} from "lucide-react"

export default function PolicyPage() {
  const [mounted, setMounted] = useState(false)
  const [memberCount, setMemberCount] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    // Fetch member count
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (typeof data.count === 'number') {
          setMemberCount(toBengaliNumber(data.count))
        }
      })
      .catch(err => console.error("Failed to fetch stats", err))
  }, [])

  const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-primary p-2 rounded-full">
                <Handshake className="w-6 h-6 text-primary-foreground" />
             </div>
             <span className="text-xl font-bold hidden md:inline-block">Friends Development Society</span>
             <span className="text-xl font-bold md:hidden">FDS</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl mb-6">
                বন্ধুত্ব, সহযোগিতা <br className="hidden sm:inline" /> ও সমৃদ্ধির প্রতীক
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                FDS একটি স্বেচ্ছাসেবী বন্ধুসমিতি, যার মূল উদ্দেশ্য বন্ধুদের পারস্পরিক সহযোগিতা,
                অর্থ সঞ্চয়, এবং ভবিষ্যতে সম্মিলিত কোনো হালাল উদ্যোগ গ্রহণের জন্য একটি শক্তিশালী আর্থিক ভিত্তি তৈরি করা।
              </p>
            </motion.div>
        </section>

        {/* Key Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সদস্য সংখ্যা</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberCount ? `${memberCount} জন` : 'লোড হচ্ছে...'}</div>
              <p className="text-xs text-muted-foreground">বর্তমান সদস্য সংখ্যা</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মাসিক চাঁদা</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">১০০০ টাকা</div>
              <p className="text-xs text-muted-foreground">প্রতি মাসের ১০ তারিখের মধ্যে</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">অর্থ উত্তোলন</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৩ বছর</div>
              <p className="text-xs text-muted-foreground">পরে উত্তোলনযোগ্য</p>
            </CardContent>
          </Card>
        </section>

        {/* Rules and Regulations */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">নীতি ও বিধিমালা</h2>
            <p className="text-muted-foreground mt-2">সংগঠনের সুষ্ঠু পরিচালনার জন্য কিছু নিয়মাবলী</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
             <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" /> সদস্যসংখ্যা ও যোগদান
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      <li>FDS-এ বর্তমান সদস্য সংখ্যা {memberCount || '...'} জন।</li>
                      <li>সদস্য হতে হলে সবাইকে নিয়মিত মাসিক চাঁদা প্রদান করতে হবে।</li>
                      <li>নতুন সদস্য যোগ হলে পূর্ব সদস্যদের সর্বসম্মত মতামত প্রয়োজন।</li>
                   </ul>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" /> মাসিক চাঁদা ও ফান্ড
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      <li>প্রত্যেক সদস্য প্রতি মাসে ১০০০ টাকা করে চাঁদা প্রদান করবেন।</li>
                      <li>নির্ধারিত তারিখ (প্রত্যেক মাসের ১০ তারিখের মধ্যে) চাঁদা জমা দিতে হবে।</li>
                      <li>চাঁদা একটি নির্দিষ্ট ব্যাঙ্ক বা মোবাইল ব্যাংক একাউন্টে জমা হবে।</li>
                   </ul>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" /> অর্থ উত্তোলন নীতি
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      <li>ফান্ডে জমাকৃত অর্থ ৩ বছর পূর্ণ হওয়ার আগে উত্তোলন করা যাবে না।</li>
                      <li>সদস্যপদ বাতিল হলেও ৩ বছর পূর্ণ না হলে টাকা উত্তোলন করা যাবে না।</li>
                      <li>৩ বছর পূর্ণ হলে সকল সদস্য নিজ নিজ অংশ ফেরত পাওয়ার অধিকারী হবেন।</li>
                   </ul>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" /> সদস্যপদ বাতিল
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                      <li>সদস্য স্বেচ্ছায় সদস্যপদ বাতিল করতে পারেন, তবে অর্থ ৩ বছর আটকে থাকবে।</li>
                      <li>৩ মাস পরপর চাঁদা না দিলে সদস্যপদ বাতিল হতে পারে।</li>
                      <li>বাতিল সদস্য ৩ বছর পর অর্থ ফেরত পাবেন, কোনো লভ্যাংশ পাবেন না।</li>
                   </ul>
                </CardContent>
             </Card>
          </div>

          <div className="max-w-3xl mx-auto pt-6">
            <Accordion type="single" collapsible className="w-full">
               <AccordionItem value="transparency">
                  <AccordionTrigger className="text-lg font-semibold">
                     <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        হিসাব ও স্বচ্ছতা
                     </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                     <ul className="space-y-2 list-disc pl-5">
                        <li>প্রতিমাসে ফান্ডের অবস্থা সম্পর্কে সদস্যদের জানানো হবে।</li>
                        <li>একজন দায়িত্বশীল কোষাধ্যক্ষ নির্বাচিত হবেন যিনি সুষ্ঠুভাবে হিসাব রাখবেন।</li>
                        <li>বছরে অন্তত একবার অডিট করে সদস্যদের সামনে উপস্থাপন করতে হবে।</li>
                     </ul>
                  </AccordionContent>
               </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Values Section */}
        <section className="text-center space-y-8 pb-12">
          <h2 className="text-3xl font-bold tracking-tight">আমাদের প্রতিশ্রুতি</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
               <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Handshake className="h-6 w-6 text-primary" />
               </div>
               <h3 className="text-xl font-bold">ভ্রাতৃত্ববোধ</h3>
               <p className="text-muted-foreground">ইসলামী ভ্রাতৃত্ববোধ ও একে অপরের সহযোগিতা।</p>
            </div>
            <div className="space-y-2">
               <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
               </div>
               <h3 className="text-xl font-bold">আর্থিক স্থিতিশীলতা</h3>
               <p className="text-muted-foreground">হালাল উপায়ে সকলের জন্য আর্থিক নিরাপত্তা নিশ্চিত করা।</p>
            </div>
            <div className="space-y-2">
               <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-primary" />
               </div>
               <h3 className="text-xl font-bold">স্বচ্ছতা</h3>
               <p className="text-muted-foreground">লেনদেনে সম্পূর্ণ স্বচ্ছতা ও জবাবদিহিতা।</p>
            </div>
          </div>
        </section>

        {/* Closing Statement */}
        <section className="max-w-3xl mx-auto text-center py-12 border-t">
          <div className="space-y-4">
             <div className="flex justify-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
             </div>
             <blockquote className="text-xl font-medium italic text-muted-foreground">
              &quot;আল্লাহ্‌ তা&apos;আলার ওপর ভরসা করে আমরা আমাদের এই সমাজের কার্যক্রম শুরু করছি।
              তিনি যেন আমাদের সবাইকে হালাল পথে চলার তাওফিক দান করেন এবং এই উদ্যোগকে কল্যাণ ও বরকতের মাধ্যমে কবুল করেন।&quot;
             </blockquote>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Friends Development Society (FDS)</p>
          <p>বন্ধুত্ব, সহযোগিতা এবং সমৃদ্ধির প্রতীক</p>
          <p className="mt-4">© 2025 FDS. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  )
}
