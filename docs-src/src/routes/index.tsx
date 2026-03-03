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
        minHeight: "160px",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "12px",
          color: "#c4b49a",
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        {preview}
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          fontWeight: 500,
          color: "#2d1b0e",
          marginTop: "16px",
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
            <FeatureCard label="Extraction strategies for any kind of document" />
            <FeatureCard label="Use any LLM" />
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
            <FeatureCard label="Autofix validation errors" />
            <FeatureCard
              label="Schema Shorthand"
              preview={
                <div>
                  <div>--fields `name:string`</div>
                  <div style={{ paddingLeft: "24px" }}>
                    size:enum&#123;s,m,l&#125;
                  </div>
                  <div style={{ paddingLeft: "48px" }}>price:float</div>
                  <div style={{ paddingLeft: "64px" }}>
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
            <FeatureCard label="TypeScript SDK" />
            <FeatureCard label="Let the LLM reference embedded media" />
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
