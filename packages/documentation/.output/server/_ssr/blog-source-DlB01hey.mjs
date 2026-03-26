import { X as loader, Y as lucideIconsPlugin, Z as blog } from "./staticFunctionMiddleware-BO_LZi6-.mjs";
const blogSource = loader({
  source: blog.toFumadocsSource(),
  baseUrl: "/blog",
  plugins: [lucideIconsPlugin()]
});
export {
  blogSource as b
};
