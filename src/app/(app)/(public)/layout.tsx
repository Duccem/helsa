import { Analytics } from "@vercel/analytics/next";
import { Metadata } from "next";
import Header from "./_components/header";
import Footer from "./_components/footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.helsahealthcare.com"),
  title: "Helsa | Therapy and Health Management",
  description: "Enhance your health with Helsa, a platform for therapy and health management.",
  twitter: {
    title: "Helsa | Therapy and Health Management",
    description: "Enhance your health with Helsa, a platform for therapy and health management",
    card: "summary_large_image",
    images: [
      {
        url: "https://www.helsahealthcare.com/images/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Helsa | Therapy and health management",
      },
    ],
  },
  openGraph: {
    title: "Helsa | Therapy and Health Management",
    description: "Enhance your health with Helsa, a platform for therapy and health management.",
    url: "https://www.helsahealthcare.com",
    siteName: "Helsa Healthcare",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.helsahealthcare.com/images/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Helsa | Therapy and health management",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <Analytics />
    </>
  );
}

