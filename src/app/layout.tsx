import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { FarcasterProvider } from "@/contexts/FarcasterContext";
import { SelfProvider } from "@/contexts/SelfContext";
import { VerificationProvider } from "@/contexts/VerificationContext";

// Fuentes comentadas temporalmente para evitar errores en build sin red
// Se pueden habilitar cuando haya acceso a internet
// import { Geist, Geist_Mono } from "next/font/google";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "DeFi Learning Quiz | Aprende sobre protocolos DeFi",
  description: "Aprende sobre protocolos DeFi de manera interactiva con nuestro quiz educativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <FarcasterProvider>
            <SelfProvider>
              <VerificationProvider>
                {children}
              </VerificationProvider>
            </SelfProvider>
          </FarcasterProvider>
        </Providers>
      </body>
    </html>
  );
}
