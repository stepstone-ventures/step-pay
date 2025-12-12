import { NextResponse } from "next/server"
import paymentVolumeData from "@/data/payment-volume.json"

export async function GET() {
  // Simulate a small delay for realism
  await new Promise((resolve) => setTimeout(resolve, 100))
  
  return NextResponse.json(paymentVolumeData)
}

