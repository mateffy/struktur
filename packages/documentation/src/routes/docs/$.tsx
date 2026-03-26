import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { createServerFn } from "@tanstack/react-start";
import { source } from "@/lib/source";
import browserCollections from "fumadocs-mdx:collections/browser";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { File, Folder, Files } from "fumadocs-ui/components/files";
import { TypeTable } from "fumadocs-ui/components/type-table";
import { baseOptions, gitConfig } from "@/lib/layout.shared";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { Suspense } from "react";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { SchemaViewer } from "@/components/SchemaViewer";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await loader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) => {
    const { slugs } = loaderData ?? {};
    const title =
      slugs && slugs.length > 0
        ? `${slugs.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")} - Struktur`
        : "Documentation - Struktur";
    const description =
      "Struktur documentation: structured data extraction with AI. CLI and SDK for TypeScript.";

    return {
      meta: [
        {
          title,
        },
        {
          name: "description",
          content: description,
        },
        {
          property: "og:title",
          content: title,
        },
        {
          property: "og:description",
          content: description,
        },
        {
          property: "og:type",
          content: "article",
        },
        {
          property: "og:url",
          content: `https://struktur.sh/docs/${slugs?.join("/") ?? ""}`,
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
          content: title,
        },
        {
          name: "twitter:description",
          content: description,
        },
        {
          name: "twitter:image",
          content: "https://struktur.sh/og.webp",
        },
      ],
      links: [{ rel: "canonical", href: `https://struktur.sh/docs/${slugs?.join("/") ?? ""}` }],
    };
  },
});

const loader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      slugs: page.slugs,
      path: page.path,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },
    // you can define props for the component
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string;
      path: string;
    },
  ) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <LLMCopyButton markdownUrl={markdownUrl} />
          <ViewOptions
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
        </div>
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
              ...TabsComponents,
              Accordion,
              Accordions,
              Step,
              Steps,
              File,
              Folder,
              Files,
              TypeTable,
              SchemaViewer,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const { pageTree, slugs, path } = useFumadocsLoader(Route.useLoaderData());
  const markdownUrl = `/llms/docs/${slugs.length > 0 ? `${slugs.join("/")}.md` : "index.md"}`;

  return (
    <DocsLayout {...baseOptions()} tree={pageTree}>
      <Link to={markdownUrl} hidden />
      <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
    </DocsLayout>
  );
}
