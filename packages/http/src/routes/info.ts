import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { APIInfoSchema } from "../schemas";

const app = new Hono();

app.get(
  "/",
  describeRoute({
    operationId: "getApiInfo",
    summary: "Get API information",
    description: "Returns the API name, version, and a list of available endpoints.",
    tags: ["Info"],
    responses: {
      200: {
        description: "API information",
        content: {
          "application/json": {
            schema: resolver(APIInfoSchema),
          },
        },
      },
    },
  }),
  (c) => {
    return c.json(
      {
        name: "struktur-http",
        version: "1.2.1",
        endpoints: {
          "POST /parse": "Parse uploaded files into artifact JSON",
          "POST /extract": "Extract structured data from documents or artifact JSON",
          "GET /debug": "Simple debug UI for uploading files and visualizing extraction output",
        },
      },
      200,
    );
  },
);

export default app;
