import React, { useState, useCallback } from "react";
import {
  ChevronDown,
  Type,
  Hash,
  ToggleLeft,
  Brackets,
  Mail,
  Calendar,
  Globe,
  Clock,
  Phone,
  FileText,
  CheckCircle2,
  Info,
} from "lucide-react";

// JSON Schema types
interface JSONSchema {
  type?: string;
  title?: string;
  description?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  enum?: (string | number | boolean)[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  default?: unknown;
  additionalProperties?: boolean | JSONSchema;
  $ref?: string;
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  const?: unknown;
}

interface SchemaViewerProps {
  schema: JSONSchema;
  className?: string;
  defaultExpanded?: boolean;
  showExamples?: boolean;
}

// Get icon based on schema type and format
const getTypeIcon = (schema: JSONSchema): React.ReactNode => {
  const { type, format } = schema;

  // Format-specific icons for strings
  if (type === "string" && format) {
    switch (format) {
      case "email":
        return <Mail className="w-3.5 h-3.5" />;
      case "date":
      case "date-time":
        return <Calendar className="w-3.5 h-3.5" />;
      case "uri":
      case "url":
        return <Globe className="w-3.5 h-3.5" />;
      case "time":
        return <Clock className="w-3.5 h-3.5" />;
      case "tel":
      case "phone":
        return <Phone className="w-3.5 h-3.5" />;
      case "uuid":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      default:
        return <Type className="w-3.5 h-3.5" />;
    }
  }

  // Type-specific icons
  switch (type) {
    case "string":
      return <Type className="w-3.5 h-3.5" />;
    case "number":
    case "integer":
      return <Hash className="w-3.5 h-3.5" />;
    case "boolean":
      return <ToggleLeft className="w-3.5 h-3.5" />;
    case "array":
      return <Brackets className="w-3.5 h-3.5" />;
    case "object":
      return <Brackets className="w-3.5 h-3.5" />;
    default:
      return <FileText className="w-3.5 h-3.5" />;
  }
};

// Get type label
const getTypeLabel = (schema: JSONSchema): string => {
  if (schema.enum) {
    return `enum(${schema.enum.length})`;
  }
  if (schema.const !== undefined) {
    return "const";
  }
  if (schema.type === "string" && schema.format) {
    return `${schema.type}(${schema.format})`;
  }
  if (schema.type === "array" && schema.items) {
    const itemType = schema.items.type || "any";
    return `array<${itemType}>`;
  }
  return schema.type || "any";
};

// Get type color based on schema type
const getTypeColor = (type?: string): string => {
  switch (type) {
    case "string":
      return "#7a5c3a"; // brown
    case "number":
    case "integer":
      return "#4a7c59"; // green
    case "boolean":
      return "#5c4a9c"; // purple
    case "array":
      return "#9c6b4a"; // orange-brown
    case "object":
      return "#3d7a9c"; // blue
    default:
      return "#a0926f"; // muted
  }
};

// Format constraint display
interface Constraint {
  label: string;
  value: string | number;
}

const getConstraints = (schema: JSONSchema): Constraint[] => {
  const constraints: Constraint[] = [];

  if (schema.minimum !== undefined) constraints.push({ label: "min", value: schema.minimum });
  if (schema.maximum !== undefined) constraints.push({ label: "max", value: schema.maximum });
  if (schema.minLength !== undefined)
    constraints.push({ label: "minLen", value: schema.minLength });
  if (schema.maxLength !== undefined)
    constraints.push({ label: "maxLen", value: schema.maxLength });
  if (schema.minItems !== undefined)
    constraints.push({ label: "minItems", value: schema.minItems });
  if (schema.maxItems !== undefined)
    constraints.push({ label: "maxItems", value: schema.maxItems });
  if (schema.pattern) constraints.push({ label: "pattern", value: schema.pattern });

  return constraints;
};

// Property row component
interface PropertyRowProps {
  name: string;
  schema: JSONSchema;
  required: boolean;
  depth: number;
  defaultExpanded?: boolean;
}

const PropertyRow: React.FC<PropertyRowProps> = ({
  name,
  schema,
  required,
  depth,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren =
    (schema.type === "object" && schema.properties) ||
    (schema.type === "array" && schema.items && schema.items.type === "object");
  const constraints = getConstraints(schema);
  const typeColor = getTypeColor(schema.type);

  const toggleExpanded = useCallback(() => {
    if (hasChildren) {
      setExpanded((prev) => !prev);
    }
  }, [hasChildren]);

  return (
    <div className="property-row">
      {/* Main row */}
      <button
        type="button"
        className={`property-main ${hasChildren ? "cursor-pointer hover:bg-[#ebe3d6]" : ""}`}
        onClick={toggleExpanded}
        disabled={!hasChildren}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "6px",
          padding: "6px 8px",
          marginLeft: `${depth * 12}px`,
          borderRadius: "4px",
          transition: "background-color 0.15s ease",
          background: "transparent",
          border: "none",
          width: "100%",
          textAlign: "left",
          cursor: hasChildren ? "pointer" : "default",
          opacity: 1,
        }}
      >
        {/* Expand/collapse indicator */}
        {hasChildren ? (
          <span
            className="expand-icon"
            style={{
              display: "flex",
              alignItems: "center",
              color: "#a0926f",
              marginTop: "1px",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.15s ease",
            }}
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span style={{ width: "14px", flexShrink: 0 }} />
        )}

        {/* Type icon */}
        <span
          className="type-icon"
          style={{
            color: typeColor,
            display: "flex",
            alignItems: "center",
            marginTop: "1px",
          }}
        >
          {getTypeIcon(schema)}
        </span>

        {/* Property name */}
        <span
          className="property-name"
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "13px",
            fontWeight: 600,
            color: "#2d1b0e",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>

        {/* Required indicator */}
        {required && (
          <span
            className="required-indicator"
            style={{
              color: "#c45c4a",
              fontSize: "12px",
              fontWeight: 700,
              marginLeft: "1px",
            }}
            title="Required"
          >
            *
          </span>
        )}

        {/* Type badge */}
        <span
          className="type-badge"
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "11px",
            color: typeColor,
            backgroundColor: `${typeColor}15`,
            padding: "1px 6px",
            borderRadius: "3px",
            marginLeft: "4px",
            whiteSpace: "nowrap",
          }}
        >
          {getTypeLabel(schema)}
        </span>

        {/* Constraints */}
        {constraints.length > 0 && (
          <span
            className="constraints"
            style={{
              display: "flex",
              gap: "4px",
              marginLeft: "4px",
            }}
          >
            {constraints.map((c) => (
              <span
                key={`${c.label}-${String(c.value).slice(0, 20)}`}
                style={{
                  fontSize: "10px",
                  color: "#a0926f",
                  backgroundColor: "#e5dccf",
                  padding: "1px 4px",
                  borderRadius: "2px",
                  whiteSpace: "nowrap",
                }}
                title={`${c.label}: ${c.value}`}
              >
                {c.label}:
                {typeof c.value === "string" && c.value.length > 10
                  ? c.value.slice(0, 10) + "..."
                  : c.value}
              </span>
            ))}
          </span>
        )}

        {/* Default value */}
        {schema.default !== undefined && (
          <span
            className="default-value"
            style={{
              fontSize: "11px",
              color: "#7a9c5a",
              marginLeft: "auto",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            ={JSON.stringify(schema.default)}
          </span>
        )}
      </button>

      {/* Description helper text */}
      {schema.description && (
        <div
          className="property-description"
          style={{
            marginLeft: `${depth * 12 + 28}px`,
            padding: "0 8px 4px",
            fontSize: "12px",
            color: "#7a5c3a",
            lineHeight: 1.4,
          }}
        >
          {schema.description}
        </div>
      )}

      {/* Enum values */}
      {schema.enum && (
        <div
          className="enum-values"
          style={{
            marginLeft: `${depth * 12 + 28}px`,
            padding: "2px 8px 6px",
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
          }}
        >
          {schema.enum?.map((value) => (
            <span
              key={JSON.stringify(value)}
              style={{
                fontSize: "11px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                color: "#5c4a9c",
                backgroundColor: "#f0ebf5",
                padding: "2px 6px",
                borderRadius: "3px",
                border: "1px solid #e0d5eb",
              }}
            >
              {JSON.stringify(value)}
            </span>
          ))}
        </div>
      )}

      {/* Children (nested properties) */}
      {hasChildren && expanded && (
        <div
          className="property-children"
          style={{
            marginTop: "2px",
          }}
        >
          {schema.type === "object" && schema.properties && (
            <ObjectProperties
              properties={schema.properties}
              required={schema.required || []}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
            />
          )}
          {schema.type === "array" && schema.items && (
            <ArrayItems items={schema.items} depth={depth + 1} defaultExpanded={defaultExpanded} />
          )}
        </div>
      )}
    </div>
  );
};

