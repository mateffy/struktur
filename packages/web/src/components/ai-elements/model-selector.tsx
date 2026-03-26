import { Command as CommandPrimitive } from "cmdk";
import type { ComponentProps, ReactNode } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "#/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import { cn } from "#/lib/utils";

export type ModelSelectorProps = ComponentProps<typeof Popover>;

export const ModelSelector = (props: ModelSelectorProps) => <Popover {...props} />;

export type ModelSelectorTriggerProps = ComponentProps<typeof PopoverTrigger>;

export const ModelSelectorTrigger = (props: ModelSelectorTriggerProps) => (
  <PopoverTrigger {...props} />
);

export type ModelSelectorContentProps = ComponentProps<typeof PopoverContent> & {
  title?: ReactNode;
};

export const ModelSelectorContent = ({
  className,
  children,
  ...props
}: ModelSelectorContentProps) => (
  <PopoverContent
    align="start"
    sideOffset={4}
    className={cn("w-[360px] p-0 overflow-hidden shadow-xl", className)}
    {...props}
  >
    <Command className="bg-[#f5efe6]">{children}</Command>
  </PopoverContent>
);

export type ModelSelectorInputProps = ComponentProps<typeof CommandPrimitive.Input>;

export const ModelSelectorInput = ({ className, ...props }: ModelSelectorInputProps) => (
  <div className="border-b border-[#d4c8b8] px-3 py-2.5 bg-[#f5efe6]">
    <div className="flex items-center gap-2 bg-[#ede5d8] rounded-md px-3 py-2 border border-[#d4c8b8] focus-within:ring-2 focus-within:ring-[#7a5c3a] focus-within:border-transparent transition-all">
      <svg
        className="w-4 h-4 text-[#a0926f] shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-label="Search"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <CommandPrimitive.Input
        className={cn(
          "flex-1 bg-transparent text-sm text-[#2d1b0e] placeholder:text-[#a0926f] outline-none",
          className,
        )}
        {...props}
      />
    </div>
  </div>
);

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

export const ModelSelectorList = ({ className, ...props }: ModelSelectorListProps) => (
  <CommandList className={cn("max-h-[280px] overflow-y-auto py-1", className)} {...props} />
);

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModelSelectorEmpty = ({ className, ...props }: ModelSelectorEmptyProps) => (
  <CommandEmpty className={cn("py-6 text-center text-sm text-[#a0926f]", className)} {...props} />
);

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModelSelectorGroup = ({ className, ...props }: ModelSelectorGroupProps) => (
  <CommandGroup className={cn("px-2 py-1", className)} {...props} />
);

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ModelSelectorItem = ({ className, ...props }: ModelSelectorItemProps) => (
  <CommandItem
    className={cn(
      "relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#2d1b0e] hover:bg-[#e5dccf] data-[selected=true]:bg-[#e5dccf] data-[selected=true]:text-[#2d1b0e]",
      className,
    )}
    {...props}
  />
);

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const ModelSelectorShortcut = ({ className, ...props }: ModelSelectorShortcutProps) => (
  <CommandShortcut className={cn("ml-auto text-xs text-[#a0926f]", className)} {...props} />
);

export type ModelSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>;

export const ModelSelectorSeparator = ({ className, ...props }: ModelSelectorSeparatorProps) => (
  <CommandSeparator className={cn("h-px bg-[#d4c8b8] my-1", className)} {...props} />
);

export type ModelSelectorLogoProps = Omit<ComponentProps<"img">, "src" | "alt"> & {
  provider:
    | "moonshotai-cn"
    | "lucidquery"
    | "moonshotai"
    | "zai-coding-plan"
    | "alibaba"
    | "xai"
    | "vultr"
    | "nvidia"
    | "upstage"
    | "groq"
    | "github-copilot"
    | "mistral"
    | "vercel"
    | "nebius"
    | "deepseek"
    | "alibaba-cn"
    | "google-vertex-anthropic"
    | "venice"
    | "chutes"
    | "cortecs"
    | "github-models"
    | "togetherai"
    | "azure"
    | "baseten"
    | "huggingface"
    | "opencode"
    | "fastrouter"
    | "google"
    | "google-vertex"
    | "cloudflare-workers-ai"
    | "inception"
    | "wandb"
    | "openai"
    | "zhipuai-coding-plan"
    | "perplexity"
    | "openrouter"
    | "zenmux"
    | "v0"
    | "iflowcn"
    | "synthetic"
    | "deepinfra"
    | "zhipuai"
    | "submodel"
    | "zai"
    | "inference"
    | "requesty"
    | "morph"
    | "lmstudio"
    | "anthropic"
    | "aihubmix"
    | "fireworks-ai"
    | "modelscope"
    | "llama"
    | "scaleway"
    | "amazon-bedrock"
    | "cerebras"
    // oxlint-disable-next-line typescript-eslint(ban-types) -- intentional pattern for autocomplete-friendly string union
    | (string & {});
};

export const ModelSelectorLogo = ({ provider, className, ...props }: ModelSelectorLogoProps) => (
  <div
    className={cn(
      "size-6 rounded-md bg-[#ede5d8] flex items-center justify-center shrink-0 overflow-hidden",
      className,
    )}
  >
    <img
      {...props}
      alt={`${provider} logo`}
      className="size-4 object-contain"
      height={16}
      src={`https://models.dev/logos/${provider}.svg`}
      width={16}
      onError={(e) => {
        // Fallback to a generic icon if logo fails to load
        e.currentTarget.style.display = "none";
      }}
    />
  </div>
);

export type ModelSelectorLogoGroupProps = ComponentProps<"div">;

export const ModelSelectorLogoGroup = ({ className, ...props }: ModelSelectorLogoGroupProps) => (
  <div
    className={cn(
      "flex shrink-0 items-center -space-x-1 [&>div]:rounded-full [&>div]:ring-1 [&>div]:ring-[#d4c8b8]",
      className,
    )}
    {...props}
  />
);

export type ModelSelectorNameProps = ComponentProps<"span">;

export const ModelSelectorName = ({ className, ...props }: ModelSelectorNameProps) => (
  <span className={cn("flex-1 truncate text-left font-medium", className)} {...props} />
);

export type ModelSelectorGroupHeadingProps = ComponentProps<"div"> & {
  heading: string;
};

export const ModelSelectorGroupHeading = ({
  heading,
  className,
}: ModelSelectorGroupHeadingProps) => (
  <div
    className={cn(
      "px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#7a5c3a]",
      className,
    )}
  >
    {heading}
  </div>
);
