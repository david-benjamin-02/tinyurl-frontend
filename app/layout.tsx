import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Links App',
  description: 'Clean links manager',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="">
          <main>{children}</main>
      </body>
    </html>
  )
}
