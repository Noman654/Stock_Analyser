"use client"

import { useState, useMemo, useEffect } from "react"
import { ArrowDown, ArrowUp, BarChart2, Bell, BookOpen, ChevronDown, DollarSign, TrendingUp, Users, Check, ChevronUp, Eye, AlertTriangle, Loader2, Settings, Share2, MessageSquare, Book, Smartphone, Zap } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Bar, BarChart, ComposedChart, Scatter, ScatterChart, AreaChart, Area, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Dummy data for stocks (unchanged)
const stocks = [
  { id: 1, name: "Tata Motors Ltd", ticker: "TATAMOTORS", price: 791.00, change: 17.00, changePercent: 2.22, marketCap: 291222.90, pe: 8.70, sector: "Automobile", industry: "Auto Manufacturers", dividendYield: 0.5, beta: 1.2, volume: 5000000, avgVolume: 4500000, eps: 91.15, roe: 15.2, debtToEquity: 0.75, currentRatio: 1.2, quickRatio: 0.9, priceToBook: 2.89, priceToSales: 0.75 },
  { id: 2, name: "Ashok Leyland", ticker: "ASHOKLEY", price: 223.96, change: -2.04, changePercent: -0.90, marketCap: 65794.28, pe: 25.48, sector: "Automobile", industry: "Auto Manufacturers", dividendYield: 1.2, beta: 1.1, volume: 3000000, avgVolume: 2800000, eps: 8.79, roe: 12.8, debtToEquity: 0.6, currentRatio: 1.1, quickRatio: 0.8, priceToBook: 3.2, priceToSales: 1.1 },
  { id: 3, name: "Olectra Greentec", ticker: "OLECTRA", price: 1389.55, change: 45.55, changePercent: 3.39, marketCap: 11385.97, pe: 101.43, sector: "Automobile", industry: "Electric Vehicles", dividendYield: 0, beta: 1.5, volume: 1000000, avgVolume: 800000, eps: 13.7, roe: 18.5, debtToEquity: 0.4, currentRatio: 1.5, quickRatio: 1.2, priceToBook: 5.6, priceToSales: 2.3 },
  { id: 4, name: "Infosys Ltd", ticker: "INFY", price: 1456.75, change: 23.45, changePercent: 1.63, marketCap: 600000.00, pe: 24.5, sector: "Technology", industry: "IT Consulting", dividendYield: 2.1, beta: 0.8, volume: 8000000, avgVolume: 7500000, eps: 59.46, roe: 25.3, debtToEquity: 0.1, currentRatio: 2.8, quickRatio: 2.7, priceToBook: 6.2, priceToSales: 4.1 },
  { id: 5, name: "Reliance Industries", ticker: "RELIANCE", price: 2345.60, change: -12.30, changePercent: -0.52, marketCap: 1500000.00, pe: 22.3, sector: "Energy", industry: "Oil & Gas", dividendYield: 0.4, beta: 1.1, volume: 10000000, avgVolume: 9500000, eps: 105.18, roe: 9.8, debtToEquity: 0.65, currentRatio: 1.3, quickRatio: 0.9, priceToBook: 2.1, priceToSales: 1.8 },
]

// Dummy data for charts (unchanged)
const revenueAndPriceData = [
  { year: 2019, TATAMOTORS: { revenue: 10, price: 150 }, ASHOKLEY: { revenue: 8, price: 100 }, OLECTRA: { revenue: 5, price: 80 }, INFY: { revenue: 12, price: 700 }, RELIANCE: { revenue: 15, price: 1300 } },
  { year: 2020, TATAMOTORS: { revenue: 8, price: 120 }, ASHOKLEY: { revenue: 7, price: 90 }, OLECTRA: { revenue: 6, price: 85 }, INFY: { revenue: 13, price: 950 }, RELIANCE: { revenue: 14, price: 1900 } },
  { year: 2021, TATAMOTORS: { revenue: 12, price: 180 }, ASHOKLEY: { revenue: 9, price: 110 }, OLECTRA: { revenue: 8, price: 100 }, INFY: { revenue: 16, price: 1700 }, RELIANCE: { revenue: 18, price: 2100 } },
  { year: 2022, TATAMOTORS: { revenue: 15, price: 200 }, ASHOKLEY: { revenue: 11, price: 130 }, OLECTRA: { revenue: 10, price: 120 }, INFY: { revenue: 18, price: 1500 }, RELIANCE: { revenue: 20, price: 2400 } },
  { year: 2023, TATAMOTORS: { revenue: 18, price: 220 }, ASHOKLEY: { revenue: 13, price: 150 }, OLECTRA: { revenue: 12, price: 140 }, INFY: { revenue: 20, price: 1400 }, RELIANCE: { revenue: 22, price: 2300 } },
]

