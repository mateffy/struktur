import { createFileRoute } from "@tanstack/react-router";
import { ExtractPage } from "../components/ExtractPage";

export const Route = createFileRoute("/")({
  component: ExtractPage,
  head: () => ({
    meta: [
      { title: "Struktur - Extract Data" },
      {
        name: "description",
        content: "Extract structured data from documents using AI",
      },
    ],
  }),
});
