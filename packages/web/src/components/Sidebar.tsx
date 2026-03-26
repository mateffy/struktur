import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MoreHorizontal, FileJson } from "lucide-react";
import { useState } from "react";
import { ExtractionSettings } from "./ExtractionSettings";
import type { SchemaMode } from "./ExtractPage";
import { FileUploadZone } from "./FileUploadZone";
import { SchemaInput } from "./SchemaInput";

// Example schemas from ./examples/schemas
const EXAMPLE_SCHEMAS = [
  { name: "Invoice", file: "invoice.json" },
  { name: "Real Estate Property", file: "estate.json" },
  { name: "Financial Document Classification", file: "findoc-classification.json" },
  { name: "Real Estate (Simple)", file: "real-estate.json" },
  { name: "Poem", file: "poem.json" },
];

type SidebarProps = {
  files: File[];
  schemaMode: SchemaMode;
  schemaJson: string;
  fields: string;
  model: string;
  strategy: string;
  chunkSize: number;
  parsingOptions: {
    images: boolean;
    screenshots: boolean;
    parser: string;
  };
  chunkingOptions: {
    maxImages: number | null;
    textRatio: number;
    imageTokens: number;
    filterEmbedded: boolean;
    filterScreenshot: boolean;
  };
  status: "idle" | "parsing" | "extracting" | "success" | "error";
  isChunkingLoading?: boolean;
  /** Optional: Check if API key exists for the selected model */
  hasKeyForModel?: (model: string) => boolean;
  onFilesChange: (files: File[]) => void;
  onSchemaModeChange: (mode: SchemaMode) => void;
  onSchemaJsonChange: (json: string) => void;
  onFieldsChange: (fields: string) => void;
  onModelChange: (model: string) => void;
  onStrategyChange: (strategy: string) => void;
  onChunkSizeChange: (size: number) => void;
  onParsingOptionsChange: (options: SidebarProps["parsingOptions"]) => void;
  onChunkingOptionsChange: (options: SidebarProps["chunkingOptions"]) => void;
};

export function Sidebar({
  files,
  schemaMode,
  schemaJson,
  fields,
  model,
  strategy,
  chunkSize,
  parsingOptions,
  chunkingOptions,
  isChunkingLoading,
  hasKeyForModel,
  onFilesChange,
  onSchemaModeChange,
  onSchemaJsonChange,
  onFieldsChange,
  onModelChange,
  onStrategyChange,
  onChunkSizeChange,
  onParsingOptionsChange,
  onChunkingOptionsChange,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const loadExampleSchema = async (filename: string) => {
    try {
      const response = await fetch(`/examples/schemas/${filename}`);
      if (!response.ok) throw new Error("Failed to load schema");
      const schema = await response.json();
      onSchemaJsonChange(JSON.stringify(schema, null, 2));
      onSchemaModeChange("json");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to load example schema:", error);
    }
  };

  return (
    <aside className="w-96 bg-[#ede5d8] border-r border-[#d4c8b8] flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <div className="p-5 space-y-5">
          <section>
            <h2 className="text-sm font-semibold text-[#2d1b0e] mb-3 uppercase tracking-wider">
              Files
            </h2>
            <FileUploadZone files={files} onFilesChange={onFilesChange} />
          </section>

          <Separator className="bg-[#d4c8b8]" />

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#2d1b0e] uppercase tracking-wider">
                Schema
              </h2>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[#7a5c3a] hover:text-[#2d1b0e] hover:bg-[#f5efe6]"
                  >
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    <span className="text-xs">Examples</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-2">
                  <div className="space-y-1">
                    {EXAMPLE_SCHEMAS.map((schema) => (
                      <button
                        key={schema.file}
                        type="button"
                        onClick={() => loadExampleSchema(schema.file)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#2d1b0e] hover:bg-[#f5efe6] rounded-md transition-colors text-left"
                      >
                        <FileJson className="h-4 w-4 text-[#7a5c3a]" />
                        {schema.name}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <SchemaInput
              mode={schemaMode}
              schemaJson={schemaJson}
              fields={fields}
              onModeChange={onSchemaModeChange}
              onSchemaJsonChange={onSchemaJsonChange}
              onFieldsChange={onFieldsChange}
            />
          </section>

          <Separator className="bg-[#d4c8b8]" />

          <section>
            <h2 className="text-sm font-semibold text-[#2d1b0e] mb-3 uppercase tracking-wider">
              Settings
            </h2>
            <ExtractionSettings
              model={model}
              strategy={strategy}
              chunkSize={chunkSize}
              parsingOptions={parsingOptions}
              chunkingOptions={chunkingOptions}
              isChunkingLoading={isChunkingLoading}
              hasKeyForModel={hasKeyForModel}
              onModelChange={onModelChange}
              onStrategyChange={onStrategyChange}
              onChunkSizeChange={onChunkSizeChange}
              onParsingOptionsChange={onParsingOptionsChange}
              onChunkingOptionsChange={onChunkingOptionsChange}
            />
          </section>
        </div>
      </div>
    </aside>
  );
}
