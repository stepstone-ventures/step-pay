import { redirect } from "next/navigation"
import DashboardClientLayout from "./layout.client"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()

  const {
    data: { user: fetchedUser },
    error: userError,
  } = await supabase.auth.getUser()

  let user = fetchedUser
  if (!user && userError) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    user = session?.user ?? null
  }

  if (!user || !user.email_confirmed_at) {
    redirect("/login")
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>
}