// Object properties component
interface ObjectPropertiesProps {
  properties: Record<string, JSONSchema>;
  required: string[];
  depth: number;
  defaultExpanded?: boolean;
}

const ObjectProperties: React.FC<ObjectPropertiesProps> = ({
  properties,
  required,
  depth,
  defaultExpanded,
}) => {
  const sortedEntries = Object.entries(properties).sort((a, b) => {
    // Sort required fields first, then alphabetically
    const aRequired = required.includes(a[0]);
    const bRequired = required.includes(b[0]);
    if (aRequired && !bRequired) return -1;
    if (!aRequired && bRequired) return 1;
    return a[0].localeCompare(b[0]);
  });

  return (
    <div className="object-properties">
      {sortedEntries.map(([name, propSchema]) => (
        <PropertyRow
          key={name}
          name={name}
          schema={propSchema}
          required={required.includes(name)}
          depth={depth}
          defaultExpanded={defaultExpanded}
        />
      ))}
    </div>
  );
};

// Array items component
interface ArrayItemsProps {
  items: JSONSchema;
  depth: number;
  defaultExpanded?: boolean;
}

const ArrayItems: React.FC<ArrayItemsProps> = ({ items, depth, defaultExpanded }) => {
  if (items.type === "object" && items.properties) {
    return (
      <div className="array-items">
        <div
          className="array-item-label"
          style={{
            marginLeft: `${depth * 12 + 28}px`,
            padding: "2px 8px",
            fontSize: "11px",
            color: "#a0926f",
            fontStyle: "italic",
          }}
        >
          items:
        </div>
        <ObjectProperties
          properties={items.properties}
          required={items.required || []}
          depth={depth + 1}
          defaultExpanded={defaultExpanded}
        />
      </div>
    );
  }

  return (
    <div
      className="array-items-simple"
      style={{
        marginLeft: `${depth * 12 + 28}px`,
        padding: "4px 8px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span style={{ color: getTypeColor(items.type) }}>{getTypeIcon(items)}</span>
      <span
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "12px",
          color: "#2d1b0e",
        }}
      >
        {getTypeLabel(items)}
      </span>
      {items.description && (
        <span style={{ fontSize: "11px", color: "#a0926f" }}>— {items.description}</span>
      )}
    </div>
  );
};

