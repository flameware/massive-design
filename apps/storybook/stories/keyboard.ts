/* 키보드 계약의 어휘.
 *
 * meta와 나란히 서지만 읽는 쪽이 다르다 — meta는 문서(사이드바·상태 표)가 읽고
 * 이것은 테스트(test/stories.test.mjs)가 읽는다. 파일을 가른 이유가 그것이다.
 *
 * 스토리가 자기 계약을 **선언**하고 Playwright가 그것을 잰다. 다음 컴포넌트가
 * 자기 계약(포커스 트랩·화살표 이동·Esc 닫기)을 더하는 자리가 여기다. 어휘를 늘리지 않아도 셋 다 표현된다 — 포커스 트랩은 "마지막에서 Tab을
 * 누르면 첫 자리로 돌아온다"(focused), 화살표 이동도 focused, 자동 활성화된 탭은
 * text로 잰다. 재는 것은 언제나 **밖에서 보이는 결과**다: 어느 노드가 포커스를
 * 갖는가, 무엇이 화면에 적혔는가. 핸들러가 불렸는가는 재지 않는다. */
export interface KeyboardContract {
  /** 무엇을 재는가. 실패 메시지가 이 문장을 그대로 쓴다 */
  name: string
  /** 누르기 전에 포커스를 둘 자리. 없으면 문서의 시작에서 누르기 시작한다 */
  focus?: string
  /** 순서대로 누르는 키 (Playwright 이름: Tab·Enter·Space·ArrowDown·Escape…) */
  press: string[]
  expect: {
    /** 마지막 키 뒤에 포커스가 있어야 하는 자리 */
    focused?: string
    /** 선택자 → 그 요소의 textContent. 활성화 횟수·선택된 항목을 잰다 */
    text?: Record<string, string>
  }
}

