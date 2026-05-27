import { Hono } from "hono";
import { Scalar } from "@scalar/hono-api-reference";

const app = new Hono();

app.get(
  "/",
  Scalar({
    url: "/openapi.json",
    pageTitle: "Struktur API Reference",
    theme: "default",
  }),
);

export default app;
