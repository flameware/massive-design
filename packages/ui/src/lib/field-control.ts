/* Input·Textarea가 공유하는 밑그림 — 테두리·배경·포커스 링·invalid·disabled
 * 넉 줄은 두 컨트롤이 글자 그대로 같다(정렬용 높이·리사이즈만 갈린다). 컴포넌트
 * 파일마다 문자열을 따로 들고 있으면 포커스 링이나 disabled 처리를 바꿀 때 한
 * 곳을 놓쳐도 티가 안 난다 — state.css의 `@utility state`를 하나로 둔 이유와
 * 같다(#299). Button은 같은 문자열을 일부 공유하지만 그 파일은 이 티켓의 몫이
 * 아니라 손대지 않는다. */
export const fieldControlBase = [
  "border-field bg-inset text-default",
  "placeholder:text-muted",
  "outline-offset-2 focus-visible:outline-2",
  "transition-[border-color,box-shadow]",
  // Field.Root 안에서만 의미가 있다 — 밖에서는 이 data 속성이 없어 걸리지 않는다
  "data-invalid:border-danger",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
]
