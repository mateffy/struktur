import { V as loader, W as lucideIconsPlugin, Y as blog } from "./staticFunctionMiddleware-C7C9zihV.mjs";
const blogSource = loader({
  source: blog.toFumadocsSource(),
  baseUrl: "/blog",
  plugins: [lucideIconsPlugin()]
});
export {
  blogSource as b
};
