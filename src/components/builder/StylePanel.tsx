import { Palette, Type as TypeIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface BuilderStyles {
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  fontFamily: string;
  spacing: "compact" | "normal" | "spacious";
}

const fontOptions = [
  { label: "System", value: "system-ui, sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Monospace", value: "'JetBrains Mono', monospace" },
];

const spacingOptions: { label: string; value: BuilderStyles["spacing"] }[] = [
  { label: "Kompakt", value: "compact" },
  { label: "Normal", value: "normal" },
  { label: "Großzügig", value: "spacious" },
];

interface StylePanelProps {
  styles: BuilderStyles;
  onStyleChange: (styles: BuilderStyles) => void;
}

const StylePanel = ({ styles, onStyleChange }: StylePanelProps) => {
  const update = (key: keyof BuilderStyles, value: string) => {
    onStyleChange({ ...styles, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Design
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Palette className="w-3.5 h-3.5 text-primary" />
          Farben
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "primaryColor" as const, label: "Primär" },
            { key: "secondaryColor" as const, label: "Sekundär" },
            { key: "bgColor" as const, label: "Hintergrund" },
            { key: "textColor" as const, label: "Text" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">{label}</Label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={styles[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                />
                <Input
                  value={styles[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="h-7 text-[10px] font-mono bg-card"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <TypeIcon className="w-3.5 h-3.5 text-primary" />
          Schriftart
        </div>
        <div className="grid grid-cols-2 gap-1">
          {fontOptions.map((font) => (
            <button
              key={font.value}
              onClick={() => update("fontFamily", font.value)}
              className={`px-2 py-1.5 text-[11px] rounded transition-colors ${
                styles.fontFamily === font.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">Abstände</Label>
        <div className="grid grid-cols-3 gap-1">
          {spacingOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("spacing", opt.value)}
              className={`px-2 py-1.5 text-[11px] rounded transition-colors ${
                styles.spacing === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StylePanel;
