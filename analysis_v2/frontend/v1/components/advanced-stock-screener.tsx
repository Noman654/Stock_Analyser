"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, BarChart2, Bell, BookOpen, ChevronDown, DollarSign, TrendingUp, Users, Check } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Enhanced mock data for stocks
const stocks = [
  { id: 1, name: "Tata Motors Ltd", ticker: "TATAMOTORS", price: 791.00, change: 17.00, changePercent: 2.22, marketCap: 291222.90, pe: 8.70, sector: "Automobile", industry: "Auto Manufacturers", dividendYield: 0.5, beta: 1.2 },
  { id: 2, name: "Ashok Leyland", ticker: "ASHOKLEY", price: 223.96, change: -2.04, changePercent: -0.90, marketCap: 65794.28, pe: 25.48, sector: "Automobile", industry: "Auto Manufacturers", dividendYield: 1.2, beta: 1.1 },
  { id: 3, name: "Olectra Greentec", ticker: "OLECTRA", price: 1389.55, change: 45.55, changePercent: 3.39, marketCap: 11385.97, pe: 101.43, sector: "Automobile", industry: "Electric Vehicles", dividendYield: 0, beta: 1.5 },
  { id: 4, name: "Force Motors", ticker: "FORCEMOT", price: 6693.30, change: 160.30, changePercent: 2.45, marketCap: 8833.06, pe: 18.54, sector: "Automobile", industry: "Auto Manufacturers", dividendYield: 0.8, beta: 0.9 },
  { id: 5, name: "SML ISUZU", ticker: "SMLISUZU", price: 1603.00, change: -17.00, changePercent: -1.05, marketCap: 2322.30, pe: 18.85, sector: "Automobile", industry: "Commercial Vehicles", dividendYield: 1.5, beta: 1.3 },
  { id: 6, name: "Infosys Ltd", ticker: "INFY", price: 1456.75, change: 23.45, changePercent: 1.63, marketCap: 600000.00, pe: 24.5, sector: "Technology", industry: "IT Consulting", dividendYield: 2.1, beta: 0.8 },
  { id: 7, name: "Reliance Industries", ticker: "RELIANCE", price: 2345.60, change: -12.30, changePercent: -0.52, marketCap: 1500000.00, pe: 22.3, sector: "Energy", industry: "Oil & Gas", dividendYield: 0.4, beta: 1.1 },
]

// Mock data for stock performance (unchanged)
const performanceData = [
  { quarter: "Q3 2023", TATAMOTORS: 791, ASHOKLEY: 223, OLECTRA: 1389, FORCEMOT: 6693, SMLISUZU: 1603 },
  { quarter: "Q4 2023", TATAMOTORS: 800, ASHOKLEY: 230, OLECTRA: 1400, FORCEMOT: 6700, SMLISUZU: 1610 },
  { quarter: "Q1 2024", TATAMOTORS: 810, ASHOKLEY: 228, OLECTRA: 1420, FORCEMOT: 6720, SMLISUZU: 1615 },
  { quarter: "Q2 2024", TATAMOTORS: 805, ASHOKLEY: 225, OLECTRA: 1410, FORCEMOT: 6710, SMLISUZU: 1608 },
  { quarter: "Q3 2024", TATAMOTORS: 815, ASHOKLEY: 226, OLECTRA: 1430, FORCEMOT: 6730, SMLISUZU: 1620 },
]

