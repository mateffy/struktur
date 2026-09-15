import { V as loader, W as lucideIconsPlugin, Y as blog } from "./staticFunctionMiddleware-C4FwL46b.mjs";
const blogSource = loader({
  source: blog.toFumadocsSource(),
  baseUrl: "/blog",
  plugins: [lucideIconsPlugin()]
});
export {
  blogSource as b
};
