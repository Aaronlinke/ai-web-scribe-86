import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput = ({ onGenerate, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  const examplePrompts = [
    "Ein modernes Portfolio für einen Fotografen mit Bildergalerie",
    "Eine Landing Page für ein SaaS-Startup mit Pricing-Tabelle",
    "Ein Restaurant-Menü mit elegantem Dark-Mode Design",
    "Eine persönliche Blog-Seite mit minimalistischem Stil",
  ];

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Beschreibe deine Webseite... z.B. 'Eine moderne Landing Page für ein Tech-Startup mit Hero-Section, Features und Kontaktformular'"
            className="min-h-[120px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-sans text-base"
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {prompt.length} Zeichen
          </div>
        </div>

        <Button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generiere Webseite...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Webseite generieren
            </>
          )}
        </Button>
      </form>

      {!prompt && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Beispiel-Prompts:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-colors border border-border/50"
              >
                {example.slice(0, 40)}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptInput;
