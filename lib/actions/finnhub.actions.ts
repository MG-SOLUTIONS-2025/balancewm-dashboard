"use server";

import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

async function fetchJSON(url: string, revalidateSeconds?: number) {
  const options: RequestInit = revalidateSeconds
    ? { cache: "force-cache", next: { revalidate: revalidateSeconds } }
    : { cache: "no-store" };

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.statusText}`);
  }

  return response.json();
}

export const getNews = async (symbols?: string[]) => {
  try {
    const { from, to } = getDateRange(5);
    const tokenParam = `&token=${FINNHUB_API_KEY}`;

    if (symbols && symbols.length > 0) {
      // Clean and uppercase symbols
      const cleanSymbols = symbols.map((s) => s.trim().toUpperCase());
      const newsArticles: MarketNewsArticle[] = [];
      
      // We want max 6 articles total
      // Round-robin: iterate up to 6 times, picking one symbol each time if available
      // But actually, efficiently, we might want to just fetch news for each symbol once and then interleave?
      // Instructions say: "Loop max 6 times, round-robin through symbols."
      // "Fetch company news for each symbol." -> This implies fetching inside the loop or pre-fetching?
      // fetching inside loop 6 times might be too many requests if we have 6 symbols. 
      // But "Take one valid article per round" implies we want diversity.
      
      // Optimization: Fetch news for all unique symbols first (or up to N).
      // Since we have a round-robin requirement, let's fetch for each unique symbol involved.
      // But if we have 50 symbols, we shouldn't fetch 50.
      // Let's just limit to the first few symbols or all if reasonably small?
      // The prompt says "Loop max 6 times, round-robin through symbols." 
      // This probably refers to *selecting* articles.
      // "Fetch company news for each symbol" -> Let's assume we fetch for all provided symbols (limit if necessary, but usually watchlist isn't huge).
      
      const symbolNewsMap = new Map<string, RawNewsArticle[]>();

      // Parallel fetch for all symbols
      await Promise.all(
        cleanSymbols.map(async (symbol) => {
          const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}${tokenParam}`;
          try {
            const data = await fetchJSON(url, 3600); // Cache for 1 hour
            if (Array.isArray(data)) {
               symbolNewsMap.set(symbol, data.filter(validateArticle));
            }
          } catch (e) {
            console.error(`Failed to fetch news for ${symbol}`, e);
          }
        })
      );

      // Round-robin selection
      let totalCollected = 0;
      let round = 0;
      // Max 6 articles
      while (totalCollected < 6 && round < 6) { // Safety break
        let addedInRound = 0;
        for (const symbol of cleanSymbols) {
            if (totalCollected >= 6) break;
            
            const articles = symbolNewsMap.get(symbol);
            if (articles && articles.length > 0) {
                // Take the first one (most recent usually? Finnhub returns sorted?)
                // Finnhub usually returns newest first? If not we should sort?
                // Assuming we just shift the first one.
                const article = articles.shift(); 
                if (article) {
                    newsArticles.push(formatArticle(article, true, symbol));
                    totalCollected++;
                    addedInRound++;
                }
            }
        }
        if (addedInRound === 0) break; // No more articles available for any symbol
        round++;
      }

      // Sort by datetime desc
      return newsArticles.sort((a, b) => b.datetime - a.datetime);

    } else {
      // General market news
      const url = `${FINNHUB_BASE_URL}/news?category=general${tokenParam}`;
      const data = await fetchJSON(url, 1800); // Cache for 30 mins

      if (!Array.isArray(data)) return [];

      // Deduplicate by id, url, headline
      const seen = new Set();
      const uniqueArticles = data.filter((article: RawNewsArticle) => {
        if (!validateArticle(article)) return false;
        const key = `${article.id}-${article.url}-${article.headline}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Take top 6 and format
      return uniqueArticles.slice(0, 6).map((article: RawNewsArticle, index: number) => 
        formatArticle(article, false, undefined, index)
      );
    }

  } catch (error) {
    console.error("Error in getNews:", error);
    throw new Error("Failed to fetch news");
  }
};