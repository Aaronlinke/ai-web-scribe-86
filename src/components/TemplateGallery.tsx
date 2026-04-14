import { Sparkles, Layout, Briefcase, BookOpen, BarChart3, ShoppingBag, Palette } from "lucide-react";

interface Template {
  id: string;
  name: string;
  icon: React.ElementType;
  prompt: string;
  description: string;
}

const templates: Template[] = [
  {
    id: "landing",
    name: "Landing Page",
    icon: Layout,
    description: "Hero, Features, CTA, Testimonials",
    prompt: "Erstelle eine professionelle Landing Page mit: Sticky Navbar, großer Hero-Section mit Gradient-Hintergrund und CTA-Button, 3 Feature-Cards mit Icons, Testimonial-Sektion mit Karussell-Design, Pricing-Tabelle mit 3 Plänen, Newsletter-Signup, und modernem Footer. Nutze Glassmorphism-Effekte und Smooth-Scroll-Animationen.",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    icon: Briefcase,
    description: "Über mich, Projekte, Skills",
    prompt: "Erstelle ein kreatives Portfolio: Minimaler Header mit Name, Hero mit animiertem Typing-Effekt, Über-mich Sektion mit Foto-Platzhalter, Skills-Bereich mit animierten Progress-Bars, Projekt-Grid mit Hover-Overlays und Filterfunktion, Kontaktformular mit Validierung, und Dark-Mode Design.",
  },
  {
    id: "blog",
    name: "Blog",
    icon: BookOpen,
    description: "Artikel, Kategorien, Sidebar",
    prompt: "Erstelle einen eleganten Blog: Header mit Logo und Navigation, Featured-Article mit großem Bild-Platzhalter, Artikel-Grid mit Cards (Bild, Titel, Excerpt, Datum, Kategorie-Tags), Sidebar mit Kategorien und Archiv, Suchleiste, Pagination, und Footer. Editorial-Design mit schöner Typografie.",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    icon: BarChart3,
    description: "KPIs, Charts, Tabellen",
    prompt: "Erstelle ein Admin-Dashboard mit Dark Mode: Sidebar-Navigation mit Icons, Top-Bar mit User-Avatar und Notifications, 4 KPI-Cards mit Trend-Indikatoren, ein großer Line-Chart (als CSS/SVG Platzhalter), Daten-Tabelle mit Sortier-Headers, und Activity-Feed. Professionelles Business-Design.",
  },
  {
    id: "shop",
    name: "Shop",
    icon: ShoppingBag,
    description: "Produkte, Warenkorb, Filter",
    prompt: "Erstelle einen E-Commerce Shop: Navbar mit Warenkorb-Icon und Badge, Hero-Banner, Kategorie-Navigation, Produkt-Grid mit Cards (Bild-Platzhalter, Name, Preis, Rating-Stars, In-den-Warenkorb Button), Sidebar-Filter (Preis-Range, Kategorien), und Footer mit Newsletter.",
  },
  {
    id: "creative",
    name: "Kreativ-Agentur",
    icon: Palette,
    description: "Projekte, Team, Services",
    prompt: "Erstelle eine Kreativ-Agentur Webseite: Full-Screen Hero mit Video-Platzhalter-Overlay, Services-Grid mit Hover-Animationen, Portfolio-Galerie mit Masonry-Layout, Team-Sektion mit Mitarbeiter-Cards, Kunden-Logos Marquee-Animation, Kontakt-CTA mit Split-Design, und minimaler Footer. Nutze kühne Typografie und lebendige Farben.",
  },
];

interface TemplateGalleryProps {
  onSelectTemplate: (prompt: string, name: string) => void;
  isLoading: boolean;
}

const TemplateGallery = ({ onSelectTemplate, isLoading }: TemplateGalleryProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        <Sparkles className="w-3 h-3" />
        One-Click Templates
      </div>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTemplate(t.prompt, t.name)}
              disabled={isLoading}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-secondary/50 hover:bg-primary/10 hover:border-primary/30 border border-border transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-foreground">{t.name}</span>
              <span className="text-[9px] text-muted-foreground leading-tight">{t.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateGallery;
