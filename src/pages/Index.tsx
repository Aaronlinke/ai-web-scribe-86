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
  const handleGenerate = async (prompt: string, model: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-website", {
        body: { prompt, model },
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

  // ===== INTELLIGENTE FUSION - Nimmt das Beste aus allen Systemen =====
  const handleMergeFiles = () => {
    if (files.length < 2) {
      toast.error("Mindestens 2 Dateien zum Fusionieren benötigt");
      return;
    }

    // Separate by type
    const htmlFiles = files.filter((f) => f.name.endsWith(".html") || f.name.endsWith(".htm"));
    const cssFiles = files.filter((f) => f.name.endsWith(".css"));
    const jsFiles = files.filter((f) => f.name.endsWith(".js"));
    const jsonFiles = files.filter((f) => f.name.endsWith(".json"));

    // ===== CSS INTELLIGENCE =====
    // Extract CSS variables and deduplicate
    const extractCSSVariables = (css: string): Map<string, string> => {
      const vars = new Map<string, string>();
      const matches = css.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g);
      for (const match of matches) {
        vars.set(match[1], match[2].trim());
      }
      return vars;
    };

    // Extract CSS rules and deduplicate by selector
    const extractCSSRules = (css: string): Map<string, string> => {
      const rules = new Map<string, string>();
      // Remove comments first
      const cleanCSS = css.replace(/\/\*[\s\S]*?\*\//g, '');
      // Match selectors with their rules
      const ruleMatches = cleanCSS.matchAll(/([^{}]+)\{([^{}]+)\}/g);
      for (const match of ruleMatches) {
        const selector = match[1].trim();
        const properties = match[2].trim();
        if (selector && !selector.startsWith('@')) {
          // Merge properties if selector exists
          if (rules.has(selector)) {
            rules.set(selector, rules.get(selector) + '; ' + properties);
          } else {
            rules.set(selector, properties);
          }
        }
      }
      return rules;
    };

    // Extract @keyframes
    const extractKeyframes = (css: string): Map<string, string> => {
      const keyframes = new Map<string, string>();
      const matches = css.matchAll(/@keyframes\s+([a-zA-Z0-9-_]+)\s*\{([\s\S]*?)\}\s*\}/g);
      for (const match of matches) {
        keyframes.set(match[1], match[2].trim());
      }
      return matches ? keyframes : keyframes;
    };

    // Extract @media queries
    const extractMediaQueries = (css: string): string[] => {
      const queries: string[] = [];
      const matches = css.matchAll(/@media[^{]+\{([\s\S]*?\})\s*\}/g);
      for (const match of matches) {
        queries.push(match[0]);
      }
      return queries;
    };

    // ===== JS INTELLIGENCE =====
    // Extract function definitions to avoid duplicates
    const extractFunctions = (js: string): Map<string, string> => {
      const funcs = new Map<string, string>();
      // Named functions
      const funcMatches = js.matchAll(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g);
      for (const match of funcMatches) {
        funcs.set(match[1], 'function');
      }
      // Arrow functions assigned to const/let
      const arrowMatches = js.matchAll(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g);
      for (const match of arrowMatches) {
        funcs.set(match[1], 'arrow');
      }
      return funcs;
    };

    // Extract event listeners to avoid duplicates
    const extractEventListeners = (js: string): Set<string> => {
      const listeners = new Set<string>();
      const matches = js.matchAll(/addEventListener\s*\(\s*['"]([^'"]+)['"]/g);
      for (const match of matches) {
        listeners.add(match[1]);
      }
      return listeners;
    };

    // ===== HTML INTELLIGENCE =====
    const extractStyles = (html: string): string => {
      const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      return styleMatches.map(s => s.replace(/<\/?style[^>]*>/gi, '')).join('\n');
    };

    const extractScripts = (html: string): string => {
      const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
      return scriptMatches
        .filter(s => !s.includes('src='))
        .map(s => s.replace(/<\/?script[^>]*>/gi, ''))
        .join('\n');
    };

    const extractHeadContent = (html: string): string => {
      const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
      if (!headMatch) return '';
      return headMatch[1]
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
        .replace(/<meta\s+charset[^>]*>/gi, '')
        .replace(/<meta\s+name="viewport"[^>]*>/gi, '')
        .trim();
    };

    const extractBodyContent = (html: string): string => {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        return bodyMatch[1].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').trim();
      }
      if (!html.includes('<html') && !html.includes('<head')) {
        return html;
      }
      return '';
    };

    // ===== COLLECT & MERGE =====
    const allCSSVars = new Map<string, string>();
    const allCSSRules = new Map<string, string>();
    const allKeyframes = new Map<string, string>();
    const allMediaQueries: string[] = [];
    const allFunctions = new Map<string, { code: string; source: string }>();
    const eventListenerTypes = new Set<string>();

    // Process standalone CSS files
    cssFiles.forEach(f => {
      const vars = extractCSSVariables(f.content);
      vars.forEach((v, k) => allCSSVars.set(k, v));
      const rules = extractCSSRules(f.content);
      rules.forEach((v, k) => {
        if (allCSSRules.has(k)) {
          allCSSRules.set(k, allCSSRules.get(k) + '; ' + v);
        } else {
          allCSSRules.set(k, v);
        }
      });
      const kf = extractKeyframes(f.content);
      kf.forEach((v, k) => allKeyframes.set(k, v));
      allMediaQueries.push(...extractMediaQueries(f.content));
    });

    // Process embedded CSS from HTML
    htmlFiles.forEach(f => {
      const embedded = extractStyles(f.content);
      if (embedded.trim()) {
        const vars = extractCSSVariables(embedded);
        vars.forEach((v, k) => allCSSVars.set(k, v));
        const rules = extractCSSRules(embedded);
        rules.forEach((v, k) => {
          if (allCSSRules.has(k)) {
            allCSSRules.set(k, allCSSRules.get(k) + '; ' + v);
          } else {
            allCSSRules.set(k, v);
          }
        });
        const kf = extractKeyframes(embedded);
        kf.forEach((v, k) => allKeyframes.set(k, v));
        allMediaQueries.push(...extractMediaQueries(embedded));
      }
    });

    // Process JS files
    const jsCodeBlocks: string[] = [];
    jsFiles.forEach(f => {
      const funcs = extractFunctions(f.content);
      funcs.forEach((type, name) => {
        if (!allFunctions.has(name)) {
          allFunctions.set(name, { code: f.content, source: f.name });
        }
      });
      const listeners = extractEventListeners(f.content);
      listeners.forEach(l => eventListenerTypes.add(l));
      jsCodeBlocks.push(`// ═══ ${f.name} ═══\n${f.content}`);
    });

    // Process embedded JS from HTML
    htmlFiles.forEach(f => {
      const embedded = extractScripts(f.content);
      if (embedded.trim()) {
        const funcs = extractFunctions(embedded);
        funcs.forEach((type, name) => {
          if (!allFunctions.has(name)) {
            allFunctions.set(name, { code: embedded, source: f.name });
          }
        });
        jsCodeBlocks.push(`// ═══ aus ${f.name} ═══\n${embedded}`);
      }
    });

    // Process JSON config files
    let configData: Record<string, unknown> = {};
    jsonFiles.forEach(f => {
      try {
        const parsed = JSON.parse(f.content);
        configData = { ...configData, ...parsed };
      } catch (e) {
        console.warn(`JSON parse error in ${f.name}`);
      }
    });

    // Collect head content
    const headContents = htmlFiles
      .map(f => extractHeadContent(f.content))
      .filter(Boolean)
      .join('\n');

    // Collect body content with smart section naming
    const bodyContents = htmlFiles
      .map((f, idx) => {
        const content = extractBodyContent(f.content);
        if (!content.trim()) return '';
        // Try to identify main components
        const hasHeader = /<header|<nav/i.test(content);
        const hasMain = /<main|<article/i.test(content);
        const hasFooter = /<footer/i.test(content);
        const sectionClass = hasHeader ? 'header-section' : hasMain ? 'main-section' : hasFooter ? 'footer-section' : 'content-section';
        return `  <!-- ══════ ${f.name} ══════ -->\n  <div class="fusion-block ${sectionClass}" data-source="${f.name}" data-index="${idx + 1}">\n${content}\n  </div>`;
      })
      .filter(Boolean)
      .join('\n\n');

    // ===== BUILD OPTIMIZED CSS =====
    let optimizedCSS = '/* ═══════════════════════════════════════════\n';
    optimizedCSS += '   FUSIONIERTES SYSTEM - Optimiert & Dedupliziert\n';
    optimizedCSS += '   ═══════════════════════════════════════════ */\n\n';
    
    // CSS Variables
    if (allCSSVars.size > 0) {
      optimizedCSS += ':root {\n';
      allCSSVars.forEach((value, name) => {
        optimizedCSS += `  --${name}: ${value};\n`;
      });
      optimizedCSS += '}\n\n';
    }

    // Base fusion styles
    optimizedCSS += `/* Fusion Layout */
.fusion-block { position: relative; }
.fusion-block:empty { display: none; }
.header-section { z-index: 100; }
.footer-section { margin-top: auto; }

`;

    // Merged CSS rules
    allCSSRules.forEach((properties, selector) => {
      optimizedCSS += `${selector} { ${properties} }\n`;
    });

    // Keyframes
    if (allKeyframes.size > 0) {
      optimizedCSS += '\n/* Animations */\n';
      allKeyframes.forEach((content, name) => {
        optimizedCSS += `@keyframes ${name} { ${content} }\n`;
      });
    }

    // Media queries (deduplicated by content)
    const uniqueMedia = [...new Set(allMediaQueries)];
    if (uniqueMedia.length > 0) {
      optimizedCSS += '\n/* Responsive */\n';
      optimizedCSS += uniqueMedia.join('\n');
    }

    // ===== BUILD OPTIMIZED JS =====
    let optimizedJS = '/* ═══════════════════════════════════════════\n';
    optimizedJS += '   FUSIONIERTES JAVASCRIPT - Intelligent Merged\n';
    optimizedJS += '   ═══════════════════════════════════════════ */\n\n';
    
    // Add config data if exists
    if (Object.keys(configData).length > 0) {
      optimizedJS += `// Merged Configuration\nconst FUSION_CONFIG = ${JSON.stringify(configData, null, 2)};\n\n`;
    }

    // Wrap in IIFE to avoid conflicts
    optimizedJS += '(function() {\n  "use strict";\n\n';
    optimizedJS += jsCodeBlocks.map(block => '  ' + block.split('\n').join('\n  ')).join('\n\n');
    optimizedJS += '\n\n  // Auto-init on DOM ready\n';
    optimizedJS += '  if (document.readyState === "loading") {\n';
    optimizedJS += '    document.addEventListener("DOMContentLoaded", init);\n';
    optimizedJS += '  } else {\n';
    optimizedJS += '    init();\n';
    optimizedJS += '  }\n';
    optimizedJS += '  \n  function init() {\n';
    optimizedJS += '    console.log("🔥 Fusion System initialized");\n';
    optimizedJS += '  }\n';
    optimizedJS += '})();\n';

    // ===== FINAL HTML =====
    const mergedHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔥 Fusion System</title>
  <meta name="generator" content="WebGen AI Fusion">
${headContents ? `  <!-- Extrahierte Head-Elemente -->\n${headContents}` : ''}
  <style>
${optimizedCSS}
  </style>
</head>
<body>
  <!-- ═══════════════════════════════════════════
       FUSIONIERTE INHALTE AUS ${htmlFiles.length} HTML-DATEIEN
       + ${cssFiles.length} CSS + ${jsFiles.length} JS + ${jsonFiles.length} JSON
       ═══════════════════════════════════════════ -->

${bodyContents || '  <div class="fusion-empty">Keine HTML-Inhalte gefunden</div>'}

  <script>
${optimizedJS}
  </script>
</body>
</html>`;

    const mergedFile: FileItem = {
      id: `fusion-${Date.now()}`,
      name: `🔥fusion-${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}.html`,
      content: mergedHtml,
      folderId: "generated",
    };

    setFiles((prev) => [...prev, mergedFile]);
    setSelectedFile(mergedFile);
    setActiveTab("preview");
    
    const stats = {
      css: allCSSRules.size,
      vars: allCSSVars.size,
      animations: allKeyframes.size,
      functions: allFunctions.size
    };
    
    toast.success(`🔥 ${files.length} Systeme fusioniert! ${stats.css} CSS-Regeln, ${stats.vars} Variablen, ${stats.functions} Funktionen optimiert`);
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
