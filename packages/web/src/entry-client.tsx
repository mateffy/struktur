import { RouterProvider } from "@tanstack/react-router";
import { hydrateRoot } from "react-dom/client";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

hydrateRoot(document.getElementById("app")!, <RouterProvider router={router} />);
