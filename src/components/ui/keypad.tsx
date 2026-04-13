"use client"

import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"

interface KeypadProps {
  onInput: (num: string) => void
  onDelete: () => void
  className?: string
}

export function Keypad({ onInput, onDelete, className }: KeypadProps) {
  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          type="button"
          variant="outline"
          className="h-12 text-xl font-medium active:bg-primary/10"
          onClick={() => onInput(num.toString())}
        >
          {num}
        </Button>
      ))}
      <div />
      <Button
        type="button"
        variant="outline"
        className="h-12 text-xl font-medium active:bg-primary/10"
        onClick={() => onInput("0")}
      >
        0
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onDelete}
      >
        <Delete className="w-6 h-6" />
      </Button>
    </div>
  )
}
