"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tool, type ToolPart } from "@/components/ui/tool";
import { Message } from "@/components/ui/message";
import {
  ChainOfThought,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  ChainOfThoughtContent,
  ChainOfThoughtItem,
} from "@/components/ui/chain-of-thought";
import { Steps, StepsItem, StepsTrigger, StepsContent } from "@/components/ui/steps";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, Sparkles, CheckCircle2, Trash2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

// Agent activity types
export type AgentActivityType =
  | "tool_start"
  | "tool_end"
  | "message_delta"
  | "step"
  | "reasoning"
  | "complete"
  | "error";

export type ToolActivity = {
  id: string;
  type: "tool";
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  startTime: Date;
  endTime?: Date;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
};

export type MessageActivity = {
  id: string;
  type: "message";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};

export type ReasoningActivity = {
  id: string;
  type: "reasoning";
  thought: string;
  timestamp: Date;
};

export type StepActivity = {
  id: string;
  type: "step";
  label: string;
  step: number;
  total?: number;
  timestamp: Date;
};

export type AgentActivity = ToolActivity | MessageActivity | ReasoningActivity | StepActivity;

export type AgentViewerProps = {
  activities: AgentActivity[];
  isRunning: boolean;
  onClear?: () => void;
  className?: string;
};

export function AgentViewer({ activities, isRunning, onClear, className }: AgentViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, shouldAutoScroll]);

  // Handle scroll events to pause auto-scroll if user scrolls up
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isAtBottom);
    }
  };

  // Scroll to bottom button handler
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setShouldAutoScroll(true);
    }
  };

  // Get current step
  const stepActivities = activities.filter((a): a is StepActivity => a.type === "step");
  const currentStep = stepActivities[stepActivities.length - 1];

  // Convert ToolActivity to ToolPart
  const getToolPart = (activity: ToolActivity): ToolPart => {
    return {
      type: activity.toolName,
      state: activity.state,
      input: activity.args,
      output: activity.result,
      toolCallId: activity.toolCallId,
      errorText: activity.error,
    };
  };

  return (
    <Card className={cn("flex flex-col h-full border-[#d4c8b8] bg-[#f5efe6]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#d4c8b8] bg-[#ede5d8]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-8 w-8 bg-[#7a5c3a]">
              <AvatarFallback className="bg-[#7a5c3a] text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            {isRunning && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2d1b0e]">Agent Activity</h3>
            <p className="text-xs text-[#a0926f]">
              {isRunning ? "Processing..." : activities.length > 0 ? "Complete" : "Ready"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentStep && currentStep.total && (
            <span className="text-xs text-[#7a5c3a] tabular-nums">
              Step {currentStep.step}/{currentStep.total}
            </span>
          )}
          {onClear && activities.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 px-2 text-[#7a5c3a] hover:text-[#a05c5c] hover:bg-[#f5e6e6]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {currentStep && currentStep.total && (
        <div className="px-4 py-2 border-b border-[#d4c8b8] bg-[#ede5d8]">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#d4c8b8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7a5c3a] rounded-full transition-all duration-300"
                style={{
                  width: `${(currentStep.step / currentStep.total) * 100}%`,
                }}
              />
            </div>
            {isRunning && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#7a5c3a]" />}
          </div>
          <p className="text-xs text-[#7a5c3a] mt-1 truncate">{currentStep.label}</p>
        </div>
      )}

      {/* Activity Stream */}
      <div className="flex-1 p-4 overflow-y-auto" onScroll={handleScroll} ref={scrollRef}>
        <div className="space-y-4">
          {/* No Activities State */}
          {activities.length === 0 && !isRunning && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-[#a0926f]">
              <Bot className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">No agent activity yet</p>
              <p className="text-xs mt-1">Start an extraction to see the agent in action</p>
            </div>
          )}

          {/* Activities */}
          {activities.map((activity, index) => {
            const isLast = index === activities.length - 1;

            switch (activity.type) {
              case "message":
                return (
                  <Message key={activity.id} className="gap-3">
                    <Avatar className="h-8 w-8 bg-[#7a5c3a] shrink-0">
                      <AvatarFallback className="bg-[#7a5c3a] text-white text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[#a0926f] mb-1 flex items-center gap-2">
                        <span>Agent</span>
                        <span className="text-[10px]">
                          {activity.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="bg-[#ede5d8] border border-[#d4c8b8] text-[#2d1b0e] rounded-lg p-3 text-sm">
                        {activity.isStreaming ? (
                          <span className="flex items-center gap-1">
                            {activity.content}
                            <span className="animate-pulse">▋</span>
                          </span>
                        ) : (
                          activity.content
                        )}
                      </div>
                    </div>
                  </Message>
                );

              case "tool":
                return (
                  <div key={activity.id} className="ml-11">
                    <Tool
                      toolPart={getToolPart(activity)}
                      defaultOpen={isLast}
                      className="border-[#d4c8b8] bg-[#ede5d8]"
                    />
                  </div>
                );

              case "reasoning":
                return (
                  <ChainOfThought key={activity.id} className="ml-11">
                    <ChainOfThoughtStep isLast={isLast}>
                      <ChainOfThoughtTrigger
                        leftIcon={<Sparkles className="h-3 w-3 text-[#7a5c3a]" />}
                      >
                        <span className="text-xs text-[#7a5c3a]">Reasoning</span>
                      </ChainOfThoughtTrigger>
                      <ChainOfThoughtContent>
                        <ChainOfThoughtItem className="text-xs text-[#2d1b0e] bg-[#ede5d8] p-2 rounded border border-[#d4c8b8]">
                          {activity.thought}
                        </ChainOfThoughtItem>
                      </ChainOfThoughtContent>
                    </ChainOfThoughtStep>
                  </ChainOfThought>
                );

              case "step":
                return (
                  <Steps key={activity.id} defaultOpen={false} className="ml-11">
                    <StepsItem>
                      <StepsTrigger
                        leftIcon={
                          isLast && isRunning ? (
                            <Loader2 className="h-3 w-3 animate-spin text-[#7a5c3a]" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-[#5c8a5c]" />
                          )
                        }
                      >
                        <span className="text-xs text-[#2d1b0e]">{activity.label}</span>
                      </StepsTrigger>
                      <StepsContent>
                        <div className="text-xs text-[#a0926f]">
                          Step {activity.step}
                          {activity.total && ` of ${activity.total}`}
                        </div>
                      </StepsContent>
                    </StepsItem>
                  </Steps>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {!shouldAutoScroll && activities.length > 0 && (
        <div className="absolute bottom-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToBottom}
            className="h-8 px-3 bg-[#ede5d8] border-[#d4c8b8] text-[#7a5c3a] hover:bg-[#f5efe6] shadow-lg"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            Latest
          </Button>
        </div>
      )}
    </Card>
  );
}

export type AgentActivityPayload =
  | {
      type: "tool_start";
      toolName: string;
      toolCallId: string;
      args: Record<string, unknown>;
    }
  | {
      type: "tool_end";
      toolCallId: string;
      result?: Record<string, unknown>;
      error?: string;
    }
  | {
      type: "message_delta";
      content: string;
    }
  | {
      type: "step";
      label: string;
      step: number;
      total?: number;
    }
  | {
      type: "reasoning";
      thought: string;
    }
  | {
      type: "complete";
    }
  | {
      type: "error";
      message: string;
    };

// Hook to manage agent activities
export function useAgentActivities() {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const currentMessageRef = useRef<string>("");

  const clearActivities = () => {
    setActivities([]);
    currentMessageRef.current = "";
  };

  const startAgent = () => {
    setIsRunning(true);
    clearActivities();
  };

  const endAgent = () => {
    setIsRunning(false);
    // Finalize any streaming message
    setActivities((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === "message" && last.isStreaming) {
        return [...prev.slice(0, -1), { ...last, isStreaming: false }];
      }
      return prev;
    });
  };

  const addActivity = (payload: AgentActivityPayload) => {
    const id = crypto.randomUUID();
    const timestamp = new Date();

    switch (payload.type) {
      case "tool_start":
        setActivities((prev) => [
          ...prev,
          {
            id,
            type: "tool",
            toolName: payload.toolName,
            toolCallId: payload.toolCallId,
            args: payload.args,
            startTime: timestamp,
            state: "input-available",
          },
        ]);
        break;

      case "tool_end":
        setActivities((prev) => {
          const index = prev.findIndex(
            (a): a is ToolActivity => a.type === "tool" && a.toolCallId === payload.toolCallId,
          );
          if (index === -1) return prev;

          const tool = prev[index] as ToolActivity;
          return [
            ...prev.slice(0, index),
            {
              ...tool,
              state: payload.error ? "output-error" : "output-available",
              result: payload.result,
              error: payload.error,
              endTime: timestamp,
            },
            ...prev.slice(index + 1),
          ];
        });
        break;

      case "message_delta":
        currentMessageRef.current += payload.content;
        setActivities((prev) => {
          const last = prev[prev.length - 1];
          if (last?.type === "message" && last.isStreaming) {
            return [...prev.slice(0, -1), { ...last, content: currentMessageRef.current }];
          }
          return [
            ...prev,
            {
              id,
              type: "message",
              content: currentMessageRef.current,
              timestamp,
              isStreaming: true,
            },
          ];
        });
        break;

      case "step":
        setActivities((prev) => [
          ...prev,
          {
            id,
            type: "step",
            label: payload.label,
            step: payload.step,
            total: payload.total,
            timestamp,
          },
        ]);
        break;

      case "reasoning":
        setActivities((prev) => [
          ...prev,
          {
            id,
            type: "reasoning",
            thought: payload.thought,
            timestamp,
          },
        ]);
        break;

      case "complete":
        endAgent();
        break;

      case "error":
        setActivities((prev) => [
          ...prev,
          {
            id,
            type: "message",
            content: `Error: ${payload.message}`,
            timestamp,
            isStreaming: false,
          },
        ]);
        endAgent();
        break;
    }
  };

  return {
    activities,
    isRunning,
    clearActivities,
    startAgent,
    endAgent,
    addActivity,
  };
}
