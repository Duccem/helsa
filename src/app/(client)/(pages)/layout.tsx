import '@/assets/globals.css';
import icon from '@/assets/images/Helsa Logo black - white.png';
import ToastProvider from '@/libs/ducen-ui/components/toast-provider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Nunito } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import Progress from '../components/top-bar/progress';
const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Helsa',
  description: 'A platform for managing your health',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <link rel="icon" href={icon.src} sizes="any" />
      <body className={nunito.className + ' styled-scroll'} suppressHydrationWarning={true}>
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Progress />
            {children}
            <Analytics />
            <SpeedInsights />
            <ToastProvider></ToastProvider>
            <Toaster />
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
