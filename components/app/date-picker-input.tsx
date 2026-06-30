"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function DatePickerInput({
  name,
  value,
  onChange,
  id,
  placeholder = "Choose date",
  clearable = false,
}: {
  name: string
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  clearable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const date = value ? parseDateString(value) : undefined

  return (
    <div className="flex gap-2">
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon data-icon="inline-start" />
            {date ? format(date, "MMM d, yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selected) => {
              if (selected) onChange(formatDateString(selected))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {clearable && value ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Clear date"
          onClick={() => onChange("")}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  )
}
