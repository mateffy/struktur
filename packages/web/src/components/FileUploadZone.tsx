import { Upload, X } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

type FileUploadZoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
};

export function FileUploadZone({ files, onFilesChange }: FileUploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesChange([...files, ...droppedFiles]);
    },
    [files, onFilesChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      onFilesChange([...files, ...selectedFiles]);
    },
    [files, onFilesChange],
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    onFilesChange([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (filename: string) => {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop()?.toUpperCase() : "FILE";
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-[#d4c8b8] rounded-xl p-8 text-center cursor-pointer hover:border-[#7a5c3a] hover:bg-[#f5efe6]/50 transition-all bg-[#f5efe6]"
      >
        <input type="file" multiple onChange={handleFileInput} className="hidden" id="file-input" />
        <label htmlFor="file-input" className="cursor-pointer block">
          <Upload className="mx-auto h-10 w-10 text-[#a0926f] mb-3" />
          <p className="text-sm text-[#7a5c3a] mb-1 font-medium">Drag & drop files here</p>
          <p className="text-xs text-[#a0926f]">or click to browse</p>
          <p className="text-xs text-[#a0926f] mt-2">PDF, DOC, TXT, images, and more</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#2d1b0e]">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#e5dccf]"
            >
              Clear all
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="inline-flex items-center gap-2 rounded-lg border border-[#d4c8b8] bg-[#f5efe6] px-3 py-1.5 text-sm"
              >
                <span className="text-xs font-semibold text-[#7a5c3a]">
                  {getFileExtension(file.name)}
                </span>
                <span className="max-w-[150px] truncate text-[#2d1b0e]">{file.name}</span>
                <span className="text-xs text-[#a0926f]">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-1 text-[#a0926f] hover:text-[#2d1b0e] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
