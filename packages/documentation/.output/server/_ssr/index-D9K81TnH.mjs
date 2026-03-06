import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { n as Layers, Z as Zap, F as FileText, o as CircleCheckBig, p as Code, B as Braces, q as FileImage, T as TextAlignStart, r as Image, a as Copy } from "../_libs/lucide-react.mjs";
function CopyButton({
  text
}) {
  const [copied, setCopied] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, style: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    color: copied ? "#a0926f" : "#bba88a",
    flexShrink: 0
  }, title: "Copy", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }) });
}
function CommandRow({
  label,
  command,
  isPlain
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    marginBottom: label ? "20px" : "0"
  }, children: [
    label && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontSize: "12px",
      color: "#a0926f",
      marginBottom: "6px",
      fontFamily: "Inter, sans-serif"
    }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "15px",
        color: "#3d2b15",
        display: "flex",
        alignItems: "flex-start",
        gap: "6px",
        whiteSpace: isPlain ? "pre-wrap" : "nowrap",
        flexWrap: isPlain ? "wrap" : "nowrap"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#bba88a",
          userSelect: "none"
        }, children: "$" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: command })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: command })
    ] })
  ] });
}
function Card({
  children,
  style
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    backgroundColor: "#ede5d8",
    borderRadius: "16px",
    padding: "24px",
    ...style
  }, children });
}
function FeatureCard({
  label,
  description,
  icon,
  style
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    backgroundColor: "#ede5d8",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    minHeight: "120px",
    position: "relative",
    overflow: "hidden",
    ...style
  }, children: [
    icon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      position: "absolute",
      bottom: "10px",
      right: "10px",
      color: "#c4b49a",
      opacity: 0.09,
      zIndex: 0,
      transform: "scale(6) translate(0.4rem, 0.3rem)",
      transformOrigin: "bottom right"
    }, children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontFamily: "Inter, sans-serif",
      fontSize: "15px",
      fontWeight: 500,
      color: "#2d1b0e",
      marginBottom: "6px",
      position: "relative",
      zIndex: 1
    }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
      color: "#a0926f",
      lineHeight: 1.5,
      position: "relative",
      zIndex: 1
    }, children: description })
  ] });
}
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const EXAMPLES = [{
  command: "struktur extract --input invoice.txt --schema invoice.json",
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      paddingLeft: "20px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"invoice_nr"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '"INV-123"' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"customer"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#bba88a"
        }, children: "{" }),
        "...",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#bba88a"
        }, children: "}" }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"grand_total"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "1283.21" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}, {
  command: 'struktur extract --input resume.pdf --fields "name:string,skills:array{string}"',
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      paddingLeft: "20px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"name"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '"Jane Smith"' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"skills"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '["React", "TypeScript", "Node.js"]' })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}, {
  command: "struktur extract --url https://example.com --schema product.json",
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      paddingLeft: "20px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"title"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '"Wireless Headphones"' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"price"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "299.99" }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"in_stock"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#a0926f"
        }, children: "true" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}, {
  command: 'struktur extract --input meeting.txt --strategy parallel --fields "action_items:array{string},decisions:array{string}"',
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      paddingLeft: "20px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"action_items"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '["Update docs", "Schedule review"]' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"decisions"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '["Use PostgreSQL", "Deploy Friday"]' })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}, {
  command: 'struktur extract --input contract.pdf --fields "parties:array{string},start_date,value:number"',
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      paddingLeft: "20px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"parties"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '["Acme Corp", "Beta Ltd"]' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"start_date"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '"2026-01-15"' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: "#7a5c3a"
        }, children: '"value"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "48000" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}];
