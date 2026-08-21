/* 매니페스트에 담기는 컴포넌트 목록.
 *
 * 축은 여기 적지 않는다 — 컴포넌트가 내보내는 cva config가 그대로 축이다.
 * 손으로 적으면 verify가 원리적으로 못 잡는 사본이 된다(#22 §7). */
import { buttonVariants, buttonVariantsConfig } from "../../src/components/ui/button.tsx"
import { cardVariants, cardVariantsConfig } from "../../src/components/ui/card.tsx"
import { labelVariants, labelVariantsConfig } from "../../src/components/ui/label.tsx"
import { cn } from "../../src/lib/utils.ts"

export const COMPONENTS = [
  {
    name: "button",
    source: "src/components/ui/button.tsx",
    config: buttonVariantsConfig,
    // 실제 렌더와 같은 경로를 탄다 — cva가 이어 붙이고 tailwind-merge가 정리한다
    className: (props) => cn(buttonVariants(props)),
  },
  {
    name: "card",
    source: "src/components/ui/card.tsx",
    config: cardVariantsConfig,
    className: (props) => cn(cardVariants(props)),
  },
  {
    name: "label",
    source: "src/components/ui/label.tsx",
    config: labelVariantsConfig,
    className: (props) => cn(labelVariants(props)),
  },
]
