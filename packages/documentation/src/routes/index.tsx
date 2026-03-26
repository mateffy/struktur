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

function CommandRow({
  label,
  command,
  isPlain,
}: {
  label?: string;
  command: string;
  isPlain?: boolean;
}) {
  return (
    <div style={{ marginBottom: label ? "20px" : "0" }}>
      {label && (
        <div
          style={{
            fontSize: "12px",
            color: "#a0926f",
            marginBottom: "6px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {label}
        </div>
      )}
      <div
        className="command-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "15px",
            color: "#3d2b15",
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
            whiteSpace: isPlain ? "pre-wrap" : "nowrap",
            flexWrap: isPlain ? "wrap" : "nowrap",
          }}
        >
          <span style={{ color: "#bba88a", userSelect: "none" }}>$</span>
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
    <div
      className={className}
      style={{
        backgroundColor: "#ede5d8",
        borderRadius: "16px",
        padding: "24px",
        ...style,
      }}
    >
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
      style={{
        backgroundColor: "#ede5d8",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        minHeight: "120px",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            color: "#c4b49a",
            opacity: 0.09,
            zIndex: 0,
            transform: "scale(6) translate(0.4rem, 0.3rem)",
            transformOrigin: "bottom right",
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 500,
          color: "#2d1b0e",
          marginBottom: "6px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          color: "#a0926f",
          lineHeight: 1.5,
          position: "relative",
          zIndex: 1,
        }}
      >
        {description}
      </div>
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
        <div style={{ paddingLeft: "20px" }}>
          <div>
            <span style={{ color: "#7a5c3a" }}>"invoice_nr"</span>: <span>"INV-123"</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"customer"</span>:{" "}
            <span style={{ color: "#bba88a" }}>{"{"}</span>
            ...
            <span style={{ color: "#bba88a" }}>{"}"}</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"grand_total"</span>: <span>1283.21</span>
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
        <div style={{ paddingLeft: "20px" }}>
          <div>
            <span style={{ color: "#7a5c3a" }}>"name"</span>: <span>"Jane Smith"</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"skills"</span>:{" "}
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
        <div style={{ paddingLeft: "20px" }}>
          <div>
            <span style={{ color: "#7a5c3a" }}>"title"</span>: <span>"Wireless Headphones"</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"price"</span>: <span>299.99</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"in_stock"</span>:{" "}
            <span style={{ color: "#a0926f" }}>true</span>
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
        <div style={{ paddingLeft: "20px" }}>
          <div>
            <span style={{ color: "#7a5c3a" }}>"action_items"</span>:{" "}
            <span>["Update docs", "Schedule review"]</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"decisions"</span>:{" "}
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
        <div style={{ paddingLeft: "20px" }}>
          <div>
            <span style={{ color: "#7a5c3a" }}>"parties"</span>:{" "}
            <span>["Acme Corp", "Beta Ltd"]</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"start_date"</span>: <span>"2026-01-15"</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"value"</span>: <span>48000</span>
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
        <span style={{ color: "#bba88a", userSelect: "none" }}>$</span>
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
            style={{
              display: "inline-block",
              width: "1ch",
              textAlign: "center",
            }}
          >
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
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5efe6",
        fontFamily: "Inter, sans-serif",
        color: "#2d1b0e",
        position: "relative",
      }}
    >
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
            style={{
              fontSize: "14px",
              color: "#7a5c3a",
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
            onMouseOver={(e) => ((e.target as HTMLAnchorElement).style.color = "#2d1b0e")}
            onMouseOut={(e) => ((e.target as HTMLAnchorElement).style.color = "#7a5c3a")}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="homepage-container">
        {/* Hero */}
        <section
          className="hero-section"
          style={{
            paddingTop: "40px",
            paddingBottom: "80px",
          }}
        >
          <LogoAnimation size={200} className="hero-image" />
          <div style={{ paddingTop: "8px" }} className="w-full">
            <div
              style={{
                fontSize: "14px",
                color: "#a0926f",
                fontStyle: "italic",
                marginBottom: "8px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              /jtrʊkˈtuːr/
            </div>
            <h1
              className="hero-title"
              style={{
                fontSize: "62px",
                fontWeight: 600,
                lineHeight: 1,
                color: "#2d1b0e",
                margin: "0 0 20px 0",
                fontFamily: "Inter, sans-serif",
                letterSpacing: "-2px",
              }}
            >
              struktur
            </h1>
            <p
              className="hero-subtitle"
              style={{
                fontSize: "20px",
                lineHeight: 1.7,
                color: "#3d2b15",
                margin: 0,
                fontFamily: "Inter, sans-serif",
              }}
            >
              <strong style={{ fontWeight: 600 }}>
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
        <section style={{ paddingBottom: "80px" }}>
          <h2
            className="section-title"
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Extract data in your command line
          </h2>
          <Card style={{}} className="terminal-container">
            <TerminalDemo />
          </Card>
        </section>

        {/* Quickstart */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
            className="section-title"
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
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
            <div style={{ marginTop: "24px" }}>
              <a
                href="/docs/quickstart"
                style={{
                  fontSize: "16px",
                  color: "#3d2b15",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                Read the full quickstart →
              </a>
            </div>
          </Card>
        </section>

        {/* Features */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
            className="section-title"
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
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
        <section style={{ paddingBottom: "80px" }}>
          <h2
            className="section-title"
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
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
                <div key={step} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      backgroundColor: "#e5dccf",
                      borderRadius: "10px",
                      padding: "10px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      flex: 1,
                      minHeight: "58px",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#2d1b0e",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {step}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#a0926f",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {sub}
                    </div>
                  </div>
                  {arrow && (
                    <div
                      style={{
                        color: "#c4b49a",
                        fontSize: "18px",
                        flexShrink: 0,
                      }}
                    >
                      {arrow}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "#7a5c3a",
                margin: "0 0 16px",
                lineHeight: 1.6,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Before extracting, Struktur normalizes your raw data into the{" "}
              <a
                href="/docs/explanation/artifact-format"
                style={{ color: "#3d2b15", fontWeight: 500, textDecoration: "none" }}
              >
                Artifact format
              </a>
              , which is then given to the extraction strategy you picked. Here the data is chunked
              and given to the LLM, which extracts data in your schema and automatically retries on
              validation errors.
            </p>
            <a
              href="/docs/explanation/pipeline"
              style={{
                fontSize: "14px",
                color: "#3d2b15",
                textDecoration: "none",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
              }}
            >
              Extraction pipeline explained →
            </a>
          </Card>
        </section>

        {/* Parsers */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
            className="section-title"
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Prepare any filetype for LLMs
          </h2>
          <Card>
            <p
              style={{
                fontSize: "14px",
                color: "#7a5c3a",
                margin: "0 0 20px",
                lineHeight: 1.6,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Struktur's parser layer converts files into Artifacts before extraction. PDF, plain
              text, and images work out of the box. Register custom parsers for any MIME type using
              an npm package or a shell command.
            </p>

            {/* Built-in vs custom split */}
            <div className="parser-grid">
              <div
                style={{
                  backgroundColor: "#e5dccf",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#a0926f",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
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
                    style={{
                      marginBottom: "8px",
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ color: "#a0926f", flexShrink: 0 }}>{icon}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                      <div
                        style={{
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          fontSize: "12px",
                          color: "#3d2b15",
                        }}
                      >
                        {mime}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#a0926f",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  backgroundColor: "#e5dccf",
                  borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#a0926f",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    marginBottom: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  adding custom parsers
                </div>
                <div
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: "11px",
                    color: "#3d2b15",
                    marginBottom: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "#bba88a" }}>$</span> struktur config parsers add ...
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
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#a0926f",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {type}
                    </div>
                    <div
                      style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: "11px",
                        color: "#3d2b15",
                      }}
                    >
                      {cmd}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "13px",
                color: "#3d2b15",
                backgroundColor: "#e5dccf",
                borderRadius: "10px",
                padding: "14px 16px",
                lineHeight: 1.7,
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  color: "#a0926f",
                  fontSize: "11px",
                  marginBottom: "6px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Register a Word document parser
              </div>
              <div>
                <span style={{ color: "#a0926f" }}>$</span> struktur config parsers add \
              </div>
              <div style={{ paddingLeft: "16px" }}>--mime application/msword \</div>
              <div style={{ paddingLeft: "16px" }}>
                --file-command <span style={{ color: "#7a5c3a" }}>"markitdown FILE_PATH"</span>
              </div>
            </div>

            <a
              href="/docs/explanation/document-parsing"
              style={{
                fontSize: "14px",
                color: "#3d2b15",
                textDecoration: "none",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
              }}
            >
              Parser system explained →
            </a>
          </Card>
        </section>

        {/* TypeScript SDK */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
            className="section-title"
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Integrate into your application using the TypeScript SDK
          </h2>
          <Card>
            <CommandRow label="Install the SDK" command="npm install @struktur/sdk" />
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "13px",
                color: "#3d2b15",
                lineHeight: 1.7,
                backgroundColor: "#e5dccf",
                borderRadius: "10px",
                padding: "16px",
                marginTop: "12px",
              }}
            >
              <div>
                <span style={{ color: "#a0926f" }}>import</span> {"{ extract, simple, parse }"}{" "}
                <span style={{ color: "#a0926f" }}>from</span>{" "}
                <span style={{ color: "#7a5c3a" }}>'@struktur/sdk'</span>;
              </div>
              <div>
                <span style={{ color: "#a0926f" }}>import</span> {"{ openai }"}{" "}
                <span style={{ color: "#a0926f" }}>from</span>{" "}
                <span style={{ color: "#7a5c3a" }}>'@ai-sdk/openai'</span>;
              </div>
              <div style={{ marginTop: "12px", color: "#a0926f" }}>
                {"// Parse a raw buffer into Artifacts"}
              </div>
              <div>
                <span style={{ color: "#a0926f" }}>const</span> artifacts ={" "}
                <span style={{ color: "#a0926f" }}>await</span>{" "}
                <span style={{ fontWeight: 600 }}>parse(</span>
              </div>
              <div style={{ paddingLeft: "16px" }}>
                {"{ kind: "}
                <span style={{ color: "#7a5c3a" }}>'buffer'</span>
                {", buffer, mimeType: "}
                <span style={{ color: "#7a5c3a" }}>'application/pdf'</span>
                {" },"}
              </div>
              <div style={{ paddingLeft: "16px" }}>{"{ includeImages: true }"}</div>
              <div>
                <span style={{ fontWeight: 600 }}>)</span>;
              </div>
              <div style={{ marginTop: "8px", color: "#a0926f" }}>
                {"// Run extraction with your chosen strategy"}
              </div>
              <div>
                <span style={{ color: "#a0926f" }}>const</span> result ={" "}
                <span style={{ color: "#a0926f" }}>await</span>{" "}
                <span style={{ fontWeight: 600 }}>extract(</span>
                {"{"}
              </div>
              <div style={{ paddingLeft: "16px" }}>artifacts,</div>
              <div style={{ paddingLeft: "16px" }}>schema: {"{"}</div>
              <div style={{ paddingLeft: "32px" }}>
                <span style={{ color: "#7a5c3a" }}>type</span>:{" "}
                <span style={{ color: "#7a5c3a" }}>'object'</span>,
              </div>
              <div style={{ paddingLeft: "32px" }}>
                properties: {"{"} invoice_nr: {"{ "} <span style={{ color: "#7a5c3a" }}>type</span>:{" "}
                <span style={{ color: "#7a5c3a" }}>'string'</span> {" }"}, total: {"{ "}{" "}
                <span style={{ color: "#7a5c3a" }}>type</span>:{" "}
                <span style={{ color: "#7a5c3a" }}>'number'</span> {" }"} {"}"}
              </div>
              <div style={{ paddingLeft: "16px" }}>{"}"},</div>
              <div style={{ paddingLeft: "16px" }}>
                strategy: <span style={{ fontWeight: 600 }}>simple(</span>
                {"{ model: openai("}
                <span style={{ color: "#7a5c3a" }}>'gpt-4o-mini'</span>
                {") }"}
                <span style={{ fontWeight: 600 }}>)</span>,
              </div>
              <div>
                {"}"}
                <span style={{ fontWeight: 600 }}>)</span>;
              </div>
              <div style={{ marginTop: "8px", color: "#a0926f" }}>
                {"// result.data is fully typed from your schema"}
              </div>
            </div>
            <div style={{ marginTop: "16px" }}>
              <a
                href="/docs/sdk/installation"
                style={{
                  fontSize: "14px",
                  color: "#3d2b15",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                SDK reference →
              </a>
            </div>
          </Card>
        </section>

        {/* Call to action */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
            className="section-title"
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Ready to extract structured data?
          </h2>
          <Card>
            <div className="cta-grid">
              {/* Left: Quickstart */}
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#2d1b0e",
                    marginBottom: "16px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Quickstart
                </h3>
                <div style={{ marginBottom: "20px" }}>
                  <CommandRow label="Install globally" command="npm install -g @struktur/cli" />
                  <CommandRow
                    label="Extract data from any file"
                    command='struktur --input invoice.pdf --fields "total:number"'
                  />
                </div>
                <a
                  href="/docs/quickstart"
                  style={{
                    fontSize: "14px",
                    color: "#3d2b15",
                    textDecoration: "none",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Full quickstart guide →
                </a>
              </div>

              {/* Right: Documentation */}
              <div className="cta-right-column">
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#2d1b0e",
                    marginBottom: "12px",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Documentation
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#7a5c3a",
                    marginBottom: "20px",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.6,
                  }}
                >
                  Explore extraction strategies, parser configuration, SDK integration, and advanced
                  features.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <a
                    href="/docs/explanation/strategies"
                    style={{
                      fontSize: "13px",
                      color: "#3d2b15",
                      textDecoration: "none",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    → Choosing a strategy
                  </a>
                  <a
                    href="/docs/explanation/document-parsing"
                    style={{
                      fontSize: "13px",
                      color: "#3d2b15",
                      textDecoration: "none",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    → Parser system
                  </a>
                  <a
                    href="/docs/sdk/installation"
                    style={{
                      fontSize: "13px",
                      color: "#3d2b15",
                      textDecoration: "none",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                    }}
                  >
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
        style={{
          borderTop: "1px solid rgba(102, 102, 102, 0.15)",
          padding: "32px 40px",
          maxWidth: "950px",
          margin: "0 auto",
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div className="flex flex-col gap-2">
          <div
            style={{
              fontSize: "13px",
              color: "#a0926f",
              fontFamily: "Inter, sans-serif",
            }}
          >
            struktur by{" "}
            <a
              href="https://mateffy.org"
              style={{ color: "#7a5c3a", textDecoration: "none", fontWeight: 500 }}
            >
              Lukas Mateffy
            </a>
          </div>

          <div className="opacity-80">
            <a href="https://smollaunch.com" target="_blank" rel="noopener">
              <img
                src="https://smollaunch.com/badges/featured.svg"
                alt="Featured on Smol Launch"
                loading="lazy"
                width="250"
                height="60"
              />
            </a>
            <a
              href="https://ufind.best/products/struktur?utm_source=ufind.best"
              target="_blank"
              rel="noopener"
            >
              <img
                src="https://ufind.best/badges/ufind-best-badge-light.svg"
                alt="Featured on ufind.best"
                width="150"
              />
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
              style={{
                fontSize: "13px",
                color: "#7a5c3a",
                textDecoration: "none",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
