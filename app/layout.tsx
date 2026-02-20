import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ScrollProgress } from "@/components/animate-ui/primitives/animate/scroll-progress"

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "StepPay – Global Payments for African Businesses",
  description:
    "StepPay enables African businesses to securely receive payments from customers around the world and locally.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4" },
      { url: "/icon.png?v=4", sizes: "32x32", type: "image/png" },
      { url: "/icon.png?v=4", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico?v=4",
    apple: "/apple-icon.png?v=4",
  },
  openGraph: {
    title: "StepPay – Global Payments for African Businesses",
    description:
      "StepPay enables African businesses to securely receive payments from customers around the world and locally.",
    url: "https://step-pay.vercel.app",
    type: "website",
    images: [
      {
        url: "/steppay-logo-liquid.png?v=4",
        width: 1200,
        height: 630,
        alt: "StepPay logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StepPay – Global Payments for African Businesses",
    description:
      "StepPay enables African businesses to securely receive payments from customers around the world and locally.",
    images: ["/steppay-logo-liquid.png?v=4"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('step-pay-theme') || 'light';
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider defaultTheme="light" storageKey="step-pay-theme">
          <ScrollProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
