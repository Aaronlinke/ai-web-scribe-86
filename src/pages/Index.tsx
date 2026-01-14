import { useState } from "react";
import { Code2, Eye, Zap, Download, ExternalLink, AlertTriangle, FolderOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PromptInput from "@/components/PromptInput";
import PreviewFrame from "@/components/PreviewFrame";
import CodeEditor from "@/components/CodeEditor";
import FileManager, { FileItem, FolderItem } from "@/components/FileManager";
import MultiFileUpload from "@/components/MultiFileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [activeTab, setActiveTab] = useState("preview");
  const [isLoading, setIsLoading] = useState(false);
  
  // File Management State
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: "generated", name: "🤖 Generiert", isExpanded: true },
    { id: "uploaded", name: "📁 Uploads", isExpanded: true },
  ]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // AI Generation
  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);

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
        const newFile: FileItem = {
          id: `gen-${Date.now()}`,
          name: `generated-${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}.html`,
          content: data.code,
          folderId: "generated",
        };
        setFiles((prev) => [...prev, newFile]);
        setSelectedFile(newFile);
        setActiveTab("preview");
        toast.success("Webseite generiert!");
      }
    } catch (err) {
      console.error("Generate error:", err);
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  // File Operations
  const handleFilesLoaded = (newFiles: Omit<FileItem, "id">[]) => {
    const filesWithIds = newFiles.map((f) => ({
      ...f,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      folderId: "uploaded",
    }));
    setFiles((prev) => [...prev, ...filesWithIds]);
    if (filesWithIds.length > 0) {
      setSelectedFile(filesWithIds[0]);
      setActiveTab("preview");
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
    toast.success("Datei gelöscht");
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setFiles((prev) => prev.filter((f) => f.folderId !== folderId));
    toast.success("Ordner gelöscht");
  };

  const handleAddFolder = (name: string) => {
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name,
      isExpanded: true,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleToggleFolder = (folderId: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f))
    );
  };

  // Merge/Fusion Function
  const handleMergeFiles = () => {
    if (files.length < 2) {
      toast.error("Mindestens 2 Dateien zum Fusionieren benötigt");
      return;
    }

    // Separate by type
    const htmlFiles = files.filter((f) => f.name.endsWith(".html") || f.name.endsWith(".htm"));
    const cssFiles = files.filter((f) => f.name.endsWith(".css"));
    const jsFiles = files.filter((f) => f.name.endsWith(".js"));

    // Build merged HTML
    let mergedHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fusionierte Webseite</title>
  <style>
    /* === FUSIONIERTES CSS === */
${cssFiles.map((f) => `    /* --- ${f.name} --- */\n${f.content}`).join("\n\n")}
  </style>
</head>
<body>
  <!-- === FUSIONIERTER HTML INHALT === -->
${htmlFiles
  .map((f) => {
    // Extract body content if full HTML, otherwise use as-is
    const bodyMatch = f.content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1] : f.content;
    return `  <!-- --- ${f.name} --- -->\n  <section class="merged-section">\n${content}\n  </section>`;
  })
  .join("\n\n")}

  <script>
    /* === FUSIONIERTES JAVASCRIPT === */
${jsFiles.map((f) => `    // --- ${f.name} ---\n${f.content}`).join("\n\n")}
  </script>
</body>
</html>`;

    const mergedFile: FileItem = {
      id: `merged-${Date.now()}`,
      name: `fusion-${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}.html`,
      content: mergedHtml,
      folderId: "generated",
    };

    setFiles((prev) => [...prev, mergedFile]);
    setSelectedFile(mergedFile);
    setActiveTab("preview");
    toast.success(`${files.length} Dateien fusioniert!`);
  };

  // Download & Open
  const handleDownload = () => {
    if (!selectedFile) {
      toast.error("Keine Datei ausgewählt");
      return;
    }
    const blob = new Blob([selectedFile.content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download gestartet!");
  };

  const handleOpenInBrowser = () => {
    if (!selectedFile) {
      toast.error("Keine Datei ausgewählt");
      return;
    }
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(selectedFile.content);
      newWindow.document.close();
    }
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
              <h1 className="text-lg font-bold gradient-text">WebGen AI</h1>
              <p className="text-[10px] text-muted-foreground">HTML • CSS • JavaScript</p>
            </div>
          </div>

          {/* Quick Actions */}
          {selectedFile && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 h-8">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenInBrowser} className="gap-1.5 h-8">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Öffnen</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Disclaimer */}
      <div className="container mx-auto px-4 pt-3">
        <Alert variant="default" className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-xs text-yellow-200">
            ⚠️ Dieses Tool dient ausschließlich zu Lern- und Studienzwecken.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="w-full lg:w-[400px] flex-shrink-0 space-y-4">
          {/* Main Tabs */}
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-card border border-border h-10">
              <TabsTrigger value="generate" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sparkles className="w-3 h-3" />
                KI
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FolderOpen className="w-3 h-3" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Code2 className="w-3 h-3" />
                Dateien
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="mt-3">
              <div className="gradient-border p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">KI-Generator</h2>
                  </div>
                  <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-3">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-semibold text-foreground">Dateien hochladen</h2>
                </div>
                <MultiFileUpload onFilesLoaded={handleFilesLoaded} />
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  .html, .css, .js, .json • max. 5MB pro Datei
                </p>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-3">
              <FileManager
                folders={folders}
                files={files}
                selectedFileId={selectedFile?.id || null}
                onSelectFile={setSelectedFile}
                onDeleteFile={handleDeleteFile}
                onDeleteFolder={handleDeleteFolder}
                onAddFolder={handleAddFolder}
                onMergeFiles={handleMergeFiles}
                onToggleFolder={handleToggleFolder}
              />
            </TabsContent>
          </Tabs>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {selectedFile.content.length.toLocaleString()} Zeichen •{" "}
                {selectedFile.content.split("\n").length} Zeilen
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
              <PreviewFrame code={selectedFile?.content || ""} />
            </TabsContent>

            <TabsContent value="code" className="flex-1 mt-3">
              <CodeEditor code={selectedFile?.content || ""} />
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
