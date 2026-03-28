import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/monokai-sublime.css";
import { cn } from "@/modules/shared/presentation/lib/utils";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/modules/shared/presentation/components/providers";

const nunitoSans = Nunito_Sans({ variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helsa | Your Personal Health Assistant",
  description:
    "Helsa es tu asistente de salud personal, diseñado para ayudarte a gestionar tus citas médicas, recibir recordatorios personalizados y optimizar tu bienestar. Con una interfaz intuitiva y funciones inteligentes, Helsa te acompaña en cada paso de tu cuidado de salud.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <html lang="en" className={cn("font-sans", nunitoSans.variable)} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

