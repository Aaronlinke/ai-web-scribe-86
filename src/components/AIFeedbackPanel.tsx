import { Flame, Lightbulb, Rocket, ChevronDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export interface AIFeedback {
  strengths: string;
  improvements: string;
  nextLevel: string;
}

interface AIFeedbackPanelProps {
  feedback: AIFeedback | null;
  onRefine?: () => void;
  isRefining?: boolean;
}

const AIFeedbackPanel = ({ feedback, onRefine, isRefining }: AIFeedbackPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!feedback) return null;

  const sections = [
    { icon: Flame, label: "Stärken", content: feedback.strengths, color: "text-orange-400", bg: "bg-orange-500/10" },
    { icon: Lightbulb, label: "Verbesserungen", content: feedback.improvements, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { icon: Rocket, label: "Nächste Stufe", content: feedback.nextLevel, color: "text-blue-400", bg: "bg-blue-500/10" },
  ].filter(s => s.content);

  if (sections.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-blue-500/10 hover:from-orange-500/15 hover:via-yellow-500/15 hover:to-blue-500/15 transition-colors">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-foreground">KI-Feedback</span>
          </div>
          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-3 space-y-2">
            {sections.map(({ icon: Icon, label, content, color, bg }) => (
              <div key={label} className={`${bg} rounded-md p-2.5`}>
                <div className={`flex items-center gap-1.5 ${color} text-[11px] font-semibold mb-1`}>
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed">{content}</p>
              </div>
            ))}

            {onRefine && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/10 hover:text-primary"
                onClick={onRefine}
                disabled={isRefining}
              >
                <RefreshCw className={`w-3 h-3 ${isRefining ? "animate-spin" : ""}`} />
                {isRefining ? "Verbessere..." : "🔥 KI-Verbesserung starten"}
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default AIFeedbackPanel;