const TYPING_SPEED_MS = 38;
const SPINNER_DURATION_MS = 1200;
const OUTPUT_PAUSE_MS = 3e3;
const RESTART_DELAY_MS = 600;
function TerminalDemo() {
  const [phase, setPhase] = reactExports.useState("typing");
  const [typedLen, setTypedLen] = reactExports.useState(0);
  const [spinnerFrame, setSpinnerFrame] = reactExports.useState(0);
  const [exampleIndex, setExampleIndex] = reactExports.useState(0);
  const timeoutRef = reactExports.useRef(null);
  const intervalRef = reactExports.useRef(null);
  const currentExample = EXAMPLES[exampleIndex];
  reactExports.useEffect(() => {
    setPhase("typing");
    setTypedLen(0);
    setSpinnerFrame(0);
  }, [exampleIndex]);
  const clear = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  reactExports.useEffect(() => {
    const run = () => {
      setPhase("typing");
      setTypedLen(0);
      let i = 0;
      const type = () => {
        i++;
        setTypedLen(i);
        if (i < currentExample.command.length) {
          timeoutRef.current = setTimeout(type, TYPING_SPEED_MS);
        } else {
          timeoutRef.current = setTimeout(() => {
            setPhase("spinner");
            let frame = 0;
            intervalRef.current = setInterval(() => {
              frame = (frame + 1) % SPINNER_FRAMES.length;
              setSpinnerFrame(frame);
            }, 80);
            timeoutRef.current = setTimeout(() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setPhase("output");
              timeoutRef.current = setTimeout(() => {
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
  const commandStyle = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "17px",
    fontWeight: 500,
    color: "#3d2b15",
    lineHeight: 1.8
  };
  const outputStyle = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "13px",
    color: "#3d2b15",
    lineHeight: 1.8
  };
  const fadeInAnimation = {
    animation: "fade-in-up 0.3s ease-out forwards"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      gap: "8px",
      alignItems: "baseline",
      ...commandStyle
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
        color: "#bba88a",
        userSelect: "none"
      }, children: "$" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        currentExample.command.slice(0, typedLen),
        phase === "typing" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          display: "inline-block",
          width: "2px",
          height: "1em",
          backgroundColor: "#bba88a",
          marginLeft: "1px",
          marginBottom: "2px",
          verticalAlign: "text-bottom",
          animation: "terminal-cursor-blink 0.7s step-end infinite"
        } })
      ] })
    ] }),
    phase === "spinner" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      color: "#bba88a",
      marginTop: "12px",
      display: "flex",
      gap: "8px",
      alignItems: "center",
      ...outputStyle,
      ...fadeInAnimation
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
        display: "inline-block",
        width: "1ch",
        textAlign: "center"
      }, children: SPINNER_FRAMES[spinnerFrame] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Extracting data..." })
    ] }),
    phase === "output" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      marginTop: "12px",
      ...outputStyle,
      ...fadeInAnimation
    }, children: currentExample.output })
  ] });
}
function Home() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    minHeight: "100vh",
    backgroundColor: "#f5efe6",
    fontFamily: "Inter, sans-serif",
    color: "#2d1b0e",
    position: "relative"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "navbar-desktop", children: [{
      label: "Documentation",
      href: "/docs"
    }, {
      label: "GitHub",
      href: "https://github.com/mateffy/struktur"
    }, {
      label: "Author",
      href: "https://mateffy.org"
    }].map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link.href, style: {
      fontSize: "14px",
      color: "#7a5c3a",
      textDecoration: "none",
      fontFamily: "Inter, sans-serif",
      fontWeight: 500
    }, onMouseOver: (e) => e.target.style.color = "#2d1b0e", onMouseOut: (e) => e.target.style.color = "#7a5c3a", children: link.label }, link.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      maxWidth: "950px",
      margin: "0 auto",
      padding: "0 40px 80px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "hero-section", style: {
        paddingTop: "40px",
        paddingBottom: "80px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/struktur-icon.png", alt: "Struktur", className: "hero-image", style: {
          width: "200px",
          height: "200px",
          borderRadius: "28px",
          flexShrink: 0
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          paddingTop: "8px"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            fontSize: "14px",
            color: "#a0926f",
            fontStyle: "italic",
            marginBottom: "8px",
            fontFamily: "Inter, sans-serif"
          }, children: "/jtrʊkˈtuːr/" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: {
            fontSize: "62px",
            fontWeight: 600,
            lineHeight: 1,
            color: "#2d1b0e",
            margin: "0 0 20px 0",
            fontFamily: "Inter, sans-serif",
            letterSpacing: "-2px"
          }, children: "struktur" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: {
            fontSize: "20px",
            lineHeight: 1.7,
            color: "#3d2b15",
            margin: 0,
            fontFamily: "Inter, sans-serif"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: {
              fontWeight: 600
            }, children: "All-in-one tool for structured data extraction." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Feed it any document — PDF, text, or custom format.",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Get back validated, schema-typed JSON."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: {
        paddingBottom: "80px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
          fontSize: "22px",
          fontWeight: 600,
          color: "#2d1b0e",
          marginBottom: "20px",
          fontFamily: "Inter, sans-serif"
        }, children: "Extract data in your command line" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { style: {
          height: "222px"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TerminalDemo, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: {
        paddingBottom: "80px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
          fontSize: "22px",
          fontWeight: 600,
          color: "#2d1b0e",
          marginBottom: "20px",
          fontFamily: "Inter, sans-serif"
        }, children: "Installation & Quickstart" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Install globally", command: "npm install -g @mateffy/struktur" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Store your API key and set a default model in one step", command: 'struktur config providers add openai --token "sk-..." --default' }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Extract structured data from any file", command: 'struktur --input invoice.pdf --fields "number, vendor, total:number"' }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            marginTop: "24px"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/quickstart", style: {
            fontSize: "16px",
            color: "#3d2b15",
            textDecoration: "none",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500
          }, children: "Read the full quickstart →" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: {
        paddingBottom: "80px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
          fontSize: "22px",
          fontWeight: 600,
          color: "#2d1b0e",
          marginBottom: "20px",
          fontFamily: "Inter, sans-serif"
        }, children: "Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "12px",
          marginBottom: "12px"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Extraction strategies for any kind of document", description: "Choose how Struktur processes your document: single-shot for simple inputs, parallel chunking for large files, sequential pass for context-dependent extraction, or double-pass refinement for higher accuracy. Auto-merge strategies deduplicate results across chunks automatically.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Use any LLM", description: "OpenAI, Anthropic, Google, Mistral, OpenRouter, OpenCode Zen, and more. Switch with a single flag or by configuring default models.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "12px"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Built-in file parsing", description: 'Pass a PDF, image, or text file — Struktur makes it LLM-ready before extraction, including embedded images and full-page "screenshots". Add your own parser easily.', icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Schema validation with auto-retry", description: "Every LLM response is thoroughly validated against your schema. Validation errors are fed back to the model automatically, letting it fix its own mistakes.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Fields shorthand", description: `Extract data on the fly without writing a verbose JSON schema. Use the --fields flag with the shorthand syntax for one-off extractions or experimentation.`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "TypeScript SDK", description: "Integrate Struktur into your applications using the fully typed SDK. Everything is just JavaScript, so it works with any runtime.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Braces, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Embedded media support", description: "File parsing renders document pages as images so the LLM sees tables, charts, and photos in context. It can even reference visual elements in the output data.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileImage, { size: 20 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: {
        paddingBottom: "80px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
          fontSize: "22px",
          fontWeight: 600,
          color: "#2d1b0e",
          marginBottom: "20px",
          fontFamily: "Inter, sans-serif"
        }, children: "How it works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "24px"
          }, children: [{
            step: "Raw Input",
            sub: "Files, Text or Images",
            arrow: "→"
          }, {
            step: "Artifact",
            sub: "Text + Images",
            arrow: "→"
          }, {
            step: "Extract",
            sub: "Your chosen strategy",
            arrow: "→"
          }, {
            step: "Structured Data",
            sub: "JSON in your schema",
            arrow: null
          }].map(({
            step,
            sub,
            arrow
          }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              backgroundColor: "#e5dccf",
              borderRadius: "10px",
              padding: "10px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              flex: 1,
              minHeight: "58px",
              justifyContent: "center"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                fontSize: "13px",
                fontWeight: 600,
                color: "#2d1b0e",
                fontFamily: "Inter, sans-serif"
              }, children: step }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                fontSize: "11px",
                color: "#a0926f",
                fontFamily: "Inter, sans-serif"
              }, children: sub })
            ] }),
            arrow && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              color: "#c4b49a",
              fontSize: "18px",
              flexShrink: 0
            }, children: arrow })
          ] }, step)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: {
            fontSize: "14px",
            color: "#7a5c3a",
            margin: "0 0 16px",
            lineHeight: 1.6,
            fontFamily: "Inter, sans-serif"
          }, children: [
            "Before extracting, Struktur normalizes your raw data into the",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/artifacts", style: {
              color: "#3d2b15",
              fontWeight: 500,
              textDecoration: "none"
            }, children: "Artifact format" }),
            ", which is then given to the extraction strategy you picked. Here the data is chunked and given to the LLM, which extracts data in your schema and automatically retries on validation errors."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/pipeline", style: {
            fontSize: "14px",
            color: "#3d2b15",
            textDecoration: "none",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500
          }, children: "Extraction pipeline explained →" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: {
        paddingBottom: "80px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
          fontSize: "22px",
          fontWeight: 600,
          color: "#2d1b0e",
          marginBottom: "20px",
          fontFamily: "Inter, sans-serif"
        }, children: "Prepare any filetype for LLMs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
            fontSize: "14px",
            color: "#7a5c3a",
            margin: "0 0 20px",
            lineHeight: 1.6,
            fontFamily: "Inter, sans-serif"
          }, children: "Struktur's parser layer converts files into Artifacts before extraction. PDF, plain text, and images work out of the box. Register custom parsers for any MIME type using an npm package or a shell command." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              backgroundColor: "#e5dccf",
              borderRadius: "10px",
              padding: "16px"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                fontSize: "12px",
                color: "#a0926f",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }, children: "Built-in Parsers" }),
              [{
                mime: "application/pdf",
                note: "text + images per page",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 13 })
              }, {
                mime: "text/*",
                note: "split into content slices",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TextAlignStart, { size: 13 })
              }, {
                mime: "image/*",
                note: "passed as media artifact",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { size: 13 })
              }, {
                mime: "application/json",
                note: "treated as text unless it's valid Artifact data",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Braces, { size: 13 })
              }].map(({
                mime,
                note,
                icon
              }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                marginBottom: "8px",
                display: "flex",
                gap: "12px",
                alignItems: "center"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  color: "#a0926f",
                  flexShrink: 0
                }, children: icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px"
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: "12px",
                    color: "#3d2b15"
                  }, children: mime }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                    fontSize: "11px",
                    color: "#a0926f",
                    fontFamily: "Inter, sans-serif"
                  }, children: note })
                ] })
              ] }, mime))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              backgroundColor: "#e5dccf",
              borderRadius: "10px",
              padding: "16px"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                fontSize: "12px",
                color: "#a0926f",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }, children: "adding custom parsers" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "11px",
                color: "#3d2b15",
                marginBottom: "12px",
                lineHeight: 1.5
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                  color: "#bba88a"
                }, children: "$" }),
                " struktur config parsers add ..."
              ] }),
              [{
                type: "NPM Package",
                cmd: "--npm @myorg/docx-parser"
              }, {
                type: "Shell Command (using path)",
                cmd: '--file-command "markitdown FILE_PATH"'
              }, {
                type: "Shell Command (using stdin)",
                cmd: '--stdin-command "my-html-tool"'
              }].map(({
                type,
                cmd
              }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "1px"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  fontSize: "11px",
                  color: "#a0926f",
                  fontFamily: "Inter, sans-serif"
                }, children: type }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "11px",
                  color: "#3d2b15"
                }, children: cmd })
              ] }, type))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "13px",
            color: "#3d2b15",
            backgroundColor: "#e5dccf",
            borderRadius: "10px",
            padding: "14px 16px",
            lineHeight: 1.7,
            marginBottom: "16px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              color: "#a0926f",
              fontSize: "11px",
              marginBottom: "6px",
              fontFamily: "Inter, sans-serif"
            }, children: "Register a Word document parser" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#a0926f"
              }, children: "$" }),
              " ",
              "struktur config parsers add \\"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              paddingLeft: "16px"
            }, children: "--mime application/msword \\" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              paddingLeft: "16px"
            }, children: [
              "--file-command ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: '"markitdown FILE_PATH"' })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/parsers", style: {
            fontSize: "14px",
            color: "#3d2b15",
            textDecoration: "none",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500
          }, children: "Parser system explained →" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: {
        paddingBottom: "80px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
          fontSize: "22px",
          fontWeight: 600,
          color: "#2d1b0e",
          marginBottom: "20px",
          fontFamily: "Inter, sans-serif"
        }, children: "Integrate into your application using the TypeScript SDK" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Install the SDK", command: "npm install @mateffy/struktur" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "13px",
            color: "#3d2b15",
            lineHeight: 1.7,
            backgroundColor: "#e5dccf",
            borderRadius: "10px",
            padding: "16px",
            marginTop: "12px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#a0926f"
              }, children: "import" }),
              " ",
              "{ extract, simple, parse }",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#a0926f"
              }, children: "from" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "'@mateffy/struktur'" }),
              ";"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#a0926f"
              }, children: "import" }),
              " ",
              "{ openai }",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#a0926f"
              }, children: "from" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "'@ai-sdk/openai'" }),
              ";"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              marginTop: "12px",
              color: "#a0926f"
            }, children: "// Parse a raw buffer into Artifacts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#a0926f"
              }, children: "const" }),
              " artifacts =",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#a0926f"
              }, children: "await" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontWeight: 600
              }, children: "parse(" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              paddingLeft: "16px"
            }, children: [
              "{ kind: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "'buffer'" }),
              ", buffer, mimeType: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "'application/pdf'" }),
              " },"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              paddingLeft: "16px"
            }, children: "{ includeImages: true }" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontWeight: 600
              }, children: ")" }),
              ";"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              marginTop: "8px",
              color: "#a0926f"
            }, children: "// Run extraction with your chosen strategy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#a0926f"
              }, children: "const" }),
              " result =",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#a0926f"
              }, children: "await" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontWeight: 600
              }, children: "extract(" }),
              "{"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              paddingLeft: "16px"
            }, children: "artifacts," }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              paddingLeft: "16px"
            }, children: [
              "schema: ",
              "{"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              paddingLeft: "32px"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "type" }),
              ":",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "'object'" }),
              ","
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              paddingLeft: "32px"
            }, children: [
              "properties: ",
              "{",
              " ",
              "invoice_nr: ",
              "{ ",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "type" }),
              ":",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "'string'" }),
              " ",
              " }",
              ",",
              " ",
              "total: ",
              "{ ",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "type" }),
              ":",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "'number'" }),
              " ",
              " }",
              " ",
              "}"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              paddingLeft: "16px"
            }, children: [
              "}",
              ","
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              paddingLeft: "16px"
            }, children: [
              "strategy:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontWeight: 600
              }, children: "simple(" }),
              "{ model: openai(",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                color: "#7a5c3a"
              }, children: "'gpt-4o-mini'" }),
              ") }",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontWeight: 600
              }, children: ")" }),
              ","
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "}",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
                fontWeight: 600
              }, children: ")" }),
              ";"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              marginTop: "8px",
              color: "#a0926f"
            }, children: "// result.data is fully typed from your schema" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
            marginTop: "16px"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/sdk/installation", style: {
            fontSize: "14px",
            color: "#3d2b15",
            textDecoration: "none",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500
          }, children: "SDK reference →" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { style: {
        paddingBottom: "80px"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: {
          fontSize: "22px",
          fontWeight: 600,
          color: "#2d1b0e",
          marginBottom: "20px",
          fontFamily: "Inter, sans-serif"
        }, children: "Ready to extract structured data?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: {
              fontSize: "16px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "16px",
              fontFamily: "Inter, sans-serif"
            }, children: "Quickstart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              marginBottom: "20px"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Install globally", command: "npm install -g @mateffy/struktur" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Extract data from any file", command: 'struktur --input invoice.pdf --fields "total:number"' })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/quickstart", style: {
              fontSize: "14px",
              color: "#3d2b15",
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500
            }, children: "Full quickstart guide →" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
            borderLeft: "1px solid rgba(122, 92, 58, 0.15)",
            paddingLeft: "40px"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: {
              fontSize: "16px",
              fontWeight: 600,
              color: "#2d1b0e",
              marginBottom: "12px",
              fontFamily: "Inter, sans-serif"
            }, children: "Documentation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: {
              fontSize: "14px",
              color: "#7a5c3a",
              marginBottom: "20px",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.6
            }, children: "Explore extraction strategies, parser configuration, SDK integration, and advanced features." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/strategies", style: {
                fontSize: "13px",
                color: "#3d2b15",
                textDecoration: "none",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500
              }, children: "→ Choosing a strategy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/parsers", style: {
                fontSize: "13px",
                color: "#3d2b15",
                textDecoration: "none",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500
              }, children: "→ Parser system" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/sdk/installation", style: {
                fontSize: "13px",
                color: "#3d2b15",
                textDecoration: "none",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500
              }, children: "→ TypeScript SDK" })
            ] })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { style: {
      borderTop: "1px solid rgba(102, 102, 102, 0.15)",
      padding: "32px 40px",
      maxWidth: "950px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        fontSize: "13px",
        color: "#a0926f",
        fontFamily: "Inter, sans-serif"
      }, children: [
        "struktur by",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://mateffy.org", style: {
          color: "#7a5c3a",
          textDecoration: "none",
          fontWeight: 500
        }, children: "Lukas Mateffy" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { style: {
        display: "flex",
        gap: "24px",
        flexWrap: "wrap"
      }, children: [{
        label: "Documentation",
        href: "/docs"
      }, {
        label: "Quickstart",
        href: "/docs/quickstart"
      }, {
        label: "Strategies",
        href: "/docs/explanation/strategies"
      }, {
        label: "Pipeline",
        href: "/docs/explanation/pipeline"
      }, {
        label: "SDK reference",
        href: "/docs/sdk/installation"
      }, {
        label: "GitHub",
        href: "https://github.com/mateffy/struktur"
      }].map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link.href, style: {
        fontSize: "13px",
        color: "#7a5c3a",
        textDecoration: "none",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500
      }, children: link.label }, link.label)) })
    ] })
  ] });
}
export {
  Home as component
};
