export interface Transaction {
  id: string
  amount: number
  status: "successful" | "failed" | "pending"
  customer: string
  date: string
  channel: string
}

export interface PaymentVolume {
  date: string
  amount: number
}

export const mockTransactions: Transaction[] = []

export const mockPaymentVolume: PaymentVolume[] = []