// Main Schema Viewer component
export const SchemaViewer: React.FC<SchemaViewerProps> = ({
  schema,
  className = "",
  defaultExpanded = false,
  showExamples = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasProperties = schema.type === "object" && schema.properties;
  const hasItems = schema.type === "array" && schema.items;
  const canExpand = hasProperties || hasItems;

  // Generate a fake example based on schema
  const generateExample = (s: JSONSchema): unknown => {
    if (s.const !== undefined) return s.const;
    if (s.default !== undefined) return s.default;
    if (s.enum) return s.enum[0];

    switch (s.type) {
      case "string":
        if (s.format === "email") return "user@example.com";
        if (s.format === "date") return "2024-01-15";
        if (s.format === "date-time") return "2024-01-15T10:30:00Z";
        if (s.format === "uri" || s.format === "url") return "https://example.com";
        return "string";
      case "number":
      case "integer":
        return s.minimum !== undefined ? s.minimum : 42;
      case "boolean":
        return true;
      case "array":
        if (s.items) {
          return [generateExample(s.items)];
        }
        return [];
      case "object":
        if (s.properties) {
          const example: Record<string, unknown> = {};
          for (const [key, prop] of Object.entries(s.properties)) {
            if (!s.required || s.required.includes(key)) {
              example[key] = generateExample(prop);
            }
          }
          return example;
        }
        return {};
      default:
        return null;
    }
  };

  return (
    <div
      className={`schema-viewer ${className}`}
      style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        backgroundColor: "#f5efe6",
        border: "1px solid #d4c8b8",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="schema-header"
        style={{
          backgroundColor: "#ebe3d6",
          padding: "10px 12px",
          borderBottom: "1px solid #d4c8b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {canExpand && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#7a5c3a",
                borderRadius: "3px",
                transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.15s ease, background-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5dccf")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "14px",
              fontWeight: 600,
              color: "#2d1b0e",
            }}
          >
            {schema.title || "Schema"}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "#a0926f",
              backgroundColor: "#f5efe6",
              padding: "2px 8px",
              borderRadius: "3px",
              border: "1px solid #d4c8b8",
            }}
          >
            {schema.type || "any"}
          </span>
        </div>

        {/* Stats */}
        {schema.type === "object" && schema.properties && (
          <div
            style={{
              fontSize: "11px",
              color: "#a0926f",
              display: "flex",
              gap: "8px",
            }}
          >
            <span title={`${Object.keys(schema.properties).length} properties`}>
              {Object.keys(schema.properties).length} props
            </span>
            {schema.required && schema.required.length > 0 && (
              <span style={{ color: "#c45c4a" }} title={`${schema.required.length} required`}>
                {schema.required.length} required
              </span>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {schema.description && (
        <div
          className="schema-description"
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            color: "#5c4a3a",
            backgroundColor: "#faf7f2",
            borderBottom: "1px solid #e5dccf",
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
          }}
        >
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#a0926f" }} />
          <span>{schema.description}</span>
        </div>
      )}

      {/* Body */}
      <div className="schema-body" style={{ maxHeight: "400px", overflow: "auto" }}>
        {/* Properties */}
        {schema.type === "object" && schema.properties && (
          <ObjectProperties
            properties={schema.properties}
            required={schema.required || []}
            depth={0}
            defaultExpanded={expanded}
          />
        )}

        {/* Array items */}
        {schema.type === "array" && schema.items && (
          <div style={{ padding: "8px" }}>
            <ArrayItems items={schema.items} depth={0} defaultExpanded={expanded} />
          </div>
        )}

        {/* Simple type display */}
        {!schema.properties && !schema.items && (
          <div
            style={{
              padding: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: getTypeColor(schema.type) }}>{getTypeIcon(schema)}</span>
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "13px",
                color: "#2d1b0e",
              }}
            >
              {getTypeLabel(schema)}
            </span>
            {schema.description && (
              <span style={{ fontSize: "12px", color: "#7a5c3a" }}>— {schema.description}</span>
            )}
          </div>
        )}
      </div>

      {/* Example footer */}
      {showExamples && (schema.type === "object" || schema.type === "array") && (
        <div
          className="schema-example"
          style={{
            backgroundColor: "#ebe3d6",
            borderTop: "1px solid #d4c8b8",
            padding: "8px 12px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#a0926f",
              marginBottom: "4px",
              fontWeight: 600,
            }}
          >
            Example
          </div>
          <pre
            style={{
              margin: 0,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "11px",
              color: "#3d2b15",
              backgroundColor: "#f5efe6",
              padding: "8px",
              borderRadius: "4px",
              overflow: "auto",
              maxHeight: "100px",
            }}
          >
            {JSON.stringify(generateExample(schema), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SchemaViewer;
