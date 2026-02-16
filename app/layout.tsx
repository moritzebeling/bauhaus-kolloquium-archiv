import type { Metadata } from "next";
import "./globals.css";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://bauhaus-kolloquium.documentary-architecture.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Das Internationale Bauhaus-Kolloquium in Weimar 1976–2019",
  description:
    "Das Internationale Bauhaus-Kolloquium der Bauhaus-Universität Weimar – Ein Beitrag zur Wiederaneignung des Bauhauses",
  keywords: [
    "Bauhaus",
    "Kolloquium",
    "Weimar",
    "Architektur",
    "Geschichte",
    "Konferenz",
    "Archiv",
    "IBHK",
  ],
  authors: [
    { name: "Bauhaus-Universität Weimar" },
    { name: "Centre for Documentary Architecture" },
    { name: "Ines Weizman" },
    { name: "Moritz Ebeling" },
  ],
  openGraph: {
    title: "Das Internationale Bauhaus-Kolloquium in Weimar 1976–2019",
    description:
      "Das Internationale Bauhaus-Kolloquium der Bauhaus-Universität Weimar – Ein Beitrag zur Wiederaneignung des Bauhauses",
    url: baseUrl,
    siteName: "Bauhaus Kolloquium Archiv",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Das Internationale Bauhaus-Kolloquium in Weimar 1976–2019",
    description:
      "Das Internationale Bauhaus-Kolloquium der Bauhaus-Universität Weimar – Ein Beitrag zur Wiederaneignung des Bauhauses",
  },
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Das Internationale Bauhaus-Kolloquium in Weimar 1976–2019",
              url: baseUrl,
              description:
                "Das Internationale Bauhaus-Kolloquium der Bauhaus-Universität Weimar – Ein Beitrag zur Wiederaneignung des Bauhauses",
              publisher: {
                "@type": "Organization",
                name: "Bauhaus-Universität Weimar",
                url: "https://www.uni-weimar.de",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
