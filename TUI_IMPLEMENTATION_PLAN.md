# Struktur TUI Enhancement Implementation Plan

## Overview

Transform the Struktur CLI from a traditional command-line tool into an interactive, user-friendly TUI experience using Ink (React for CLIs). The system will detect when running in a user-facing environment and automatically prompt for missing inputs while showing real-time progress through Struktur's callback system.

---

## Framework Choice: Ink (React for CLIs)

**Why Ink over blessed/Bubbletea:**
- **React-based**: Familiar component model, declarative UI
- **TypeScript-first**: Excellent type support
- **Bun-compatible**: Works seamlessly with Bun runtime
- **Rich ecosystem**: ink-spinner, ink-progress-bar, ink-text-input, ink-select-input
- **Active maintenance**: Regular updates, large community
- **Modern patterns**: Hooks, context, effects - matches existing codebase style

### Dependencies to Add

```json
{
  "dependencies": {
    "ink": "^5.0.0",
    "react": "^18.2.0",
    "ink-spinner": "^5.0.0",
    "ink-progress-bar": "^3.0.0",
    "ink-text-input": "^6.0.0",
    "ink-select-input": "^6.0.0",
    "ink-divider": "^4.0.0",
    "is-interactive": "^2.0.0",
    "is-ci": "^3.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0"
  }
}
```

---

## File Structure

```
src/cli/
├── index.ts                    # Entry point, exports all CLI modules
├── cli.ts                      # Refactored CLI implementation with TUI detection
├── env-detector.ts             # Detect CI vs interactive environment
├── commands/
│   ├── extract.tsx             # Interactive extract command with TUI
│   ├── auth.tsx                # Interactive auth command with TUI
│   ├── models.tsx              # Interactive models listing with TUI
│   └── verify.tsx              # Interactive verify command with TUI
├── components/
│   ├── App.tsx                 # Main TUI app container with routing
│   ├── Wizard.tsx              # Multi-step wizard for missing inputs
│   ├── Progress.tsx            # Real-time progress display
│   ├── Steps.tsx               # Step-by-step progress indicator
│   ├── Spinner.tsx             # Loading spinner component
│   ├── TokenUsage.tsx          # Token usage display
│   ├── messages/
│   │   ├── MessageLog.tsx      # Scrollable message log for onMessage events
│   │   └── ValidationError.tsx # Validation error display
│   ├── inputs/
│   │   ├── FileInput.tsx       # File picker with autocomplete
│   │   ├── SchemaInput.tsx     # Schema input (file or JSON)
│   │   ├── ModelSelector.tsx   # Interactive model selection
│   │   ├── TextInput.tsx       # Multi-line text input
│   │   └── StrategySelector.tsx # Strategy selection dropdown
│   └── layout/
│       ├── Header.tsx          # App header with branding
│       ├── Footer.tsx          # Status bar and help text
│       ├── Panel.tsx           # Reusable panel container
│       └── ErrorBoundary.tsx   # Error handling for TUI
├── hooks/
│   ├── useExtraction.ts        # Hook to run extraction with event handlers
│   ├── useProgress.ts          # Track and display progress state
│   ├── useArtifacts.ts         # Handle artifact loading and validation
│   └── useTerminalSize.ts      # Respond to terminal resize events
├── types/
│   └── tui.ts                  # TUI-specific type definitions
└── utils/
    ├── render-mode.ts          # Determine render mode (TUI vs CLI)
    └── format.ts               # Format helpers for display
```

---

## Phase 1: Environment Detection & Foundation

### 1.1 Environment Detection (`src/cli/env-detector.ts`)

Detect when to use interactive TUI vs traditional CLI:

```typescript
export type EnvironmentType = 'interactive' | 'ci' | 'piped' | 'agent';

export interface EnvironmentInfo {
  type: EnvironmentType;
  isTTY: boolean;
  isInteractive: boolean;
  reason: string;
}

export function detectEnvironment(): EnvironmentInfo {
  // Check for CI environments
  if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) {
    return { type: 'ci', isTTY: false, isInteractive: false, reason: 'CI environment detected' };
  }
  
  // Check for agent/non-interactive
  if (process.env.OPENCODE_AGENT || process.env.CODESANDBOX_SSE) {
    return { type: 'agent', isTTY: false, isInteractive: false, reason: 'Agent environment detected' };
  }
  
  // Check for piped stdin/stdout
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return { type: 'piped', isTTY: false, isInteractive: false, reason: 'Piped I/O detected' };
  }
  
  // Check terminal capabilities
  if (!process.env.TERM || process.env.TERM === 'dumb') {
    return { type: 'ci', isTTY: true, isInteractive: false, reason: 'Dumb terminal detected' };
  }
  
  return { type: 'interactive', isTTY: true, isInteractive: true, reason: 'Interactive terminal detected' };
}

export function shouldUseTUI(info?: EnvironmentInfo): boolean {
  const env = info ?? detectEnvironment();
  return env.type === 'interactive' && env.isInteractive;
}
```

### 1.2 Render Mode Utility (`src/cli/utils/render-mode.ts`)

```typescript
import { render } from 'ink';
import { detectEnvironment, shouldUseTUI } from '../env-detector';

export type RenderResult = 
  | { mode: 'tui'; unmount: () => void }
  | { mode: 'cli'; write: (data: string) => void };

export async function renderOrExecute<T>(options: {
  component: React.ReactElement;
  fallback: () => Promise<T>;
  onComplete?: (result: T) => void;
}): Promise<RenderResult> {
  if (shouldUseTUI()) {
    const { waitUntilExit, unmount } = render(options.component);
    await waitUntilExit();
    return { mode: 'tui', unmount };
  } else {
    const result = await options.fallback();
    options.onComplete?.(result);
    return { mode: 'cli', write: (data) => process.stdout.write(data) };
  }
}
```

---

## Phase 2: Core TUI Components

### 2.1 Main App Container (`src/cli/components/App.tsx`)

```typescript
import React, { useState, useCallback } from 'react';
import { Box, useApp, useInput } from 'ink';
import type { ParsedArgs } from '../cli';

type Command = 'extract' | 'auth' | 'models' | 'verify' | 'help';

interface AppState {
  command: Command;
  args: ParsedArgs;
  error?: Error;
  result?: unknown;
}

interface AppProps {
  initialArgs: ParsedArgs;
}

export const App: React.FC<AppProps> = ({ initialArgs }) => {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({
    command: (initialArgs.command as Command) || 'extract',
    args: initialArgs,
  });

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'c')) {
      exit();
    }
  });

  const handleError = useCallback((error: Error) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const handleComplete = useCallback((result: unknown) => {
    setState((prev) => ({ ...prev, result }));
    setTimeout(() => exit(), 500);
  }, [exit]);

  return (
    <Box flexDirection="column" height="100%">
      {/* Render appropriate command component based on state */}
    </Box>
  );
};
```

### 2.2 Wizard for Missing Inputs (`src/cli/components/Wizard.tsx`)

Multi-step wizard that prompts for required but missing inputs:

```typescript
import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';

type WizardStep = 
  | { type: 'input'; name: string; label: string; required: boolean }
  | { type: 'select'; name: string; label: string; options: Array<{ label: string; value: string }> }
  | { type: 'file'; name: string; label: string; accept: string[] };

interface WizardProps {
  steps: WizardStep[];
  onComplete: (values: Record<string, string>) => void;
  onCancel: () => void;
}

export const Wizard: React.FC<WizardProps> = ({ steps, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');

  useInput((_, key) => {
    if (key.escape) {
      onCancel();
    }
  });

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setInputValue('');
    } else {
      onComplete(values);
    }
  }, [currentStep, steps.length, values, onComplete]);

  const step = steps[currentStep];

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Step {currentStep + 1} of {steps.length}: {step.label}
      </Text>
      <Box marginTop={1}>
        {/* Render appropriate input based on step type */}
      </Box>
    </Box>
  );
};
```

### 2.3 Real-time Progress Display (`src/cli/components/Progress.tsx`)

