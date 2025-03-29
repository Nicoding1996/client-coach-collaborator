"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils" // Verify this path
import { Button } from "@/components/ui/button" // Verify this path
import { Calendar } from "@/components/ui/calendar" // Verify this path
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover" // Verify this path

// Define the expected props
interface DatePickerProps {
  date: Date | undefined; // The selected date value from the form
  onDateChange: (date: Date | undefined) => void; // The function to call when date changes
  className?: string;
  // Add other Button or Popover props you might want to pass through
}

// Rename the function to DatePicker and accept props
export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  // REMOVE the internal useState for date:
  // const [date, setDate] = React.useState<Date>() 

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* Pass down className */}
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className // Apply className prop here
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {/* Use the 'date' prop */}
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date} // Use the 'date' prop
          onSelect={onDateChange} // Use the 'onDateChange' prop
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}