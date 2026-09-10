import { dirname } from "path"
import { fileURLToPath } from "url"
import type { StorybookConfig } from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

const uiSrc = fileURLToPath(new URL("../../../packages/ui/src", import.meta.url))

const config: StorybookConfig = {
  /* MDX가 앞이다 — 색인 순서가 사이드바 순서이고, 컴포넌트를 고르러 온 사람이
   * 먼저 볼 것은 스토리 목록이 아니라 문서 페이지다(ADR-0023 §8). */
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [getAbsolutePath("@storybook/addon-a11y"), getAbsolutePath("@storybook/addon-docs")],
  framework: getAbsolutePath("@storybook/react-vite"),
  // @flameware/ui의 exports는 dist(빌드 산출물)를 가리킨다(#278). 워크벤치까지
  // 그것을 보면 ui 소스를 고칠 때마다 빌드를 돌려야 HMR이 붙으므로, 여기서만
  // 소스로 되돌린다 — 스토리를 쓰는 동안 보는 것은 언제나 지금의 소스여야 한다.
  viteFinal: async (viteConfig) => {
    viteConfig.resolve ??= {}
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      "@flameware/ui": uiSrc,
    }
    viteConfig.plugins ??= []
    viteConfig.plugins.push(tailwindcss())
    return viteConfig
  },
}

export default config
