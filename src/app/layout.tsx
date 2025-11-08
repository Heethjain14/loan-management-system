import "./globals.css";
import { LoanProvider } from "./context/LoanContext";
import { AuthProvider } from "./context/AuthContext";

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
        <AuthProvider>
          <LoanProvider>{children}</LoanProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
