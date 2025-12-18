import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const filePath = join(process.cwd(), "data", "payment-volume.json")
    const fileContents = await readFile(filePath, "utf8")
    const volumeData = JSON.parse(fileContents)
    return NextResponse.json(volumeData)
  } catch (error) {
    console.error("Error loading payment volume:", error)
    return NextResponse.json({ error: "Failed to load payment volume" }, { status: 500 })
  }
}

