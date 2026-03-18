import { X as loader, Y as lucideIconsPlugin, $ as docs } from "./staticFunctionMiddleware-Cl6ijKlk.mjs";
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
