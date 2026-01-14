import { useCallback } from "react";
import { Upload, Files } from "lucide-react";
import { toast } from "sonner";
import { FileItem } from "./FileManager";

interface MultiFileUploadProps {
  onFilesLoaded: (files: Omit<FileItem, "id">[]) => void;
  targetFolderId?: string;
}

const MultiFileUpload = ({ onFilesLoaded, targetFolderId = "root" }: MultiFileUploadProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [onFilesLoaded, targetFolderId]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = async (fileList: File[]) => {
    const validExtensions = [".html", ".htm", ".css", ".js", ".json"];
    const validFiles: Omit<FileItem, "id">[] = [];
    let errorCount = 0;

    for (const file of fileList) {
      const hasValidExtension = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        errorCount++;
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        errorCount++;
        continue;
      }

      try {
        const content = await readFileContent(file);
        validFiles.push({
          name: file.name,
          content,
          folderId: targetFolderId,
        });
      } catch {
        errorCount++;
      }
    }

    if (validFiles.length > 0) {
      onFilesLoaded(validFiles);
      toast.success(`${validFiles.length} Datei(en) geladen!`);
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} Datei(en) übersprungen (falsches Format/zu groß)`);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Lesefehler"));
      reader.readAsText(file);
    });
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="relative">
      <input
        type="file"
        accept=".html,.htm,.css,.js,.json"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="multi-file-upload"
        multiple
      />
      <label
        htmlFor="multi-file-upload"
        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
          <Files className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-sm font-medium text-foreground">Dateien hochladen</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Mehrere Dateien • Drag & Drop
        </p>
      </label>
    </div>
  );
};

export default MultiFileUpload;
