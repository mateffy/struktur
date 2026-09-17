import { createFileRoute } from "@tanstack/react-router";
import { LogoAnimation } from "@/components/LogoAnimation";
import {
  Copy,
  FileText,
  AlignLeft,
  Image,
  Braces,
  Zap,
  Layers,
  CheckCircle,
  Code,
  FileImage,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      {
        title: "Struktur - Structured Data Extraction",
      },
      {
        name: "description",
        content:
          "All-in-one tool for structured data extraction. Turn documents into validated JSON with AI. CLI and SDK for TypeScript.",
      },
      {
        property: "og:title",
        content: "Struktur - Structured Data Extraction",
      },
      {
        property: "og:description",
        content:
          "All-in-one tool for structured data extraction. Turn documents into validated JSON with AI.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://struktur.sh",
      },
      {
        property: "og:image",
        content: "https://struktur.sh/og.webp",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Struktur - Structured Data Extraction",
      },
      {
        name: "twitter:description",
        content:
          "All-in-one tool for structured data extraction. Turn documents into validated JSON with AI.",
      },
      {
        name: "twitter:image",
        content: "https://struktur.sh/og.webp",
      },
    ],
    links: [{ rel: "canonical", href: "https://struktur.sh" }],
  }),
});

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px",
        color: copied ? "#a0926f" : "#bba88a",
        flexShrink: 0,
      }}
      title="Copy"
    >
      <Copy size={14} />
    </button>
  );
}

function CommandRow({ label, command }: { label?: string; command: string }) {
  return (
    <div className={label ? "mb-5" : undefined}>
      {label && <div className="text-caption mb-1.5">{label}</div>}
      <div className="command-row">
        <div className="text-command flex items-start gap-1.5">
          <span className="text-faint select-none">$</span>
          <span>{command}</span>
        </div>
        <CopyButton text={command} />
      </div>
    </div>
  );
}

function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={className ? `surface-card ${className}` : "surface-card"} style={style}>
      {children}
    </div>
  );
}

function FeatureCard({
  label,
  description,
  icon,
  style,
}: {
  label: string;
  description: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="surface-card relative flex min-h-[120px] flex-col justify-start overflow-hidden"
      style={style}
    >
      {icon && (
        <div
          className="text-watermark absolute right-2.5 bottom-2.5 z-0 opacity-[0.09]"
          style={{ "transform": "scale(6) translate(0.4rem, 0.3rem)", "transformOrigin": "bottom right" }}
        >
          {icon}
        </div>
      )}
      <div className="text-feature-label relative z-[1] mb-1.5">{label}</div>
      <div className="text-copy relative z-[1]">{description}</div>
    </div>
  );
}

// Braille spinner frames
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

type AnimPhase = "typing" | "spinner" | "output" | "pause";

interface Example {
  command: string;
  output: React.ReactNode;
}

const EXAMPLES: Example[] = [
  {
    command: "struktur extract --input invoice.pdf --schema invoice.json",
    output: (
      <>
        <div>{"{"}</div>
        <div className="pl-5" >
          <div>
            <span className="text-accent" >"invoice_nr"</span>: <span>"INV-123"</span>,
          </div>
          <div>
            <span className="text-accent" >"customer"</span>:{" "}
            <span className="text-faint" >{"{"}</span>
            ...
            <span className="text-faint" >{"}"}</span>,
          </div>
          <div>
            <span className="text-accent" >"grand_total"</span>: <span>1283.21</span>
          </div>
        </div>
        <div>{"}"}</div>
      </>
    ),
  },
  {
    command: 'struktur extract --input resume.pdf --fields "name:string,skills:array{string}"',
    output: (
      <>
        <div>{"{"}</div>
        <div className="pl-5" >
          <div>
            <span className="text-accent" >"name"</span>: <span>"Jane Smith"</span>,
          </div>
          <div>
            <span className="text-accent" >"skills"</span>:{" "}
            <span>["React", "TypeScript", "Node.js"]</span>
          </div>
        </div>
        <div>{"}"}</div>
      </>
    ),
  },
  {
    command: "struktur extract --input https://example.com/product.html --schema product.json",
    output: (
      <>
        <div>{"{"}</div>
        <div className="pl-5" >
          <div>
            <span className="text-accent" >"title"</span>: <span>"Wireless Headphones"</span>,
          </div>
          <div>
            <span className="text-accent" >"price"</span>: <span>299.99</span>,
          </div>
          <div>
            <span className="text-accent" >"in_stock"</span>:{" "}
            <span className="text-subtle" >true</span>
          </div>
        </div>
        <div>{"}"}</div>
      </>
    ),
  },
  {
    command:
      'struktur extract --input meeting.txt --strategy parallel --fields "action_items:array{string},decisions:array{string}"',
    output: (
      <>
        <div>{"{"}</div>
        <div className="pl-5" >
          <div>
            <span className="text-accent" >"action_items"</span>:{" "}
            <span>["Update docs", "Schedule review"]</span>,
          </div>
          <div>
            <span className="text-accent" >"decisions"</span>:{" "}
            <span>["Use PostgreSQL", "Deploy Friday"]</span>
          </div>
        </div>
        <div>{"}"}</div>
      </>
    ),
  },
  {
    command:
      'struktur extract --input contract.docx --fields "parties:array{string},start_date,value:number"',
    output: (
      <>
        <div>{"{"}</div>
        <div className="pl-5" >
          <div>
            <span className="text-accent" >"parties"</span>:{" "}
            <span>["Acme Corp", "Beta Ltd"]</span>,
          </div>
          <div>
            <span className="text-accent" >"start_date"</span>: <span>"2026-01-15"</span>,
          </div>
          <div>
            <span className="text-accent" >"value"</span>: <span>48000</span>
          </div>
        </div>
        <div>{"}"}</div>
      </>
    ),
  },
];

