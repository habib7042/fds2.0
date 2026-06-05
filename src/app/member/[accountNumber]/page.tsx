"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Download, Calendar, DollarSign, User, Phone, Mail, MapPin, Edit, FileText, Heart, UserPlus, Image as ImageIcon, MessageSquare, Bell, Lock, CheckCircle2, MoreVertical, CreditCard, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Keypad } from "@/components/ui/keypad"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MemberCard } from "@/components/member-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Adjustment {
  id: string
  type: string
  amount: number
  date: string
  description?: string
}

interface FundAdjustment {
  id: string
  type: string
  amount: number
  date: string
  description?: string
}

interface Member {
  id: string
  accountNumber: string
  name: string
  phone?: string
  email?: string
  address?: string
  dob?: string
  nid?: string
  fatherName?: string
  motherName?: string
  maritalStatus?: string
  nomineeName?: string
  nomineeNid?: string
  nomineeRelation?: string
  profileImage?: string
  nomineeImage?: string
  createdAt: string
  contributions: Contribution[]
  adjustments: Adjustment[]
  fundAdjustments: FundAdjustment[]
  memberCount: number
  isVerified?: boolean
}

interface Contribution {
  id: string
  memberId: string
  month: string
  year: number
  amount: number
  paymentDate: string
  description?: string
}

