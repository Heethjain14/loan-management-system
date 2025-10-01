import "./globals.css";
import { LoanProvider } from "./context/LoanContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LoanProvider>{children}</LoanProvider>
      </body>
    </html>
  );
}
