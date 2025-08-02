import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Posa Xrosto - Bill Splitter",
  description: "Easily calculate who owes what when sharing plates at a restaurant",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Posa Xrosto",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Posa Xrosto",
    title: "Posa Xrosto - Bill Splitter",
    description: "Easily calculate who owes what when sharing plates at a restaurant",
  },
  twitter: {
    card: "summary",
    title: "Posa Xrosto - Bill Splitter",
    description: "Easily calculate who owes what when sharing plates at a restaurant",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: "#6a7fdb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Posa Xrosto" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6a7fdb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
