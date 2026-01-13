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
    "Portfolio mit Bildergalerie",
    "Landing Page mit Pricing",
    "Restaurant-Menü Dark Mode",
    "Kontaktformular modern",
  ];

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="z.B. 'Landing Page mit Hero, Features und Kontaktformular'"
            className="min-h-[80px] bg-card border-border text-foreground placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-sans text-sm"
            disabled={isLoading}
          />
        </div>

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
