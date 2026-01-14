import { useState } from "react";
import { Folder, File, Trash2, ChevronDown, ChevronRight, Merge, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export interface FileItem {
  id: string;
  name: string;
  content: string;
  folderId: string;
}

export interface FolderItem {
  id: string;
  name: string;
  isExpanded: boolean;
}

interface FileManagerProps {
  folders: FolderItem[];
  files: FileItem[];
  selectedFileId: string | null;
  onSelectFile: (file: FileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddFolder: (name: string) => void;
  onMergeFiles: () => void;
  onToggleFolder: (folderId: string) => void;
}

const FileManager = ({
  folders,
  files,
  selectedFileId,
  onSelectFile,
  onDeleteFile,
  onDeleteFolder,
  onAddFolder,
  onMergeFiles,
  onToggleFolder,
}: FileManagerProps) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName("");
      setShowNewFolder(false);
      toast.success("Ordner erstellt!");
    }
  };

  const getFilesInFolder = (folderId: string) => {
    return files.filter((f) => f.folderId === folderId);
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Dateien</span>
          <span className="text-xs text-muted-foreground">({files.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="h-7 w-7 p-0"
            title="Neuer Ordner"
          >
            <Plus className="w-4 h-4" />
          </Button>
          {files.length >= 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMergeFiles}
              className="h-7 px-2 gap-1 text-xs"
              title="Alle Dateien fusionieren"
            >
              <Merge className="w-3 h-3" />
              Fusion
            </Button>
          )}
        </div>
      </div>

      {/* New Folder Input */}
      {showNewFolder && (
        <div className="p-2 border-b border-border bg-secondary/20">
          <div className="flex gap-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Ordnername..."
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAddFolder()}
            />
            <Button size="sm" onClick={handleAddFolder} className="h-8">
              OK
            </Button>
          </div>
        </div>
      )}

      {/* File Tree */}
      <div className="max-h-[300px] overflow-y-auto">
        {folders.length === 0 && files.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Keine Dateien vorhanden
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {folders.map((folder) => (
              <div key={folder.id}>
                {/* Folder Header */}
                <div
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary/50 cursor-pointer group"
                  onClick={() => onToggleFolder(folder.id)}
                >
                  {folder.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Folder className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-foreground flex-1">{folder.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {getFilesInFolder(folder.id).length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.id);
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>

                {/* Folder Contents */}
                {folder.isExpanded && (
                  <div className="ml-6 space-y-0.5">
                    {getFilesInFolder(folder.id).map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
                          selectedFileId === file.id
                            ? "bg-primary/20 text-primary"
                            : "hover:bg-secondary/50"
                        }`}
                        onClick={() => onSelectFile(file)}
                      >
                        <File className="w-4 h-4 text-accent" />
                        <span className="text-sm flex-1 truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file.id);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {getFilesInFolder(folder.id).length === 0 && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        Leer
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Files without folder (root) */}
            {files
              .filter((f) => f.folderId === "root")
              .map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
                    selectedFileId === file.id
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={() => onSelectFile(file)}
                >
                  <File className="w-4 h-4 text-accent" />
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile(file.id);
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
