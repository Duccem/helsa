import icon from '@/src/assets/images/HELSA NUEVO BLANCO ISOTIPO.png';
import { Provider as Analytics } from '@helsa/analytics/client';
import { DesignSystemProvider } from '@helsa/ui';
import '@helsa/ui/styles/global.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';

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
        <DesignSystemProvider>{children}</DesignSystemProvider>
        <Analytics />
      </body>
    </html>
  );
}
