import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import type { Transaction } from "@/lib/mock-data"
import { PRIVATE_API_CACHE_HEADERS, requireAuthenticatedApiUser } from "@/lib/security/route-auth"

export async function GET() {
  const { unauthorizedResponse } = await requireAuthenticatedApiUser()
  if (unauthorizedResponse) return unauthorizedResponse

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
    }, {
      headers: PRIVATE_API_CACHE_HEADERS,
    })
  } catch (error) {
    console.error("Error calculating dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to calculate stats" },
      { status: 500, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }
}
