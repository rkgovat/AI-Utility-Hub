import "./globals.css";
import Link from "next/link"; // Link is faster than <a> tags in Next.js
import { Analytics } from "@vercel/analytics/next"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-slate-900 text-white p-4 shadow-md">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/" className="font-bold text-xl tracking-tight">
              AI UTILITY HUB
            </Link>
            <div className="space-x-6">
              <Link href="/fitness" className="hover:text-blue-400 transition">
                Fitness
              </Link>
              {/* Future modules can be added here */}
              <span className="text-gray-500 cursor-not-allowed">Cooking (Soon)</span>
            </div>
          </div>
        </nav>
        
        <main className="min-h-screen bg-gray-50">
          {children}
          <Analytics />
        </main>
      </body>
    </html>
  );
}