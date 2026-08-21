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
      return (
        <div
          className={`bg-background text-foreground ${theme === "dark" ? "dark" : ""}`}
          style={{ padding: "1rem", minHeight: "100vh" }}
        >
          <Story />
        </div>
      )
    },
  ],
}

export default preview
