import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const filePath = join(process.cwd(), "data", "transactions.json")
    const fileContents = await readFile(filePath, "utf8")
    const transactionsData = JSON.parse(fileContents)
    return NextResponse.json(transactionsData)
  } catch (error) {
    console.error("Error loading transactions:", error)
    return NextResponse.json({ error: "Failed to load transactions" }, { status: 500 })
  }
}

