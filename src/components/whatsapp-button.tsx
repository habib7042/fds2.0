"use client"

import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

export function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/8801893669791"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-tr from-green-600 to-teal-500 hover:from-green-500 hover:to-teal-400 text-white p-3 rounded-full shadow-lg transition-all group shadow-green-900/20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      title="হিসাবরক্ষক"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-medium pr-1">
        হিসাবরক্ষক
      </span>
    </motion.a>
  )
}
