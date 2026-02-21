import { useState } from "react";
import { Trash2, GripVertical, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import type { BuilderComponent } from "./ComponentPalette";
import type { BuilderStyles } from "./StylePanel";
import { Button } from "@/components/ui/button";

interface BuilderCanvasProps {
  components: BuilderComponent[];
  styles: BuilderStyles;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onUpdateContent: (id: string, content: Record<string, string>) => void;
}

const spacingMap = { compact: "1rem", normal: "2rem", spacious: "3.5rem" };

const BuilderCanvas = ({ components, styles, onRemove, onMoveUp, onMoveDown, onUpdateContent }: BuilderCanvasProps) => {
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);

  if (components.length === 0) {
    return (
      <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-lg">
        <div className="text-center space-y-2 p-8">
          <div className="text-4xl">🧱</div>
          <p className="text-sm text-muted-foreground">Füge Komponenten aus der Palette hinzu</p>
          <p className="text-[10px] text-muted-foreground/60">Klicke links auf eine Komponente</p>
        </div>
      </div>
    );
  }

  const renderComponentPreview = (comp: BuilderComponent) => {
    const padding = spacingMap[styles.spacing];
    const baseStyle = { fontFamily: styles.fontFamily, padding };

    const editableText = (field: string, tag: "h1" | "h2" | "h3" | "p" | "span" | "button", extraClass = "") => {
      const isEditing = editingField?.id === comp.id && editingField?.field === field;
      const Tag = tag;
      const value = comp.defaultContent[field] || "";

      if (isEditing) {
        return (
          <input
            autoFocus
            className="bg-primary/10 border border-primary/40 rounded px-1 text-inherit font-inherit outline-none w-full"
            value={value}
            onChange={(e) => onUpdateContent(comp.id, { ...comp.defaultContent, [field]: e.target.value })}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
          />
        );
      }

      return (
        <Tag
          className={`cursor-text hover:outline hover:outline-1 hover:outline-primary/40 hover:outline-offset-2 rounded ${extraClass}`}
          onClick={(e) => { e.stopPropagation(); setEditingField({ id: comp.id, field }); }}
        >
          {value}
          <Pencil className="inline-block w-2.5 h-2.5 ml-1 opacity-0 group-hover:opacity-40" />
        </Tag>
      );
    };

    switch (comp.type) {
      case "header":
        return (
          <div style={{ ...baseStyle, backgroundColor: styles.primaryColor, color: "#fff" }} className="flex items-center justify-between rounded">
            {editableText("title", "h3", "text-base font-bold")}
            <nav className="flex gap-3 text-xs opacity-80">
              {(comp.defaultContent.links || "").split(",").map((l, i) => (
                <span key={i} className="hover:underline cursor-pointer">{l.trim()}</span>
              ))}
            </nav>
          </div>
        );
      case "hero":
        return (
          <div style={{ ...baseStyle, background: `linear-gradient(135deg, ${styles.primaryColor}, ${styles.secondaryColor})`, color: "#fff" }} className="text-center rounded py-12">
            {editableText("heading", "h1", "text-2xl font-bold mb-2")}
            {editableText("subheading", "p", "text-sm opacity-80 mb-4")}
            {editableText("cta", "button", "inline-block px-4 py-2 bg-white/20 rounded-lg text-sm font-semibold hover:bg-white/30")}
          </div>
        );
      case "text-block":
        return (
          <div style={{ ...baseStyle, color: styles.textColor }} className="rounded">
            {editableText("heading", "h2", "text-lg font-bold mb-2")}
            {editableText("text", "p", "text-sm leading-relaxed opacity-80")}
          </div>
        );
      case "feature-cards":
        return (
          <div style={baseStyle} className="grid grid-cols-3 gap-3 rounded">
            {["card1", "card2", "card3"].map((key) => (
              <div key={key} className="bg-secondary/30 border border-border rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">⭐</div>
                {editableText(key, "p", "text-xs font-medium")}
              </div>
            ))}
          </div>
        );
      case "testimonial":
        return (
          <div style={{ ...baseStyle, color: styles.textColor }} className="text-center rounded bg-secondary/20 border border-border">
            <div className="text-2xl mb-2">💬</div>
            {editableText("quote", "p", "text-sm italic mb-2")}
            {editableText("author", "span", "text-xs font-semibold opacity-60")}
          </div>
        );
      case "image-placeholder":
        return (
          <div style={{ ...baseStyle, height: comp.defaultContent.height || "200px" }} className="bg-secondary/30 border-2 border-dashed border-border rounded flex items-center justify-center">
            <span className="text-muted-foreground text-xs">🖼️ Bild-Platzhalter</span>
          </div>
        );
      case "gallery":
        return (
          <div style={baseStyle} className="grid grid-cols-4 gap-2 rounded">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-secondary/30 border border-border rounded flex items-center justify-center text-muted-foreground text-xs">
                🖼️
              </div>
            ))}
          </div>
        );
      case "contact-form":
        return (
          <div style={{ ...baseStyle, color: styles.textColor }} className="rounded space-y-2">
            <h3 className="text-sm font-bold mb-2">Kontakt</h3>
            {(comp.defaultContent.fields || "").split(",").map((f, i) => (
              <div key={i} className="bg-secondary/30 border border-border rounded px-3 py-2 text-xs text-muted-foreground">
                {f.trim()}
              </div>
            ))}
            {editableText("button", "button", "mt-2 w-full py-2 rounded text-xs font-semibold text-center")}
          </div>
        );
      case "newsletter":
        return (
          <div style={{ ...baseStyle, backgroundColor: styles.secondaryColor + "22" }} className="text-center rounded border border-border">
            {editableText("heading", "h3", "text-sm font-bold mb-2")}
            <div className="flex gap-2 max-w-xs mx-auto">
              <div className="flex-1 bg-secondary/30 border border-border rounded px-3 py-2 text-xs text-muted-foreground text-left">
                {comp.defaultContent.placeholder}
              </div>
              <div className="px-3 py-2 rounded text-xs font-semibold" style={{ backgroundColor: styles.primaryColor, color: "#fff" }}>
                OK
              </div>
            </div>
          </div>
        );
      case "footer":
        return (
          <div style={{ ...baseStyle, backgroundColor: styles.textColor, color: styles.bgColor }} className="text-center rounded text-xs">
            {editableText("text", "p", "mb-1")}
            <div className="flex gap-3 justify-center opacity-60 text-[10px]">
              {(comp.defaultContent.links || "").split(",").map((l, i) => (
                <span key={i} className="hover:underline cursor-pointer">{l.trim()}</span>
              ))}
            </div>
          </div>
        );
      default:
        return <div style={baseStyle} className="text-xs text-muted-foreground">Unbekannte Komponente</div>;
    }
  };

  return (
    <div className="space-y-2 p-2" style={{ backgroundColor: styles.bgColor, minHeight: "100%" }}>
      {components.map((comp, idx) => (
        <div key={comp.id} className="group relative border border-transparent hover:border-primary/30 rounded-lg transition-colors">
          {/* Controls */}
          <div className="absolute -right-1 top-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMoveUp(comp.id)} disabled={idx === 0}>
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMoveDown(comp.id)} disabled={idx === components.length - 1}>
              <ChevronDown className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onRemove(comp.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          {/* Label */}
          <div className="absolute -left-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded font-medium">
              {comp.label}
            </span>
          </div>
          {renderComponentPreview(comp)}
        </div>
      ))}
    </div>
  );
};

export default BuilderCanvas;
