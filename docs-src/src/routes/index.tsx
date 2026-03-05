import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
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
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
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
  preview,
  style,
}: {
  label: string;
  preview?: React.ReactNode;
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
        justifyContent: "space-between",
        minHeight: "180px",
        ...style,
      }}
    >
      <div style={{ flex: 1 }}>
        {preview}
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 500,
          color: "#2d1b0e",
          marginTop: "20px",
        }}
      >
        {label}
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
    command: "struktur extract --input invoice.txt --schema invoice.json",
    output: (
      <>
        <div>{"{"}</div>
        <div style={{ paddingLeft: "20px" }}>
          <div>
            <span style={{ color: "#7a5c3a" }}>"invoice_nr"</span>:{" "}
            <span>"INV-123"</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"customer"</span>:{" "}
            <span style={{ color: "#bba88a" }}>{"{"}</span>
            ...
            <span style={{ color: "#bba88a" }}>{"}"}</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"grand_total"</span>:{" "}
            <span>1283.21</span>
          </div>
        </div>
        <div>{"}"}</div>
      </>
    ),
  },
  {
    command:
      'struktur extract --input resume.pdf --fields "name:string,skills:array{string}"',
    output: (
      <>
        <div>{"{"}</div>
        <div style={{ paddingLeft: "20px" }}>
          <div>
            <span style={{ color: "#7a5c3a" }}>"name"</span>:{" "}
            <span>"Jane Smith"</span>,
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
    command: "struktur extract --url https://example.com --schema product.json",
    output: (
      <>
        <div>{"{"}</div>
        <div style={{ paddingLeft: "20px" }}>
          <div>
            <span style={{ color: "#7a5c3a" }}>"title"</span>:{" "}
            <span>"Wireless Headphones"</span>,
          </div>
          <div>
            <span style={{ color: "#7a5c3a" }}>"price"</span>:{" "}
            <span>299.99</span>,
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
      "struktur extract --input receipts/ --schema receipt.json --output results.json",
    output: (
      <>
        <div>{"["}</div>
        <div style={{ paddingLeft: "20px" }}>
          <div>{"{"}</div>
          <div style={{ paddingLeft: "20px" }}>
            <span style={{ color: "#7a5c3a" }}>"store"</span>:{" "}
            <span>"Whole Foods"</span>,
          </div>
          <div style={{ paddingLeft: "20px" }}>
            <span style={{ color: "#7a5c3a" }}>"total"</span>:{" "}
            <span>87.43</span>
          </div>
          <div>{"}"}</div>
        </div>
        <div style={{ paddingLeft: "20px", color: "#bba88a" }}>...</div>
        <div>{"]"}</div>
      </>
    ),
  },
];

const TYPING_SPEED_MS = 38; // ms per character
const SPINNER_DURATION_MS = 1200;
const OUTPUT_PAUSE_MS = 3000;
const RESTART_DELAY_MS = 600;

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
                // Phase 4: pause then restart with next example
                setPhase("pause");
                timeoutRef.current = setTimeout(() => {
                  setExampleIndex((prev) => (prev + 1) % EXAMPLES.length);
                  run();
                }, RESTART_DELAY_MS);
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
        <span>
          {currentExample.command.slice(0, typedLen)}
          {phase === "typing" && (
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "1em",
                backgroundColor: "#bba88a",
                marginLeft: "1px",
                verticalAlign: "text-bottom",
                animation: "terminal-cursor-blink 0.7s step-end infinite",
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
            marginTop: "4px",
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
      {phase === "output" && (
        <div style={{ marginTop: "12px", ...outputStyle, ...fadeInAnimation }}>
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
          { label: "GitHub", href: "https://github.com/mateffy/struktur" },
          { label: "Author", href: "https://mateffy.me" },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={{
              fontSize: "14px",
              color: "#7a5c3a",
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#2d1b0e")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLAnchorElement).style.color = "#7a5c3a")
            }
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div
        style={{ maxWidth: "950px", margin: "0 auto", padding: "0 40px 80px" }}
      >
        {/* Hero */}
        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: "60px",
            paddingTop: "40px",
            paddingBottom: "80px",
          }}
        >
          <img
            src="/struktur-icon.png"
            alt="Struktur"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "28px",
              flexShrink: 0,
            }}
          />
          <div style={{ paddingTop: "8px" }}>
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
              style={{
                fontSize: "20px",
                lineHeight: 1.7,
                color: "#3d2b15",
                margin: 0,
                fontFamily: "Inter, sans-serif",
              }}
            >
              <strong>
                Struktur is a tool for structured data extraction.
              </strong>
              <br />
              Turn documents of any size into validated JSON.
              <br />
              Works out of the box and can be customized when needed.
            </p>
          </div>
        </section>

        {/* CLI Demo */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
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
          <Card style={{ height: "222px" }}>
            <TerminalDemo />
          </Card>
        </section>

        {/* Features */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <FeatureCard
              label="Extraction strategies for any kind of document"
              preview={
                <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "4px" }}>
                  {/* Input documents column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
                    {/* Document icon */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{
                        width: "40px", height: "48px", backgroundColor: "#e5dccf",
                        borderRadius: "4px", border: "1.5px solid #c4b49a",
                        display: "flex", flexDirection: "column", justifyContent: "flex-end",
                        padding: "5px", gap: "2px", position: "relative", flexShrink: 0,
                      }}>
                        <div style={{ position: "absolute", top: 0, right: 0, width: "10px", height: "10px", borderLeft: "1.5px solid #c4b49a", borderBottom: "1.5px solid #c4b49a", backgroundColor: "#ede5d8", borderBottomLeftRadius: "2px" }} />
                        {[0,1,2,3].map(i => <div key={i} style={{ height: "2px", backgroundColor: "#c4b49a", borderRadius: "1px", width: i === 3 ? "60%" : "100%" }} />)}
                      </div>
                      <div style={{ fontSize: "10px", color: "#a0926f", textAlign: "center", fontFamily: "Inter, sans-serif", lineHeight: 1.2 }}>Long<br/>Document</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ color: "#c4b49a", fontSize: "16px", flexShrink: 0 }}>→</div>

                  {/* Web article (smaller doc) */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{
                      width: "34px", height: "40px", backgroundColor: "#e5dccf",
                      borderRadius: "4px", border: "1.5px solid #c4b49a",
                      display: "flex", flexDirection: "column", justifyContent: "flex-end",
                      padding: "4px", gap: "2px", position: "relative", flexShrink: 0,
                    }}>
                      <div style={{ position: "absolute", top: 0, right: 0, width: "9px", height: "9px", borderLeft: "1.5px solid #c4b49a", borderBottom: "1.5px solid #c4b49a", backgroundColor: "#ede5d8", borderBottomLeftRadius: "2px" }} />
                      {[0,1,2].map(i => <div key={i} style={{ height: "2px", backgroundColor: "#c4b49a", borderRadius: "1px", width: i === 2 ? "60%" : "100%" }} />)}
                    </div>
                    <div style={{ fontSize: "10px", color: "#a0926f", textAlign: "center", fontFamily: "Inter, sans-serif", lineHeight: 1.2 }}>Web<br/>Article</div>
                  </div>

                  {/* Arrow */}
                  <div style={{ color: "#c4b49a", fontSize: "16px", flexShrink: 0 }}>→</div>

                  {/* Document type variants */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {["Short Article", "Table Data", "Structured Data"].map(t => (
                      <div key={t} style={{ fontSize: "11px", color: "#7a5c3a", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>{t}</div>
                    ))}
                  </div>

                  {/* Arrows from document types */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "2px" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ color: "#c4b49a", fontSize: "14px", lineHeight: "18px" }}>→</div>
                    ))}
                  </div>

                  {/* Strategy icons + labels */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { label: "Parallel strategy" },
                      { label: "Simple strategy" },
                      { label: "Auto-merge strategy" },
                      { label: "Double-pass strategy" },
                    ].map(({ label }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {/* Gear placeholder icon */}
                        <div style={{
                          width: "18px", height: "18px", borderRadius: "50%",
                          border: "2px solid #a0926f",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#a0926f" }} />
                        </div>
                        <span style={{ fontSize: "11px", color: "#7a5c3a", fontFamily: "Inter, sans-serif", fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />
            <FeatureCard
              label="Use any LLM"
              preview={
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: "4px" }}>
                  {[
                    { name: "OpenAI", sub: "GPT-5.3 CODEX", initial: "⊕" },
                    { name: "Gemini", sub: "Gemini 3.1", initial: "◇" },
                    { name: "Mistral\nCodestral", sub: "Codestral", initial: "⊞" },
                    { name: "Anthropic", sub: "Sonnet 4.6", initial: "A\\" },
                  ].map(({ name, sub, initial }) => (
                    <div key={name} style={{
                      backgroundColor: "#e5dccf",
                      borderRadius: "10px",
                      padding: "10px 10px 8px",
                      display: "flex", flexDirection: "column", gap: "4px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{
                          width: "20px", height: "20px", borderRadius: "4px",
                          backgroundColor: "#c4b49a",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", color: "#ede5d8", fontWeight: 700, flexShrink: 0,
                          fontFamily: "ui-monospace, monospace",
                        }}>{initial.split("\\")[0]}</div>
                        <span style={{ fontSize: "12px", color: "#2d1b0e", fontFamily: "Inter, sans-serif", fontWeight: 600, lineHeight: 1.2, whiteSpace: "pre-line" }}>{name}</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "#a0926f", fontFamily: "Inter, sans-serif" }}>{sub}</div>
                    </div>
                  ))}
                </div>
              }
            />
          </div>

          {/* Row 2 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <FeatureCard
              label="Autofix validation errors"
              preview={
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "4px", flexWrap: "wrap" }}>
                  {/* Invalid JSON box */}
                  <div style={{
                    backgroundColor: "#e5dccf", borderRadius: "8px", padding: "8px 10px",
                    border: "1.5px solid #c4b49a", fontFamily: "ui-monospace, monospace",
                    fontSize: "10px", color: "#7a5c3a", lineHeight: 1.6, flexShrink: 0,
                  }}>
                    <div style={{ fontSize: "9px", color: "#a0926f", marginBottom: "3px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>JSON</div>
                    <div>{"{"}</div>
                    <div style={{ paddingLeft: "8px" }}><span style={{ color: "#7a5c3a" }}>"key"</span>: "name",</div>
                    <div style={{ paddingLeft: "8px" }}><span style={{ color: "#c4685a" }}>"missing"</span>: "..."</div>
                    <div>{"}"}</div>
                  </div>

                  {/* X arrow */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", flexShrink: 0 }}>
                    <span style={{ color: "#c4685a", fontSize: "16px", lineHeight: 1 }}>✕</span>
                    <span style={{ color: "#c4b49a", fontSize: "14px" }}>→</span>
                  </div>

                  {/* Brain/LLM placeholder */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    border: "2px solid #a0926f", backgroundColor: "#e5dccf",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, position: "relative",
                  }}>
                    <div style={{
                      fontSize: "8px", color: "#a0926f", fontFamily: "Inter, sans-serif",
                      fontWeight: 700, textAlign: "center", lineHeight: 1.1,
                    }}>LLM</div>
                    {/* gear overlay */}
                    <div style={{
                      position: "absolute", bottom: "-2px", right: "-2px",
                      width: "14px", height: "14px", borderRadius: "50%",
                      border: "1.5px solid #a0926f", backgroundColor: "#ede5d8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#a0926f" }} />
                    </div>
                  </div>

                  {/* Arrow + label */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", flexShrink: 0 }}>
                    <span style={{ fontSize: "8px", color: "#a0926f", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>JSON VALIDATION</span>
                    <span style={{ color: "#c4b49a", fontSize: "14px" }}>→</span>
                  </div>

                  {/* Valid JSON box */}
                  <div style={{
                    backgroundColor: "#e5dccf", borderRadius: "8px", padding: "8px 10px",
                    border: "1.5px solid #7aab7a", fontFamily: "ui-monospace, monospace",
                    fontSize: "10px", color: "#7a5c3a", lineHeight: 1.6, flexShrink: 0,
                  }}>
                    <div style={{ fontSize: "9px", color: "#a0926f", marginBottom: "3px", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>JSON</div>
                    <div>{"{"}</div>
                    <div style={{ paddingLeft: "8px" }}><span style={{ color: "#7a5c3a" }}>"key"</span>: "name",</div>
                    <div style={{ paddingLeft: "8px" }}><span style={{ color: "#7a5c3a" }}>"key"</span>: "gloat"</div>
                    <div>{"}"}</div>
                  </div>

                  {/* Valid checkmark */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", flexShrink: 0 }}>
                    <span style={{ color: "#5a9a5a", fontSize: "16px", lineHeight: 1 }}>✓</span>
                    <span style={{ fontSize: "9px", color: "#5a9a5a", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>VALID</span>
                  </div>

                  {/* Retry loop label */}
                  <div style={{ width: "100%", textAlign: "center", fontSize: "9px", color: "#a0926f", fontFamily: "Inter, sans-serif", marginTop: "2px" }}>
                    ↺ RETRY / CORRECT
                  </div>
                </div>
              }
            />
            <FeatureCard
              label="Schema Shorthand"
              preview={
                <div style={{ paddingTop: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#7a5c3a" }}>--fields `name:string`</div>
                  <div style={{ paddingLeft: "24px", fontSize: "13px", color: "#7a5c3a" }}>
                    size:enum&#123;s,m,l&#125;
                  </div>
                  <div style={{ paddingLeft: "48px", fontSize: "13px", color: "#7a5c3a" }}>price:float</div>
                  <div style={{ paddingLeft: "64px", fontSize: "13px", color: "#7a5c3a" }}>
                    names:array&#123;string&#125;
                  </div>
                </div>
              }
            />
          </div>

          {/* Row 3 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "12px",
            }}
          >
            <FeatureCard
              label="TypeScript SDK"
              preview={
                <div style={{ paddingTop: "4px" }}>
                  {/* Fake editor window */}
                  <div style={{
                    backgroundColor: "#2d2420", borderRadius: "8px",
                    overflow: "hidden", fontSize: "10px",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}>
                    {/* Title bar */}
                    <div style={{
                      backgroundColor: "#3d2e28", padding: "5px 8px",
                      display: "flex", alignItems: "center", gap: "6px",
                    }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {["#c4685a","#c4a45a","#7aab7a"].map(c => (
                          <div key={c} style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: c }} />
                        ))}
                      </div>
                      <span style={{ color: "#a0926f", fontSize: "9px", marginLeft: "4px" }}>mot.ts</span>
                      <div style={{
                        marginLeft: "auto", backgroundColor: "#3178c6",
                        borderRadius: "3px", padding: "1px 4px",
                        fontSize: "8px", color: "white", fontWeight: 700,
                      }}>TS</div>
                    </div>
                    {/* Code */}
                    <div style={{ padding: "8px 10px", lineHeight: 1.7, color: "#c4b49a" }}>
                      <div><span style={{ color: "#a0926f" }}>import</span> {"{ extract }"} <span style={{ color: "#a0926f" }}>from</span> <span style={{ color: "#7aab7a" }}>"@mateffy/struktur"</span>;</div>
                      <div style={{ marginTop: "6px" }}>
                        <span style={{ color: "#a0926f" }}>const</span> result = <span style={{ color: "#a0926f" }}>await</span> extract({"{"})
                      </div>
                      <div style={{ paddingLeft: "12px" }}>size: <span style={{ color: "#7aab7a" }}>'s,st'</span>,</div>
                      <div style={{ paddingLeft: "12px" }}>price: float</div>
                      <div>{"}"});</div>
                    </div>
                  </div>
                  {/* Terminal row */}
                  <div style={{
                    backgroundColor: "#1a1412", borderRadius: "6px", marginTop: "6px",
                    padding: "6px 10px", fontFamily: "ui-monospace, monospace",
                    fontSize: "10px", color: "#c4b49a",
                  }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {["#c4685a","#c4a45a","#7aab7a"].map(c => (
                        <div key={c} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: c }} />
                      ))}
                    </div>
                    <div style={{ marginTop: "4px" }}>
                      <span style={{ color: "#a0926f" }}>›</span> bun install @mateffy/struktur
                    </div>
                    <div style={{ color: "#5a9a5a" }}>› _</div>
                  </div>
                </div>
              }
            />
            <FeatureCard
              label="Let the LLM reference embedded media"
              preview={
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", paddingTop: "4px" }}>
                  {/* Document */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                    <div style={{
                      width: "40px", height: "48px", backgroundColor: "#e5dccf",
                      borderRadius: "4px", border: "1.5px solid #c4b49a",
                      padding: "5px", display: "flex", flexDirection: "column", gap: "2px",
                      position: "relative",
                    }}>
                      <div style={{ position: "absolute", top: 0, right: 0, width: "10px", height: "10px", borderLeft: "1.5px solid #c4b49a", borderBottom: "1.5px solid #c4b49a", backgroundColor: "#ede5d8", borderBottomLeftRadius: "2px" }} />
                      {[0,1,2,3].map(i => <div key={i} style={{ height: "2px", backgroundColor: "#c4b49a", borderRadius: "1px", width: i === 3 ? "60%" : "100%" }} />)}
                    </div>
                  </div>

                  <div style={{ color: "#c4b49a", fontSize: "16px", paddingTop: "10px", flexShrink: 0 }}>→</div>

                  {/* Document with embedded images */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      width: "52px", height: "60px", backgroundColor: "#e5dccf",
                      borderRadius: "4px", border: "1.5px solid #c4b49a",
                      padding: "5px", display: "flex", flexDirection: "column", gap: "3px",
                      position: "relative",
                    }}>
                      <div style={{ position: "absolute", top: 0, right: 0, width: "11px", height: "11px", borderLeft: "1.5px solid #c4b49a", borderBottom: "1.5px solid #c4b49a", backgroundColor: "#ede5d8", borderBottomLeftRadius: "2px" }} />
                      <div style={{ height: "2px", backgroundColor: "#c4b49a", borderRadius: "1px" }} />
                      {/* Two small image placeholders */}
                      <div style={{ display: "flex", gap: "2px", marginTop: "2px" }}>
                        {[0,1].map(i => (
                          <div key={i} style={{
                            width: "17px", height: "14px", backgroundColor: "#c4b49a",
                            borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <div style={{ fontSize: "8px", color: "#ede5d8" }}>⛰</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ height: "2px", backgroundColor: "#c4b49a", borderRadius: "1px", width: "70%" }} />
                      {/* Chart placeholder */}
                      <div style={{
                        height: "14px", backgroundColor: "#c4b49a", borderRadius: "2px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ fontSize: "8px", color: "#ede5d8" }}>📊</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ color: "#c4b49a", fontSize: "16px", paddingTop: "14px", flexShrink: 0 }}>→</div>

                  {/* LLM brain with question bubble */}
                  <div style={{ flexShrink: 0, position: "relative" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%",
                      border: "2px solid #a0926f", backgroundColor: "#e5dccf",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: "18px" }}>🧠</span>
                    </div>
                    {/* Magnifier */}
                    <div style={{
                      position: "absolute", bottom: "-2px", right: "-4px",
                      width: "18px", height: "18px", borderRadius: "50%",
                      border: "2px solid #a0926f", backgroundColor: "#ede5d8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "9px",
                    }}>🔍</div>
                    {/* Speech bubble */}
                    <div style={{
                      position: "absolute", top: "-28px", left: "50%", transform: "translateX(-50%)",
                      backgroundColor: "#fff", borderRadius: "6px", padding: "3px 6px",
                      fontSize: "8px", color: "#3d2b15", fontFamily: "Inter, sans-serif",
                      whiteSpace: "nowrap", border: "1px solid #c4b49a",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}>What is in this chart?</div>
                  </div>

                  <div style={{ color: "#c4b49a", fontSize: "16px", paddingTop: "14px", flexShrink: 0 }}>→</div>

                  {/* JSON output */}
                  <div style={{
                    backgroundColor: "#e5dccf", borderRadius: "8px", padding: "7px 9px",
                    fontFamily: "ui-monospace, monospace", fontSize: "9px",
                    color: "#7a5c3a", lineHeight: 1.6, flexShrink: 0,
                  }}>
                    <div><span style={{ color: "#a0926f" }}>"chart_type"</span>: "Sales",</div>
                    <div><span style={{ color: "#a0926f" }}>"data_points"</span>: {"["}</div>
                    <div style={{ paddingLeft: "8px" }}>{"{"}
                      <span style={{ color: "#a0926f" }}>"label"</span>: "Q1",</div>
                    <div style={{ paddingLeft: "8px" }}><span style={{ color: "#a0926f" }}>"value"</span>: 1500{"}"}</div>
                    <div style={{ paddingLeft: "8px", color: "#c4b49a" }}>...</div>
                    <div>{"]"}</div>
                  </div>
                </div>
              }
            />
          </div>
        </section>

        {/* Get Started */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Get started in 5 seconds
          </h2>
          <Card>
            <CommandRow
              label="Install with NPM"
              command="npm install -g @struktur/cli"
            />
            <CommandRow
              label="Configure an LLM provider"
              command="struktur providers add openai --default --token 'sk_abc...'"
            />
            <CommandRow
              label="Aaaaand you're ready to go :)"
              command="struktur extract --text `my name is lukas` --fields 'name:string'"
            />
            <div style={{ marginTop: "24px" }}>
              <a
                href="/docs"
                style={{
                  fontSize: "16px",
                  color: "#3d2b15",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                Read the documentation to find out more →
              </a>
            </div>
          </Card>
        </section>

        {/* AI Agent */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Give your AI Agent data extraction superpowers
          </h2>
          <Card>
            <CommandRow
              label="Install the skill"
              command="npm install -g @struktur/skill"
            />
            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#a0926f",
                  marginBottom: "6px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Your AI agent can now extract structured data without bloating
                its own context window
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: "15px",
                    color: "#3d2b15",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  <span style={{ color: "#bba88a", userSelect: "none" }}>
                    $
                  </span>
                  <span>
                    "Please extract data in the FakturX schema for these
                    invoices"
                  </span>
                </div>
                <CopyButton text='"Please extract data in the FakturX schema for these invoices"' />
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <a
                href="/docs"
                style={{
                  fontSize: "16px",
                  color: "#3d2b15",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                }}
              >
                Read the documentation to find out more →
              </a>
            </div>
          </Card>
        </section>

        {/* TypeScript SDK */}
        <section style={{ paddingBottom: "80px" }}>
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            It also has a TypeScript SDK you can use in your own app.
          </h2>
          <Card>
            <CommandRow
              label="Install the SDK"
              command="npm install @struktur/sdk"
            />
            <div
              style={{
                fontSize: "12px",
                color: "#a0926f",
                marginBottom: "12px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Use the TypeScript SDK in your own application
            </div>
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "13px",
                color: "#3d2b15",
                lineHeight: 1.7,
                backgroundColor: "#e5dccf",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <div>
                import {"{"} extract, parallel {"}"} from{" "}
                <span style={{ color: "#7a5c3a" }}>'@struktur/sdk'</span>;
              </div>
              <div style={{ marginTop: "12px" }}>
                const data = await extract({"{"})
              </div>
              <div style={{ paddingLeft: "16px" }}>
                schema: {"{"} type:{" "}
                <span style={{ color: "#7a5c3a" }}>'object'</span>, ... {"}"},
              </div>
              <div style={{ paddingLeft: "16px" }}>
                input: await fs.readFile(
                <span style={{ color: "#7a5c3a" }}>'./large-document.txt'</span>
                ),
              </div>
              <div style={{ paddingLeft: "16px" }}>
                strategy: parallel({"{"} chunkSize:{" "}
                <span style={{ color: "#a0926f" }}>10000</span> {"}"}),
              </div>
              <div>{"}"});</div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
