import { useState } from "react";
import { Sparkles, Loader2, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  onGenerate: (prompt: string, model: string) => void;
  isLoading: boolean;
}

const models = [
  { id: "google/gemini-3-flash-preview", name: "Flash", icon: Zap, desc: "Schnell" },
  { id: "google/gemini-2.5-pro", name: "Pro", icon: Brain, desc: "Stärker" },
];

const PromptInput = ({ onGenerate, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0].id);

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

  return (
    <div className="w-full space-y-3">
      {/* Model Switcher */}
      <div className="flex gap-2">
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
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="z.B. 'Landing Page mit Hero, Features und Kontaktformular'"
          className="min-h-[80px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-sans text-sm"
          disabled={isLoading}
        />

        <Button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generiere...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generieren
            </>
          )}
        </Button>
      </form>

      {!prompt && (
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
