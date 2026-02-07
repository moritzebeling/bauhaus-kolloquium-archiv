import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Das Internationale Bauhaus-Kolloquium in Weimar 1976–2019",
  description:
    "Das Internationale Bauhaus-Kolloquium der Bauhaus-Universität Weimar – Ein Beitrag zur Wiederaneignung des Bauhauses",
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
      <body>{children}</body>
    </html>
  );
}
