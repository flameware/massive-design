import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  title: "Pipeline/LLM assembly",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SocialLogin: Story = {
  render: () => (
    <article style={{ maxWidth: 720, fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <h1>LLM assembly demo</h1>
      <p>
        The agent assembled a social-login screen from Card, Label, and Button Figma
        instances. The Figma result is available in the <a href="https://www.figma.com/design/wxz7M6txDvlvH6Z95JzDHJ/Massive-Design?node-id=117-3">Demo page</a>.
      </p>
      <ul>
        <li>Card: 1 instance</li>
        <li>Label: 1 instance</li>
        <li>Button: 2 instances (default and outline)</li>
        <li>Canvas and text colors: semantic variable bindings</li>
      </ul>
      <p>
        Current boundary: the Massive Design library is subscribed, but its three
        component sets are unpublished, so library search returns no assets. The
        demonstration uses the matching local instances until a human publishes the sets.
        Figma cloud also lacks Pretendard, so editable demo text uses the documented Inter fallback.
      </p>
    </article>
  ),
}
