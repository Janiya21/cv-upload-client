import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils";
import { NextUIProvider } from '@nextui-org/react'
import { Toaster } from "@/components/ui/toaster";


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Senkadagala online CV portal",
  description: "Senkadagala online CV portal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (

    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Senkadagala online CV portal</title>
        <link rel="icon" type="image/x-icon" href="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEPv9Mz1qZ2fiZAlXXWEyIpwFVDUQbIuhp8A&s"></link>
        {/* <meta property="og:image"  /> */}
      </head>
      <body
        className={cn(
          "bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <NextUIProvider>
          {children}
          <div className="sticky bg-green-800 w-full bottom-0 flex justify-center">
            <h1 className="text-gray-200 py-3">All Right Reserved 2024 - EWB IT</h1>
          </div>
        </NextUIProvider>
        <Toaster />
      </body>
    </html>
  )
}