const monthNames = {
  "01": "জানুয়ারি", "02": "ফেব্রুয়ারি", "03": "মার্চ", "04": "এপ্রিল",
  "05": "মে", "06": "জুন", "07": "জুলাই", "08": "আগস্ট",
  "09": "সেপ্টেম্বর", "10": "অক্টোবর", "11": "নভেম্বর", "12": "ডিসেম্বর"
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function MemberDashboard() {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPin, setIsChangingPin] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [saving, setSaving] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const params = useParams()
  const router = useRouter()
  const accountNumber = params.accountNumber as string

  // Form state
  const [formData, setFormData] = useState<Partial<Member>>({})
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [nomineeImageFile, setNomineeImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchMemberData()
  }, [accountNumber])

  useEffect(() => {
    if (member) {
      setFormData({
        dob: member.dob || "",
        nid: member.nid || "",
        fatherName: member.fatherName || "",
        motherName: member.motherName || "",
        maritalStatus: member.maritalStatus || "",
        nomineeName: member.nomineeName || "",
        nomineeNid: member.nomineeNid || "",
        nomineeRelation: member.nomineeRelation || "",
        phone: member.phone || "",
        email: member.email || "",
        address: member.address || "",
      })
    }
  }, [member])

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const sub = await registration.pushManager.getSubscription()
        setIsSubscribed(!!sub)
      })
    }
  }, [])

  const fetchMemberData = async () => {
    try {
      const response = await fetch(`/api/member/${accountNumber}`)
      if (response.ok) {
        const data = await response.json()
        setMember(data)
      } else {
        setError("Member not found")
        router.push("/")
      }
    } catch (err) {
      setError("Network error occurred")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("memberAccount")
    router.push("/")
  }

  const handleDownloadCalendarReminder = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FDS//Monthly Deposit Reminder//EN
BEGIN:VEVENT
SUMMARY:FDS Monthly Deposit Reminder
DESCRIPTION:Please remember to make your monthly deposit to the Friends Development Society.
RRULE:FREQ=MONTHLY;BYMONTHDAY=10
DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
UID:fds-reminder-${new Date().getTime()}@fds.com
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'fds_monthly_deposit.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("ক্যালেন্ডার রিমাইন্ডার ডাউনলোড হয়েছে");
  }

  const handleSubscribe = async () => {
    if (!member) return
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
          console.error("VAPID Public Key not found")
          toast.error("Push notifications not configured")
          return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription, memberId: member.id })
      })

      setIsSubscribed(true)
      toast.success("Notifications enabled!")
    } catch (err) {
      console.error("Subscription failed", err)
      toast.error("Failed to enable notifications")
    }
  }

  const handleChangePin = async () => {
     if (!newPin || newPin.length < 4) {
        toast.error("পিন অন্তত ৪ ডিজিট হতে হবে")
        return
     }

     try {
        const res = await fetch(`/api/member/${accountNumber}`, {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ pin: newPin })
        })
        if (res.ok) {
           toast.success("পিন পরিবর্তন সফল হয়েছে")
           setIsChangingPin(false)
           setNewPin("")
        } else {
           toast.error("পিন পরিবর্তন ব্যর্থ হয়েছে")
        }
     } catch (e) {
        toast.error("ত্রুটি হয়েছে")
     }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = new FormData()

      // Append text fields
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof Member]
        if (value) {
          data.append(key, value as string)
        }
      })

      // Append files
      if (profileImageFile) {
        data.append("profileImage", profileImageFile)
      }
      if (nomineeImageFile) {
        data.append("nomineeImage", nomineeImageFile)
      }

      const response = await fetch(`/api/member/${accountNumber}`, {
        method: "PATCH",
        body: data,
      })

      if (response.ok) {
        const updatedMember = await response.json()
        setMember((prev) => prev ? { ...prev, ...updatedMember } : null)
        setIsEditing(false)
        setProfileImageFile(null)
        setNomineeImageFile(null)
        toast.success("প্রোফাইল আপডেট সফল হয়েছে")
      } else {
        toast.error("প্রোফাইল আপডেট ব্যর্থ হয়েছে")
      }
    } catch (error) {
      toast.error("নেটওয়ার্ক ত্রুটি হয়েছে")
    } finally {
      setSaving(false)
    }
  }

  const toBengaliNumber = (num: number | string) => {
    if (num === undefined || num === null) return "০"
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
  }

  const getMonthName = (month: string) => {
    return monthNames[month as keyof typeof monthNames] || month
  }


  // Calculate Due Info
  const calculateDue = () => {
    if (!member) return { months: 0, amount: 0, status: 'No Due' };

    const joinDate = new Date(member.createdAt);
    const currentDate = new Date();

    let totalMonths = (currentDate.getFullYear() - joinDate.getFullYear()) * 12;
    totalMonths -= joinDate.getMonth();
    totalMonths += currentDate.getMonth() + 1; // Include current month

    // Stop accruing dues if inactive. This requires knowing WHEN they became inactive,
    // but without tracking that, we can assume if inactive, dues don't increment from now.
    // If they are inactive, we ideally stop at updatedAt, but to keep it simple, we just use current date or their last update.
    if (member.isActive === false) {
      const updateDate = new Date(member.updatedAt);
      totalMonths = (updateDate.getFullYear() - joinDate.getFullYear()) * 12;
      totalMonths -= joinDate.getMonth();
      totalMonths += updateDate.getMonth() + 1;
    }

    if (totalMonths <= 0) totalMonths = 1;

    const expectedContribution = totalMonths * 1000;
    const paidContribution = member.contributions.reduce((sum, c) => sum + c.amount, 0);

    const dueAmount = expectedContribution - paidContribution;
    const dueMonths = Math.ceil(dueAmount / 1000);

    return {
      months: dueMonths > 0 ? dueMonths : 0,
      amount: dueAmount > 0 ? dueAmount : 0,
    };
  };

  const dueInfo = calculateDue();

  const getTotalBalance = () => {
    if (!member) return 0
    const contributions = member.contributions.reduce((sum, c) => sum + c.amount, 0)

    // Personal Adjustments
    const personalInterests = member.adjustments?.filter(a => a.type === 'INTEREST').reduce((sum, a) => sum + a.amount, 0) || 0
    const personalCharges = member.adjustments?.filter(a => a.type === 'CHARGE').reduce((sum, a) => sum + a.amount, 0) || 0

    // Global Adjustments (Share)
    const memberCount = Math.max(1, member.memberCount)
    const globalInterests = member.fundAdjustments?.filter(a => a.type === 'INTEREST').reduce((sum, a) => sum + (a.amount / memberCount), 0) || 0
    const globalCharges = member.fundAdjustments?.filter(a => a.type === 'CHARGE').reduce((sum, a) => sum + (a.amount / memberCount), 0) || 0

    return contributions + personalInterests - personalCharges + globalInterests - globalCharges
  }

  const getCurrentYearContributions = () => {
    if (!member) return 0
    const currentYear = new Date().getFullYear()
    return member.contributions
      .filter(c => c.year === currentYear)
      .reduce((sum, contribution) => sum + contribution.amount, 0)
  }

  const generatePDF = async () => {
    if (!member) return
    setGeneratingPDF(true)
    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) throw new Error('Unable to open print window')

      const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0)

      // Personal Adjustments
      const personalAdjSum = (member.adjustments || []).reduce((sum, adj) => {
        return adj.type === 'INTEREST' ? sum + adj.amount : sum - adj.amount
      }, 0)

      // Global Adjustments (Share)
      const memberCount = Math.max(1, member.memberCount)
      const globalAdjSum = (member.fundAdjustments || []).reduce((sum, adj) => {
         // Calculate share per member for this adjustment
         const share = adj.amount / memberCount
         return adj.type === 'INTEREST' ? sum + share : sum - share
      }, 0)

      const totalBalance = totalContributions + personalAdjSum + globalAdjSum

      // Prepare transaction list
      const transactions = [
          ...member.contributions.map(c => ({
              date: new Date(c.paymentDate),
              desc: 'মাসিক চাঁদা',
              details: `${getMonthName(c.month)} ${toBengaliNumber(c.year)}`,
              amount: c.amount,
              isNegative: false
          })),
          ...(member.adjustments || []).map(a => ({
              date: new Date(a.date),
              desc: a.type === 'INTEREST' ? 'মুনাফা/চার্জ' : 'মুনাফা/চার্জ',
              details: a.type === 'INTEREST' ? 'ব্যাংক মুনাফা' : 'ব্যাংক চার্জ',
              amount: a.amount,
              isNegative: a.type === 'CHARGE'
          })),
          ...(member.fundAdjustments || []).map(a => ({
              date: new Date(a.date),
              desc: 'গ্লোবাল শেয়ার',
              details: a.type === 'INTEREST' ? 'ব্যাংক মুনাফা (শেয়ার)' : 'ব্যাংক চার্জ (শেয়ার)',
              amount: a.amount / memberCount,
              isNegative: a.type === 'CHARGE'
          }))
      ].sort((a, b) => b.date.getTime() - a.date.getTime())

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>হিসাব স্টেটমেন্ট - ${member.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Noto Sans Bengali', sans-serif;
              padding: 0;
              margin: 0;
              background-color: #f0f2f5;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .page {
              background: white;
              width: 210mm;
              min-height: 297mm;
              margin: 20px auto;
              padding: 40px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              position: relative;
              box-sizing: border-box;
              border: 10px solid transparent;
              border-image: linear-gradient(to right, #16a34a, #15803d) 1;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              color: rgba(22, 163, 74, 0.08);
              font-weight: 800;
              pointer-events: none;
              white-space: nowrap;
              z-index: 0;
              border: 5px solid rgba(22, 163, 74, 0.1);
              padding: 20px 50px;
              border-radius: 20px;
            }
            @media print {
              body { background: none; margin: 0; }
              .page { margin: 0; width: 100%; box-shadow: none; border-width: 5px; }
            }
            .header-banner {
              background: linear-gradient(135deg, #16a34a 0%, #047857 100%);
              color: white;
              padding: 35px;
              border-radius: 4px;
              margin-bottom: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              position: relative;
              z-index: 1;
              box-shadow: 0 4px 15px rgba(22, 163, 74, 0.2);
            }
            .brand h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 800;
              letter-spacing: -0.5px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .brand p {
              margin: 5px 0 0;
              font-size: 14px;
              opacity: 0.95;
            }
            .statement-title {
              text-align: right;
            }
            .statement-title h2 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
              opacity: 1;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .statement-title p {
              margin: 5px 0 0;
              font-size: 12px;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.95);
            }
            .content {
              position: relative;
              z-index: 1;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1.5fr 1fr;
              gap: 50px;
              margin-bottom: 40px;
            }
            .info-box {
              padding: 20px;
              background: #fcfcfc;
              border-radius: 8px;
              border-left: 4px solid #16a34a;
              box-shadow: 0 2px 5px rgba(0,0,0,0.02);
            }
            .info-box h3 {
              font-size: 12px;
              text-transform: uppercase;
              color: #16a34a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-bottom: 10px;
              letter-spacing: 1px;
              font-weight: 700;
            }
            .info-row {
              display: flex;
              margin-bottom: 4px;
              font-size: 11px;
              color: #334155;
            }
            .info-row span:first-child {
              width: 100px;
              color: #64748b;
              font-weight: 600;
            }
            .info-row strong {
              color: #0f172a;
              font-weight: 700;
            }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              font-size: 11px;
              margin-bottom: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              overflow: hidden;
            }
            th {
              background-color: #16a34a;
              color: white;
              font-weight: 600;
              text-align: left;
              padding: 8px 10px;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            td {
              padding: 6px 10px;
              border-bottom: 1px solid #e2e8f0;
              color: #334155;
            }
            tr:last-child td {
              border-bottom: none;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:hover {
              background-color: #f0fdf4;
            }
            .amount {
              text-align: right;
              font-family: monospace;
              font-size: 11px;
              font-weight: 700;
            }
            .summary-box {
              background: #f0fdf4;
              border: 2px solid #16a34a;
              border-radius: 12px;
              padding: 15px;
              margin-top: 20px;
              break-inside: avoid;
              box-shadow: 0 4px 10px rgba(22, 163, 74, 0.05);
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              font-size: 12px;
              color: #334155;
            }
            .summary-row.total {
              border-top: 2px dashed #16a34a;
              margin-top: 15px;
              padding-top: 15px;
              font-weight: 800;
              font-size: 20px;
              color: #16a34a;
            }
            .footer {
              margin-top: 60px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 30px;
            }
            .footer p:last-child {
              font-weight: 600;
              color: #16a34a;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="watermark">FDS OFFICIAL</div>

            <div class="header-banner">
              <div class="brand">
                <h1>Friends Development Society</h1>
                <p>বন্ধুত্ব ও সহযোগিতার এক অনন্য বন্ধন</p>
              </div>
              <div class="statement-title">
                <h2>হিসাব বিবরণী</h2>
                <p>প্রিন্ট: ${new Date().toLocaleString('bn-BD')}</p>
              </div>
            </div>

            <div class="content">
              <div class="info-grid">
                <div class="info-box">
                  <h3>সদস্যের তথ্য</h3>
                  <div class="info-row">
                    <span>নাম:</span>
                    <strong>${member.name}</strong>
                  </div>
                  <div class="info-row">
                    <span>একাউন্ট নম্বর:</span>
                    <strong>${toBengaliNumber(member.accountNumber)}</strong>
                  </div>
                  <div class="info-row">
                    <span>মোবাইল:</span>
                    <span>${toBengaliNumber(member.phone || 'N/A')}</span>
                  </div>
                  <div class="info-row">
                    <span>ঠিকানা:</span>
                    <span>${member.address || 'N/A'}</span>
                  </div>
                </div>
                <div class="info-box">
                  <h3>সারসংক্ষেপ</h3>
                  <div class="info-row">
                    <span>মোট জমা:</span>
                    <span class="amount" style="color: #16a34a">৳${toBengaliNumber(totalContributions)}</span>
                  </div>
                  <div class="info-row">
                    <span>মুনাফা/চার্জ:</span>
                    <span class="amount" style="color: ${personalAdjSum + globalAdjSum >= 0 ? '#16a34a' : '#dc2626'}">
                      ৳${toBengaliNumber((personalAdjSum + globalAdjSum).toFixed(2))}
                    </span>
                  </div>
                </div>
              </div>

          <div class="table-container">
            <h3>সাম্প্রতিক লেনদেন</h3>
            <table>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>বিবরণ</th>
                  <th>বিস্তারিত</th>
                  <th style="text-align: right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(t => `
                  <tr>
                    <td>${t.date.toLocaleDateString('bn-BD')}</td>
                    <td>${t.desc}</td>
                    <td>${t.details}</td>
                    <td class="amount" style="color: ${t.isNegative ? '#dc2626' : 'inherit'}">
                      ${t.isNegative ? '-' : ''}৳${toBengaliNumber(t.amount.toFixed(2))}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="summary-box">
            <div class="summary-row">
              <span>মোট চাঁদা</span>
              <span class="amount">৳${toBengaliNumber(totalContributions)}</span>
            </div>
            <div class="summary-row">
              <span>ব্যক্তিগত মুনাফা/চার্জ</span>
              <span class="amount" style="color: ${personalAdjSum >= 0 ? 'inherit' : '#dc2626'}">
                ৳${toBengaliNumber(personalAdjSum.toFixed(2))}
              </span>
            </div>
            <div class="summary-row">
              <span>গ্লোবাল মুনাফা/চার্জ (শেয়ার)</span>
              <span class="amount" style="color: ${globalAdjSum >= 0 ? 'inherit' : '#dc2626'}">
                ৳${toBengaliNumber(globalAdjSum.toFixed(2))}
              </span>
            </div>
            <div class="summary-row total">
              <span>সর্বমোট স্থিতি</span>
              <span class="amount">৳${toBengaliNumber(totalBalance.toFixed(2))}</span>
            </div>
          </div>

          <div class="footer">
            <p>এই স্টেটমেন্টটি কম্পিউটার দ্বারা প্রস্তুতকৃত এবং এর জন্য কোনো স্বাক্ষরের প্রয়োজন নেই।</p>
            <p>© ${new Date().getFullYear()} Friends Development Society (FDS)</p>
          </div>
          </div>
          </div>

          <script>window.print();</script>
        </body>
        </html>
      `
      printWindow.document.write(htmlContent)
      printWindow.document.close()
    } catch (error) {
      console.error(error)
      setError('PDF generation failed')
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
  if (!member) return null

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      {/* Modern Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 sticky top-0 z-20 shadow-lg text-white backdrop-blur-md bg-opacity-90">
         <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Avatar className="h-9 w-9 border-2 border-white/30">
                  <AvatarImage src={member.profileImage} alt={member.name} />
                  <AvatarFallback className="bg-white/20 text-white font-bold">{member.name.charAt(0)}</AvatarFallback>
               </Avatar>
               <div>
                  <h1 className="text-sm font-bold leading-none">{member.name}</h1>
                  <p className="text-[10px] text-white/80 mt-0.5 font-mono">AC: {toBengaliNumber(member.accountNumber)}</p>
               </div>
            </div>

            <div className="flex items-center gap-1">
               <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={() => router.push(`/member/${accountNumber}/community`)}>
                  <MessageSquare className="h-5 w-5" />
               </Button>
               {!isSubscribed && (
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={handleSubscribe}>
                     <Bell className="h-5 w-5" />
                  </Button>
               )}

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                        <MoreVertical className="h-5 w-5" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                     <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-medium">
                        <LogOut className="h-4 w-4 mr-2" /> লগআউট
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>
      </div>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">


        {/* Inactive Member Warning */}
        {member.isActive === false && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center gap-3 shadow-sm"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-sm font-medium leading-relaxed">
              আপনার সদস্যপদ স্থগিত করা হয়েছে। নতুন কোনো চাঁদা যোগ করা যাবে না। তবে আপনার জমাকৃত টাকা ও হিসাব সুরক্ষিত আছে।
            </div>
          </motion.div>
        )}

        {/* Member Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
           <MemberCard member={{ name: member.name, accountNumber: member.accountNumber, balance: getTotalBalance() }} />
        </motion.div>

        {/* Quick Actions / Stats */}
        <div className="grid grid-cols-3 gap-3">
           <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                 </div>
                 <div>
                    <div className="text-xl font-bold text-gray-900">৳{toBengaliNumber(getTotalBalance().toFixed(0))}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">বর্তমান স্থিতি</div>
                 </div>
              </CardContent>
           </Card>
           <Card className="bg-white border-0 shadow-md">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar className="h-5 w-5" />
                 </div>
                 <div>
                    <div className="text-xl font-bold text-gray-900">৳{toBengaliNumber(getCurrentYearContributions())}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">চলতি বছর</div>
                 </div>
              </CardContent>
           </Card>
           <Card className="bg-white border-0 shadow-md cursor-pointer hover:bg-slate-50 transition-colors" onClick={handleDownloadCalendarReminder}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                 <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <Bell className="h-5 w-5" />
                 </div>
                 <div>
                    <div className="text-sm font-bold text-gray-900 mt-1">রিমাইন্ডার</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">মাসিক চাঁদা</div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100/80 rounded-xl mb-6">
            <TabsTrigger value="history" className="rounded-lg text-xs font-medium">লেনদেন</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg text-xs font-medium">প্রোফাইল</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4 min-h-[300px]">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={generatePDF} disabled={generatingPDF}>
                <Download className="mr-2 h-4 w-4" />
                {generatingPDF ? "তৈরি হচ্ছে..." : "স্টেটমেন্ট ডাউনলোড"}
              </Button>
            </div>

            <div className="space-y-3">
              {/* Merge Contributions and Adjustments */}
              {(() => {
                  const allItems = [
                      ...member.contributions.map(c => ({
                          id: c.id,
                          type: 'CONTRIBUTION',
                          amount: c.amount,
                          date: c.paymentDate,
                          title: `${getMonthName(c.month)} ${c.year}`,
                          subtitle: 'মাসিক চাঁদা'
                      })),
                      ...(member.adjustments || []).map(a => ({
                          id: a.id,
                          type: a.type,
                          amount: a.amount,
                          date: a.date,
                          title: a.type === 'INTEREST' ? 'ব্যাংক মুনাফা' : 'ব্যাংক চার্জ',
                          subtitle: a.description || ''
                      })),
                      ...(member.fundAdjustments || []).map(a => ({
                          id: a.id,
                          type: a.type,
                          amount: a.amount / Math.max(1, member.memberCount),
                          date: a.date,
                          title: a.type === 'INTEREST' ? 'ব্যাংক মুনাফা (শেয়ার)' : 'ব্যাংক চার্জ (শেয়ার)',
                          subtitle: a.description || ''
                      }))
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                  if (allItems.length === 0) {
                      return (
                        <div className="text-center py-10 text-muted-foreground">
                          কোন লেনদেন নেই
                        </div>
                      )
                  }

                  return allItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="flex items-center p-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {item.title}
                              {item.type === 'CONTRIBUTION' && <Badge variant="secondary" className="text-xs font-normal">Paid</Badge>}
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(item.date).toLocaleDateString("bn-BD")}
                              {item.subtitle && <span className="ml-2">• {item.subtitle}</span>}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`block text-lg font-bold ${item.type === 'CHARGE' ? 'text-red-600' : 'text-green-600'}`}>
                              {item.type === 'CHARGE' ? '-' : '+'}৳{item.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
              })()}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={isChangingPin} onOpenChange={setIsChangingPin}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Lock className="h-4 w-4 mr-2" /> পিন পরিবর্তন
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>পিন পরিবর্তন করুন</DialogTitle>
                        <DialogDescription>আপনার একাউন্টের নিরাপত্তা নিশ্চিত করতে নতুন পিন সেট করুন।</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>নতুন পিন</Label>
                          <Input
                            type="password"
                            value={newPin}
                            readOnly
                            placeholder="****"
                            className="text-center text-xl tracking-widest h-12"
                          />
                        </div>
                        <Keypad
                          onInput={(n) => { if (newPin.length < 6) setNewPin(p => p + n) }}
                          onDelete={() => setNewPin(p => p.slice(0, -1))}
                        />
                      </div>
                      <DialogFooter>
                        <Button onClick={handleChangePin}>পরিবর্তন করুন</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" /> এডিট করুন
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>প্রোফাইল এডিট করুন</DialogTitle>
                        <DialogDescription>
                          আপনার তথ্যে পরিবর্তন এনে সংরক্ষণ করুন।
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
                        {/* Photo Uploads */}
                        <div className="grid grid-cols-2 gap-4 border-b pb-4">
                          <div className="space-y-2">
                              <Label htmlFor="profileImage">আপনার ছবি</Label>
                              <Input
                                  id="profileImage"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="nomineeImage">নমিনির ছবি</Label>
                              <Input
                                  id="nomineeImage"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setNomineeImageFile(e.target.files?.[0] || null)}
                              />
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-2">
                          <Label htmlFor="phone">মোবাইল নম্বর</Label>
                          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">ইমেইল</Label>
                          <Input id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">ঠিকানা</Label>
                          <Textarea id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="dob">জন্মতারিখ</Label>
                              <Input id="dob" type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="maritalStatus">বৈবাহিক অবস্থা</Label>
                              <Select value={formData.maritalStatus} onValueChange={(v) => setFormData({...formData, maritalStatus: v})}>
                                <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="married">বিবাহিত</SelectItem>
                                    <SelectItem value="unmarried">অবিবাহিত</SelectItem>
                                </SelectContent>
                              </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nid">জাতীয় পরিচয়পত্র/জন্ম নিবন্ধন নম্বর</Label>
                          <Input id="nid" value={formData.nid} onChange={(e) => setFormData({...formData, nid: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherName">বাবার নাম</Label>
                          <Input id="fatherName" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherName">মায়ের নাম</Label>
                          <Input id="motherName" value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value})} />
                        </div>

                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-semibold mb-3">নমিনির তথ্য</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomineeName">নমিনির নাম</Label>
                                <Input id="nomineeName" value={formData.nomineeName} onChange={(e) => setFormData({...formData, nomineeName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nomineeRelation">সম্পর্ক</Label>
                                <Input id="nomineeRelation" value={formData.nomineeRelation} onChange={(e) => setFormData({...formData, nomineeRelation: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nomineeNid">নমিনির এনআইডি/জন্ম নিবন্ধন</Label>
                                <Input id="nomineeNid" value={formData.nomineeNid} onChange={(e) => setFormData({...formData, nomineeNid: e.target.value})} />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button type="submit" disabled={saving}>
                            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Profile Image Display */}
                <div className="flex justify-center mb-6">
                   <div className="flex flex-col items-center gap-2">
                      <div className="h-32 w-32 rounded-full border-4 border-muted overflow-hidden bg-muted flex items-center justify-center relative">
                         {member.profileImage ? (
                            <img src={member.profileImage} alt="Profile" className="h-full w-full object-cover" />
                         ) : (
                            <User className="h-16 w-16 text-muted-foreground" />
                         )}
                      </div>
                      <Badge variant="outline">আপনার ছবি</Badge>
                   </div>
                </div>

                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">নাম</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{member.name}</p>
                    {member.isVerified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">একাউন্ট নম্বর</p>
                   <p className="text-sm text-muted-foreground">{member.accountNumber}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">ফোন</p>
                   <p className="text-sm text-muted-foreground">{member.phone || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">ইমেইল</p>
                   <p className="text-sm text-muted-foreground">{member.email || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">ঠিকানা</p>
                   <p className="text-sm text-muted-foreground whitespace-pre-wrap">{member.address || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">জন্মতারিখ</p>
                   <p className="text-sm text-muted-foreground">{member.dob || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">এনআইডি/জন্ম নিবন্ধন</p>
                   <p className="text-sm text-muted-foreground">{member.nid || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">বাবার নাম</p>
                   <p className="text-sm text-muted-foreground">{member.fatherName || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">মায়ের নাম</p>
                   <p className="text-sm text-muted-foreground">{member.motherName || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">বৈবাহিক অবস্থা</p>
                   <p className="text-sm text-muted-foreground">
                      {member.maritalStatus === "married" ? "বিবাহিত" : member.maritalStatus === "unmarried" ? "অবিবাহিত" : "তথ্য নেই"}
                   </p>
                </div>

                <div className="border-t pt-4 mt-4">
                   <h4 className="font-semibold mb-4">নমিনির তথ্য</h4>

                   {/* Nominee Image Display */}
                   <div className="flex justify-start mb-6">
                      <div className="flex flex-col items-center gap-2">
                         <div className="h-24 w-24 rounded-full border-4 border-muted overflow-hidden bg-muted flex items-center justify-center relative">
                            {member.nomineeImage ? (
                               <img src={member.nomineeImage} alt="Nominee" className="h-full w-full object-cover" />
                            ) : (
                               <User className="h-10 w-10 text-muted-foreground" />
                            )}
                         </div>
                         <Badge variant="outline">নমিনির ছবি</Badge>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1">
                         <p className="text-sm font-medium leading-none">নাম</p>
                         <p className="text-sm text-muted-foreground">{member.nomineeName || "তথ্য নেই"}</p>
                      </div>
                      <div className="grid gap-1">
                         <p className="text-sm font-medium leading-none">সম্পর্ক</p>
                         <p className="text-sm text-muted-foreground">{member.nomineeRelation || "তথ্য নেই"}</p>
                      </div>
                      <div className="grid gap-1 col-span-2">
                         <p className="text-sm font-medium leading-none">এনআইডি/জন্ম নিবন্ধন</p>
                         <p className="text-sm text-muted-foreground">{member.nomineeNid || "তথ্য নেই"}</p>
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
