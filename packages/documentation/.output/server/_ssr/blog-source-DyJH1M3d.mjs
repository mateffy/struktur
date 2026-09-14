import { V as loader, W as lucideIconsPlugin, Z as blog } from "./staticFunctionMiddleware-XqRNDyGO.mjs";
const blogSource = loader({
  source: blog.toFumadocsSource(),
  baseUrl: "/blog",
  plugins: [lucideIconsPlugin()]
});
export {
  blogSource as b
};
