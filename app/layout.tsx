import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "verbatim — the TA that actually read everything",
  description:
    "Upload your lecture slides, research papers, or course notes. Ask anything — verbatim finds the answer and cites the exact page it came from.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
