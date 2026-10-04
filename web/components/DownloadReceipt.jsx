"use client";
import { Download } from "lucide-react";

const m = (c) => `$${(c / 100).toFixed(2)}`;

export default function DownloadReceipt({ order }) {
  async function download() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(22).text("HYPERLOOM", 20, 25);
    doc.setFontSize(10).setTextColor(120).text("Payment receipt · demo store, test mode", 20, 32);
    doc.setTextColor(0).setFontSize(11);
    doc.text(`Order: #${order.number}`, 20, 48);
    doc.text(`Date: ${order.date}`, 20, 55);
    doc.text(`Email: ${order.email || "-"}`, 20, 62);
    doc.text("Payment: Card (Stripe)", 20, 69);

    let y = 86;
    doc.setFont("helvetica", "bold");
    doc.text("Item", 20, y); doc.text("Qty", 115, y); doc.text("Price", 150, y, { align: "right" }); doc.text("Amount", 190, y, { align: "right" });
    doc.line(20, y + 2, 190, y + 2);
    doc.setFont("helvetica", "normal");
    order.items.forEach((i) => {
      if (y > 255) { doc.addPage(); y = 20; }
      y += 9;
      doc.text(i.name.slice(0, 45), 20, y); doc.text(String(i.qty), 115, y);
      doc.text(m(i.unit_price_cents), 150, y, { align: "right" }); doc.text(m(i.qty * i.unit_price_cents), 190, y, { align: "right" });
    });
    y += 6; doc.line(20, y, 190, y);
    [["Subtotal", m(order.total)], ["Shipping", "Free"], ["Tax", "$0.00"]].forEach(([k, v]) => {
      y += 8; doc.text(k, 150, y, { align: "right" }); doc.text(v, 190, y, { align: "right" });
    });
    y += 10; doc.setFont("helvetica", "bold").setFontSize(13);
    doc.text("Total paid", 150, y, { align: "right" }); doc.text(m(order.total), 190, y, { align: "right" });
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(120).text("Thank you for shopping with Hyperloom. This is a demo store: no real payment was taken.", 20, y + 20);
    doc.save(`hyperloom-receipt-${order.number}.pdf`);
  }

  return (
    <button onClick={download} className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition hover:border-cyan-400">
      <Download size={18} /> Download receipt (PDF)
    </button>
  );
}