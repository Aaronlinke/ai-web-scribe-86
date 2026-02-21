import { useState } from "react";
import { 
  Layout, Type, Image, FormInput, Navigation, 
  ChevronDown, GripVertical, Star, Mail, 
  Columns, FileText, Quote, MapPin
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface BuilderComponent {
  id: string;
  type: string;
  label: string;
  category: string;
  defaultContent: Record<string, string>;
}

const componentCategories = [
  {
    name: "Layout",
    icon: Layout,
    components: [
      { type: "header", label: "Header + Navigation", defaultContent: { title: "Mein Unternehmen", links: "Home, Über uns, Kontakt" } },
      { type: "hero", label: "Hero Section", defaultContent: { heading: "Willkommen", subheading: "Deine Beschreibung hier", cta: "Mehr erfahren" } },
      { type: "footer", label: "Footer", defaultContent: { text: "© 2026 Unternehmen. Alle Rechte vorbehalten.", links: "Impressum, Datenschutz" } },
    ],
  },
  {
    name: "Inhalt",
    icon: Type,
    components: [
      { type: "text-block", label: "Textblock", defaultContent: { heading: "Überschrift", text: "Hier kommt dein Text. Klicke zum Bearbeiten." } },
      { type: "feature-cards", label: "Feature Cards (3er)", defaultContent: { card1: "Feature 1", card2: "Feature 2", card3: "Feature 3" } },
      { type: "testimonial", label: "Testimonial", defaultContent: { quote: "Ein tolles Produkt!", author: "Max Mustermann" } },
    ],
  },
  {
    name: "Medien",
    icon: Image,
    components: [
      { type: "image-placeholder", label: "Bild-Platzhalter", defaultContent: { alt: "Bild Beschreibung", width: "100%", height: "300px" } },
      { type: "gallery", label: "Bildgalerie (4er)", defaultContent: { count: "4" } },
    ],
  },
  {
    name: "Formulare",
    icon: FormInput,
    components: [
      { type: "contact-form", label: "Kontaktformular", defaultContent: { fields: "Name, E-Mail, Nachricht", button: "Absenden" } },
      { type: "newsletter", label: "Newsletter Signup", defaultContent: { heading: "Newsletter abonnieren", placeholder: "Deine E-Mail" } },
    ],
  },
];

interface ComponentPaletteProps {
  onAddComponent: (component: Omit<BuilderComponent, "id">) => void;
}

const ComponentPalette = ({ onAddComponent }: ComponentPaletteProps) => {
  const [expanded, setExpanded] = useState<string | null>("Layout");

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
        Komponenten
      </div>
      {componentCategories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Collapsible
            key={cat.name}
            open={expanded === cat.name}
            onOpenChange={(open) => setExpanded(open ? cat.name : null)}
          >
            <CollapsibleTrigger className="w-full flex items-center justify-between px-2 py-1.5 bg-secondary/50 hover:bg-secondary rounded-md text-xs font-medium transition-colors">
              <span className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
                {cat.name}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${expanded === cat.name ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1 space-y-0.5">
              {cat.components.map((comp) => (
                <button
                  key={comp.type}
                  onClick={() =>
                    onAddComponent({
                      type: comp.type,
                      label: comp.label,
                      category: cat.name,
                      defaultContent: comp.defaultContent,
                    })
                  }
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-foreground/80 hover:bg-primary/10 hover:text-primary rounded transition-colors"
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                  {comp.label}
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default ComponentPalette;
