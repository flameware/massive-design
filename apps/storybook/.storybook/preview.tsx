import * as React from "react"
import type { Preview } from "@storybook/react-vite"
import "@massive/ui/styles.css"

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? "light"
      /* 테마 클래스는 문서 루트에 건다. 오버레이 컴포넌트는 내용을 document.body로
       * portal하므로, 클래스를 아래 래퍼에만 걸면 포털로 나간 표면이 테마 범위 밖에
       * 착지해 dark에서도 light로 렌더된다. 배경·글자색은 tokens.css의 base 규칙이
       * body에 칠한다. */
      React.useEffect(() => {
        const root = document.documentElement
        root.classList.toggle("dark", theme === "dark")
        return () => root.classList.remove("dark")
      }, [theme])
      return (
        <div style={{ padding: "1rem", minHeight: "100vh" }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
