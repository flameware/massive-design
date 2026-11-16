/* 데코레이터(테마·키보드 계약·렌더 완료 신호)는 apps/storybook의 것을 그대로 쓴다 —
 * 스토리 테스트가 읽는 `data-ds-keyboard`·`data-ds-rendered`가 거기서 난다.
 * 더하는 것은 `@layer ui-sdk` 선언 한 줄뿐이고, 그것이 styles.css보다 먼저 와야 한다. */
import "./layer.css"

import preview from "../../../apps/storybook/.storybook/preview"

export default preview
