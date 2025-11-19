// import { Button } from "@/components/ui/button"
import Header from "@/components/Header"
import TradingViewWidget from "@/components/TradingViewWidget"
import { MARKET_OVERVIEW_WIDGET_CONFIG } from "@/lib/constants"

const Home = () => {
  return (
    <div className="flex home-wrapper min-h-screen">
      <Header />
      <section className="grid w-full gap-8 home-section">
        <div className=" md:col-span-1 xl = col-span-1">
          <TradingViewWidget 
            title="Market Overview"
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
            config={MARKET_OVERVIEW_WIDGET_CONFIG}
            className="custom-chart"
          />
        </div>
      </section>
    </div>

  )
}

export default Home