```typescript
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import ProgressBar from 'ink-progress-bar';
import type { ProgressInfo, StepInfo, TokenUsageInfo } from '../../types';

interface ProgressProps {
  currentStep: StepInfo;
  progress?: ProgressInfo;
  tokenUsage: TokenUsageInfo;
  isComplete: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  currentStep,
  progress,
  tokenUsage,
  isComplete,
}) => {
  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        {isComplete ? (
          <Text color="green">✓</Text>
        ) : (
          <Text color="yellow">
            <Spinner type="dots" />
          </Text>
        )}
        <Text> {currentStep.label || `Step ${currentStep.step}`}</Text>
        {currentStep.total && (
          <Text dimColor> ({currentStep.step}/{currentStep.total})</Text>
        )}
      </Box>
      
      {progress && progress.total > 0 && (
        <Box marginTop={1}>
          <ProgressBar
            percent={progress.percent || (progress.current / progress.total) * 100}
            columns={40}
          />
          <Text dimColor> {progress.current}/{progress.total}</Text>
        </Box>
      )}
      
      <Box marginTop={1}>
        <Text dimColor>
          Tokens: {tokenUsage.totalTokens.toLocaleString()} 
          ({tokenUsage.inputTokens.toLocaleString()} in / {tokenUsage.outputTokens.toLocaleString()} out)
        </Text>
      </Box>
    </Box>
  );
};
```

### 2.4 Message Log for Callbacks (`src/cli/components/messages/MessageLog.tsx`)

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Static } from 'ink';
import type { MessageInfo, ExtractionEvents } from '../../../types';

interface MessageLogProps {
  maxHeight?: number;
}

