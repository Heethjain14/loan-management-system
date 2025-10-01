import "./globals.css";
import { LoanProvider } from "./context/LoanContext";

export const metadata = {
  title: "Loan Management System",
  description: "MVP Prototype",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-900 text-white">
        <LoanProvider>{children}</LoanProvider>
      </body>
    </html>
  );
}