const TYPING_SPEED_MS = 38; // ms per character
const SPINNER_DURATION_MS = 2400;
const OUTPUT_PAUSE_MS = 2500;
const FADE_OUT_DURATION_MS = 400;

function TerminalDemo() {
  const [phase, setPhase] = useState<AnimPhase>("typing");
  const [typedLen, setTypedLen] = useState(0);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExample = EXAMPLES[exampleIndex];

  // Reset when example changes
  useEffect(() => {
    setPhase("typing");
    setTypedLen(0);
    setSpinnerFrame(0);
  }, [exampleIndex]);

  const clear = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    const run = () => {
      // Phase 1: typing
      setPhase("typing");
      setTypedLen(0);
      let i = 0;
      const type = () => {
        i++;
        setTypedLen(i);
        if (i < currentExample.command.length) {
          timeoutRef.current = setTimeout(type, TYPING_SPEED_MS);
        } else {
          // Phase 2: spinner
          timeoutRef.current = setTimeout(() => {
            setPhase("spinner");
            let frame = 0;
            intervalRef.current = setInterval(() => {
              frame = (frame + 1) % SPINNER_FRAMES.length;
              setSpinnerFrame(frame);
            }, 80);
            timeoutRef.current = setTimeout(() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              // Phase 3: output
              setPhase("output");
              timeoutRef.current = setTimeout(() => {
                // Phase 4: fade out then restart with next example
                setPhase("pause");
                timeoutRef.current = setTimeout(() => {
                  setExampleIndex((prev) => (prev + 1) % EXAMPLES.length);
                  run();
                }, FADE_OUT_DURATION_MS);
              }, OUTPUT_PAUSE_MS);
            }, SPINNER_DURATION_MS);
          }, 120);
        }
      };
      timeoutRef.current = setTimeout(type, TYPING_SPEED_MS);
    };

    run();
    return clear;
  }, [exampleIndex]);

  const commandStyle: React.CSSProperties = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "17px",
    fontWeight: 500,
    color: "#3d2b15",
    lineHeight: 1.8,
  };

  const outputStyle: React.CSSProperties = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "13px",
    color: "#3d2b15",
    lineHeight: 1.8,
  };

  const fadeInAnimation: React.CSSProperties = {
    animation: "fade-in-up 0.3s ease-out forwards",
  };

  const fadeOutAnimation: React.CSSProperties = {
    animation: `fade-out ${FADE_OUT_DURATION_MS}ms ease-out forwards`,
  };

  return (
    <div>
      {/* Command line */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "baseline",
          ...commandStyle,
        }}
      >
        <span className="text-faint select-none" >$</span>
        <span style={phase === "pause" ? fadeOutAnimation : {}}>
          {currentExample.command.slice(0, typedLen)}
          {(phase === "typing" || phase === "output") && (
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "1.1em",
                backgroundColor: "#bba88a",
                marginLeft: "1px",
                marginBottom: "1px",
                verticalAlign: "text-bottom",
                animation:
                  phase === "typing"
                    ? "terminal-cursor-solid 0.05s step-end infinite"
                    : "terminal-cursor-blink 1.2s step-end infinite",
              }}
            />
          )}
        </span>
      </div>

      {/* Spinner line */}
      {phase === "spinner" && (
        <div
          style={{
            color: "#bba88a",
            marginTop: "12px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            ...outputStyle,
            ...fadeInAnimation,
          }}
        >
          <span
            
          className="inline-block w-[1ch] text-center" >
            {SPINNER_FRAMES[spinnerFrame]}
          </span>
          <span>Extracting data...</span>
        </div>
      )}

      {/* JSON output */}
      {(phase === "output" || phase === "pause") && (
        <div
          style={{
            marginTop: "12px",
            ...outputStyle,
            ...(phase === "output" ? fadeInAnimation : fadeOutAnimation),
          }}
        >
          {currentExample.output}
        </div>
      )}
    </div>
  );
}

