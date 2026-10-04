import { Watch, Headphones, Keyboard, Lightbulb, Package } from "lucide-react";

const ICONS = { Wearables: Watch, Audio: Headphones, "Desk & Workspace": Keyboard, "Smart Lighting": Lightbulb };

export default function ProductVisual({ product }) {
  const Icon = ICONS[product.category] || Package;
  return (
    <div className="pv" style={{ "--a": product.accent, "--b": product.accent2 }}>
      <div className="pv-ring" />
      <div className="pv-ring r2" />
      <div className="pv-core"><Icon strokeWidth={1.3} className="pv-icon" /></div>
    </div>
  );
}