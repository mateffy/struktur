import { ChevronDown, ChevronRight, Hash, List, Text, ToggleLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// JSON Schema types
interface JSONSchema {
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  enum?: (string | number)[];
  description?: string;
  title?: string;
  required?: string[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: unknown;
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
}

interface SchemaFormProps {
  schema: JSONSchema;
  data: unknown;
  className?: string;
}

// Helper to get type from schema
function getSchemaType(schema: JSONSchema): string {
  if (Array.isArray(schema.type)) {
    return schema.type[0] ?? "any";
  }
  return schema.type ?? "any";
}

// Helper to check if field is required
function isRequired(schema: JSONSchema, key: string): boolean {
  return schema.required?.includes(key) ?? false;
}

// Field type icons
const FieldIcons: Record<string, React.ReactNode> = {
  string: <Text className="w-3.5 h-3.5" />,
  number: <Hash className="w-3.5 h-3.5" />,
  integer: <Hash className="w-3.5 h-3.5" />,
  boolean: <ToggleLeft className="w-3.5 h-3.5" />,
  array: <List className="w-3.5 h-3.5" />,
  object: <div className="w-3.5 h-3.5 rounded-sm border border-current" />,
};

// Single field display component
function FieldDisplay({
  name,
  schema,
  value,
  required,
  depth = 0,
}: {
  name: string;
  schema: JSONSchema;
  value: unknown;
  required: boolean;
  depth?: number;
}) {
  const type = getSchemaType(schema);
  const hasValue = value !== undefined && value !== null;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 py-2.5 px-3 rounded-lg transition-colors",
        "hover:bg-[#e8dfd1]/50",
        hasValue ? "bg-[#f5efe6]" : "bg-[#f5efe6]/30",
      )}
      style={{ marginLeft: `${depth * 12}px` }}
    >
      <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0 pt-0.5">
        <span className="text-[#7a5c3a]/70">{FieldIcons[type] ?? FieldIcons.string}</span>
        <span className="text-sm font-medium text-[#2d1b0e]">{name}</span>
        {required && <span className="text-[#a05c5c] text-xs">*</span>}
      </div>
      <div className="flex-1 min-w-0">
        <ValueDisplay schema={schema} value={value} />
        {schema.description && (
          <p className="text-xs text-[#7a5c3a]/60 mt-1 leading-relaxed">{schema.description}</p>
        )}
      </div>
    </div>
  );
}

// Value display component
function ValueDisplay({ schema, value }: { schema: JSONSchema; value: unknown }) {
  const type = getSchemaType(schema);

  // Handle enums
  if (schema.enum && Array.isArray(schema.enum)) {
    const isSelected = schema.enum.includes(value as string | number);
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {schema.enum.map((option) => {
          const isActive = option === value;
          return (
            <span
              key={String(option)}
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
                "border transition-all",
                isActive
                  ? "bg-[#7a5c3a] text-white border-[#7a5c3a]"
                  : "bg-[#f5efe6] text-[#7a5c3a] border-[#d4c8b8]",
              )}
            >
              {String(option)}
            </span>
          );
        })}
        {!isSelected && value !== undefined && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#7a5c3a] text-white border border-[#7a5c3a]">
            {String(value)}
          </span>
        )}
      </div>
    );
  }

  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-sm text-[#a0926f] italic">null</span>;
  }

  // Handle boolean
  if (type === "boolean" || typeof value === "boolean") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
          value
            ? "bg-[#5c8a5c]/15 text-[#5c8a5c] border border-[#5c8a5c]/30"
            : "bg-[#a05c5c]/15 text-[#a05c5c] border border-[#a05c5c]/30",
        )}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  // Handle numbers
  if (type === "number" || type === "integer" || typeof value === "number") {
    return (
      <span className="text-sm font-mono text-[#2d1b0e] bg-[#ede5d8] px-2 py-0.5 rounded">
        {String(value)}
      </span>
    );
  }

  // Handle arrays (non-collapsible, inline preview)
  if (type === "array" && Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-sm text-[#a0926f] italic">Empty array</span>;
    }
    return <span className="text-sm text-[#7a5c3a]">[{value.length} items]</span>;
  }

  // Handle objects (non-collapsible, inline preview)
  if (type === "object" && typeof value === "object" && value !== null) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <span className="text-sm text-[#a0926f] italic">Empty object</span>;
    }
    return (
      <span className="text-sm text-[#7a5c3a]">
        {"{"}
        {entries.length} fields{"}"}
      </span>
    );
  }

  // Default string/text display
  if (typeof value === "string" && value.length > 80) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-[#2d1b0e] leading-relaxed">
          {value.slice(0, 80)}
          <span className="text-[#a0926f]">...</span>
        </p>
      </div>
    );
  }

  return <span className="text-sm text-[#2d1b0e]">{String(value)}</span>;
}

