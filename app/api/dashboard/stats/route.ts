import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import type { Transaction } from "@/lib/mock-data"

export async function GET() {
  try {
    const filePath = join(process.cwd(), "data", "transactions.json")
    const fileContents = await readFile(filePath, "utf8")
    const transactions: Transaction[] = JSON.parse(fileContents)
    
    const totalRevenue = transactions
      .filter((t) => t.status === "successful")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const pendingAmount = transactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalTransactions = transactions.length
    
    const successfulTransactions = transactions.filter((t) => t.status === "successful").length
    const successRate = totalTransactions > 0 
      ? (successfulTransactions / totalTransactions) * 100 
      : 0
    
    return NextResponse.json({
      totalRevenue,
      pendingAmount,
      totalTransactions,
      successRate,
    })
  } catch (error) {
    console.error("Error calculating dashboard stats:", error)
    return NextResponse.json({ error: "Failed to calculate stats" }, { status: 500 })
  }
}

