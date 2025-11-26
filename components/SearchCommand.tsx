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
import { Loader2, TrendingUp } from "lucide-react"
import Link from "next/link"

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
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10)

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
        <div className="search-field">
          <CommandInput
            placeholder="Type a command or search..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          {loading && <Loader2 className="search-loader" />}
        </div>
        <CommandList className="search-list">
          {loading ? (
            <CommandEmpty className="search-list-empty">Loading...</CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="search-list-indicator">
              {isSearchMode ? 'No results found' : 'No stocks available'}
            </div>
          ) : (
            <ul>
              <div className="search-count">
                {isSearchMode ? 'Search results' : 'Popular stocks'}
                {` `}({displayStocks?.length || 0})
              </div>
              {displayStocks?.map((stock, i) => (
                <li key={stock.symbol} className="search-item">
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    onClick={handleSelectStock}
                    className="search-item-link"
                  />
                  <TrendingUp className='h-4 text-gray-500' />
                  <div className="flex-1">
                    <div className="search-item-name">
                      {stock.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {stock.symbol} | {stock.exchange} | {stock.type}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
