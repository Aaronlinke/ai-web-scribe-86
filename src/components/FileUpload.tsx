import { useCallback } from "react";
import { Upload, FileCode } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileLoaded: (code: string, fileName: string) => void;
}

const FileUpload = ({ onFileLoaded }: FileUploadProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [onFileLoaded]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const validTypes = ["text/html", "text/css", "text/javascript", "application/javascript"];
    const validExtensions = [".html", ".htm", ".css", ".js"];
    
    const hasValidExtension = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      toast.error("Bitte nur HTML, CSS oder JS Dateien hochladen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Datei ist zu groß (max. 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoaded(content, file.name);
      toast.success(`${file.name} erfolgreich geladen!`);
    };
    reader.onerror = () => {
      toast.error("Fehler beim Lesen der Datei");
    };
    reader.readAsText(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative"
    >
      <input
        type="file"
        accept=".html,.htm,.css,.js"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
          <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-sm font-medium text-foreground">
          HTML-Datei hochladen
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Drag & Drop oder klicken • .html, .css, .js
        </p>
      </label>
    </div>
  );
};

export default FileUpload;
