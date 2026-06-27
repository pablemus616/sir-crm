import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
