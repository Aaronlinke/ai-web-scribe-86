import { useState } from "react";
import { Code2, Eye, Zap, Upload, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PromptInput from "@/components/PromptInput";
import PreviewFrame from "@/components/PreviewFrame";
import CodeEditor from "@/components/CodeEditor";
import FileUpload from "@/components/FileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [generatedCode, setGeneratedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [fileName, setFileName] = useState("website.html");

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
        setFileName("generated-website.html");
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

  const handleFileLoaded = (code: string, name: string) => {
    setGeneratedCode(code);
    setFileName(name);
    setActiveTab("preview");
  };

  const handleDownload = () => {
    if (!generatedCode) {
      toast.error("Kein Code zum Herunterladen");
      return;
    }
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download gestartet!");
  };

  const handleOpenInBrowser = () => {
    if (!generatedCode) {
      toast.error("Kein Code zum Öffnen");
      return;
    }
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(generatedCode);
      newWindow.document.close();
    }
  };

  const handleClear = () => {
    setGeneratedCode("");
    setFileName("website.html");
    toast.success("Zurückgesetzt");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">HTML Generator</h1>
              <p className="text-[10px] text-muted-foreground">HTML • CSS • JavaScript</p>
            </div>
          </div>

          {/* Quick Actions */}
          {generatedCode && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5 h-8"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInBrowser}
                className="gap-1.5 h-8"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Öffnen</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Input */}
        <div className="w-full lg:w-[380px] flex-shrink-0 space-y-4">
          {/* AI Generator */}
          <div className="gradient-border p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">KI-Generator</h2>
              </div>
              <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">ODER</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* File Upload */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">Datei hochladen</h2>
            </div>
            <FileUpload onFileLoaded={handleFileLoaded} />
          </div>

          {/* Current File Info */}
          {generatedCode && (
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{fileName}</span>
                </div>
                <button
                  onClick={handleClear}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Zurücksetzen
                </button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {generatedCode.length.toLocaleString()} Zeichen • {generatedCode.split("\n").length} Zeilen
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Preview/Code */}
        <div className="flex-1 min-h-[500px] lg:min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-2 bg-card border border-border h-10">
              <TabsTrigger
                value="preview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                Vorschau
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 text-sm"
              >
                <Code2 className="w-4 h-4" />
                Quellcode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 mt-3">
              <PreviewFrame code={generatedCode} />
            </TabsContent>

            <TabsContent value="code" className="flex-1 mt-3">
              <CodeEditor code={generatedCode} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Vanilla HTML • CSS • JavaScript – Kein Framework nötig
        </div>
      </footer>
    </div>
  );
};

export default Index;
