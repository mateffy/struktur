import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { LogoAnimation } from "@/components/LogoAnimation";

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: "mateffy",
  repo: "struktur",
  branch: "main",
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <LogoAnimation size={28} />
          <span className="font-medium">Struktur</span>
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
