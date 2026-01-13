import { useState } from "react";
import { Code2, Eye, Zap, Github } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PromptInput from "@/components/PromptInput";
import PreviewFrame from "@/components/PreviewFrame";
import CodeEditor from "@/components/CodeEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setGeneratedCode("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-website", {
        body: { prompt },
      });

      if (error) {
        console.error("Supabase function error:", error);
        toast.error(error.message || "Fehler bei der Generierung");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.code) {
        setGeneratedCode(data.code);
        setActiveTab("preview");
        toast.success("Webseite erfolgreich generiert!");
      }
    } catch (err) {
      console.error("Generate error:", err);
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">WebGen AI</h1>
              <p className="text-xs text-muted-foreground">KI-gestützter Website-Generator</p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Github className="w-5 h-5 text-muted-foreground" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Input */}
        <div className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
          <div className="gradient-border p-5">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Beschreibe deine Webseite
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Die KI generiert vollständigen HTML, CSS & JavaScript Code
                </p>
              </div>
              <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "⚡", title: "Blitzschnell", desc: "Generierung in Sekunden" },
              { icon: "🎨", title: "Modernes Design", desc: "Responsive & animiert" },
              { icon: "📱", title: "Responsive", desc: "Für alle Geräte" },
              { icon: "💾", title: "Exportierbar", desc: "Download als HTML" },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <span className="text-2xl">{feature.icon}</span>
                <h3 className="font-medium text-foreground mt-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Preview/Code */}
        <div className="flex-1 min-h-[500px] lg:min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-2 bg-card border border-border">
              <TabsTrigger
                value="preview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
              >
                <Eye className="w-4 h-4" />
                Vorschau
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
              >
                <Code2 className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 mt-4">
              <PreviewFrame code={generatedCode} />
            </TabsContent>

            <TabsContent value="code" className="flex-1 mt-4">
              <CodeEditor code={generatedCode} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Powered by KI • Erstelle professionelle Webseiten in Sekunden
        </div>
      </footer>
    </div>
  );
};

export default Index;