export const MessageLog: React.FC<MessageLogProps> = ({ maxHeight = 10 }) => {
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const scrollRef = useRef<number>(0);

  // Expose event handlers for parent
  const handleMessage = (info: MessageInfo) => {
    setMessages((prev) => [...prev, info]);
  };

  return (
    <Box 
      flexDirection="column" 
      borderStyle="single" 
      borderColor="gray"
      padding={1}
      height={maxHeight}
    >
      <Text bold dimColor>Event Log</Text>
      <Box flexDirection="column" marginTop={1}>
        {messages.slice(-maxHeight).map((msg, idx) => (
          <Text key={idx} dimColor={msg.role === 'system'}>
            [{msg.role}] {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content).slice(0, 80)}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
```

---

## Phase 3: Command-Specific TUI Components

### 3.1 Interactive Extract Command (`src/cli/commands/extract.tsx`)

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import { Wizard } from '../components/Wizard';
import { Progress } from '../components/Progress';
import { MessageLog } from '../components/messages/MessageLog';
import { useExtraction } from '../hooks/useExtraction';
import { FileInput } from '../components/inputs/FileInput';
import { SchemaInput } from '../components/inputs/SchemaInput';
import { ModelSelector } from '../components/inputs/ModelSelector';
import { StrategySelector } from '../components/inputs/StrategySelector';
import type { ExtractionResult, Artifact } from '../../types';

interface ExtractCommandProps {
  initialOptions: Record<string, string | boolean>;
}

export const ExtractCommand: React.FC<ExtractCommandProps> = ({ initialOptions }) => {
  const { exit } = useApp();
  const [phase, setPhase] = useState<'setup' | 'running' | 'complete' | 'error'>('setup');
  const [options, setOptions] = useState(initialOptions);
  const [result, setResult] = useState<ExtractionResult<unknown> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { run, progress, step, tokenUsage, messageLog } = useExtraction();

  // Determine required inputs
  const getRequiredSteps = useCallback(() => {
    const steps = [];
    
    if (!options.input && !options.text && !options.artifact && !options['artifact-json']) {
      steps.push({
        type: 'file' as const,
        name: 'input',
        label: 'Select input file or enter text',
        accept: ['*'],
      });
    }
    
    if (!options.schema && !options['schema-json']) {
      steps.push({
        type: 'schema' as const,
        name: 'schema',
        label: 'Select JSON schema file or enter schema JSON',
      });
    }
    
    if (!options.model) {
      steps.push({
        type: 'model' as const,
        name: 'model',
        label: 'Select AI model',
      });
    }
    
    return steps;
  }, [options]);

  const handleWizardComplete = useCallback(async (wizardValues: Record<string, string>) => {
    const finalOptions = { ...options, ...wizardValues };
    setOptions(finalOptions);
    setPhase('running');

    try {
      const extractionResult = await run(finalOptions);
      setResult(extractionResult);
      setPhase('complete');
    } catch (err) {
      setError(err as Error);
      setPhase('error');
    }
  }, [options, run]);

  const handleSave = useCallback(() => {
    if (result?.data) {
      // Save to file or output
      const output = JSON.stringify(result.data, null, 2);
      if (options.output && typeof options.output === 'string') {
        Bun.write(options.output, output);
      } else {
        console.log(output);
      }
    }
    exit();
  }, [result, options.output, exit]);

  if (phase === 'setup') {
    const steps = getRequiredSteps();
    if (steps.length === 0) {
      // All inputs provided, skip to running
      handleWizardComplete({});
      return null;
    }
    return (
      <Wizard
        steps={steps}
        onComplete={handleWizardComplete}
        onCancel={() => exit()}
      />
    );
  }

  if (phase === 'running') {
    return (
      <Box flexDirection="column" height="100%">
        <Progress
          currentStep={step}
          progress={progress}
          tokenUsage={tokenUsage}
          isComplete={false}
        />
        <MessageLog maxHeight={15} />
      </Box>
    );
  }

  if (phase === 'complete' && result) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green" bold>✓ Extraction Complete!</Text>
        <Box marginTop={1}>
          <Text dimColor>Data extracted successfully.</Text>
        </Box>
        <Box marginTop={1}>
          <Text>Tokens used: {result.usage.totalTokens.toLocaleString()}</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press Enter to save, or Ctrl+C to exit without saving</Text>
        </Box>
      </Box>
    );
  }

  if (phase === 'error' && error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>✗ Extraction Failed</Text>
        <Box marginTop={1}>
          <Text>{error.message}</Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Press any key to exit</Text>
        </Box>
      </Box>
    );
  }

  return null;
};
```

### 3.2 Extraction Hook (`src/cli/hooks/useExtraction.ts`)

```typescript
import { useState, useCallback, useRef } from 'react';
import { extract } from '../../extract';
import { simple } from '../../strategies';
import { resolveModel } from '../cli';
import type { 
  ExtractionResult, 
  ExtractionEvents, 
  ProgressInfo, 
  StepInfo, 
  TokenUsageInfo,
  MessageInfo,
  Artifact 
} from '../../types';

interface UseExtractionReturn {
  run: (options: Record<string, string | boolean>) => Promise<ExtractionResult<unknown>>;
  progress?: ProgressInfo;
  step: StepInfo;
  tokenUsage: TokenUsageInfo;
  messageLog: MessageInfo[];
  isRunning: boolean;
}

export function useExtraction(): UseExtractionReturn {
  const [progress, setProgress] = useState<ProgressInfo | undefined>();
  const [step, setStep] = useState<StepInfo>({ step: 0, label: 'idle' });
  const [tokenUsage, setTokenUsage] = useState<TokenUsageInfo>({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  });
  const messageLogRef = useRef<MessageInfo[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback(async (options: Record<string, string | boolean>) => {
    setIsRunning(true);
    setStep({ step: 1, label: 'initializing' });

    try {
      // Load artifacts, schema, and model
      const artifacts = await loadArtifacts(options);
      const schema = await loadSchema(options);
      const model = await resolveModel(typeof options.model === 'string' ? options.model : 'openai/gpt-4');

      // Set up event handlers
      const events: ExtractionEvents = {
        onStep: (info) => {
          setStep(info);
        },
        onProgress: (info) => {
          setProgress(info);
        },
        onTokenUsage: (info) => {
          setTokenUsage(info);
        },
        onMessage: (info) => {
          messageLogRef.current = [...messageLogRef.current, info];
        },
      };

      // Run extraction
      const strategy = simple({ model });
      const result = await extract({ artifacts, schema, strategy, events });

      setIsRunning(false);
      return result;
    } catch (error) {
      setIsRunning(false);
      throw error;
    }
  }, []);

  return {
    run,
    progress,
    step,
    tokenUsage,
    messageLog: messageLogRef.current,
    isRunning,
  };
}
```

---

## Phase 4: Input Components

### 4.1 Interactive Model Selector (`src/cli/components/inputs/ModelSelector.tsx`)

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { listAllProviderModels, resolveCheapestModel } from '../../../llm/models';
import { listStoredProviders } from '../../../auth/tokens';
import type { ProviderModelsResult } from '../../../types';

interface ModelSelectorProps {
  onSelect: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ onSelect }) => {
  const [providers, setProviders] = useState<ProviderModelsResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const storedProviders = await listStoredProviders();
        const providerIds = storedProviders.map((p) => p.provider);
        const results = await listAllProviderModels(providerIds.length > 0 ? providerIds : ['openai', 'anthropic', 'google']);
        setProviders(results.filter((r) => r.ok && r.models && r.models.length > 0));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  if (loading) {
    return <Text>Loading available models...</Text>;
  }

  if (error) {
    return <Text color="red">Error loading models: {error}</Text>;
  }

  const items = providers.flatMap((provider) =>
    (provider.models || []).map((model) => ({
      label: `${provider.provider}/${model}`,
      value: `${provider.provider}/${model}`,
    }))
  );

  return (
    <Box flexDirection="column">
      <Text>Select a model:</Text>
      <Box marginTop={1}>
        <SelectInput items={items} onSelect={(item) => onSelect(item.value)} />
      </Box>
    </Box>
  );
};
```

### 4.2 File Input with Autocomplete (`src/cli/components/inputs/FileInput.tsx`)

```typescript
import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Glob } from 'bun';

interface FileInputProps {
  onSubmit: (path: string) => void;
  accept?: string[];
}

export const FileInput: React.FC<FileInputProps> = ({ onSubmit, accept }) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);

  const updateSuggestions = useCallback(async (input: string) => {
    if (!input || input.startsWith('-')) {
      setSuggestions([]);
      return;
    }

    try {
      const pattern = input.includes('*') ? input : `${input}*`;
      const glob = new Glob(pattern);
      const matches = [];
      for await (const file of glob.scan('.')) {
        if (accept && accept[0] !== '*') {
          const ext = file.split('.').pop();
          if (ext && accept.includes(`.${ext}`)) {
            matches.push(file);
          }
        } else {
          matches.push(file);
        }
        if (matches.length >= 5) break;
      }
      setSuggestions(matches);
      setSelectedSuggestion(0);
    } catch {
      setSuggestions([]);
    }
  }, [accept]);

  useInput((input, key) => {
    if (key.tab && suggestions.length > 0) {
      setValue(suggestions[selectedSuggestion]);
      setSuggestions([]);
    } else if (key.upArrow && suggestions.length > 0) {
      setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (key.downArrow && suggestions.length > 0) {
      setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
    } else if (key.return) {
      onSubmit(value);
    }
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text>File path: </Text>
        <TextInput
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            updateSuggestions(newValue);
          }}
          onSubmit={() => onSubmit(value)}
        />
      </Box>
      {suggestions.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {suggestions.map((s, i) => (
            <Text key={s} color={i === selectedSuggestion ? 'cyan' : 'gray'}>
              {i === selectedSuggestion ? '> ' : '  '}{s}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};
```

---

## Phase 5: Refactored CLI Entry Point

### 5.1 Main CLI (`src/cli/cli.ts`)

Refactor the existing `src/cli.ts` to support both TUI and traditional modes:

```typescript
import { render } from 'ink';
import React from 'react';
import { App } from './components/App';
import { detectEnvironment, shouldUseTUI } from './env-detector';
import { runCli as runTraditionalCli } from './traditional-cli';
import type { ParsedArgs, CliDependencies } from './types';

export { runExtractCommand, runAuthCommand, runModelsCommand, runVerifyCommand } from './traditional-cli';

export const runCli = async (argv: string[], deps: CliDependencies = {}) => {
  const env = detectEnvironment();
  const args = parseArgs(argv);

  if (args.options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  // Check if we should use TUI
  if (shouldUseTUI(env) && !args.options['no-tui']) {
    // Launch TUI
    const { waitUntilExit } = render(
      React.createElement(App, { initialArgs: args })
    );
    await waitUntilExit();
  } else {
    // Fall back to traditional CLI
    await runTraditionalCli(argv, deps);
  }
};

// Parse args function (same as current)
const parseArgs = (argv: string[]): ParsedArgs => {
  // ... existing implementation
};

const usage = () => {
  // ... existing implementation with TUI note added
  return [
    // ... existing lines
    "",
    "Global:",
    "  -h, --help               Show help",
    "  --no-tui                 Disable interactive TUI (force traditional CLI)",
  ].join("\n");
};
```

---

## Phase 6: Integration with Existing Event System

### 6.1 Enhance Event Callbacks

Update existing strategies to provide better progress information:

```typescript
// In SequentialStrategy.ts - enhanced event reporting
export class SequentialStrategy<T> implements ExtractionStrategy<T> {
  // ... existing code

  async run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>> {
    const batches = getBatches(options.artifacts, {
      maxTokens: this.config.chunkSize,
      maxImages: this.config.maxImages,
    });

    const totalSteps = batches.length + 1; // +1 for final merge if needed
    
    // Report initial progress
    await options.events?.onStep?.({ step: 1, total: totalSteps, label: 'chunking' });
    await options.events?.onProgress?.({ current: 0, total: batches.length, percent: 0 });

    const schema = serializeSchema(options.schema);
    let currentData: T | undefined;
    const usages = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      // Report step progress
      await options.events?.onStep?.({ 
        step: i + 1, 
        total: totalSteps, 
        label: `processing batch ${i + 1}/${batches.length}` 
      });

      const previousData = currentData ? JSON.stringify(currentData) : "{}";
      const prompt = buildSequentialPrompt(
        batch,
        schema,
        previousData,
        this.config.outputInstructions
      );

      const result = await extractWithPrompt<T>({
        model: this.config.model,
        schema: options.schema,
        system: prompt.system,
        user: prompt.user,
        artifacts: batch,
        events: options.events,
        execute: this.config.execute as never,
      });

      currentData = result.data;
      usages.push(result.usage);

      // Report batch completion
      const percent = ((i + 1) / batches.length) * 100;
      await options.events?.onProgress?.({ 
        current: i + 1, 
        total: batches.length, 
        percent 
      });
      
      // Report token usage for this batch
      await options.events?.onTokenUsage?.({
        ...result.usage,
        model: 'sequential-batch',
      });
    }

    if (!currentData) {
      throw new Error("No data extracted from sequential strategy");
    }

    await options.events?.onStep?.({ step: totalSteps, total: totalSteps, label: 'complete' });

    return { data: currentData, usage: mergeUsage(usages) };
  }

  getEstimatedSteps(artifacts: Artifact[]): number {
    const batches = getBatches(artifacts, {
      maxTokens: this.config.chunkSize,
      maxImages: this.config.maxImages,
    });
    return batches.length + 1;
  }
}
```

---

## Phase 7: Testing Strategy

### 7.1 Test Files

```
src/cli/
├── env-detector.test.ts        # Test environment detection
├── utils/
│   └── render-mode.test.ts     # Test render mode selection
├── components/
│   ├── Wizard.test.tsx         # Test wizard flow
│   ├── Progress.test.tsx       # Test progress display
│   └── inputs/
│       ├── ModelSelector.test.tsx
│       └── FileInput.test.tsx
└── hooks/
    └── useExtraction.test.ts   # Test extraction hook
```

### 7.2 Example Test

```typescript
import { test, expect, describe } from 'bun:test';
import { render } from 'ink-testing-library';
import React from 'react';
import { Wizard } from './components/Wizard';

describe('Wizard', () => {
  test('renders first step initially', () => {
    const steps = [
      { type: 'input' as const, name: 'input', label: 'Select input', required: true },
      { type: 'select' as const, name: 'model', label: 'Select model', options: [] },
    ];

    const { lastFrame } = render(
      React.createElement(Wizard, {
        steps,
        onComplete: () => {},
        onCancel: () => {},
      })
    );

    expect(lastFrame()).toContain('Step 1 of 2');
    expect(lastFrame()).toContain('Select input');
  });
});
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Add Ink dependencies to package.json
- [ ] Create environment detector
- [ ] Create render mode utility
- [ ] Set up basic App component structure
- [ ] Write tests for environment detection

### Phase 2: Core Components (Week 2)
- [ ] Build Wizard component
- [ ] Build Progress component with spinner
- [ ] Build MessageLog component
- [ ] Create layout components (Header, Footer, Panel)
- [ ] Write component tests

### Phase 3: Input Components (Week 3)
- [ ] Build ModelSelector with live model fetching
- [ ] Build FileInput with autocomplete
- [ ] Build SchemaInput (file + JSON modes)
- [ ] Build StrategySelector
- [ ] Build TextInput for raw text entry
- [ ] Write input component tests

### Phase 4: Command TUI (Week 4)
- [ ] Implement ExtractCommand with full flow
- [ ] Implement AuthCommand with token management UI
- [ ] Implement ModelsCommand with provider/model browser
- [ ] Implement VerifyCommand with validation display
- [ ] Write integration tests

### Phase 5: Integration & Enhancement (Week 5)
- [ ] Refactor main CLI to support TUI mode
- [ ] Enhance strategies with detailed progress events
- [ ] Add keyboard shortcuts and help system
- [ ] Add error boundaries and recovery
- [ ] Performance optimization

### Phase 6: Polish (Week 6)
- [ ] Add color themes
- [ ] Add configuration persistence
- [ ] Documentation and examples
- [ ] Final testing and bug fixes
- [ ] Release

---

## Configuration Options

Add to existing config system:

```typescript
// src/auth/config.ts - add TUI preferences
export interface TUIConfig {
  enabled: boolean;
  theme: 'light' | 'dark' | 'system';
  animations: boolean;
  compactMode: boolean;
  showTokenUsage: boolean;
  showMessageLog: boolean;
}

export async function getTUIConfig(): Promise<TUIConfig> {
  // Read from config file or env vars
  return {
    enabled: process.env.STRUKTUR_TUI !== 'false',
    theme: (process.env.STRUKTUR_THEME as TUIConfig['theme']) || 'system',
    animations: process.env.STRUKTUR_ANIMATIONS !== 'false',
    compactMode: process.env.STRUKTUR_COMPACT === 'true',
    showTokenUsage: true,
    showMessageLog: process.env.STRUKTUR_SHOW_LOG === 'true',
  };
}
```

---

## Backward Compatibility

The TUI enhancement maintains full backward compatibility:

1. **Existing scripts work unchanged** - TUI only activates in interactive terminals
2. **CI/CD unaffected** - Automatic detection disables TUI in CI environments  
3. **--no-tui flag** - Force traditional CLI mode
4. **Same exit codes** - TUI and traditional modes return identical exit codes
5. **Same output format** - JSON output remains consistent
6. **All existing options work** - No changes to CLI argument parsing

---

## Usage Examples

### Interactive Mode (auto-detected)
```bash
struktur extract-file --input document.pdf --schema schema.json
# TUI launches with progress bars and real-time updates
```

### CI Mode (auto-detected)
```bash
struktur extract-file --input document.pdf --schema schema.json
# Traditional CLI output (no TUI in CI environment)
```

### Force Traditional Mode
```bash
struktur extract-file --input document.pdf --schema schema.json --no-tui
# Always uses traditional CLI
```

### Interactive with Missing Inputs
```bash
struktur extract-file
# TUI prompts for: input file, schema, model, strategy
```

---

## Summary

This plan transforms Struktur from a traditional CLI into a modern, interactive TUI tool while maintaining complete backward compatibility. The Ink-based React components provide a familiar development experience, while the environment detection ensures CI/CD pipelines continue to work seamlessly. Real-time progress tracking leverages the existing event system, showing users exactly what's happening during long-running extractions.

The modular architecture allows incremental implementation, with each phase building on the previous. The component-based design makes the TUI highly testable and maintainable.
