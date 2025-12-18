export interface Transaction {
  id: string
  amount: number
  status: "successful" | "failed" | "pending"
  customer: string
  email: string
  date: string
  paymentMethod: string
  description?: string
  currency?: string
}

export interface PaymentVolume {
  period: string
  amount: number
  transactions?: number
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

export const mockTransactions: Transaction[] = []

export const mockPaymentVolume: PaymentVolume[] = []
