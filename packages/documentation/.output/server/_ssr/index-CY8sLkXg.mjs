import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { L as LogoAnimation } from "./router-BlcnbrIM.mjs";
import { v as Layers, Z as Zap, n as FileText, w as CircleCheckBig, x as Code, y as Braces, z as FileImage, f as TextAlignStart, D as Image, g as Copy } from "../_libs/lucide-react.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "node:stream/web";
import "node:stream";
import "../_chunks/_libs/@tanstack/react-router.mjs";
import "../_libs/tiny-warning.mjs";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./staticFunctionMiddleware-Bri6ctyh.mjs";
import "node:path";
import "../_libs/tailwind-merge.mjs";
import "../_libs/fumadocs-mdx.mjs";
import "node:fs/promises";
import "./index.mjs";
import "node:async_hooks";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
import "node:process";
import "node:url";
import "./source-CS2NVe81.mjs";
import "./compare-source-DCpJSRvv.mjs";
import "./blog-source-BWlpLtv1.mjs";
import "../_chunks/_libs/@orama/orama.mjs";
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
  command
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: label ? "mb-5" : void 0, children: [
    label && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-caption mb-1.5", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "command-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-command flex items-start gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-faint select-none", children: "$" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: command })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: command })
    ] })
  ] });
}
function Card({
  children,
  style,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: className ? `surface-card ${className}` : "surface-card", style, children });
}
function FeatureCard({
  label,
  description,
  icon,
  style
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-card relative flex min-h-[120px] flex-col justify-start overflow-hidden", style, children: [
    icon && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-watermark absolute right-2.5 bottom-2.5 z-0 opacity-[0.09]", style: {
      "transform": "scale(6) translate(0.4rem, 0.3rem)",
      "transformOrigin": "bottom right"
    }, children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-feature-label relative z-[1] mb-1.5", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-copy relative z-[1]", children: description })
  ] });
}
const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const EXAMPLES = [{
  command: "struktur extract --input invoice.pdf --schema invoice.json",
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"invoice_nr"' }),
        ": ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '"INV-123"' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"customer"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-faint", children: "{" }),
        "...",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-faint", children: "}" }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"grand_total"' }),
        ": ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "1283.21" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}, {
  command: 'struktur extract --input resume.pdf --fields "name:string,skills:array{string}"',
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"name"' }),
        ": ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '"Jane Smith"' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"skills"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '["React", "TypeScript", "Node.js"]' })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}, {
  command: "struktur extract --input https://example.com/product.html --schema product.json",
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"title"' }),
        ": ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '"Wireless Headphones"' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"price"' }),
        ": ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "299.99" }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"in_stock"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "true" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}, {
  command: 'struktur extract --input meeting.txt --strategy parallel --fields "action_items:array{string},decisions:array{string}"',
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"action_items"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '["Update docs", "Schedule review"]' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"decisions"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '["Use PostgreSQL", "Deploy Friday"]' })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}, {
  command: 'struktur extract --input contract.docx --fields "parties:array{string},start_date,value:number"',
  output: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "{" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"parties"' }),
        ":",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '["Acme Corp", "Beta Ltd"]' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"start_date"' }),
        ": ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: '"2026-01-15"' }),
        ","
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"value"' }),
        ": ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "48000" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "}" })
  ] })
}];
const TYPING_SPEED_MS = 38;
const SPINNER_DURATION_MS = 2400;
const OUTPUT_PAUSE_MS = 2500;
const FADE_OUT_DURATION_MS = 400;
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
  const fadeOutAnimation = {
    animation: `fade-out ${FADE_OUT_DURATION_MS}ms ease-out forwards`
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
      display: "flex",
      gap: "8px",
      alignItems: "baseline",
      ...commandStyle
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-faint select-none", children: "$" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: phase === "pause" ? fadeOutAnimation : {}, children: [
        currentExample.command.slice(0, typedLen),
        (phase === "typing" || phase === "output") && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          display: "inline-block",
          width: "8px",
          height: "1.1em",
          backgroundColor: "#bba88a",
          marginLeft: "1px",
          marginBottom: "1px",
          verticalAlign: "text-bottom",
          animation: phase === "typing" ? "terminal-cursor-solid 0.05s step-end infinite" : "terminal-cursor-blink 1.2s step-end infinite"
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-[1ch] text-center", children: SPINNER_FRAMES[spinnerFrame] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Extracting data..." })
    ] }),
    (phase === "output" || phase === "pause") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      marginTop: "12px",
      ...outputStyle,
      ...phase === "output" ? fadeInAnimation : fadeOutAnimation
    }, children: currentExample.output })
  ] });
}
function Home() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[100vh] bg-paper font-brand text-ink relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "navbar-desktop", children: [{
      label: "Documentation",
      href: "/docs"
    }, {
      label: "Blog",
      href: "/blog"
    }, {
      label: "Comparisons",
      href: "/compare"
    }, {
      label: "GitHub",
      href: "https://github.com/mateffy/struktur"
    }, {
      label: "Made by Lukas Mateffy",
      href: "https://mateffy.org"
    }].map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link.href, onMouseOver: (e) => e.target.style.color = "#2d1b0e", onMouseOut: (e) => e.target.style.color = "#7a5c3a", className: "text-[14px] text-accent no-underline font-brand font-medium", children: link.label }, link.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "homepage-container", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "hero-section pt-10 max-sm:pt-6 pb-20 max-sm:pb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogoAnimation, { size: 200, className: "hero-image" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-size-14 text-subtle italic mb-2 font-brand", children: "/jtrʊkˈtuːr/" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-size-62 font-semibold leading-[1] text-ink font-brand tracking-[-2px]", style: {
            "margin": "0 0 20px 0"
          }, children: "struktur" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-size-20 leading-[1.7] text-body font-brand", style: {
            "margin": "0"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: "All-in-one tool for structured data extraction." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Feed it any document — PDF, text, or custom format.",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Get back validated, schema-typed JSON."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pb-20 max-sm:pb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-size-22 font-semibold text-ink mb-5 font-brand", children: "Extract data in your command line" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "terminal-container", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TerminalDemo, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pb-20 max-sm:pb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-size-22 font-semibold text-ink mb-5 font-brand", children: "Installation & Quickstart" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Install globally", command: "npm install -g @struktur/cli" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Store your API key and set a default model in one step", command: 'struktur config providers add openai --token "sk-..." --default' }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Extract structured data from any file", command: 'struktur --input invoice.pdf --fields "number, vendor, total:number"' }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/quickstart", className: "text-size-16 text-body no-underline font-brand font-medium", children: "Read the full quickstart →" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pb-20 max-sm:pb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-size-22 font-semibold text-ink mb-5 font-brand", children: "Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-grid-2-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Extraction strategies for any kind of document", description: "Choose how Struktur processes your document: single-shot for simple inputs, parallel chunking for large files, sequential pass for context-dependent extraction, or double-pass refinement for higher accuracy. Auto-merge strategies deduplicate results across chunks automatically.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Use any LLM", description: "OpenAI, Anthropic, Google, Mistral, OpenRouter, OpenCode Zen, and more. Switch with a single flag or by configuring default models.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-grid-1-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Built-in file parsing", description: 'Pass a PDF, image, or text file — Struktur makes it LLM-ready before extraction, including embedded images and full-page "screenshots". Add your own parser easily.', icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Schema validation with auto-retry", description: "Every LLM response is thoroughly validated against your schema. Validation errors are fed back to the model automatically, letting it fix its own mistakes.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "feature-grid-1-1-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Fields shorthand", description: `Extract data on the fly without writing a verbose JSON schema. Use the --fields flag with the shorthand syntax for one-off extractions or experimentation.`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "TypeScript SDK", description: "Integrate Struktur into your applications using the fully typed SDK. Everything is just JavaScript, so it works with any runtime.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Braces, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureCard, { label: "Embedded media support", description: "File parsing renders document pages as images so the LLM sees tables, charts, and photos in context. It can even reference visual elements in the output data.", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileImage, { size: 20 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pb-20 max-sm:pb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-size-22 font-semibold text-ink mb-5 font-brand", children: "How it works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pipeline-grid", children: [{
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
          }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-sand rounded-[10px] py-2.5 px-4 flex flex-col gap-0.5 flex-1 min-h-[58px] justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-size-13 font-semibold text-ink font-brand", children: step }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-size-11 text-subtle font-brand", children: sub })
            ] }),
            arrow && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-watermark text-[18px] shrink-0", children: arrow })
          ] }, step)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-size-14 text-accent leading-[1.6] font-brand", style: {
            "margin": "0 0 16px"
          }, children: [
            "Before extracting, Struktur normalizes your raw data into the",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/artifact-format", className: "text-body font-medium no-underline", children: "Artifact format" }),
            ", which is then given to the extraction strategy you picked. Here the data is chunked and given to the LLM, which extracts data in your schema and automatically retries on validation errors."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/pipeline", className: "text-size-14 text-body no-underline font-brand font-medium", children: "Extraction pipeline explained →" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pb-20 max-sm:pb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-size-22 font-semibold text-ink mb-5 font-brand", children: "Prepare any filetype for LLMs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-size-14 text-accent leading-[1.6] font-brand", style: {
            "margin": "0 0 20px"
          }, children: "Struktur's parser layer converts files into Artifacts before extraction. PDF, plain text, and images work out of the box. Register custom parsers for any MIME type using an npm package or a shell command." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "parser-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-sand rounded-[10px] p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-size-12 text-subtle font-brand font-semibold mb-2.5 uppercase tracking-[0.05em]", children: "Built-in Parsers" }),
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
              }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex gap-3 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-subtle shrink-0", children: icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[1px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-code text-size-12 text-body", children: mime }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-size-11 text-subtle font-brand", children: note })
                ] })
              ] }, mime))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-sand rounded-[10px] p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-size-12 text-subtle font-brand font-semibold mb-2.5 uppercase tracking-[0.05em]", children: "adding custom parsers" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-code text-size-11 text-body mb-3 leading-[1.5]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-faint", children: "$" }),
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
              }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2.5 flex flex-col gap-[1px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-size-11 text-subtle font-brand", children: type }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-code text-size-11 text-body", children: cmd })
              ] }, type))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-code text-size-13 text-body bg-sand rounded-[10px] py-3.5 px-4 leading-[1.7] mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-subtle text-size-11 mb-1.5 font-brand", children: "Register a Word document parser" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "$" }),
              " struktur config parsers add \\"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-4", children: "--mime application/msword \\" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-4", children: [
              "--file-command ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: '"markitdown FILE_PATH"' })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/document-parsing", className: "text-size-14 text-body no-underline font-brand font-medium", children: "Parser system explained →" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pb-20 max-sm:pb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-size-22 font-semibold text-ink mb-5 font-brand", children: "Integrate into your application using the TypeScript SDK" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Install the SDK", command: "npm install @struktur/sdk" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-code text-size-13 text-body leading-[1.7] bg-sand rounded-[10px] p-4 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "import" }),
              " ",
              "{ extract, simple, parse }",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "from" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "'@struktur/sdk'" }),
              ";"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "import" }),
              " ",
              "{ openai }",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "from" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "'@ai-sdk/openai'" }),
              ";"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-subtle", children: "// Parse a raw buffer into Artifacts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "const" }),
              " artifacts =",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "await" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "parse(" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-4", children: [
              "{ kind: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "'buffer'" }),
              ", buffer, mimeType: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "'application/pdf'" }),
              " },"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-4", children: "{ includeImages: true }" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: ")" }),
              ";"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-subtle", children: "// Run extraction with your chosen strategy" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "const" }),
              " result =",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-subtle", children: "await" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "extract(" }),
              "{"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-4", children: "artifacts," }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-4", children: [
              "schema: ",
              "{"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "type" }),
              ":",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "'object'" }),
              ","
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-8", children: [
              "properties: ",
              "{",
              " invoice_nr: ",
              "{ ",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "type" }),
              ":",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "'string'" }),
              " ",
              " }",
              ", total: ",
              "{ ",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "type" }),
              ":",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "'number'" }),
              " ",
              " }",
              " ",
              "}"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-4", children: [
              "}",
              ","
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-4", children: [
              "strategy: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "simple(" }),
              "{ model: openai(",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "'gpt-4o-mini'" }),
              ") }",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: ")" }),
              ","
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "}",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: ")" }),
              ";"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-subtle", children: "// result.data is fully typed from your schema" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/sdk/installation", className: "text-size-14 text-body no-underline font-brand font-medium", children: "SDK reference →" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pb-20 max-sm:pb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-size-22 font-semibold text-ink mb-5 font-brand", children: "Ready to extract structured data?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cta-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-size-16 font-semibold text-ink mb-4 font-brand", children: "Quickstart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Install globally", command: "npm install -g @struktur/cli" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandRow, { label: "Extract data from any file", command: 'struktur --input invoice.pdf --fields "total:number"' })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/quickstart", className: "text-size-14 text-body no-underline font-brand font-medium", children: "Full quickstart guide →" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cta-right-column", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-size-16 font-semibold text-ink mb-3 font-brand", children: "Documentation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-size-14 text-accent mb-5 font-brand leading-[1.6]", children: "Explore extraction strategies, parser configuration, SDK integration, and advanced features." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/strategies", className: "text-size-13 text-body no-underline font-brand font-medium", children: "→ Choosing a strategy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/explanation/document-parsing", className: "text-size-13 text-body no-underline font-brand font-medium", children: "→ Parser system" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/docs/sdk/installation", className: "text-size-13 text-body no-underline font-brand font-medium", children: "→ TypeScript SDK" })
            ] })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "border-t border-[rgba(102,102,102,0.15)] py-8 px-10 max-w-[950px] flex justify-between flex-wrap gap-4 max-md:flex-col max-md:items-center max-md:text-center max-md:gap-[22px] max-md:px-4 max-md:py-7", style: {
      "margin": "0 auto",
      "alignItems": "start"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px] text-muted font-brand", children: [
        "struktur by",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://mateffy.org", className: "text-accent no-underline font-medium", children: "Lukas Mateffy" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "footer-nav", children: [{
        label: "Documentation",
        href: "/docs"
      }, {
        label: "Blog",
        href: "/blog"
      }, {
        label: "Comparisons",
        href: "/compare"
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
      }].map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link.href, className: "text-[13px] max-sm:text-[14px] text-accent no-underline font-brand font-medium", children: link.label }, link.label)) })
    ] })
  ] });
}
export {
  Home as component
};
