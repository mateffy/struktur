import { X as loader, Y as lucideIconsPlugin, $ as blog } from "./staticFunctionMiddleware-WHQ8LAqF.mjs";
const blogSource = loader({
  source: blog.toFumadocsSource(),
  baseUrl: "/blog",
  plugins: [lucideIconsPlugin()]
});
export {
  blogSource as b
};
