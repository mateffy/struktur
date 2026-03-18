import { X as loader, Y as lucideIconsPlugin, _ as blog } from "./staticFunctionMiddleware-Cl6ijKlk.mjs";
const blogSource = loader({
  source: blog.toFumadocsSource(),
  baseUrl: "/blog",
  plugins: [lucideIconsPlugin()]
});
export {
  blogSource as b
};
