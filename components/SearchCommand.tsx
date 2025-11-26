"use client"

import { useEffect, useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "./ui/button"

interface SearchCommandProps {
  renderAs?: 'button' | 'text'
  label?: string
  initialStocks?: any[]
}

export function SearchCommand({ 
  renderAs = 'button', 
  label = 'Add stock', 
  initialStocks = [] 
}: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelectStock = () => {
    console.log("Stock selected")
    setOpen(false) // Close dialog on selection
  }

  return (
    <>
      {/* 1. Render the Trigger (Text or Button) */}
      {renderAs === 'text' ? (
        <span 
          onClick={() => setOpen(true)} 
          className="cursor-pointer hover:text-yellow-500 transition-colors"
        >
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)}>
          {label}
        </Button>
      )}

      {/* 2. Render the Dialog (Hidden until open is true) */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          {loading ? (
            <div className="py-6 text-center text-sm">Loading...</div>
          ) : (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Stocks">
                {/* Example Items */}
                <CommandItem onSelect={handleSelectStock}>AAPL</CommandItem>
                <CommandItem onSelect={handleSelectStock}>TSLA</CommandItem>
                <CommandItem onSelect={handleSelectStock}>NVDA</CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
