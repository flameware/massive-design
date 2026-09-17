/* Input·Textarea가 공유하는 밑그림 — 테두리·배경·포커스 링·invalid·disabled
 * 넉 줄은 두 컨트롤이 글자 그대로 같다(정렬용 높이·리사이즈만 갈린다). 컴포넌트
 * 파일마다 문자열을 따로 들고 있으면 포커스 링이나 disabled 처리를 바꿀 때 한
 * 곳을 놓쳐도 티가 안 난다 — state.css의 `@utility state`를 하나로 둔 이유와
 * 같다(#299). Button은 같은 문자열을 일부 공유하지만 그 파일은 이 티켓의 몫이
 * 아니라 손대지 않는다. */
export const fieldControlBase = [
  // 쉬는 면은 카드와 같은 `bg.surface`다 — 입력은 파묻힌 면이 아니라 면 위에
  // 놓인 테두리 박스다(#463). 회색 면(`bg.inset`, 램프 step 3)은 카드 위에서
  // 1.14:1로 층을 거의 말하지 않으면서 무력화처럼은 충분히 읽혔고, 층을
  // 실제로 나르는 것은 테두리다 — `border.field`는 회색 면 위 1.71:1에서 흰 면
  // 위 1.95:1로 **세진다**. 다크에서는 면이 캔버스 대비 1.07:1로 내려가 경계를
  // 테두리(흰색 알파)가 혼자 지는데, 그것은 `bg.overlay`가 다크에서 이미 택한
  // 원칙과 같은 방향이다(tokens/semantic/color.json).
  "border-field bg-surface text-default",
  "placeholder:text-muted",
  "outline-offset-2 focus-visible:outline-2",
  "transition-[border-color,box-shadow]",
  // Field.Root 안에서만 의미가 있다 — 밖에서는 이 data 속성이 없어 걸리지 않는다
  "data-invalid:border-danger",
  // 회색은 버리지 않고 **뜻을 옮긴다**(#463): `bg.inset`은 이제 무력화된 입력의
  // 면이다. 불투명도 규약은 그대로 둔다 — 카탈로그 전체가 무력화를 그것으로
  // 말하므로 여기서 뒤집지 않고 면 하나를 더한다.
  "data-disabled:bg-inset data-disabled:pointer-events-none data-disabled:opacity-50",
]
