# 중립 solid 배경의 별칭을 `secondary-solid`가 아니라 `neutral-solid`로 연다

`--ds-bg-neutral-solid`에 shadcn 이름 별칭이 없어 컨트롤 어포던스(Scroll Area thumb, Switch off 트랙)가 Tailwind 유틸리티로 solid 중립 배경에 닿지 못했다([#109](https://github.com/flameware/massive-design/issues/109)). 별칭 계층의 접미사 관습을 따르면 `secondary-solid`가 자연스럽지만, neutral만 `secondary`가 soft 자리를 이미 먹은 비대칭이라 그 이름은 "soft인 것의 solid"라는 뒤집힌 뜻이 된다. 별칭은 되돌리기 어려운 공개 표면이므로, 관습보다 뜻을 택해 우리 semantic 이름과 1:1인 `neutral-solid`를 연다.

## 고려한 대안

- **`secondary-solid`** — 다른 계열(`primary`/`primary-soft`, `destructive`/`destructive-soft`)의 파생 모양과 일치한다. 그러나 그 모양에서 접미사 없는 이름은 언제나 solid인데 neutral에서만 soft라, 같은 모양이 반대 뜻을 갖는다. 영구적인 이름에 남길 결함으로 판단했다.
- **역할 이름(`control`·`control-solid` 등)** — 발견한 것이 색이 아니라 역할이므로 개념적으로 가장 정직하다. 그러나 별칭 계층이 어휘 상한 밖인 근거는 "소비처가 아는 이름, 그리고 그와 같은 모양으로 파생된 이름"이고, 역할 이름은 파생이 아니라 **발명**이라 그 근거를 무너뜨린다. 여는 데 alias 정의 자체의 개정이 필요해 이 결정보다 큰 작업이다.
- **별칭을 열지 않고 `--ds-bg-neutral-solid`를 직접 읽기** — `state.layer`의 명시적 예외와 같은 길이다. 그러나 그 예외의 근거는 "완성된 색 유틸리티가 아니라 상태 합성 전용 입력이라서"였고 `bg.neutral.solid`는 완성된 색이라 논리가 옮겨오지 않는다. 게다가 이 역할을 쓰는 자리가 최소 둘이라 예외가 예외로 남지 못한다.
- **`secondary`를 solid로 재지정** — 공개 기준선의 기존 Figma 인스턴스를 재해석하는 breaking 변경이다.

## 파급

`neutral-solid`는 shadcn 정본에 없는 이름이다. 그래도 별칭 계층에 사는 것은 `success`·`warning`·`link`·`focus-contrast`와 같은 근거이며, 어휘 상한 계산에는 들어가지 않는다.

이 결정은 값이 아니라 **역할**에 이름을 준다. `--ds-border-strong`은 `--ds-bg-neutral-solid`와 값이 같지만(둘 다 neutral 9) 별칭을 열지 않는다 — 계열은 값이 아니라 역할을 가르며, 그것이 매니페스트 lint 규칙 3의 전제다.
