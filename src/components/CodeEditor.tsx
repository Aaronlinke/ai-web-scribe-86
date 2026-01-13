import { useState } from "react";
import { Copy, Check, Download, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CodeEditorProps {
  code: string;
}

const CodeEditor = ({ code }: CodeEditorProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code kopiert!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download gestartet!");
  };

  const lineCount = code.split("\n").length;

  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center bg-code-bg rounded-lg border border-border">
        <div className="text-center space-y-4 p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
            <Code2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Code-Ansicht</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Hier siehst du den generierten Quellcode
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-code-bg rounded-lg border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">index.html</span>
          <span className="text-xs text-muted-foreground">
            {lineCount} Zeilen
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-1"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {copied ? "Kopiert!" : "Kopieren"}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-8 gap-1"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code className="font-mono text-foreground/90">
            {code.split("\n").map((line, i) => (
              <div key={i} className="flex">
                <span className="w-12 flex-shrink-0 text-right pr-4 text-muted-foreground select-none">
                  {i + 1}
                </span>
                <span className="flex-1">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;
