// Type definitions
export interface Transaction {
  id: string
  customer: string
  email: string
  amount: number
  currency: string
  status: "successful" | "pending" | "failed"
  paymentMethod: string
  date: string
  description: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalTransactions: number
  totalAmount: number
  currency: string
  lastTransaction: string
  status: "active" | "inactive"
}

export interface PaymentVolume {
  period: string
  amount: number
  transactions: number
}

// In-memory arrays (loaded from JSON files at build time)
import transactionsData from "@/data/transactions.json"
import customersData from "@/data/customers.json"
import paymentVolumeData from "@/data/payment-volume.json"

export const mockTransactions: Transaction[] = transactionsData as Transaction[]
export const mockCustomers: Customer[] = customersData as Customer[]
export const mockPaymentVolume: PaymentVolume[] = paymentVolumeData as PaymentVolume[]

// Helper function for dashboard stats
export const getDashboardStats = () => {
  const successful = mockTransactions.filter((t) => t.status === "successful")
  const pending = mockTransactions.filter((t) => t.status === "pending")
  
  const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0)
  const pendingAmount = pending.reduce((sum, t) => sum + t.amount, 0)
  const totalTransactions = mockTransactions.length
  const successRate = (successful.length / totalTransactions) * 100

  return {
    totalRevenue,
    pendingAmount,
    totalTransactions,
    successRate: Math.round(successRate * 10) / 10,
  }
}