// Collapsible section for nested objects/arrays
function CollapsibleSection({
  title,
  schema,
  value,
  count,
  children,
}: {
  title: string;
  schema: JSONSchema;
  value: unknown;
  count?: number;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasValue = value !== undefined && value !== null;
  const isEmpty =
    count === 0 ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && value !== null && Object.keys(value).length === 0);

  return (
    <div className="border border-[#d4c8b8] rounded-lg overflow-hidden bg-[#f5efe6]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-left",
          "hover:bg-[#e8dfd1] transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[#7a5c3a] focus:ring-inset",
        )}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-[#7a5c3a] shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#7a5c3a] shrink-0" />
        )}
        <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
          <span className="text-[#7a5c3a]/70">
            {Array.isArray(value) ? FieldIcons.array : FieldIcons.object}
          </span>
          <span className="text-sm font-medium text-[#2d1b0e]">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-1">
          {isEmpty ? (
            <span className="text-xs text-[#a0926f] italic">Empty</span>
          ) : (
            <span className="text-xs text-[#7a5c3a] font-medium">
              {count !== undefined && `${count} items`}
              {count === undefined && hasValue && "Has data"}
            </span>
          )}
        </div>
        {schema.description && (
          <span className="text-xs text-[#a0926f] truncate max-w-[200px]">
            {schema.description}
          </span>
        )}
      </button>
      {isOpen && <div className="border-t border-[#d4c8b8] bg-[#faf8f3]">{children}</div>}
    </div>
  );
}

// Object viewer component
function ObjectViewer({
  schema,
  data,
  depth = 0,
}: {
  schema: JSONSchema;
  data: Record<string, unknown>;
  depth?: number;
}) {
  const properties = schema.properties ?? {};
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return <div className="p-4 text-center text-sm text-[#a0926f] italic">No data</div>;
  }

  return (
    <div className="space-y-1 p-2">
      {entries.map(([key, value]) => {
        const propSchema = properties[key] ?? {};
        const type = getSchemaType(propSchema);

        // Handle nested objects
        if (
          type === "object" &&
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          const nestedEntries = Object.entries(value);
          return (
            <CollapsibleSection
              key={key}
              title={key}
              schema={propSchema}
              value={value}
              count={nestedEntries.length}
            >
              <ObjectViewer
                schema={propSchema}
                data={value as Record<string, unknown>}
                depth={depth + 1}
              />
            </CollapsibleSection>
          );
        }

        // Handle arrays
        if (type === "array" && Array.isArray(value)) {
          return (
            <CollapsibleSection
              key={key}
              title={key}
              schema={propSchema}
              value={value}
              count={value.length}
            >
              <ArrayViewer schema={propSchema} data={value} depth={depth + 1} />
            </CollapsibleSection>
          );
        }

        // Simple field
        return (
          <FieldDisplay
            key={key}
            name={key}
            schema={propSchema}
            value={value}
            required={isRequired(schema, key)}
            depth={depth}
          />
        );
      })}
    </div>
  );
}

// Array viewer component
function ArrayViewer({
  schema,
  data,
  depth = 0,
}: {
  schema: JSONSchema;
  data: unknown[];
  depth?: number;
}) {
  const items = schema.items ?? {};

  if (data.length === 0) {
    return <div className="p-4 text-center text-sm text-[#a0926f] italic">Empty array</div>;
  }

  return (
    <div className="space-y-2 p-2">
      {data.map((item, index) => {
        const itemType = getSchemaType(items);

        // Handle object items
        if (itemType === "object" && typeof item === "object" && item !== null) {
          const itemEntries = Object.entries(item);
          return (
            <CollapsibleSection
              key={index}
              title={`Item ${index + 1}`}
              schema={items}
              value={item}
              count={itemEntries.length}
            >
              <ObjectViewer
                schema={items}
                data={item as Record<string, unknown>}
                depth={depth + 1}
              />
            </CollapsibleSection>
          );
        }

        // Simple array item
        return (
          <div
            key={index}
            className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#f5efe6]"
            style={{ marginLeft: `${depth * 12}px` }}
          >
            <span className="text-xs text-[#a0926f] font-mono w-6">{index + 1}</span>
            <div className="flex-1">
              <ValueDisplay schema={items} value={item} />
              {items.description && (
                <p className="text-xs text-[#7a5c3a]/60 mt-1">{items.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Main SchemaForm component
export function SchemaForm({ schema, data, className }: SchemaFormProps) {
  if (!schema || !data) {
    return (
      <div className="p-8 text-center">
        <div className="text-[#a0926f] text-sm italic">
          {!schema ? "No schema available" : "No data available"}
        </div>
      </div>
    );
  }

  const type = getSchemaType(schema);

  // Root level object
  if (type === "object" && typeof data === "object" && data !== null && !Array.isArray(data)) {
    return (
      <div className={cn("space-y-3", className)}>
        {schema.title && (
          <div className="px-1">
            <h3 className="text-lg font-semibold text-[#2d1b0e]">{schema.title}</h3>
            {schema.description && (
              <p className="text-sm text-[#7a5c3a] mt-1">{schema.description}</p>
            )}
          </div>
        )}
        <div className="rounded-xl border border-[#d4c8b8] overflow-hidden bg-[#faf8f3]">
          <ObjectViewer schema={schema} data={data as Record<string, unknown>} />
        </div>
      </div>
    );
  }

  // Root level array
  if (type === "array" && Array.isArray(data)) {
    return (
      <div className={cn("space-y-3", className)}>
        {schema.title && (
          <div className="px-1">
            <h3 className="text-lg font-semibold text-[#2d1b0e]">{schema.title}</h3>
            {schema.description && (
              <p className="text-sm text-[#7a5c3a] mt-1">{schema.description}</p>
            )}
          </div>
        )}
        <div className="rounded-xl border border-[#d4c8b8] overflow-hidden bg-[#faf8f3]">
          <ArrayViewer schema={schema} data={data} />
        </div>
      </div>
    );
  }

  // Root level primitive
  return (
    <div className={cn("p-4", className)}>
      <FieldDisplay name={schema.title ?? "Value"} schema={schema} value={data} required={true} />
    </div>
  );
}
