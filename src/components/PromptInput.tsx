import { useState } from "react";
import { Sparkles, Loader2, Zap, Brain, Terminal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PromptInputProps {
  onGenerate: (prompt: string, model: string) => void;
  isLoading: boolean;
}

const models = [
  { id: "google/gemini-3-flash-preview", name: "Flash", icon: Zap, desc: "Schnell" },
  { id: "google/gemini-2.5-pro", name: "Pro", icon: Brain, desc: "Stärker" },
];

// Developer Mode Prompts - Technische Templates
const devModePrompts = [
  {
    category: "📈 Trading & Finance",
    prompts: [
      { title: "Trading Dashboard", prompt: "Erstelle ein Trading-Dashboard mit Echtzeit-Kurs-Anzeige, Candlestick-Chart Platzhalter, Order-Buch, Portfolio-Übersicht, Gewinn/Verlust-Rechner und Trade-History. Nutze professionelles dunkles Design." },
      { title: "Krypto Portfolio Tracker", prompt: "Baue einen Kryptowährungs-Portfolio-Tracker mit Coin-Liste, Prozentuale Änderungen, Gesamt-Portfolio-Wert, Allokations-Pie-Chart, und Preis-Alerts Konfiguration." },
      { title: "Technische Analyse Tool", prompt: "Entwickle ein Tool für technische Analyse mit RSI, MACD, Bollinger Bands Anzeige-Bereichen, Support/Resistance-Linien Markierung, und Signal-Indikatoren." },
      { title: "Bot Konfiguration Panel", prompt: "Erstelle ein Konfigurations-Panel für Trading-Bots: API-Key Eingabe (maskiert), Strategy-Auswahl (Grid, DCA, Arbitrage), Risk-Parameter, Start/Stop Controls, und Live-Log-Anzeige." },
    ]
  },
  {
    category: "🔢 Mathematik & Algorithmen",
    prompts: [
      { title: "Rechner Suite", prompt: "Baue eine erweiterte Rechner-Suite: Wissenschaftlicher Rechner, Matrixrechner, Statistik-Tools (Mittelwert, Standardabweichung, Regression), und Graphen-Plotter mit Funktionseingabe." },
      { title: "Algorithmus Visualizer", prompt: "Erstelle einen Algorithmus-Visualizer: Sorting-Algorithmen (Bubble, Quick, Merge) mit Step-by-Step Animation, Array-Visualisierung, und Performance-Vergleich." },
      { title: "Fraktal Generator", prompt: "Entwickle einen Fraktal-Generator: Mandelbrot-Set, Julia-Set Auswahl, Zoom-Controls, Farbpaletten-Wechsel, und Koordinaten-Anzeige." },
      { title: "Fibonacci & Sequenzen", prompt: "Baue ein Tool für mathematische Sequenzen: Fibonacci-Rechner, Pascal-Dreieck Generator, Prime Number Finder, und Sequence-Visualisierung." },
    ]
  },
  {
    category: "🛠️ Dev Tools",
    prompts: [
      { title: "API Tester", prompt: "Erstelle einen API-Testing-Client: HTTP-Method Auswahl, URL-Eingabe, Headers Editor, Body (JSON/Form), Response-Viewer mit Syntax-Highlighting, und History." },
      { title: "JSON Formatter", prompt: "Baue einen JSON-Tool: Formatter/Beautifier, Minifier, Validator, JSON-to-CSV Konverter, Tree-View, und Diff-Vergleich." },
      { title: "Regex Builder", prompt: "Entwickle einen Regex-Builder: Pattern-Eingabe, Test-String, Live-Matching mit Highlighting, Match-Groups Anzeige, und Cheatsheet-Sidebar." },
      { title: "Code Generator", prompt: "Erstelle einen Code-Boilerplate-Generator: Sprache wählen (HTML, CSS, JS, Python Template), Template-Optionen, Variablen-Inputs, und Copy-Button." },
    ]
  },
  {
    category: "📊 Data & Analytics",
    prompts: [
      { title: "Daten Dashboard", prompt: "Baue ein Analytics-Dashboard: KPI-Cards, Line-Charts, Bar-Charts, Data-Table mit Sorting/Filtering, Date-Range-Picker, und Export-Button." },
      { title: "CSV Analyzer", prompt: "Erstelle einen CSV-Analyzer: Upload-Zone, Spalten-Statistiken, Daten-Preview, Filter-Builder, und Chart-Generator aus Spalten." },
      { title: "Survey Builder", prompt: "Entwickle einen Survey/Form-Builder: Drag-Drop Fragen-Typen, Logik-Branches, Preview-Mode, und Ergebnis-Statistiken-Mockup." },
    ]
  },
  {
    category: "🤖 Machine Learning",
    prompts: [
      { title: "ML Pipeline Dashboard", prompt: "Erstelle ein Machine-Learning-Pipeline-Dashboard: Dataset-Upload, Feature-Auswahl mit Checkboxen, Model-Typ-Selector (Linear Regression, Decision Tree, Neural Network), Training-Progress-Bar, Metriken-Anzeige (Accuracy, F1, Loss), und Prediction-Interface." },
      { title: "Neural Network Visualizer", prompt: "Baue einen Neural-Network-Visualizer: Layer-Konfiguration (Input, Hidden, Output), Neuronen-Anzahl pro Layer, Aktivierungsfunktionen-Auswahl, interaktive Netzwerk-Grafik mit Verbindungen, und Forward-Pass-Animation." },
      { title: "Dataset Explorer", prompt: "Entwickle einen Dataset-Explorer: Daten-Upload, automatische Spaltentyp-Erkennung, Korrelationsmatrix-Heatmap, Verteilungs-Histogramme, Outlier-Detection, und Feature-Importance-Ranking." },
      { title: "Prompt Engineering Lab", prompt: "Erstelle ein Prompt-Engineering-Lab: Prompt-Editor mit Variablen-Platzhaltern, Temperature/Top-P Slider, Side-by-Side Response-Vergleich, Prompt-Bibliothek, und A/B-Test Scoring." },
    ]
  },
  {
    category: "⚡ Automation",
    prompts: [
      { title: "Workflow Builder", prompt: "Baue einen visuellen Workflow-Builder: Node-basierter Editor mit Trigger-Nodes (Webhook, Schedule, Event), Action-Nodes (HTTP, Email, DB-Query), Conditional-Branches, Verbindungslinien zwischen Nodes, und Execution-Log." },
      { title: "Cron Job Manager", prompt: "Erstelle einen Cron-Job-Manager: Cron-Expression-Builder mit visuellem Editor, Job-Liste mit Status (Active/Paused/Failed), nächste Ausführungszeit-Anzeige, Log-History, und Retry-Konfiguration." },
      { title: "Web Scraper Studio", prompt: "Entwickle ein Web-Scraper-Studio: URL-Eingabe, CSS-Selector-Builder mit Preview-Highlighting, Daten-Mapping zu Spalten, Schedule-Konfiguration, Export als JSON/CSV, und Run-History." },
      { title: "Task Automation Hub", prompt: "Baue einen Task-Automation-Hub: Trigger-Auswahl (Datei-Änderung, API-Call, Zeitplan), Multi-Step-Actions mit Drag-Drop Reihenfolge, Variable-Mapping zwischen Steps, Error-Handling-Config, und Dashboard mit Erfolgsrate." },
    ]
  },
  {
    category: "🗄️ Datenbank-Tools",
    prompts: [
      { title: "SQL Query Builder", prompt: "Erstelle einen visuellen SQL-Query-Builder: Tabellen-Auswahl per Dropdown, JOIN-Builder mit Drag-Drop, WHERE-Condition-Builder, GROUP-BY und ORDER-BY Konfiguration, Live-SQL-Preview, und Ergebnis-Tabelle mit Pagination." },
      { title: "DB Schema Designer", prompt: "Baue einen Datenbank-Schema-Designer: Tabellen erstellen mit Drag-Drop, Spalten-Editor (Name, Typ, Constraints), Relationen-Linien zwischen Tabellen ziehen, Auto-Generate SQL-DDL, und ERD-Export als Bild." },
      { title: "Migration Manager", prompt: "Entwickle einen Migration-Manager: Migration-Liste mit Versionen und Status, SQL-Editor für Up/Down Migrations, Diff-View zwischen Versionen, Rollback-Button, und Dependency-Graph." },
      { title: "Data Seeder", prompt: "Erstelle einen Data-Seeder: Tabellen-Auswahl, Spaltenweise Fake-Daten-Konfiguration (Name, Email, Datum, Number-Range), Anzahl-Slider, Preview der generierten Daten, und Export als SQL-Insert oder JSON." },
    ]
  },
  {
    category: "🔗 API & Webhooks",
    prompts: [
      { title: "REST API Builder", prompt: "Erstelle einen REST-API-Builder: Endpoint-Definition mit Method/Path/Description, Request/Response-Body-Schema-Editor (JSON), Auth-Typ-Auswahl (Bearer, API-Key, OAuth), Auto-generierte Dokumentation im OpenAPI-Stil, und Try-It-Out Panel." },
      { title: "Webhook Manager", prompt: "Baue einen Webhook-Manager: Webhook-URL-Generator, Event-Typ-Auswahl (POST/PUT/DELETE), Payload-Template-Editor, Retry-Konfiguration (Attempts, Backoff), Delivery-Log mit Status-Codes, und Test-Button mit Response-Preview." },
      { title: "API Gateway Dashboard", prompt: "Entwickle ein API-Gateway-Dashboard: Route-Konfiguration mit Path-Matching, Rate-Limiting-Settings pro Endpoint, API-Key-Verwaltung (erstellen, widerrufen), Request/Response-Transformation-Rules, und Echtzeit-Traffic-Monitor mit Latenz-Graphen." },
      { title: "OAuth Flow Designer", prompt: "Erstelle einen OAuth-Flow-Designer: Provider-Auswahl (Google, GitHub, Discord), Scope-Konfiguration mit Checkboxen, Redirect-URI-Builder, Token-Lifecycle-Visualisierung (Auth Code → Access Token → Refresh), und Test-Login-Button mit Token-Inspector." },
    ]
  }
];

const PromptInput = ({ onGenerate, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [devMode, setDevMode] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim(), selectedModel);
    }
  };

  const examplePrompts = [
    "Portfolio mit Galerie",
    "Landing Page modern",
    "Dashboard Dark Mode",
    "Blog mit Sidebar",
  ];

  // Secret click handler - clicking on "AI" title toggles dev mode
  const handleDevModeToggle = () => {
    setDevMode(!devMode);
  };

  return (
    <div className="w-full space-y-3">
      {/* Model Switcher with hidden Dev Mode trigger */}
      <div className="flex gap-2 items-center">
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedModel === model.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border"
              }`}
            >
              <Icon className="w-3 h-3" />
              {model.name}
              <span className="text-[10px] opacity-70">({model.desc})</span>
            </button>
          );
        })}
        {/* Dev Mode Toggle - Secret button */}
        <button
          onClick={handleDevModeToggle}
          className={`p-2 rounded-lg transition-all ${
            devMode 
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/50" 
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
          }`}
          title="Developer Mode"
        >
          <Terminal className="w-4 h-4" />
        </button>
      </div>

      {/* Developer Mode Panel */}
      {devMode && (
        <div className="bg-gradient-to-br from-amber-950/30 to-orange-950/20 border border-amber-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer Mode</span>
            <span className="text-[10px] text-amber-500/70 ml-auto">Erweiterte Templates</span>
          </div>
          
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
            {devModePrompts.map((category) => (
              <Collapsible 
                key={category.category}
                open={expandedCategory === category.category}
                onOpenChange={(open) => setExpandedCategory(open ? category.category : null)}
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between px-2 py-1.5 bg-black/30 hover:bg-black/40 rounded text-xs text-left transition-colors">
                  <span>{category.category}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedCategory === category.category ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1 space-y-1">
                  {category.prompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPrompt(item.prompt);
                        setSelectedModel(models[1].id); // Auto-select Pro for complex prompts
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] bg-black/20 hover:bg-amber-500/20 rounded transition-colors text-amber-200/80 hover:text-amber-100"
                    >
                      {item.title}
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={devMode 
            ? "Wähle ein Template oben oder schreibe deinen technischen Prompt..."
            : "z.B. 'Landing Page mit Hero, Features und Kontaktformular'"
          }
          className={`min-h-[80px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-sans text-sm ${
            devMode ? 'border-amber-500/30 focus:ring-amber-500/50 focus:border-amber-500' : ''
          }`}
          disabled={isLoading}
        />

        <Button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className={`w-full h-10 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            devMode 
              ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generiere...
            </>
          ) : (
            <>
              {devMode ? <Terminal className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {devMode ? "Build starten" : "Generieren"}
            </>
          )}
        </Button>
      </form>

      {!prompt && !devMode && (
        <div className="flex flex-wrap gap-1.5">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              className="px-2 py-1 text-[10px] bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition-colors border border-border/50"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptInput;
