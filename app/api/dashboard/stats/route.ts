import { NextResponse } from "next/server"
import transactionsData from "@/data/transactions.json"

export async function GET() {
  // Simulate a small delay for realism
  await new Promise((resolve) => setTimeout(resolve, 100))

  const transactions = transactionsData as Array<{
    status: string
    amount: number
  }>

  const successful = transactions.filter((t) => t.status === "successful")
  const pending = transactions.filter((t) => t.status === "pending")
  const failed = transactions.filter((t) => t.status === "failed")

  const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0)
  const pendingAmount = pending.reduce((sum, t) => sum + t.amount, 0)
  const totalTransactions = transactions.length
  const successRate = (successful.length / totalTransactions) * 100

  return NextResponse.json({
    totalRevenue,
    pendingAmount,
    totalTransactions,
    successRate: Math.round(successRate * 10) / 10,
  })
}