function Home() {
  return (
    <div
      
    className="min-h-[100vh] bg-paper font-brand text-ink relative" >
      {/* Top nav - absolute positioned, right-aligned, vertical */}
      <nav className="navbar-desktop">
        {[
          { label: "Documentation", href: "/docs" },
          { label: "Blog", href: "/blog" },
          { label: "Comparisons", href: "/compare" },
          { label: "GitHub", href: "https://github.com/mateffy/struktur" },
          { label: "Made by Lukas Mateffy", href: "https://mateffy.org" },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            
            onMouseOver={(e) => ((e.target as HTMLAnchorElement).style.color = "#2d1b0e")}
            onMouseOut={(e) => ((e.target as HTMLAnchorElement).style.color = "#7a5c3a")}
          className="text-[14px] text-accent no-underline font-brand font-medium" >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="homepage-container">
        {/* Hero */}
        <section
          className="hero-section pt-10 max-sm:pt-6 pb-20 max-sm:pb-12"
          
        >
          <LogoAnimation size={200} className="hero-image" />
          <div  className="w-full pt-2">
            <div
              
            className="text-size-14 text-subtle italic mb-2 font-brand" >
              /jtrʊkˈtuːr/
            </div>
            <h1
              className="text-size-62 font-semibold leading-[1] text-ink font-brand tracking-[-2px]"
              style={{ "margin": "0 0 20px 0" }}
            >
              struktur
            </h1>
            <p
              className="text-size-20 leading-[1.7] text-body font-brand"
              style={{ "margin": "0" }}
            >
              <strong className="font-semibold" >
                All-in-one tool for structured data extraction.
              </strong>
              <br />
              Feed it any document — PDF, text, or custom format.
              <br />
              Get back validated, schema-typed JSON.
            </p>
          </div>
        </section>

        {/* CLI Demo */}
        <section className="pb-20 max-sm:pb-12" >
          <h2
            className="text-size-22 font-semibold text-ink mb-5 font-brand"
            
          >
            Extract data in your command line
          </h2>
          <Card  className="terminal-container">
            <TerminalDemo />
          </Card>
        </section>

        {/* Quickstart */}
        <section className="pb-20 max-sm:pb-12" >
          <h2
            className="text-size-22 font-semibold text-ink mb-5 font-brand"
            
          >
            Installation & Quickstart
          </h2>
          <Card>
            <CommandRow label="Install globally" command="npm install -g @struktur/cli" />
            <CommandRow
              label="Store your API key and set a default model in one step"
              command='struktur config providers add openai --token "sk-..." --default'
            />
            <CommandRow
              label="Extract structured data from any file"
              command='struktur --input invoice.pdf --fields "number, vendor, total:number"'
            />
            <div className="mt-6" >
              <a
                href="/docs/quickstart"
                
              className="text-size-16 text-body no-underline font-brand font-medium" >
                Read the full quickstart →
              </a>
            </div>
          </Card>
        </section>

        {/* Features */}
        <section className="pb-20 max-sm:pb-12" >
          <h2
            className="text-size-22 font-semibold text-ink mb-5 font-brand"
            
          >
            Features
          </h2>

          {/* Row 1 */}
          <div className="feature-grid-2-1">
            <FeatureCard
              label="Extraction strategies for any kind of document"
              description="Choose how Struktur processes your document: single-shot for simple inputs, parallel chunking for large files, sequential pass for context-dependent extraction, or double-pass refinement for higher accuracy. Auto-merge strategies deduplicate results across chunks automatically."
              icon={<Layers size={20} />}
            />
            <FeatureCard
              label="Use any LLM"
              description="OpenAI, Anthropic, Google, Mistral, OpenRouter, OpenCode Zen, and more. Switch with a single flag or by configuring default models."
              icon={<Zap size={20} />}
            />
          </div>

          {/* Row 2 */}
          <div className="feature-grid-1-1">
            <FeatureCard
              label="Built-in file parsing"
              description='Pass a PDF, image, or text file — Struktur makes it LLM-ready before extraction, including embedded images and full-page "screenshots". Add your own parser easily.'
              icon={<FileText size={20} />}
            />
            <FeatureCard
              label="Schema validation with auto-retry"
              description="Every LLM response is thoroughly validated against your schema. Validation errors are fed back to the model automatically, letting it fix its own mistakes."
              icon={<CheckCircle size={20} />}
            />
          </div>

          {/* Row 3 */}
          <div className="feature-grid-1-1-1">
            <FeatureCard
              label="Fields shorthand"
              description={`Extract data on the fly without writing a verbose JSON schema. Use the --fields flag with the shorthand syntax for one-off extractions or experimentation.`}
              icon={<Code size={20} />}
            />
            <FeatureCard
              label="TypeScript SDK"
              description="Integrate Struktur into your applications using the fully typed SDK. Everything is just JavaScript, so it works with any runtime."
              icon={<Braces size={20} />}
            />
            <FeatureCard
              label="Embedded media support"
              description="File parsing renders document pages as images so the LLM sees tables, charts, and photos in context. It can even reference visual elements in the output data."
              icon={<FileImage size={20} />}
            />
          </div>
        </section>

        {/* How it works */}
        <section className="pb-20 max-sm:pb-12" >
          <h2
            className="text-size-22 font-semibold text-ink mb-5 font-brand"
            
          >
            How it works
          </h2>
          <Card>
            {/* Pipeline steps */}
            <div className="pipeline-grid">
              {[
                { step: "Raw Input", sub: "Files, Text or Images", arrow: "→" },
                { step: "Artifact", sub: "Text + Images", arrow: "→" },
                { step: "Extract", sub: "Your chosen strategy", arrow: "→" },
                { step: "Structured Data", sub: "JSON in your schema", arrow: null },
              ].map(({ step, sub, arrow }) => (
                <div key={step} className="flex items-center gap-3" >
                  <div
                    
                  className="bg-sand rounded-[10px] py-2.5 px-4 flex flex-col gap-0.5 flex-1 min-h-[58px] justify-center" >
                    <div
                      
                    className="text-size-13 font-semibold text-ink font-brand" >
                      {step}
                    </div>
                    <div
                      
                    className="text-size-11 text-subtle font-brand" >
                      {sub}
                    </div>
                  </div>
                  {arrow && (
                    <div
                      
                    className="text-watermark text-[18px] shrink-0" >
                      {arrow}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p
              className="text-size-14 text-accent leading-[1.6] font-brand" style={{ "margin": "0 0 16px" }}
            >
              Before extracting, Struktur normalizes your raw data into the{" "}
              <a
                href="/docs/explanation/artifact-format"
                
              className="text-body font-medium no-underline" >
                Artifact format
              </a>
              , which is then given to the extraction strategy you picked. Here the data is chunked
              and given to the LLM, which extracts data in your schema and automatically retries on
              validation errors.
            </p>
            <a
              href="/docs/explanation/pipeline"
              
            className="text-size-14 text-body no-underline font-brand font-medium" >
              Extraction pipeline explained →
            </a>
          </Card>
        </section>

        {/* Parsers */}
        <section className="pb-20 max-sm:pb-12" >
          <h2
            className="text-size-22 font-semibold text-ink mb-5 font-brand"
            
          >
            Prepare any filetype for LLMs
          </h2>
          <Card>
            <p
              className="text-size-14 text-accent leading-[1.6] font-brand" style={{ "margin": "0 0 20px" }}
            >
              Struktur's parser layer converts files into Artifacts before extraction. PDF, plain
              text, and images work out of the box. Register custom parsers for any MIME type using
              an npm package or a shell command.
            </p>

            {/* Built-in vs custom split */}
            <div className="parser-grid">
              <div
                
              className="bg-sand rounded-[10px] p-4" >
                <div
                  
                className="text-size-12 text-subtle font-brand font-semibold mb-2.5 uppercase tracking-[0.05em]" >
                  Built-in Parsers
                </div>
                {[
                  {
                    mime: "application/pdf",
                    note: "text + images per page",
                    icon: <FileText size={13} />,
                  },
                  {
                    mime: "text/*",
                    note: "split into content slices",
                    icon: <AlignLeft size={13} />,
                  },
                  { mime: "image/*", note: "passed as media artifact", icon: <Image size={13} /> },
                  {
                    mime: "application/json",
                    note: "treated as text unless it's valid Artifact data",
                    icon: <Braces size={13} />,
                  },
                ].map(({ mime, note, icon }) => (
                  <div
                    key={mime}
                    
                  className="mb-2 flex gap-3 items-center" >
                    <div className="text-subtle shrink-0" >{icon}</div>
                    <div className="flex flex-col gap-[1px]" >
                      <div
                        
                      className="font-code text-size-12 text-body" >
                        {mime}
                      </div>
                      <div
                        
                      className="text-size-11 text-subtle font-brand" >
                        {note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                
              className="bg-sand rounded-[10px] p-4" >
                <div
                  
                className="text-size-12 text-subtle font-brand font-semibold mb-2.5 uppercase tracking-[0.05em]" >
                  adding custom parsers
                </div>
                <div
                  
                className="font-code text-size-11 text-body mb-3 leading-[1.5]" >
                  <span className="text-faint" >$</span> struktur config parsers add ...
                </div>
                {[
                  {
                    type: "NPM Package",
                    cmd: "--npm @myorg/docx-parser",
                  },
                  {
                    type: "Shell Command (using path)",
                    cmd: '--file-command "markitdown FILE_PATH"',
                  },
                  {
                    type: "Shell Command (using stdin)",
                    cmd: '--stdin-command "my-html-tool"',
                  },
                ].map(({ type, cmd }) => (
                  <div
                    key={type}
                    
                  className="mb-2.5 flex flex-col gap-[1px]" >
                    <div
                      
                    className="text-size-11 text-subtle font-brand" >
                      {type}
                    </div>
                    <div
                      
                    className="font-code text-size-11 text-body" >
                      {cmd}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              
            className="font-code text-size-13 text-body bg-sand rounded-[10px] py-3.5 px-4 leading-[1.7] mb-4" >
              <div
                
              className="text-subtle text-size-11 mb-1.5 font-brand" >
                Register a Word document parser
              </div>
              <div>
                <span className="text-subtle" >$</span> struktur config parsers add \
              </div>
              <div className="pl-4" >--mime application/msword \</div>
              <div className="pl-4" >
                --file-command <span className="text-accent" >"markitdown FILE_PATH"</span>
              </div>
            </div>

            <a
              href="/docs/explanation/document-parsing"
              
            className="text-size-14 text-body no-underline font-brand font-medium" >
              Parser system explained →
            </a>
          </Card>
        </section>

        {/* TypeScript SDK */}
        <section className="pb-20 max-sm:pb-12" >
          <h2
            className="text-size-22 font-semibold text-ink mb-5 font-brand"
            
          >
            Integrate into your application using the TypeScript SDK
          </h2>
          <Card>
            <CommandRow label="Install the SDK" command="npm install @struktur/sdk" />
            <div
              
            className="font-code text-size-13 text-body leading-[1.7] bg-sand rounded-[10px] p-4 mt-3" >
              <div>
                <span className="text-subtle" >import</span> {"{ extract, simple, parse }"}{" "}
                <span className="text-subtle" >from</span>{" "}
                <span className="text-accent" >'@struktur/sdk'</span>;
              </div>
              <div>
                <span className="text-subtle" >import</span> {"{ openai }"}{" "}
                <span className="text-subtle" >from</span>{" "}
                <span className="text-accent" >'@ai-sdk/openai'</span>;
              </div>
              <div className="mt-3 text-subtle" >
                {"// Parse a raw buffer into Artifacts"}
              </div>
              <div>
                <span className="text-subtle" >const</span> artifacts ={" "}
                <span className="text-subtle" >await</span>{" "}
                <span className="font-semibold" >parse(</span>
              </div>
              <div className="pl-4" >
                {"{ kind: "}
                <span className="text-accent" >'buffer'</span>
                {", buffer, mimeType: "}
                <span className="text-accent" >'application/pdf'</span>
                {" },"}
              </div>
              <div className="pl-4" >{"{ includeImages: true }"}</div>
              <div>
                <span className="font-semibold" >)</span>;
              </div>
              <div className="mt-2 text-subtle" >
                {"// Run extraction with your chosen strategy"}
              </div>
              <div>
                <span className="text-subtle" >const</span> result ={" "}
                <span className="text-subtle" >await</span>{" "}
                <span className="font-semibold" >extract(</span>
                {"{"}
              </div>
              <div className="pl-4" >artifacts,</div>
              <div className="pl-4" >schema: {"{"}</div>
              <div className="pl-8" >
                <span className="text-accent" >type</span>:{" "}
                <span className="text-accent" >'object'</span>,
              </div>
              <div className="pl-8" >
                properties: {"{"} invoice_nr: {"{ "} <span className="text-accent" >type</span>:{" "}
                <span className="text-accent" >'string'</span> {" }"}, total: {"{ "}{" "}
                <span className="text-accent" >type</span>:{" "}
                <span className="text-accent" >'number'</span> {" }"} {"}"}
              </div>
              <div className="pl-4" >{"}"},</div>
              <div className="pl-4" >
                strategy: <span className="font-semibold" >simple(</span>
                {"{ model: openai("}
                <span className="text-accent" >'gpt-4o-mini'</span>
                {") }"}
                <span className="font-semibold" >)</span>,
              </div>
              <div>
                {"}"}
                <span className="font-semibold" >)</span>;
              </div>
              <div className="mt-2 text-subtle" >
                {"// result.data is fully typed from your schema"}
              </div>
            </div>
            <div className="mt-4" >
              <a
                href="/docs/sdk/installation"
                
              className="text-size-14 text-body no-underline font-brand font-medium" >
                SDK reference →
              </a>
            </div>
          </Card>
        </section>

        {/* Call to action */}
        <section className="pb-20 max-sm:pb-12" >
          <h2
            className="text-size-22 font-semibold text-ink mb-5 font-brand"
            
          >
            Ready to extract structured data?
          </h2>
          <Card>
            <div className="cta-grid">
              {/* Left: Quickstart */}
              <div>
                <h3
                  
                className="text-size-16 font-semibold text-ink mb-4 font-brand" >
                  Quickstart
                </h3>
                <div className="mb-5" >
                  <CommandRow label="Install globally" command="npm install -g @struktur/cli" />
                  <CommandRow
                    label="Extract data from any file"
                    command='struktur --input invoice.pdf --fields "total:number"'
                  />
                </div>
                <a
                  href="/docs/quickstart"
                  
                className="text-size-14 text-body no-underline font-brand font-medium" >
                  Full quickstart guide →
                </a>
              </div>

              {/* Right: Documentation */}
              <div className="cta-right-column">
                <h3
                  
                className="text-size-16 font-semibold text-ink mb-3 font-brand" >
                  Documentation
                </h3>
                <p
                  
                className="text-size-14 text-accent mb-5 font-brand leading-[1.6]" >
                  Explore extraction strategies, parser configuration, SDK integration, and advanced
                  features.
                </p>
                <div className="flex flex-col gap-2" >
                  <a
                    href="/docs/explanation/strategies"
                    
                  className="text-size-13 text-body no-underline font-brand font-medium" >
                    → Choosing a strategy
                  </a>
                  <a
                    href="/docs/explanation/document-parsing"
                    
                  className="text-size-13 text-body no-underline font-brand font-medium" >
                    → Parser system
                  </a>
                  <a
                    href="/docs/sdk/installation"
                    
                  className="text-size-13 text-body no-underline font-brand font-medium" >
                    → TypeScript SDK
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer
        className="border-t border-[rgba(102,102,102,0.15)] py-8 px-10 max-w-[950px] flex justify-between flex-wrap gap-4 max-md:flex-col max-md:items-center max-md:text-center max-md:gap-[22px] max-md:px-4 max-md:py-7" style={{ "margin": "0 auto", "alignItems": "start" }}
      >
        <div className="flex flex-col gap-2">
          <div
            
          className="text-[13px] text-muted font-brand" >
            struktur by{" "}
            <a
              href="https://mateffy.org"
              
            className="text-accent no-underline font-medium" >
              Lukas Mateffy
            </a>
          </div>

        </div>
        <nav className="footer-nav">
          {[
            { label: "Documentation", href: "/docs" },
            { label: "Blog", href: "/blog" },
            { label: "Comparisons", href: "/compare" },
            { label: "Quickstart", href: "/docs/quickstart" },
            { label: "Strategies", href: "/docs/explanation/strategies" },
            { label: "Pipeline", href: "/docs/explanation/pipeline" },
            { label: "SDK reference", href: "/docs/sdk/installation" },
            { label: "GitHub", href: "https://github.com/mateffy/struktur" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              
            className="text-[13px] max-sm:text-[14px] text-accent no-underline font-brand font-medium" >
              {link.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
