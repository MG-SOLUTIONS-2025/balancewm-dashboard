"use client"

import { useEffect, useState, useCallback } from "react"
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
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { useDebounce } from "@/hooks/useDebounce"

// Define the type for your stock data (assuming this is global or imported)
interface StockWithWatchlistStatus {
  symbol: string
  name: string
  exchange: string
  type: string
  isInWatchlist: boolean
}

interface SearchCommandProps {
  renderAs?: 'button' | 'text'
  label?: string
  initialStocks?: StockWithWatchlistStatus[]
}

/**
 * Render a searchable command-style dialog for finding and selecting stocks, triggered by either a button or inline text.
 *
 * @param renderAs - Determines the trigger UI: `'button'` renders a Button, `'text'` renders an inline clickable label. Defaults to `'button'`.
 * @param label - Visible text shown in the trigger. Defaults to `'Add stock'`.
 * @param initialStocks - Initial list of stocks (with watchlist status) displayed before any search is performed. Defaults to an empty array.
 * @returns The SearchCommand React element that shows a trigger and a debounced search dialog with results and item navigation.
 */
export function SearchCommand({
  renderAs = 'button',
  label = 'Add stock',
  initialStocks = []
}: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks)

  // Derived state
  const isSearchMode = !!searchTerm.trim()
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10)

  // Toggle dialog with keyboard shortcut
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

  // 1. Define the search logic (useCallback to keep reference stable)
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setStocks(initialStocks)
      return
    }

    setLoading(true)
    try {
      const results = await searchStocks(searchTerm.trim())
      setStocks(results)
    } catch (error) {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, initialStocks])

  // 2. Create the debounced function
  const debouncedSearch = useDebounce(handleSearch, 300)

  // 3. Trigger debounce when searchTerm changes
  useEffect(() => {
    debouncedSearch()
  }, [debouncedSearch]) // searchTerm is implicit because debouncedSearch depends on handleSearch which depends on searchTerm

  const handleSelectStock = () => {
    setOpen(false)
    setSearchTerm("")
    setStocks(initialStocks)
  }

  return (
    <>
      {/* Trigger */}
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

      {/* Dialog */}
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
              {displayStocks?.map((stock) => (
                <li key={stock.symbol} className="search-item relative group">
                   {/* Make the whole row clickable via absolute positioning */}
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    onClick={handleSelectStock}
                    className="search-item-link absolute inset-0 z-10"
                  >
                     <span className="sr-only">View {stock.symbol}</span>
                  </Link>
                  
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