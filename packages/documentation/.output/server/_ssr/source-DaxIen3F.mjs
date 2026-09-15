import { V as loader, W as lucideIconsPlugin, X as docs } from "./staticFunctionMiddleware-C4FwL46b.mjs";
const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
  plugins: [lucideIconsPlugin()]
});
async function getLLMText(page) {
  const processed = await page.data.getText("processed");
  return `# ${page.data.title}

${processed}`;
}
export {
  getLLMText as g,
  source as s
};
