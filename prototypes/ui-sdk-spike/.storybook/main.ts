import { dirname } from "path"
import { fileURLToPath } from "url"
import type { StorybookConfig } from "@storybook/react-vite"
import tailwindcss from "@tailwindcss/vite"

/* #496 스파이크의 Storybook. apps/storybook의 설정에서 문서(MDX)·매니저 외관을
 * 뺀 것이다 — 재는 것은 스토리뿐이다.
 *
 * `SPIKE_TARGET`이 스토리 폴더 하나를 고른다(run.sh). 비우면 전부다.
 *
 * 별칭 둘:
 *   - `@flameware/ui` → packages/ui/src. 스파이크가 옮기지 않은 것(Button·Toggle·
 *     ToggleGroup·cn·fieldControlBase·styles.css)은 게시 패키지의 소스를 그대로 쓴다.
 *   - `@spike/ui` → ./src. UI SDK 위에 다시 세운 스파이크 대상이다. */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

const uiSrc = fileURLToPath(new URL("../../../packages/ui/src", import.meta.url))
const spikeSrc = fileURLToPath(new URL("../src", import.meta.url))
const target = process.env.SPIKE_TARGET

const config: StorybookConfig = {
  stories: [target ? `../stories/${target}/**/*.stories.tsx` : "../stories/**/*.stories.tsx"],
  addons: [getAbsolutePath("@storybook/addon-a11y"), "storybook/viewport"],
  framework: getAbsolutePath("@storybook/react-vite"),
  viteFinal: async (viteConfig) => {
    viteConfig.resolve ??= {}
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      "@flameware/ui": uiSrc,
      "@spike/ui": spikeSrc,
    }
    viteConfig.resolve.dedupe = [...(viteConfig.resolve.dedupe ?? []), "react", "react-dom"]
    viteConfig.plugins ??= []
    viteConfig.plugins.push(tailwindcss())
    return viteConfig
  },
}

export default config
