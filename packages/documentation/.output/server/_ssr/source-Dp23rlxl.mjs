import { V as loader, W as lucideIconsPlugin, Y as docs } from "./staticFunctionMiddleware-CsIfojI1.mjs";
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
