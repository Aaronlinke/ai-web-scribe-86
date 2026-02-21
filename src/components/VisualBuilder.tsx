import { useState, useCallback } from "react";
import { Download, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ComponentPalette, { type BuilderComponent } from "./builder/ComponentPalette";
import BuilderCanvas from "./builder/BuilderCanvas";
import StylePanel, { type BuilderStyles } from "./builder/StylePanel";

const defaultStyles: BuilderStyles = {
  primaryColor: "#0ea5e9",
  secondaryColor: "#8b5cf6",
  bgColor: "#ffffff",
  textColor: "#1e293b",
  fontFamily: "system-ui, sans-serif",
  spacing: "normal",
};

interface VisualBuilderProps {
  onExportHTML: (html: string, name: string) => void;
}

const VisualBuilder = ({ onExportHTML }: VisualBuilderProps) => {
  const [components, setComponents] = useState<BuilderComponent[]>([]);
  const [styles, setStyles] = useState<BuilderStyles>(defaultStyles);

  const addComponent = useCallback((comp: Omit<BuilderComponent, "id">) => {
    const newComp: BuilderComponent = { ...comp, id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    setComponents((prev) => [...prev, newComp]);
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const moveUp = useCallback((id: string) => {
    setComponents((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((id: string) => {
    setComponents((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const updateContent = useCallback((id: string, content: Record<string, string>) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, defaultContent: content } : c)));
  }, []);

  const resetAll = () => {
    setComponents([]);
    setStyles(defaultStyles);
    toast.info("Builder zurückgesetzt");
  };

  // Generate clean HTML export
  const generateHTML = (): string => {
    const spacingMap = { compact: "1rem", normal: "2rem", spacious: "3.5rem" };
    const pad = spacingMap[styles.spacing];

    const renderComp = (c: BuilderComponent): string => {
      switch (c.type) {
        case "header":
          return `<header style="background:${styles.primaryColor};color:#fff;padding:${pad};display:flex;align-items:center;justify-content:space-between;">
  <h1 style="font-size:1.25rem;font-weight:700;margin:0;">${c.defaultContent.title}</h1>
  <nav style="display:flex;gap:1.5rem;font-size:0.875rem;">${(c.defaultContent.links || "").split(",").map((l) => `<a href="#" style="color:#fff;text-decoration:none;">${l.trim()}</a>`).join("")}</nav>
</header>`;
        case "hero":
          return `<section style="background:linear-gradient(135deg,${styles.primaryColor},${styles.secondaryColor});color:#fff;padding:${pad};text-align:center;padding-top:4rem;padding-bottom:4rem;">
  <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;">${c.defaultContent.heading}</h1>
  <p style="opacity:0.8;margin-bottom:1.5rem;">${c.defaultContent.subheading}</p>
  <a href="#" style="display:inline-block;padding:0.75rem 2rem;background:rgba(255,255,255,0.2);border-radius:0.5rem;color:#fff;text-decoration:none;font-weight:600;">${c.defaultContent.cta}</a>
</section>`;
        case "text-block":
          return `<section style="padding:${pad};color:${styles.textColor};">
  <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;">${c.defaultContent.heading}</h2>
  <p style="line-height:1.6;opacity:0.8;">${c.defaultContent.text}</p>
</section>`;
        case "feature-cards":
          return `<section style="padding:${pad};display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">
${["card1", "card2", "card3"].map((k) => `  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0.75rem;padding:1.5rem;text-align:center;">
    <div style="font-size:1.5rem;margin-bottom:0.5rem;">⭐</div>
    <p style="font-weight:500;">${c.defaultContent[k]}</p>
  </div>`).join("\n")}
</section>`;
        case "testimonial":
          return `<section style="padding:${pad};text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:0.75rem;">
  <div style="font-size:1.5rem;margin-bottom:0.5rem;">💬</div>
  <p style="font-style:italic;margin-bottom:0.5rem;">${c.defaultContent.quote}</p>
  <span style="font-size:0.75rem;font-weight:600;opacity:0.6;">— ${c.defaultContent.author}</span>
</section>`;
        case "image-placeholder":
          return `<div style="padding:${pad};"><div style="height:${c.defaultContent.height || "300px"};background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:0.75rem;display:flex;align-items:center;justify-content:center;color:#94a3b8;">🖼️ Bild hier einfügen</div></div>`;
        case "gallery":
          return `<section style="padding:${pad};display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;">
${Array.from({ length: 4 }).map(() => `  <div style="aspect-ratio:1;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:0.5rem;display:flex;align-items:center;justify-content:center;color:#94a3b8;">🖼️</div>`).join("\n")}
</section>`;
        case "contact-form":
          return `<section style="padding:${pad};color:${styles.textColor};">
  <h3 style="font-weight:700;margin-bottom:1rem;">Kontakt</h3>
  <form style="display:flex;flex-direction:column;gap:0.5rem;max-width:400px;">
${(c.defaultContent.fields || "").split(",").map((f) => `    <input type="text" placeholder="${f.trim()}" style="padding:0.5rem 0.75rem;border:1px solid #e2e8f0;border-radius:0.5rem;font-size:0.875rem;" />`).join("\n")}
    <button type="submit" style="padding:0.5rem 1rem;background:${styles.primaryColor};color:#fff;border:none;border-radius:0.5rem;font-weight:600;cursor:pointer;margin-top:0.5rem;">${c.defaultContent.button}</button>
  </form>
</section>`;
        case "newsletter":
          return `<section style="padding:${pad};text-align:center;background:${styles.secondaryColor}15;border:1px solid ${styles.secondaryColor}30;border-radius:0.75rem;">
  <h3 style="font-weight:700;margin-bottom:0.75rem;">${c.defaultContent.heading}</h3>
  <div style="display:flex;gap:0.5rem;max-width:320px;margin:0 auto;">
    <input type="email" placeholder="${c.defaultContent.placeholder}" style="flex:1;padding:0.5rem 0.75rem;border:1px solid #e2e8f0;border-radius:0.5rem;font-size:0.875rem;" />
    <button style="padding:0.5rem 1rem;background:${styles.primaryColor};color:#fff;border:none;border-radius:0.5rem;font-weight:600;cursor:pointer;">OK</button>
  </div>
</section>`;
        case "footer":
          return `<footer style="background:${styles.textColor};color:${styles.bgColor};padding:${pad};text-align:center;font-size:0.75rem;">
  <p style="margin-bottom:0.25rem;">${c.defaultContent.text}</p>
  <div style="display:flex;gap:1rem;justify-content:center;opacity:0.6;">${(c.defaultContent.links || "").split(",").map((l) => `<a href="#" style="color:inherit;text-decoration:none;">${l.trim()}</a>`).join("")}</div>
</footer>`;
        default:
          return `<div style="padding:${pad};">${c.label}</div>`;
      }
    };

    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Builder Export</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${styles.fontFamily}; background: ${styles.bgColor}; color: ${styles.textColor}; }
    img { max-width: 100%; }
    a { color: inherit; }
  </style>
</head>
<body>
${components.map(renderComp).join("\n\n")}
</body>
</html>`;
  };

  const handleExport = () => {
    if (components.length === 0) {
      toast.error("Keine Komponenten zum Exportieren");
      return;
    }
    const html = generateHTML();
    const name = `builder-${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}.html`;
    onExportHTML(html, name);
    toast.success("HTML exportiert und zu Dateien hinzugefügt!");
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={resetAll}>
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
        <Button size="sm" className="gap-1.5 h-8 text-xs ml-auto" onClick={handleExport}>
          <Download className="w-3 h-3" />
          Als HTML exportieren
        </Button>
      </div>

      {/* Component Palette */}
      <ComponentPalette onAddComponent={addComponent} />

      {/* Style Panel */}
      <div className="border-t border-border pt-3">
        <StylePanel styles={styles} onStyleChange={setStyles} />
      </div>

      {/* Mini Preview Info */}
      <div className="text-[10px] text-muted-foreground text-center pt-1">
        {components.length} Komponente{components.length !== 1 ? "n" : ""} • Vorschau rechts
      </div>
    </div>
  );
};

export { VisualBuilder, type BuilderComponent, type BuilderStyles };
export default VisualBuilder;
