import { useState } from "react";
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewFrameProps {
  code: string;
}

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportSizes: Record<ViewportSize, { width: string; label: string }> = {
  desktop: { width: "100%", label: "Desktop" },
  tablet: { width: "768px", label: "Tablet" },
  mobile: { width: "375px", label: "Mobile" },
};

const PreviewFrame = ({ code }: PreviewFrameProps) => {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const handleOpenInNewTab = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(code);
      newWindow.document.close();
    }
  };

  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center bg-code-bg rounded-lg border border-border">
        <div className="text-center space-y-4 p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
            <Monitor className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Vorschau-Bereich</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Hier erscheint deine generierte Webseite
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
        <div className="flex items-center gap-1">
          <Button
            variant={viewport === "desktop" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewport("desktop")}
            className="h-8 px-2"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === "tablet" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewport("tablet")}
            className="h-8 px-2"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === "mobile" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewport("mobile")}
            className="h-8 px-2"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-xs text-muted-foreground">
          {viewportSizes[viewport].label}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 px-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenInNewTab}
            className="h-8 px-2"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-start justify-center p-4 overflow-auto bg-muted/30">
        <div
          className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: viewportSizes[viewport].width,
            maxWidth: "100%",
            height: "100%",
          }}
        >
          <iframe
            key={key}
            srcDoc={code}
            title="Website Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            style={{ minHeight: "500px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewFrame;