const peAndPriceData = [
  { year: 2019, TATAMOTORS: { pe: 15, price: 150 }, ASHOKLEY: { pe: 12, price: 100 }, OLECTRA: { pe: 20, price: 80 }, INFY: { pe: 22, price: 700 }, RELIANCE: { pe: 18, price: 1300 } },
  { year: 2020, TATAMOTORS: { pe: 12, price: 120 }, ASHOKLEY: { pe: 10, price: 90 }, OLECTRA: { pe: 18, price: 85 }, INFY: { pe: 25, price: 950 }, RELIANCE: { pe: 20, price: 1900 } },
  { year: 2021, TATAMOTORS: { pe: 18, price: 180 }, ASHOKLEY: { pe: 14, price: 110 }, OLECTRA: { pe: 25, price: 100 }, INFY: { pe: 28, price: 1700 }, RELIANCE: { pe: 22, price: 2100 } },
  { year: 2022, TATAMOTORS: { pe: 20, price: 200 }, ASHOKLEY: { pe: 16, price: 130 }, OLECTRA: { pe: 30, price: 120 }, INFY: { pe: 26, price: 1500 }, RELIANCE: { pe: 24, price: 2400 } },
  { year: 2023, TATAMOTORS: { pe: 22, price: 220 }, ASHOKLEY: { pe: 18, price: 150 }, OLECTRA: { pe: 35, price: 140 }, INFY: { pe: 24, price: 1400 }, RELIANCE: { pe: 23, price: 2300 } },
]

const priceChangeData = [
  { stock: "TATAMOTORS", week: 2.5, month: 5.8, year: 15.3, threeYear: 45.2 },
  { stock: "ASHOKLEY", week: 1.8, month: 4.2, year: 12.7, threeYear: 38.9 },
  { stock: "OLECTRA", week: 3.2, month: 7.5, year: 18.6, threeYear: 52.1 },
  { stock: "INFY", week: 1.5, month: 3.8, year: 10.2, threeYear: 35.6 },
  { stock: "RELIANCE", week: 2.1, month: 6.3, year: 16.8, threeYear: 48.7 },
]

// New dummy data for portfolio
const portfolioData = [
  { id: 1, name: "Tata Motors Ltd", ticker: "TATAMOTORS", quantity: 100, avgBuyPrice: 750, currentPrice: 791.00, profitLoss: 4100 },
  { id: 2, name: "Infosys Ltd", ticker: "INFY", quantity: 50, avgBuyPrice: 1400, currentPrice: 1456.75, profitLoss: 2837.5 },
  { id: 3, name: "Reliance Industries", ticker: "RELIANCE", quantity: 25, avgBuyPrice: 2300, currentPrice: 2345.60, profitLoss: 1140 },
]

// New dummy data for news
const newsData = [
  { id: 1, title: "Tata Motors reports strong Q4 results", source: "Economic Times", time: "2 hours ago" },
  { id: 2, title: "Infosys wins major contract with European bank", source: "Business Standard", time: "4 hours ago" },
  { id: 3, title: "Oil prices surge, impact on Reliance Industries stock", source: "Moneycontrol", time: "6 hours ago" },
]

