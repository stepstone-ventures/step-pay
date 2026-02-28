import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { PRIVATE_API_CACHE_HEADERS, requireAuthenticatedApiUser } from "@/lib/security/route-auth"

export async function GET() {
  const { unauthorizedResponse } = await requireAuthenticatedApiUser()
  if (unauthorizedResponse) return unauthorizedResponse

  try {
    const filePath = join(process.cwd(), "data", "transactions.json")
    const fileContents = await readFile(filePath, "utf8")
    const transactionsData = JSON.parse(fileContents)
    return NextResponse.json(transactionsData, {
      headers: PRIVATE_API_CACHE_HEADERS,
    })
  } catch (error) {
    console.error("Error loading transactions:", error)
    return NextResponse.json(
      { error: "Failed to load transactions" },
      { status: 500, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }
}
