import "./globals.css";
import "./hyperloom.css";
import Navbar from "@/components/Navbar";
import CartProvider from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import AuthProvider from "@/components/AuthProvider";
import Assistant from "@/components/Assistant";

export const metadata = { title: "Hyperloom | Gear from the next decade", description: "Futuristic tech & lifestyle gear." };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        <CartProvider>
          <Navbar />
          {children}
          <CartDrawer />
          <Assistant />
          <footer className="py-10 text-center text-sm" style={{ color: "var(--muted)" }}>© 2026 Hyperloom · Demo store, no real purchases</footer>
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}