export function AdvancedStockScreener() {
  const [selectedStock, setSelectedStock] = useState(null)
  const [priceRange, setPriceRange] = useState([0, 7000])
  const [selectedStocks, setSelectedStocks] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [isRevenueChartOpen, setIsRevenueChartOpen] = useState(true)
  const [isPEChartOpen, setIsPEChartOpen] = useState(true)
  const [isPriceChangeChartOpen, setIsPriceChangeChartOpen] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    minPE: 0,
    maxPE: 200,
    minDividendYield: 0,
    maxDividendYield: 10,
    minROE: 0,
    maxROE: 50,
  })
  const [comparisonResult, setComparisonResult] = useState<string | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showSocialFeatures, setShowSocialFeatures] = useState(false)
  const [portfolio, setPortfolio] = useState(portfolioData)
  const [news, setNews] = useState(newsData)

  // New state for real-time data simulation
  const [realTimeData, setRealTimeData] = useState(stocks)

  // Simulating real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prevData =>
        prevData.map(stock => ({
          ...stock,
          price: stock.price * (1 + (Math.random() - 0.5) * 0.002),
          change: stock.price * (Math.random() - 0.5) * 0.002,
          changePercent: (Math.random() - 0.5) * 0.2,
        }))
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const openStockDetails = (stock) => {
    setSelectedStock(stock)
  }

  const toggleStockSelection = (stockId: number) => {
    setSelectedStocks(prev =>
      prev.includes(stockId) ? prev.filter(id => id !== stockId) : [...prev, stockId]
    )
  }

  const handleSearch = () => {
    // Implement search logic here
  }

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector)
    setSelectedIndustry(null)
  }

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry)
  }

  const handleAdvancedFilterChange = (filter: string, value: number[]) => {
    setAdvancedFilters(prev => ({ ...prev, [filter]: value }))
  }

  const filteredStocks = realTimeData.filter(stock => {
    const matchesSearch = searchQuery === "" || stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSector = !selectedSector || stock.sector === selectedSector
    const matchesIndustry = !selectedIndustry || stock.industry === selectedIndustry
    const matchesPriceRange = stock.price >= priceRange[0] && stock.price <= priceRange[1]
    const matchesAdvancedFilters = !showAdvancedFilters || (
      stock.pe >= advancedFilters.minPE && stock.pe <= advancedFilters.maxPE &&
      stock.dividendYield >= advancedFilters.minDividendYield && stock.dividendYield <= advancedFilters.maxDividendYield &&
      stock.roe >= advancedFilters.minROE && stock.roe <= advancedFilters.maxROE
    )
    return matchesSearch && matchesSector && matchesIndustry && matchesPriceRange && matchesAdvancedFilters
  })

  const sectors = Array.from(new Set(stocks.map(stock => stock.sector)))
  const industries = Array.from(new Set(stocks.filter(stock => !selectedSector || stock.sector === selectedSector).map(stock => stock.industry)))

  const selectedStocksData = useMemo(() => {
    return stocks.filter(stock => selectedStocks.includes(stock.id))
  }, [selectedStocks])

  const filteredRevenueAndPriceData = useMemo(() => {
    return revenueAndPriceData.map(item => {
      const filteredItem = { year: item.year }
      selectedStocksData.forEach(stock => {
        if (item[stock.ticker]) {
          filteredItem[stock.ticker] = item[stock.ticker]
        }
      })
      return filteredItem
    })
  }, [selectedStocksData])

  const filteredPeAndPriceData = useMemo(() => {
    return peAndPriceData.map(item => {
      const filteredItem = { year: item.year }
      selectedStocksData.forEach(stock => {
        if (item[stock.ticker]) {
          filteredItem[stock.ticker] = item[stock.ticker]
        }
      })
      return filteredItem
    })
  }, [selectedStocksData])

  const filteredPriceChangeData = useMemo(() => {
    return priceChangeData.filter(item => selectedStocksData.some(stock => stock.ticker === item.stock))
  }, [selectedStocksData])

  const compareSelectedStocks = async () => {
    setIsComparing(true)
    try {
      // Simulating an API call to an LLM service
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating a 2-second delay
      
      const selectedStocksInfo = selectedStocksData.map(stock => ({
        name: stock.name,
        ticker: stock.ticker,
        price: stock.price,
        pe: stock.pe,
        marketCap: stock.marketCap,
        dividendYield: stock.dividendYield,
      }))

      // Simulated LLM response
      const comparisonText = `
Detailed Comparison of Selected Stocks:

${selectedStocksInfo.map(stock => `
${stock.name} (${stock.ticker}):
- Current Price: ₹${stock.price.toFixed(2)}
- P/E Ratio: ${stock.pe.toFixed(2)}
- Market Cap: ₹${stock.marketCap.toFixed(2)} Cr
- Dividend Yield: ${stock.dividendYield.toFixed(2)}%

`).join('')}

Analysis:
1. Valuation: ${selectedStocksInfo.sort((a, b) => a.pe - b.pe)[0].name} appears to be the most attractively valued based on P/E ratio.
2. Size: ${selectedStocksInfo.sort((a, b) => b.marketCap - a.marketCap)[0].name} is the largest company by market capitalization.
3. Income: ${selectedStocksInfo.sort((a, b) => b.dividendYield - a.dividendYield)[0].name} offers the highest dividend yield.

Recommendation:
Consider your investment goals and risk tolerance when choosing between these stocks. ${selectedStocksInfo.sort((a, b) => a.pe - b.pe)[0].name} might be suitable for value investors, while ${selectedStocksInfo.sort((a, b) => b.dividendYield - a.dividendYield)[0].name} could be attractive for income-focused investors.
      `

      setComparisonResult(comparisonText)
    } catch (error) {
      console.error("Error comparing stocks:", error)
      setComparisonResult("An error occurred while comparing stocks. Please try again.")
    } finally {
      setIsComparing(false)
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolio}
                    dataKey="quantity"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {portfolio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Market Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueAndPriceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="TATAMOTORS.price" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => setActiveTab("screener")}>
                Open Stock Screener
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setShowSocialFeatures(true)}>
                View Social Insights
              </Button>
              <Button className="w-full" variant="secondary">
                Set Price Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Avg. Buy Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Profit/Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>₹{stock.avgBuyPrice.toFixed(2)}</TableCell>
                  <TableCell>₹{stock.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className={stock.profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                    ₹{stock.profitLoss.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {news.map((item) => (
              <li key={item.id} className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.source}</p>
                </div>
                <span className="text-sm text-muted-foreground">{item.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )

  const renderStockScreener = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sector & Industry</label>
              <div className="flex flex-col space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedSector || "Select Sector"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {sectors.map((sector) => (
                      <DropdownMenuCheckboxItem
                        key={sector}
                        checked={selectedSector === sector}
                        onCheckedChange={() => handleSectorChange(sector)}
                      >
                        {sector}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedIndustry || "Select Industry"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {industries.map((industry) => (
                      <DropdownMenuCheckboxItem
                        key={industry}
                        checked={selectedIndustry === industry}
                        onCheckedChange={() => handleIndustryChange(industry)}
                      >
                        {industry}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <Slider
                min={0}
                max={7000}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="advanced-filters"
                checked={showAdvancedFilters}
                onCheckedChange={setShowAdvancedFilters}
              />
              <label htmlFor="advanced-filters" className="text-sm font-medium">
                Show Advanced Filters
              </label>
            </div>
            {showAdvancedFilters && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">P/E Ratio</label>
                  <Slider
                    min={0}
                    max={200}
                    step={1}
                    value={[advancedFilters.minPE, advancedFilters.maxPE]}
                    onValueChange={(value) => handleAdvancedFilterChange('minPE', value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{advancedFilters.minPE}</span>
                    <span>{advancedFilters.maxPE}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dividend Yield (%)</label>
                  <Slider
                    min={0}
                    max={10}
                    step={0.1}
                    value={[advancedFilters.minDividendYield, advancedFilters.maxDividendYield]}
                    onValueChange={(value) => handleAdvancedFilterChange('minDividendYield', value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{advancedFilters.minDividendYield.toFixed(1)}%</span>
                    <span>{advancedFilters.maxDividendYield.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Return on Equity (%)</label>
                  <Slider
                    min={0}
                    max={50}
                    step={0.5}
                    value={[advancedFilters.minROE, advancedFilters.maxROE]}
                    onValueChange={(value) => handleAdvancedFilterChange('minROE', value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{advancedFilters.minROE.toFixed(1)}%</span>
                    <span>{advancedFilters.maxROE.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Stock Overview</CardTitle>
            <CardDescription>Click on a stock for detailed analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>

Thank you for your feedback! I'm excited to enhance this product to reach its full billion-dollar potential. Let's improve the advanced stock screener by adding some key features that will set it apart from competitors while maintaining its user-friendly interface. Here's an updated version with new features and improvements:

```tsx project="Advanced Stock Screener" file="advanced-stock-screener.tsx" type="react"
"use client"

import { useState, useMemo, useEffect } from "react"
import { ArrowDown, ArrowUp, BarChart2, Bell, BookOpen, ChevronDown, DollarSign, TrendingUp, Users, Check, ChevronUp, Eye, AlertTriangle, Loader2, Settings, Share2, MessageSquare, Book, Smartphone, Zap } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Bar, BarChart, ComposedChart, Scatter, ScatterChart, AreaChart, Area, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Dummy data for stocks (unchanged)
const stocks = [
  { id: 1, name: "Tata Motors Ltd", ticker: "TATAMOTORS", price: 791.00, change: 17.00, changePercent: 2.22, marketCap: 291222.90, pe: 8.70, sector: "Automobile", industry: "Auto Manufacturers", dividendYield: 0.5, beta: 1.2, volume: 5000000, avgVolume: 4500000, eps: 91.15, roe: 15.2, debtToEquity: 0.75, currentRatio: 1.2, quickRatio: 0.9, priceToBook: 2.89, priceToSales: 0.75 },
  { id: 2, name: "Ashok Leyland", ticker: "ASHOKLEY", price: 223.96, change: -2.04, changePercent: -0.90, marketCap: 65794.28, pe: 25.48, sector: "Automobile", industry: "Auto Manufacturers", dividendYield: 1.2, beta: 1.1, volume: 3000000, avgVolume: 2800000, eps: 8.79, roe: 12.8, debtToEquity: 0.6, currentRatio: 1.1, quickRatio: 0.8, priceToBook: 3.2, priceToSales: 1.1 },
  { id: 3, name: "Olectra Greentec", ticker: "OLECTRA", price: 1389.55, change: 45.55, changePercent: 3.39, marketCap: 11385.97, pe: 101.43, sector: "Automobile", industry: "Electric Vehicles", dividendYield: 0, beta: 1.5, volume: 1000000, avgVolume: 800000, eps: 13.7, roe: 18.5, debtToEquity: 0.4, currentRatio: 1.5, quickRatio: 1.2, priceToBook: 5.6, priceToSales: 2.3 },
  { id: 4, name: "Infosys Ltd", ticker: "INFY", price: 1456.75, change: 23.45, changePercent: 1.63, marketCap: 600000.00, pe: 24.5, sector: "Technology", industry: "IT Consulting", dividendYield: 2.1, beta: 0.8, volume: 8000000, avgVolume: 7500000, eps: 59.46, roe: 25.3, debtToEquity: 0.1, currentRatio: 2.8, quickRatio: 2.7, priceToBook: 6.2, priceToSales: 4.1 },
  { id: 5, name: "Reliance Industries", ticker: "RELIANCE", price: 2345.60, change: -12.30, changePercent: -0.52, marketCap: 1500000.00, pe: 22.3, sector: "Energy", industry: "Oil & Gas", dividendYield: 0.4, beta: 1.1, volume: 10000000, avgVolume: 9500000, eps: 105.18, roe: 9.8, debtToEquity: 0.65, currentRatio: 1.3, quickRatio: 0.9, priceToBook: 2.1, priceToSales: 1.8 },
]

// Dummy data for charts (unchanged)
const revenueAndPriceData = [
  { year: 2019, TATAMOTORS: { revenue: 10, price: 150 }, ASHOKLEY: { revenue: 8, price: 100 }, OLECTRA: { revenue: 5, price: 80 }, INFY: { revenue: 12, price: 700 }, RELIANCE: { revenue: 15, price: 1300 } },
  { year: 2020, TATAMOTORS: { revenue: 8, price: 120 }, ASHOKLEY: { revenue: 7, price: 90 }, OLECTRA: { revenue: 6, price: 85 }, INFY: { revenue: 13, price: 950 }, RELIANCE: { revenue: 14, price: 1900 } },
  { year: 2021, TATAMOTORS: { revenue: 12, price: 180 }, ASHOKLEY: { revenue: 9, price: 110 }, OLECTRA: { revenue: 8, price: 100 }, INFY: { revenue: 16, price: 1700 }, RELIANCE: { revenue: 18, price: 2100 } },
  { year: 2022, TATAMOTORS: { revenue: 15, price: 200 }, ASHOKLEY: { revenue: 11, price: 130 }, OLECTRA: { revenue: 10, price: 120 }, INFY: { revenue: 18, price: 1500 }, RELIANCE: { revenue: 20, price: 2400 } },
  { year: 2023, TATAMOTORS: { revenue: 18, price: 220 }, ASHOKLEY: { revenue: 13, price: 150 }, OLECTRA: { revenue: 12, price: 140 }, INFY: { revenue: 20, price: 1400 }, RELIANCE: { revenue: 22, price: 2300 } },
]

const peAndPriceData = [
  { year: 2019, TATAMOTORS: { pe: 15, price: 150 }, ASHOKLEY: { pe: 12, price: 100 }, OLECTRA: { pe: 20, price: 80 }, INFY: { pe: 22, price: 700 }, RELIANCE: { pe: 18, price: 1300 } },
  { year: 2020, TATAMOTORS: { pe: 12, price: 120 }, ASHOKLEY: { pe: 10, price: 90 }, OLECTRA: { pe: 18, price: 85 }, INFY: { pe: 25, price: 950 }, RELIANCE: { pe: 20, price: 1900 } },
  { year: 2021, TATAMOTORS: { pe: 18, price: 180 }, ASHOKLEY: { pe: 14, price: 110 }, OLECTRA: { pe: 25, price: 100 }, INFY: { pe: 28, price: 1700 }, RELIANCE: { pe: 22, price: 2100 } },
  { year: 2022, TATAMOTORS: { pe: 20, price: 200 }, ASHOKLEY: { pe: 16, price: 130 }, OLECTRA: { pe: 30, price: 120 }, INFY: { pe: 26, price: 1500 }, RELIANCE: { pe: 24, price: 2400 } },
  { year: 2023, TATAMOTORS: { pe: 22, price: 220 }, ASHOKLEY: { pe: 18, price: 150 }, OLECTRA: { pe: 35, price: 140 }, INFY: { pe: 24, price: 1400 }, RELIANCE: { pe: 23, price: 2300 } },
]

const priceChangeData = [
  { stock: "TATAMOTORS", week: 2.5, month: 5.8, year: 15.3, threeYear: 45.2 },
  { stock: "ASHOKLEY", week: 1.8, month: 4.2, year: 12.7, threeYear: 38.9 },
  { stock: "OLECTRA", week: 3.2, month: 7.5, year: 18.6, threeYear: 52.1 },
  { stock: "INFY", week: 1.5, month: 3.8, year: 10.2, threeYear: 35.6 },
  { stock: "RELIANCE", week: 2.1, month: 6.3, year: 16.8, threeYear: 48.7 },
]

// New dummy data for portfolio
const portfolioData = [
  { id: 1, name: "Tata Motors Ltd", ticker: "TATAMOTORS", quantity: 100, avgBuyPrice: 750, currentPrice: 791.00, profitLoss: 4100 },
  { id: 2, name: "Infosys Ltd", ticker: "INFY", quantity: 50, avgBuyPrice: 1400, currentPrice: 1456.75, profitLoss: 2837.5 },
  { id: 3, name: "Reliance Industries", ticker: "RELIANCE", quantity: 25, avgBuyPrice: 2300, currentPrice: 2345.60, profitLoss: 1140 },
]

// New dummy data for news
const newsData = [
  { id: 1, title: "Tata Motors reports strong Q4 results", source: "Economic Times", time: "2 hours ago" },
  { id: 2, title: "Infosys wins major contract with European bank", source: "Business Standard", time: "4 hours ago" },
  { id: 3, title: "Oil prices surge, impact on Reliance Industries stock", source: "Moneycontrol", time: "6 hours ago" },
]

export default function Component() {
  const [selectedStock, setSelectedStock] = useState(null)
  const [priceRange, setPriceRange] = useState([0, 7000])
  const [selectedStocks, setSelectedStocks] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [isRevenueChartOpen, setIsRevenueChartOpen] = useState(true)
  const [isPEChartOpen, setIsPEChartOpen] = useState(true)
  const [isPriceChangeChartOpen, setIsPriceChangeChartOpen] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    minPE: 0,
    maxPE: 200,
    minDividendYield: 0,
    maxDividendYield: 10,
    minROE: 0,
    maxROE: 50,
  })
  const [comparisonResult, setComparisonResult] = useState<string | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showSocialFeatures, setShowSocialFeatures] = useState(false)
  const [portfolio, setPortfolio] = useState(portfolioData)
  const [news, setNews] = useState(newsData)

  // New state for real-time data simulation
  const [realTimeData, setRealTimeData] = useState(stocks)

  // Simulating real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prevData =>
        prevData.map(stock => ({
          ...stock,
          price: stock.price * (1 + (Math.random() - 0.5) * 0.002),
          change: stock.price * (Math.random() - 0.5) * 0.002,
          changePercent: (Math.random() - 0.5) * 0.2,
        }))
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const openStockDetails = (stock) => {
    setSelectedStock(stock)
  }

  const toggleStockSelection = (stockId: number) => {
    setSelectedStocks(prev =>
      prev.includes(stockId) ? prev.filter(id => id !== stockId) : [...prev, stockId]
    )
  }

  const handleSearch = () => {
    // Implement search logic here
  }

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector)
    setSelectedIndustry(null)
  }

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry)
  }

  const handleAdvancedFilterChange = (filter: string, value: number[]) => {
    setAdvancedFilters(prev => ({ ...prev, [filter]: value }))
  }

  const filteredStocks = realTimeData.filter(stock => {
    const matchesSearch = searchQuery === "" || stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSector = !selectedSector || stock.sector === selectedSector
    const matchesIndustry = !selectedIndustry || stock.industry === selectedIndustry
    const matchesPriceRange = stock.price >= priceRange[0] && stock.price <= priceRange[1]
    const matchesAdvancedFilters = !showAdvancedFilters || (
      stock.pe >= advancedFilters.minPE && stock.pe <= advancedFilters.maxPE &&
      stock.dividendYield >= advancedFilters.minDividendYield && stock.dividendYield <= advancedFilters.maxDividendYield &&
      stock.roe >= advancedFilters.minROE && stock.roe <= advancedFilters.maxROE
    )
    return matchesSearch && matchesSector && matchesIndustry && matchesPriceRange && matchesAdvancedFilters
  })

  const sectors = Array.from(new Set(stocks.map(stock => stock.sector)))
  const industries = Array.from(new Set(stocks.filter(stock => !selectedSector || stock.sector === selectedSector).map(stock => stock.industry)))

  const selectedStocksData = useMemo(() => {
    return stocks.filter(stock => selectedStocks.includes(stock.id))
  }, [selectedStocks])

  const filteredRevenueAndPriceData = useMemo(() => {
    return revenueAndPriceData.map(item => {
      const filteredItem = { year: item.year }
      selectedStocksData.forEach(stock => {
        if (item[stock.ticker]) {
          filteredItem[stock.ticker] = item[stock.ticker]
        }
      })
      return filteredItem
    })
  }, [selectedStocksData])

  const filteredPeAndPriceData = useMemo(() => {
    return peAndPriceData.map(item => {
      const filteredItem = { year: item.year }
      selectedStocksData.forEach(stock => {
        if (item[stock.ticker]) {
          filteredItem[stock.ticker] = item[stock.ticker]
        }
      })
      return filteredItem
    })
  }, [selectedStocksData])

  const filteredPriceChangeData = useMemo(() => {
    return priceChangeData.filter(item => selectedStocksData.some(stock => stock.ticker === item.stock))
  }, [selectedStocksData])

  const compareSelectedStocks = async () => {
    setIsComparing(true)
    try {
      // Simulating an API call to an LLM service
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating a 2-second delay
      
      const selectedStocksInfo = selectedStocksData.map(stock => ({
        name: stock.name,
        ticker: stock.ticker,
        price: stock.price,
        pe: stock.pe,
        marketCap: stock.marketCap,
        dividendYield: stock.dividendYield,
      }))

      // Simulated LLM response
      const comparisonText = `
Detailed Comparison of Selected Stocks:

${selectedStocksInfo.map(stock => `
${stock.name} (${stock.ticker}):
- Current Price: ₹${stock.price.toFixed(2)}
- P/E Ratio: ${stock.pe.toFixed(2)}
- Market Cap: ₹${stock.marketCap.toFixed(2)} Cr
- Dividend Yield: ${stock.dividendYield.toFixed(2)}%

`).join('')}

Analysis:
1. Valuation: ${selectedStocksInfo.sort((a, b) => a.pe - b.pe)[0].name} appears to be the most attractively valued based on P/E ratio.
2. Size: ${selectedStocksInfo.sort((a, b) => b.marketCap - a.marketCap)[0].name} is the largest company by market capitalization.
3. Income: ${selectedStocksInfo.sort((a, b) => b.dividendYield - a.dividendYield)[0].name} offers the highest dividend yield.

Recommendation:
Consider your investment goals and risk tolerance when choosing between these stocks. ${selectedStocksInfo.sort((a, b) => a.pe - b.pe)[0].name} might be suitable for value investors, while ${selectedStocksInfo.sort((a, b) => b.dividendYield - a.dividendYield)[0].name} could be attractive for income-focused investors.
      `

      setComparisonResult(comparisonText)
    } catch (error) {
      console.error("Error comparing stocks:", error)
      setComparisonResult("An error occurred while comparing stocks. Please try again.")
    } finally {
      setIsComparing(false)
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolio}
                    dataKey="quantity"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {portfolio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Market Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueAndPriceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="TATAMOTORS.price" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => setActiveTab("screener")}>
                Open Stock Screener
              </Button>
              <Button className="w-full" variant="outline" onClick={() => setShowSocialFeatures(true)}>
                View Social Insights
              </Button>
              <Button className="w-full" variant="secondary">
                Set Price Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Avg. Buy Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Profit/Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolio.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>₹{stock.avgBuyPrice.toFixed(2)}</TableCell>
                  <TableCell>₹{stock.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className={stock.profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
                    ₹{stock.profitLoss.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {news.map((item) => (
              <li key={item.id} className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.source}</p>
                </div>
                <span className="text-sm text-muted-foreground">{item.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )

  const renderStockScreener = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sector & Industry</label>
              <div className="flex flex-col space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedSector || "Select Sector"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {sectors.map((sector) => (
                      <DropdownMenuCheckboxItem
                        key={sector}
                        checked={selectedSector === sector}
                        onCheckedChange={() => handleSectorChange(sector)}
                      >
                        {sector}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedIndustry || "Select Industry"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {industries.map((industry) => (
                      <DropdownMenuCheckboxItem
                        key={industry}
                        checked={selectedIndustry === industry}
                        onCheckedChange={() => handleIndustryChange(industry)}
                      >
                        {industry}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <Slider
                min={0}
                max={7000}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="advanced-filters"
                checked={showAdvancedFilters}
                onCheckedChange={setShowAdvancedFilters}
              />
              <label htmlFor="advanced-filters" className="text-sm font-medium">
                Show Advanced Filters
              </label>
            </div>
            {showAdvancedFilters && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">P/E Ratio</label>
                  <Slider
                    min={0}
                    max={200}
                    step={1}
                    value={[advancedFilters.minPE, advancedFilters.maxPE]}
                    onValueChange={(value) => handleAdvancedFilterChange('minPE', value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{advancedFilters.minPE}</span>
                    <span>{advancedFilters.maxPE}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dividend Yield (%)</label>
                  <Slider
                    min={0}
                    max={10}
                    step={0.1}
                    value={[advancedFilters.minDividendYield, advancedFilters.maxDividendYield]}
                    onValueChange={(value) => handleAdvancedFilterChange('minDividendYield', value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{advancedFilters.minDividendYield.toFixed(1)}%</span>
                    <span>{advancedFilters.maxDividendYield.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Return on Equity (%)</label>
                  <Slider
                    min={0}
                    max={50}
                    step={0.5}
                    value={[advancedFilters.minROE, advancedFilters.maxROE]}
                    onValueChange={(value) => handleAdvancedFilterChange('minROE', value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{advancedFilters.minROE.toFixed(1)}%</span>
                    <span>{advancedFilters.maxROE.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Stock Overview</CardTitle>
            <CardDescription>Click on a stock for detailed analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>P/E Ratio</TableHead>
                    <TableHead>Dividend Yield</TableHead>
                    <TableHead>Beta</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map(stock => (
                    <TableRow key={stock.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStocks.includes(stock.id)}
                          onCheckedChange={() => toggleStockSelection(stock.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{stock.name}</TableCell>
                      <TableCell>₹{stock.price.toFixed(2)}</TableCell>
                      <TableCell className={stock.change > 0 ? "text-green-600" : "text-red-600"}>
                        {stock.change > 0 ? <ArrowUp className="inline mr-1" /> : <ArrowDown className="inline mr-1" />}
                        {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </TableCell>
                      <TableCell>₹{stock.marketCap.toFixed(2)} Cr</TableCell>
                      <TableCell>{stock.pe.toFixed(2)}</TableCell>
                      <TableCell>{stock.dividendYield.toFixed(2)}%</TableCell>
                      <TableCell>{stock.beta.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openStockDetails(stock)}>
                          Analyze
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={compareSelectedStocks}
                disabled={selectedStocks.length < 2 || isComparing}
              >
                {isComparing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  'Compare Selected Stocks'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {comparisonResult && (
        <Card>
          <CardHeader>
            <CardTitle>Stock Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{comparisonResult}</pre>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Collapsible open={isRevenueChartOpen} onOpenChange={setIsRevenueChartOpen}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Revenue % and Price</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isRevenueChartOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="sr-only">Toggle Revenue Chart</span>
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <ChartContainer
                  config={selectedStocksData.reduce((acc, stock) => {
                    acc[stock.ticker] = { label: stock.name, color: `hsl(var(--chart-${stock.id}))` }
                    return acc
                  }, {})}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={filteredRevenueAndPriceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      {selectedStocksData.map(stock => (
                        <Bar key={`${stock.ticker}-revenue`} yAxisId="left" dataKey={`${stock.ticker}.revenue`} name={`${stock.name} Revenue %`} fill={`var(--color-${stock.ticker})`} />
                      ))}
                      {selectedStocksData.map(stock => (
                        <Line key={`${stock.ticker}-price`} yAxisId="right" type="monotone" dataKey={`${stock.ticker}.price`} name={`${stock.name} Price`} stroke={`var(--color-${stock.ticker})`} />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible open={isPEChartOpen} onOpenChange={setIsPEChartOpen}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>P/E Ratio and Price</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isPEChartOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="sr-only">Toggle P/E Chart</span>
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <ChartContainer
                  config={selectedStocksData.reduce((acc, stock) => {
                    acc[stock.ticker] = { label: stock.name, color: `hsl(var(--chart-${stock.id}))` }
                    return acc
                  }, {})}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={filteredPeAndPriceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      {selectedStocksData.map(stock => (
                        <Bar key={`${stock.ticker}-pe`} yAxisId="left" dataKey={`${stock.ticker}.pe`} name={`${stock.name} P/E`} fill={`var(--color-${stock.ticker})`} />
                      ))}
                      {selectedStocksData.map(stock => (
                        <Line key={`${stock.ticker}-price`} yAxisId="right" type="monotone" dataKey={`${stock.ticker}.price`} name={`${stock.name} Price`} stroke={`var(--color-${stock.ticker})`} />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible open={isPriceChangeChartOpen} onOpenChange={setIsPriceChangeChartOpen}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Price Change (%)</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isPriceChangeChartOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="sr-only">Toggle Price Change Chart</span>
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <ChartContainer
                  config={selectedStocksData.reduce((acc, stock) => {
                    acc[stock.ticker] = { label: stock.name, color: `hsl(var(--chart-${stock.id}))` }
                    return acc
                  }, {})}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredPriceChangeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stock" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="week" name="1 Week" fill="var(--color-TATAMOTORS)" />
                      <Bar dataKey="month" name="1 Month" fill="var(--color-ASHOKLEY)" />
                      <Bar dataKey="year" name="1 Year" fill="var(--color-OLECTRA)" />
                      <Bar dataKey="threeYear" name="3 Years" fill="hsl(var(--chart-4))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </>
  )

  const renderSocialFeatures = () => (
    <Card>
      <CardHeader>
        <CardTitle>Social Insights</CardTitle>
        <CardDescription>Collaborate and share with other investors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/avatars/01.png" alt="@johndoe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Bullish on TATAMOTORS</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/avatars/02.png" alt="@janedoe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Jane Doe</p>
              <p className="text-xs text-muted-foreground">RELIANCE looks promising</p>
            </div>
          </div>
          <Button className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Join the Discussion
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-gradient-to-r from-primary to-primary-foreground p-4 rounded-lg text-white">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Advanced Stock Screener</h1>
        <div className="flex space-x-2">
          <Button variant="secondary">
            <Eye className="mr-2 h-4 w-4" />
            Watchlist
          </Button>
          <Button variant="secondary">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alerts
          </Button>
          <Button variant="secondary">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="screener">Stock Screener</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          {renderDashboard()}
        </TabsContent>
        <TabsContent value="screener">
          {renderStockScreener()}
        </TabsContent>
      </Tabs>

      {showSocialFeatures && renderSocialFeatures()}

      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>Key trends and analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-10 w-10 text-green-500" />
              <div>
                <p className="font-semibold">Market Trend</p>
                <p className="text-sm text-muted-foreground">Bullish momentum in auto sector</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <BarChart2 className="h-10 w-10 text-blue-500" />
              <div>
                <p className="font-semibold">Volume Analysis</p>
                <p className="text-sm text-muted-foreground">Higher than average trading volume</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Users className="h-10 w-10 text-purple-500" />
              <div>
                <p className="font-semibold">Investor Sentiment</p>
                <p className="text-sm text-muted-foreground">Positive outlook for coming quarter</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Based on your portfolio and market trends, our AI suggests:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Consider increasing exposure to the technology sector</li>
              <li>TATAMOTORS shows strong momentum, consider adding to your position</li>
              <li>Set a stop-loss for RELIANCE at ₹2300 to manage risk</li>
            </ul>
            <Button>
              View Detailed AI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Educational Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <Book className="h-6 w-6 mb-2" />
              <span>Stock Market Basics</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <BarChart2 className="h-6 w-6 mb-2" />
              <span>Technical Analysis</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center">
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Fundamental Analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Premium Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Real-time data</span>
              </div>
              <Badge>Pro</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <span>Mobile app access</span>
              </div>
              <Badge>Pro</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-green-500" />
                <span>Advanced portfolio sharing</span>
              </div>
              <Badge>Pro</Badge>
            </div>
            <Button className="w-full">Upgrade to Pro</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}