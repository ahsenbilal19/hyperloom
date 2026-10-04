import "./globals.css";
import "./hyperloom.css";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Hyperloom | Gear from the next decade", description: "Futuristic tech & lifestyle gear." };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <footer className="text-center text-sm py-10" style={{ color: "var(--muted)" }}>© 2026 Hyperloom · Demo store, no real purchases</footer>
      </body>
    </html>
  );
}