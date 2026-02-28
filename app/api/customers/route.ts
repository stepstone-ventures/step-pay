import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { PRIVATE_API_CACHE_HEADERS, requireAuthenticatedApiUser } from "@/lib/security/route-auth"

export async function GET() {
  const { unauthorizedResponse } = await requireAuthenticatedApiUser()
  if (unauthorizedResponse) return unauthorizedResponse

  try {
    const filePath = join(process.cwd(), "data", "customers.json")
    const fileContents = await readFile(filePath, "utf8")
    const customersData = JSON.parse(fileContents)
    return NextResponse.json(customersData, {
      headers: PRIVATE_API_CACHE_HEADERS,
    })
  } catch (error) {
    console.error("Error loading customers:", error)
    return NextResponse.json(
      { error: "Failed to load customers" },
      { status: 500, headers: PRIVATE_API_CACHE_HEADERS }
    )
  }
}
