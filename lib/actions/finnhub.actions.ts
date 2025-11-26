'use server';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { cache } from 'react';
import { POPULAR_STOCK_SYMBOLS } from '../constants';

// Define types locally if not imported to avoid implicit any errors, 
// or ensure they are imported from types/global.d.ts
// Assuming these are globally available based on your file structure.

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

/**
 * Fetches a URL and parses its JSON response.
 *
 * @param url - The request URL to fetch.
 * @param revalidateSeconds - If provided, uses a cached response and sets Next.js `revalidate` to this value; otherwise forces a no-store request.
 * @returns The parsed JSON response as `T`.
 * @throws Error if the response status is not OK; the error message includes the HTTP status and any returned text when available.
 */
async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
    ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
    : { cache: 'no-store' };

  const response = await fetch(url, options);

  if (!response.ok) {
    // Attempt to read text to give a better error message
    const text = await response.text().catch(() => 'Unknown error');
    throw new Error(`Finnhub API error ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

export const getNews = async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
  try {
    const { from, to } = getDateRange(5);
    const tokenParam = `&token=${FINNHUB_API_KEY}`;

    if (symbols && symbols.length > 0) {
      // Clean and uppercase symbols, remove empty ones
      const cleanSymbols = symbols
        .map((s) => s?.trim().toUpperCase())
        .filter((s): s is string => Boolean(s));

      const symbolNewsMap = new Map<string, RawNewsArticle[]>();

      // Parallel fetch for all symbols
      await Promise.all(
        cleanSymbols.map(async (symbol) => {
          const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}${tokenParam}`;
          try {
            const data = await fetchJSON<RawNewsArticle[]>(url, 3600); // Cache for 1 hour
            if (Array.isArray(data)) {
              // Pre-filter valid articles to save iterations later
              symbolNewsMap.set(symbol, data.filter(validateArticle));
            }
          } catch (e) {
            console.error(`Failed to fetch news for ${symbol}`, e);
            symbolNewsMap.set(symbol, []);
          }
        })
      );

      const newsArticles: MarketNewsArticle[] = [];
      let totalCollected = 0;
      const maxArticles = 6;
      
      // Round-robin selection
      // We loop maxArticles times to ensure we give every symbol a fair chance 
      // until we fill our quota.
      for (let round = 0; round < maxArticles; round++) {
        let addedInRound = 0;
        
        for (const symbol of cleanSymbols) {
          if (totalCollected >= maxArticles) break;

          const articles = symbolNewsMap.get(symbol);
          if (articles && articles.length > 0) {
            const article = articles.shift(); // Take the newest remaining article
            if (article) {
              newsArticles.push(formatArticle(article, true, symbol, totalCollected));
              totalCollected++;
              addedInRound++;
            }
          }
        }
        
        if (totalCollected >= maxArticles) break;
        if (addedInRound === 0) break; // Exhausted all valid articles
      }

      // If we found specific news, return it sorted
      if (newsArticles.length > 0) {
        return newsArticles.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
      }
      // If no specific news found (e.g. invalid symbols or no news), fall through to general
    }

    // General market news fallback
    const url = `${FINNHUB_BASE_URL}/news?category=general${tokenParam}`;
    const data = await fetchJSON<RawNewsArticle[]>(url, 1800); // Cache for 30 mins

    if (!Array.isArray(data)) return [];

    const seen = new Set<string>();
    const uniqueArticles: RawNewsArticle[] = [];
    
    for (const article of data) {
        if (!validateArticle(article)) continue;
        const key = `${article.id}-${article.url}-${article.headline}`;
        if (seen.has(key)) continue;
        
        seen.add(key);
        uniqueArticles.push(article);
        
        if (uniqueArticles.length >= 6) break; // Optimization: stop once we have enough
    }

    return uniqueArticles.map((article, index) => 
      formatArticle(article, false, undefined, index)
    );

  } catch (error) {
    console.error("Error in getNews:", error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
  try {
    const token = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      console.error('Error in stock search: FINNHUB API key is not configured');
      return [];
    }

    const trimmed = typeof query === 'string' ? query.trim() : '';
    let results: FinnhubSearchResult[] = [];

    if (!trimmed) {
      // Fetch top 10 popular symbols' profiles
      const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
      const profiles = await Promise.all(
        top.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
            const profile = await fetchJSON<any>(url, 3600);
            return { sym, profile };
          } catch (e) {
            console.error('Error fetching profile2 for', sym, e);
            return { sym, profile: null };
          }
        })
      );

      results = profiles
        .map(({ sym, profile }) => {
          const symbol = sym.toUpperCase();
          const name = profile?.name || profile?.ticker || undefined;
          const exchange = profile?.exchange || undefined;
          
          if (!name) return undefined;

          const r: FinnhubSearchResult = {
            symbol,
            description: name,
            displaySymbol: symbol,
            type: 'Common Stock',
          };
          // Internal exchange hack to carry data to next step
          (r as any).__exchange = exchange;
          return r;
        })
        .filter((x): x is FinnhubSearchResult => Boolean(x));
    } else {
      const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
      const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
      results = Array.isArray(data?.result) ? data.result : [];
    }

    // Map to final StockWithWatchlistStatus shape
    const mapped: StockWithWatchlistStatus[] = results
      .map((r) => {
        const upper = (r.symbol || '').toUpperCase();
        const name = r.description || upper;
        // Prioritize displaySymbol, then internal exchange hack, then default 'US'
        const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
        const exchangeFromProfile = (r as any).__exchange as string | undefined;
        const exchange = exchangeFromProfile || exchangeFromDisplay || 'US';
        const type = r.type || 'Stock';

        return {
          symbol: upper,
          name,
          exchange,
          type,
          isInWatchlist: false, // Default, will be updated by UI or another layer
        };
      })
      // Filter out items without symbols
      .filter(item => item.symbol)
      .slice(0, 15);

    return mapped;
  } catch (err) {
    console.error('Error in stock search:', err);
    return [];
  }
});