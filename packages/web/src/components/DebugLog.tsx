import { ScrollText, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type LogEntry = {
  id: string;
  timestamp: Date;
  type: "info" | "warning" | "error" | "success";
  message: string;
  data?: unknown;
};

type DebugLogProps = {
  entries: LogEntry[];
  onClear?: () => void;
};

export function DebugLog({ entries, onClear }: DebugLogProps) {
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredEntries = entries.filter((entry) => {
    if (!filter) return true;
    const lowerFilter = filter.toLowerCase();
    return (
      entry.message.toLowerCase().includes(lowerFilter) ||
      entry.type.toLowerCase().includes(lowerFilter)
    );
  });

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-destructive";
      case "warning":
        return "text-yellow-600";
      case "success":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getTypeBg = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "bg-destructive/10";
      case "warning":
        return "bg-yellow-50";
      case "success":
        return "bg-green-50";
      default:
        return "bg-muted";
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <ScrollText className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">No debug logs yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        {onClear && (
          <Button variant="outline" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredEntries.map((entry) => {
          const isExpanded = expanded.has(entry.id);

          return (
            <div
              key={entry.id}
              className={cn("rounded-lg border p-3 text-sm transition-all", getTypeBg(entry.type))}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase",
                      getTypeColor(entry.type),
                    )}
                  >
                    {entry.type}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="font-medium">{entry.message}</div>
                  {entry.data && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => toggleExpand(entry.id)}
                      >
                        {isExpanded ? "Hide data" : "Show data"}
                      </Button>
                      {isExpanded && (
                        <pre className="mt-2 p-2 rounded bg-background/50 overflow-auto text-xs font-mono">
                          {JSON.stringify(entry.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