// Enhanced mock fundamental data for Tata Motors
const fundamentalData = {
  financials: [
    { metric: "Revenue", value: "₹101,450.00 Cr", change: "-3.50%" },
    { metric: "Net Profit", value: "₹3,450.00 Cr", change: "-12.93%" },
    { metric: "EBITDA Margin", value: "12.80%", change: "+0.70%" },
    { metric: "EPS", value: "₹7.60", change: "-13.20%" },
  ],
  ratios: [
    { metric: "P/E Ratio", value: "8.70" },
    { metric: "Price to Book Value", value: "2.89" },
    { metric: "Price to Sales", value: "0.75" },
    { metric: "EV/EBITDA", value: "7.2" },
    { metric: "Debt to Equity", value: "0.75" },
    { metric: "Return on Equity", value: "49.40%" },
    { metric: "Return on Capital Employed", value: "15.20%" },
  ],
  growth: [
    { metric: "Revenue Growth (YoY)", value: "12.5%" },
    { metric: "Earnings Growth (YoY)", value: "18.3%" },
    { metric: "Revenue Growth (QoQ)", value: "3.2%" },
    { metric: "Earnings Growth (QoQ)", value: "5.1%" },
  ],
  shareholding: [
    { category: "Promoters", percentage: "46.36%" },
    { category: "FIIs", percentage: "19.20%" },
    { category: "DIIs", percentage: "16.01%" },
    { category: "Public", percentage: "18.31%" },
  ],
  quarterlyResults: [
    { quarter: "Q3 2024", revenue: "₹98,125 Cr", profit: "₹3,300 Cr", eps: "₹7.20" },
    { quarter: "Q2 2024", revenue: "₹95,800 Cr", profit: "₹3,100 Cr", eps: "₹6.80" },
    { quarter: "Q1 2024", revenue: "₹93,500 Cr", profit: "₹2,900 Cr", eps: "₹6.35" },
    { quarter: "Q4 2023", revenue: "₹91,200 Cr", profit: "₹2,750 Cr", eps: "₹6.02" },
  ],
  balanceSheet: {
    assets: [
      { item: "Cash and Cash Equivalents", value: "₹25,000 Cr" },
      { item: "Inventories", value: "₹35,500 Cr" },
      { item: "Property, Plant and Equipment", value: "₹85,000 Cr" },
      { item: "Intangible Assets", value: "₹15,000 Cr" },
    ],
    liabilities: [
      { item: "Short-term Borrowings", value: "₹20,000 Cr" },
      { item: "Long-term Debt", value: "₹45,000 Cr" },
      { item: "Trade Payables", value: "₹30,000 Cr" },
      { item: "Other Liabilities", value: "₹10,000 Cr" },
    ],
  },
  cashFlow: [
    { type: "Operating Activities", value: "₹15,000 Cr" },
    { type: "Investing Activities", value: "-₹8,500 Cr" },
    { type: "Financing Activities", value: "-₹4,000 Cr" },
    { type: "Net Change in Cash", value: "₹2,500 Cr" },
  ],
  technicalIndicators: [
    { indicator: "50-Day Moving Average", value: "₹780.50" },
    { indicator: "200-Day Moving Average", value: "₹750.25" },
    { indicator: "Relative Strength Index (RSI)", value: "62" },
    { indicator: "MACD", value: "Bullish" },
  ],
  insiderTrading: [
    { date: "2024-03-15", insider: "John Doe (Director)", action: "Buy", shares: 10000, value: "₹7,910,000" },
    { date: "2024-03-10", insider: "Jane Smith (CFO)", action: "Sell", shares: 5000, value: "₹3,955,000" },
  ],
  analystRecommendations: [
    { firm: "Goldman Sachs", rating: "Buy", targetPrice: "₹900" },
    { firm: "Morgan Stanley", rating: "Overweight", targetPrice: "₹850" },
    { firm: "JP Morgan", rating: "Neutral", targetPrice: "₹800" },
  ],
  esgScores: {
    environmental: 75,
    social: 68,
    governance: 82,
  },
}

