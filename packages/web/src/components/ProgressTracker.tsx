import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "pending" | "running" | "completed" | "error";

export type Step = {
  id: string;
  label: string;
  status: StepStatus;
  message?: string;
};

type ProgressTrackerProps = {
  steps: Step[];
  currentStep?: number;
};

export function ProgressTracker({ steps, currentStep: _currentStep }: ProgressTrackerProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isActive = step.status === "running";
        const isCompleted = step.status === "completed";
        const isError = step.status === "error";

        return (
          <div key={step.id} className="relative">
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[11px] top-[28px] w-0.5 h-[calc(100%-28px)]",
                  isCompleted ? "bg-green-500" : "bg-border",
                )}
              />
            )}

            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                  {
                    "bg-muted border-2 border-border": step.status === "pending",
                    "bg-primary border-2 border-primary": isActive,
                    "bg-green-500": isCompleted,
                    "bg-destructive": isError,
                  },
                )}
              >
                {step.status === "pending" && (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                )}
                {isActive && <Loader2 className="h-3 w-3 animate-spin text-primary-foreground" />}
                {isCompleted && <CheckCircle className="h-3 w-3 text-white" />}
                {isError && <XCircle className="h-3 w-3 text-white" />}
              </div>

              <div className="flex-1 min-w-0 pb-4">
                <div
                  className={cn("text-sm font-medium transition-colors duration-200", {
                    "text-muted-foreground": step.status === "pending",
                    "text-foreground": isActive || isCompleted,
                    "text-destructive": isError,
                  })}
                >
                  {step.label}
                </div>
                {step.message && (
                  <div className="text-xs text-muted-foreground mt-1">{step.message}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
