'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Loader2, TrendingUp, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Briefcase, Activity, Search, Filter, Download } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function StockSageProComponent() {
  const [sectors, setSectors] = useState([])
  const [industries, setIndustries] = useState([])
  const [stocks, setStocks] = useState([])
  const [selectedSector, setSelectedSector] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedMarketCap, setSelectedMarketCap] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [marketCapRange, setMarketCapRange] = useState([0, 1000])
  const [searchTerm, setSearchTerm] = useState('')
  const [date, setDate] = useState<Date>()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState({
    pe: true,
    pb: true,
    dividendYield: true,
  })

  useEffect(() => {
    fetchSectors()
  }, [])

  useEffect(() => {
    if (selectedSector) {
      fetchIndustries(selectedSector)
    }
  }, [selectedSector])

  const fetchSectors = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:5000/sectors')
      if (!response.ok) throw new Error('Failed to fetch sectors')
      const data = await response.json()
      setSectors(data)
    } catch (err) {
      setError('Failed to fetch sectors. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchIndustries = async (sector) => {
    setLoading(true)
    try {
      const response = await fetch(`http://127.0.0.1:5000/industries?sector=${sector}`)
      if (!response.ok) throw new Error('Failed to fetch industries')
      const data = await response.json()
      setIndustries(data)
    } catch (err) {
      setError('Failed to fetch industries. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStocks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sector: selectedSector,
        industry: selectedIndustry,
        market_cap_category: selectedMarketCap,
        market_cap_min: marketCapRange[0].toString(),
        market_cap_max: marketCapRange[1].toString(),
        search: searchTerm,
        date: date ? format(date, 'yyyy-MM-dd') : '',
        metrics: Object.entries(selectedMetrics)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(','),
      })
      
      const response = await fetch(`http://127.0.0.1:5000/stocks?${params}`)
      if (!response.ok) throw new Error('Failed to fetch stocks')
      
      const data = await response.json()
  
      const transformedData = data.map(stock => ({
        ticker: stock.ticker || 'N/A',
        name: stock.name || 'N/A',
        market_cap: stock.market_cap || 'N/A',
        market_cap_category: stock.market_cap_category || 'N/A',
        pe_ratio: stock['P/E Ratio'] || null,
        pb_ratio: stock['P/B Ratio'] || null,
        composit_score: stock['Composite Score Rating'] || null,
        valuation_score: stock['Valuation Score Rating'] || null,
        dividend_yield: stock['Dividend Yield'] ? (stock['Dividend Yield'] * 100).toFixed(2) : null,
      }))
      
      console.log('transformedData:', transformedData)
      console.log('data:', data)
      setStocks(transformedData)
    } catch (err) {
      console.error('Error fetching stocks:', err)
      setError('Failed to fetch stocks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setError('')
    fetchStocks()
  }

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => 
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [stocks, searchTerm])

  // Mock data for the charts
  const performanceData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ]

  const sectorComparisonData = [
    { name: 'Technology', value: 30 },
    { name: 'Healthcare', value: 20 },
    { name: 'Finance', value: 25 },
    { name: 'Consumer', value: 15 },
    { name: 'Energy', value: 10 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <Card className="w-full max-w-7xl mx-auto bg-gray-800 border-gray-700 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg p-8">
          <CardTitle className="text-4xl font-bold flex items-center mb-2">
            <TrendingUp className="mr-3 h-8 w-8" />
            StockSage Pro
          </CardTitle>
          <CardDescription className="text-blue-100 text-lg">
            Advanced Stock Analysis and Portfolio Optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Select onValueChange={setSelectedSector}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedIndustry}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedMarketCap}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Market Cap Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small Cap">Small Cap</SelectItem>
                <SelectItem value="Mid Cap">Mid Cap</SelectItem>
                <SelectItem value="Large Cap">Large Cap</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-8">
            <Label className="text-white mb-2">Market Cap Range (in billions)</Label>
            <Slider
              defaultValue={[0, 1000]}
              max={1000}
              step={10}
              onValueChange={setMarketCapRange}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>${marketCapRange[0]}B</span>
              <span>${marketCapRange[1]}B</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex-grow">
              <Label htmlFor="search" className="sr-only">Search stocks</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search stocks..."
                  className="pl-8 bg-gray-700 border-gray-600 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {/* <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}>
                  <Activity className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Analysis Date</span>}
                </Button>
              </PopoverTrigger>
            </Popover> */}
          </div>
          <div className="flex items-center space-x-2 mb-8">
            <Switch
              id="advanced-filters"
              checked={showAdvancedFilters}
              onCheckedChange={setShowAdvancedFilters}
            />
            <Label htmlFor="advanced-filters">Show Advanced Filters</Label>
          </div>
          {showAdvancedFilters && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pe"
                  checked={selectedMetrics.pe}
                  onCheckedChange={(checked) => setSelectedMetrics(prev => ({ ...prev, pe: checked }))}
                />
                <Label htmlFor="pe">P/E Ratio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pb"
                  checked={selectedMetrics.pb}
                  onCheckedChange={(checked) => setSelectedMetrics(prev => ({ ...prev, pb: checked }))}
                />
                <Label htmlFor="pb">P/B Ratio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dividendYield"
                  checked={selectedMetrics.dividendYield}
                  onCheckedChange={(checked) => setSelectedMetrics(prev => ({ ...prev, dividendYield: checked }))}
                />
                <Label htmlFor="dividendYield">Dividend Yield</Label>
              </div>
            </div>
          )}
          <Button onClick={handleSearch} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BarChart3 className="mr-2 h-5 w-5" />}
            Analyze Stocks
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {filteredStocks.length > 0 && (
            <Tabs defaultValue="table" className="mt-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="comparison">Sector Comparison</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Analysis Results</CardTitle>
                    <CardDescription>Detailed view of analyzed stocks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ticker</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Valuation Score</TableHead>
                            <TableHead>Composit Score</TableHead>
                            <TableHead>Market Cap</TableHead>
                            <TableHead>Category</TableHead>
                            {selectedMetrics.pe && <TableHead>P/E Ratio</TableHead>}
                            {selectedMetrics.pb && <TableHead>P/B Ratio</TableHead>}
                            {selectedMetrics.dividendYield && <TableHead>Dividend Yield</TableHead>}
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStocks.map((stock) => (
                            <TableRow key={stock.ticker} className="hover:bg-gray-700/50">
                              <TableCell className="font-medium">{stock.ticker}</TableCell>
                              <TableCell>{stock.name}</TableCell>
                              <TableCell>{stock.valuation_score}</TableCell>
                              <TableCell>{stock.composit_score}</TableCell>
                              <TableCell>
                                <span className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                                  {stock.market_cap}B
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{stock.market_cap_category}</Badge>
                              </TableCell>
                              {selectedMetrics.pe && <TableCell>{stock.pe_ratio}</TableCell>}
                              {selectedMetrics.pb && <TableCell>{stock.pb_ratio}</TableCell>}
                              {selectedMetrics.dividendYield && <TableCell>{stock.dividend_yield}%</TableCell>}
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">Details</Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>{stock.name} ({stock.ticker})</DialogTitle>
                                      <DialogDescription>Detailed stock information</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-2 items-center gap-4">
                                      <span className="font-medium">Valuation Score:</span>
                                      <span>{stock.valuation_score !== null ? stock.valuation_score : 'N/A'}</span>
                                      </div>
                                      <div className="grid grid-cols-2 items-center gap-4">
                                      <span className="font-medium">Composite Score:</span>
                                      <span>{stock.composit_score !== null ? stock.composit_score : 'N/A'}</span>
                                      </div>
                                      <div className="grid grid-cols-2 items-center gap-4">
                                        <span className="font-medium">Market Cap:</span>
                                        <span>${stock.market_cap}B</span>
                                      </div>
                                      <div className="grid grid-cols-2 items-center gap-4">
                                        <span className="font-medium">Category:</span>
                                        <Badge variant="outline">{stock.market_cap_category}</Badge>
                                      </div>
                                      {selectedMetrics.pe && (
                                        <div className="grid grid-cols-2 items-center gap-4">
                                          <span className="font-medium">P/E Ratio:</span>
                                          <span>{stock.pe_ratio}</span>
                                        </div>
                                      )}
                                      {selectedMetrics.pb && (
                                        <div className="grid grid-cols-2 items-center gap-4">
                                          <span className="font-medium">P/B Ratio:</span>
                                          <span>{stock.pb_ratio}</span>
                                        </div>
                                      )}
                                      {selectedMetrics.dividendYield && (
                                        <div className="grid grid-cols-2 items-center gap-4">
                                          <span className="font-medium">Dividend Yield:</span>
                                          <span>{stock.dividend_yield}%</span>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Performance</CardTitle>
                    <CardDescription>6-month performance chart</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="comparison">
                <Card>
                  <CardHeader>
                    <CardTitle>Sector Comparison</CardTitle>
                    <CardDescription>Market share by sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sectorComparisonData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {sectorComparisonData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="portfolio">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Analysis</CardTitle>
                    <CardDescription>Optimize your investment strategy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Risk Analysis</h3>
                        <p>Portfolio Beta: 1.2</p>
                        <p>Sharpe Ratio: 0.8</p>
                        <p>Value at Risk (VaR): $10,000</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Diversification</h3>
                        <p>Correlation Matrix</p>
                        <p>Sector Allocation</p>
                        <p>Geographic Exposure</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Optimization Suggestions</h3>
                      <ul className="list-disc pl-5">
                        <li>Increase exposure to defensive sectors</li>
                        <li>Consider adding international stocks for diversification</li>
                        <li>Rebalance to maintain target asset allocation</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          <div className="mt-8 flex justify-between items-center">
            <Button variant="outline" className="text-white">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <p className="text-sm text-gray-400">
              Data as of {format(new Date(), 'MMMM d, yyyy')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}