export function AdvancedStockScreenerComponent() {
  const [selectedStock, setSelectedStock] = useState(null)
  const [priceRange, setPriceRange] = useState([0, 7000])
  const [selectedStocks, setSelectedStocks] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)

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

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = searchQuery === "" || stock.name.toLowerCase().includes(searchQuery.toLowerCase()) || stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSector = !selectedSector || stock.sector === selectedSector
    const matchesIndustry = !selectedIndustry || stock.industry === selectedIndustry
    return matchesSearch && matchesSector && matchesIndustry
  })

  const sectors = Array.from(new Set(stocks.map(stock => stock.sector)))
  const industries = Array.from(new Set(stocks.filter(stock => !selectedSector || stock.sector === selectedSector).map(stock => stock.industry)))

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center mb-6 bg-gradient-to-r from-primary to-primary-foreground p-4 rounded-lg text-white">
        <h1 className="text-3xl font-bold">Advanced Stock Screener</h1>
        <Button variant="secondary">
          <Bell className="mr-2 h-4 w-4" />
          Set Alerts
        </Button>
      </header>

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
                  <DropdownMenuContent className="w-full">
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
                  <DropdownMenuContent className="w-full">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Sectors</label>
              <div className="flex flex-wrap gap-2">
                {["Automobile", "IT", "Banking", "Pharma", "FMCG"].map(sector => (
                  <Badge key={sector} variant="outline" className="cursor-pointer">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Stock Overview</CardTitle>
            <CardDescription>Click on a stock for detailed analysis</CardDescription>
          </CardHeader>
          <CardContent>
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openStockDetails(stock)}>
                            Analyze
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{selectedStock?.name} ({selectedStock?.ticker})</DialogTitle>
                            <DialogDescription>Comprehensive stock analysis and fundamentals</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 space-y-4">
                            <Tabs defaultValue="overview">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="financials">Financials</TabsTrigger>
                                <TabsTrigger value="technical">Technical</TabsTrigger>
                                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                              </TabsList>
                              <TabsContent value="overview">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Key Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <dl className="space-y-2">
                                        <div className="flex justify-between">
                                          <dt>Current Price:</dt>
                                          <dd className="font-semibold">₹{selectedStock?.price.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt>Market Cap:</dt>
                                          <dd className="font-semibold">₹{selectedStock?.marketCap.toFixed(2)} Cr</dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt>P/E Ratio:</dt>
                                          <dd className="font-semibold">{selectedStock?.pe.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt>Dividend Yield:</dt>
                                          <dd className="font-semibold">{selectedStock?.dividendYield.toFixed(2)}%</dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt>Beta:</dt>
                                          <dd className="font-semibold">{selectedStock?.beta.toFixed(2)}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                          <dt>Sector:</dt>
                                          <dd className="font-semibold">{selectedStock?.sector}</dd>
                                        </div>
                                      </dl>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Financial Highlights</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="space-y-2">
                                        {fundamentalData.financials.map((item, index) => (
                                          <li key={index} className="flex justify-between items-center">
                                            <span>{item.metric}:</span>
                                            <span className="font-semibold">
                                              {item.value}
                                              <span className={item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                                                {' '}({item.change})
                                              </span>
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                              <TabsContent value="financials">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Key Ratios</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="space-y-2">
                                        {fundamentalData.ratios.map((ratio, index) => (
                                          <li key={index} className="flex justify-between items-center">
                                            <span>{ratio.metric}:</span>
                                            <span className="font-semibold">{ratio.value}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Growth Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="space-y-2">
                                        {fundamentalData.growth.map((item, index) => (
                                          <li key={index} className="flex justify-between items-center">
                                            <span>{item.metric}:</span>
                                            <span className="font-semibold">{item.value}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                              <TabsContent value="technical">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Technical Indicators</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="space-y-2">
                                        {fundamentalData.technicalIndicators.map((indicator, index) => (
                                          <li key={index} className="flex justify-between items-center">
                                            <span>{indicator.indicator}:</span>
                                            <span className="font-semibold">{indicator.value}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Insider Trading</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="space-y-2">
                                        {fundamentalData.insiderTrading.map((trade, index) => (
                                          <li key={index} className="text-sm">
                                            <span className="font-semibold">{trade.date}</span>: {trade.insider} 
                                            <span className={trade.action === 'Buy' ? 'text-green-600' : 'text-red-600'}>
                                              {' '}{trade.action}
                                            </span> {trade.shares} shares (₹{trade.value})
                                          </li>
                                        ))}
                                      </ul>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                              <TabsContent value="analysis">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Analyst Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="space-y-2">
                                        {fundamentalData.analystRecommendations.map((rec, index) => (
                                          <li key={index} className="flex justify-between items-center">
                                            <span>{rec.firm}:</span>
                                            <span className="font-semibold">{rec.rating} (Target: {rec.targetPrice})</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>ESG Scores</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <ul className="space-y-2">
                                        <li className="flex justify-between items-center">
                                          <span>Environmental:</span>
                                          <span className="font-semibold">{fundamentalData.esgScores.environmental}</span>
                                        </li>
                                        <li className="flex justify-between items-center">
                                          <span>Social:</span>
                                          <span className="font-semibold">{fundamentalData.esgScores.social}</span>
                                        </li>
                                        <li className="flex justify-between items-center">
                                          <span>Governance:</span>
                                          <span className="font-semibold">{fundamentalData.esgScores.governance}</span>
                                        </li>
                                      </ul>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedStocks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Selected Stocks</h3>
          <div className="flex flex-wrap gap-2">
            {selectedStocks.map(id => {
              const stock = stocks.find(s => s.id === id)
              return stock ? (
                <Badge key={stock.id} variant="secondary" className="text-sm">
                  {stock.name}
                  <button
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => toggleStockSelection(stock.id)}
                  >
                    ×
                  </button>
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}

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
    </div>
  )
}