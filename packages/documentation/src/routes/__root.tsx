import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import * as React from "react";
import "@/styles/app.css";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import SearchDialog from "@/components/search";
import { Agentation } from "agentation";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Struktur",
      },
      {
        name: "description",
        content:
          "All-in-one tool for structured data extraction. Turn documents into validated JSON with AI.",
      },
      {
        name: "google-site-verification",
        content: "YOUR_VERIFICATION_CODE_HERE", // Replace with code from Google Search Console
      },
      {
        property: "og:title",
        content: "Struktur",
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
        content: "Struktur",
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
    links: [{ rel: "icon", type: "image/png", href: "/struktur-icon.png" }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Struktur",
    description:
      "All-in-one tool for structured data extraction. Turn documents into validated JSON with AI.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Lukas Mateffy",
      url: "https://mateffy.org",
    },
    codeRepository: "https://github.com/mateffy/struktur",
    programmingLanguage: ["TypeScript", "JavaScript"],
    softwareRequirements: "Node.js, Bun, or Deno runtime",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Struktur",
    url: "https://struktur.sh",
    logo: "https://struktur.sh/struktur-icon.png",
    founder: {
      "@type": "Person",
      name: "Lukas Mateffy",
      url: "https://mateffy.org",
    },
    sameAs: ["https://github.com/mateffy/struktur"],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          defer
          data-domain="struktur.sh"
          src="https://plausible.claw.events/js/script.file-downloads.hash.outbound-links.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider search={{ SearchDialog }}>{children}</RootProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
        <Scripts />
      </body>
    </html>
  );
}
