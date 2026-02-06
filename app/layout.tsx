import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Das Internationale Bauhaus-Kolloquium in Weimar 1976–2019",
  description:
    "Das Internationale Bauhaus-Kolloquium der Bauhaus-Universität Weimar – Ein Beitrag zur Wiederaneignung des Bauhauses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
