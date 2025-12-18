"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Filter, X, Grid3x3, List, Upload, X as XIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  stock: number | "unlimited"
  status: "active" | "archived"
  quantitySold: number
  createdAt: string
  hasPhysicalGoods: boolean
  images: string[]
}

const mockProducts: Product[] = []

const statusOptions = ["Active", "Archived"]
const inStockOptions = ["Show All", "Unlimited", "Limited"]
const quantitySoldOptions = ["Show All", "Enter Amount"]
const priceOptions = ["Show All", "Enter Amount"]
const quantityOptions = ["Limited", "Unlimited"]
const currencies = ["GHS", "USD", "EUR", "NGN", "KES", "ZAR"]

export default function ProductsPage() {
  const [products] = useState<Product[]>(mockProducts)
  const [viewMode, setViewMode] = useState<"icon" | "list">("icon")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showUploadMedia, setShowUploadMedia] = useState(false)
  const [status, setStatus] = useState("Active")
  const [inStock, setInStock] = useState("Show All")
  const [quantitySoldMode, setQuantitySoldMode] = useState("Show All")
  const [quantitySold, setQuantitySold] = useState("")
  const [priceMode, setPriceMode] = useState("Show All")
  const [price, setPrice] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "GHS",
    quantity: "Limited",
    quantityValue: "",
    hasPhysicalGoods: false,
  })
  const [uploadedMedia, setUploadedMedia] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilters && filterRef.current && !filterRef.current.contains(event.target as Node)) {
        const filterButton = (event.target as HTMLElement).closest('button')
        if (!filterButton || !filterButton.textContent?.includes('Filters')) {
          setShowFilters(false)
        }
      }
    }

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilters])

  const filtered = useMemo(() => {
    let result = [...products]

    if (status) {
      result = result.filter((p) => p.status === status.toLowerCase())
    }

    if (inStock !== "Show All") {
      result = result.filter((p) =>
        inStock === "Unlimited" ? p.stock === "unlimited" : p.stock !== "unlimited"
      )
    }

    if (quantitySoldMode === "Enter Amount" && quantitySold) {
      const qty = parseInt(quantitySold)
      if (!isNaN(qty)) {
        result = result.filter((p) => p.quantitySold === qty)
      }
    }

    if (priceMode === "Enter Amount" && price) {
      const prc = parseFloat(price)
      if (!isNaN(prc)) {
        result = result.filter((p) => p.price === prc)
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      result = result.filter((p) => {
        const created = new Date(p.createdAt)
        return created >= start && created <= end
      })
    }

    return result
  }, [products, status, inStock, quantitySoldMode, quantitySold, priceMode, price, startDate, endDate])

  const handleReset = () => {
    setStatus("Active")
    setInStock("Show All")
    setQuantitySoldMode("Show All")
    setQuantitySold("")
    setPriceMode("Show All")
    setPrice("")
    setStartDate("")
    setEndDate("")
  }

  const handleAddProduct = () => {
    const newErrors: Record<string, string> = {}

    if (!productData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!productData.price.trim()) {
      newErrors.price = "Price is required"
    } else if (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
      newErrors.price = "Please enter a valid price"
    }
    if (productData.quantity === "Limited" && !productData.quantityValue.trim()) {
      newErrors.quantityValue = "Quantity is required for limited stock"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setShowAddProduct(false)
    setShowUploadMedia(true)
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (uploadedMedia.length + files.length <= 6) {
      setUploadedMedia([...uploadedMedia, ...files])
    }
  }

  const handleRemoveMedia = (index: number) => {
    setUploadedMedia(uploadedMedia.filter((_, i) => i !== index))
  }

  const handleSaveProduct = () => {
    // Save product logic
    setProductData({
      name: "",
      description: "",
      price: "",
      currency: "GHS",
      quantity: "Limited",
      quantityValue: "",
      hasPhysicalGoods: false,
    })
    setUploadedMedia([])
    setShowUploadMedia(false)
  }

  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left side - View Mode and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant={viewMode === "icon" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("icon")}
              className="h-8 w-8"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Right side - Add Product Button */}
        <Button onClick={() => setShowAddProduct(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-10">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showFilters && (
        <Card ref={filterRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>In Stock</Label>
                <Select value={inStock} onValueChange={setInStock}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inStockOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity Sold</Label>
                <div className="flex gap-2">
                  <Select value={quantitySoldMode} onValueChange={setQuantitySoldMode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quantitySoldOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {quantitySoldMode === "Enter Amount" && (
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={quantitySold}
                      onChange={(e) => setQuantitySold(e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Price</Label>
                <div className="flex gap-2">
                  <Select value={priceMode} onValueChange={setPriceMode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {priceMode === "Enter Amount" && (
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="flex-1"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={() => setShowFilters(false)}>Filter</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Products ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">The Fastest Way to Start Selling</h3>
              <p className="text-muted-foreground mb-6">
                Add a product, grab a shareable link, and manage orders and inventory.
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowAddProduct(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </div>
          ) : viewMode === "icon" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      {product.status === "active" ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Archived</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                      <div className="text-lg font-semibold">
                        {formatCurrency(product.price, product.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {product.stock === "unlimited" ? "Unlimited" : product.stock}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(product.price, product.currency)}</div>
                        <div className="text-sm text-muted-foreground">
                          Stock: {product.stock === "unlimited" ? "Unlimited" : product.stock}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter product details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={productData.name}
                onChange={(e) => {
                  setProductData({ ...productData, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: "" })
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="flex gap-2">
                <Select
                  value={productData.currency}
                  onValueChange={(value) => setProductData({ ...productData, currency: value })}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={productData.price}
                  onChange={(e) => {
                    setProductData({ ...productData, price: e.target.value })
                    if (errors.price) setErrors({ ...errors, price: "" })
                  }}
                  className={errors.price ? "border-destructive flex-1" : "flex-1"}
                />
              </div>
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label>Quantity *</Label>
              <div className="flex gap-2">
                <Select
                  value={productData.quantity}
                  onValueChange={(value) => setProductData({ ...productData, quantity: value, quantityValue: "" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {productData.quantity === "Limited" && (
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={productData.quantityValue}
                    onChange={(e) => {
                      setProductData({ ...productData, quantityValue: e.target.value })
                      if (errors.quantityValue) setErrors({ ...errors, quantityValue: "" })
                    }}
                    className={errors.quantityValue ? "border-destructive flex-1" : "flex-1"}
                  />
                )}
              </div>
              {errors.quantityValue && <p className="text-sm text-destructive">{errors.quantityValue}</p>}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="physicalGoods" className="font-normal">
                This product contains one or more physical goods
              </Label>
              <Switch
                id="physicalGoods"
                checked={productData.hasPhysicalGoods}
                onCheckedChange={(checked) => setProductData({ ...productData, hasPhysicalGoods: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Next</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Media Dialog */}
      <Dialog open={showUploadMedia} onOpenChange={setShowUploadMedia}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Add up to 6 high quality images, GIFs and videos to make this variant more appealing to customers
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {uploadedMedia.map((file, index) => (
                <div key={index} className="relative aspect-square border rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => handleRemoveMedia(index)}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {uploadedMedia.length < 6 && (
                <div
                  className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => mediaInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleMediaUpload}
            />
            {uploadedMedia.length < 6 && (
              <Button
                variant="outline"
                onClick={() => mediaInputRef.current?.click()}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Media
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadMedia(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
