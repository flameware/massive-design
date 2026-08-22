import { dirname } from "path"
import { fileURLToPath } from "url"
import type { StorybookConfig } from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

const uiSrc = fileURLToPath(new URL("../../../packages/ui/src", import.meta.url))

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: [{ from: "../../../verification", to: "/verification" }],
  addons: [getAbsolutePath("@storybook/addon-a11y"), getAbsolutePath("@storybook/addon-docs")],
  framework: getAbsolutePath("@storybook/react-vite"),
  // @massive/ui는 dist가 아니라 src를 그대로 내보낸다(package.json exports).
  // 그 소스가 쓰는 tsconfig 경로 별칭(@/* → ./src/*)은 Vite가 모른다 —
  // tsconfig를 읽는 건 tsc/타입체커뿐이라 번들러에 따로 alias를 줘야 한다.
  viteFinal: async (viteConfig) => {
    viteConfig.resolve ??= {}
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      "@": uiSrc,
    }
    viteConfig.plugins ??= []
    viteConfig.plugins.push(tailwindcss())
    return viteConfig
  },
}

export default config
