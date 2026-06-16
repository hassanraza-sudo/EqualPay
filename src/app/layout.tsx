import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EqualPay - Roommate Expense Sharing",
  description:
    "Manage shared household expenses and split costs equally among roommates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
