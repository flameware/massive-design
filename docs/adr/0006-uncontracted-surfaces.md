# 미계약 표면을 두 관문으로 가르고, 판정을 계약에 남긴다

`Card`는 `CardHeader`·`CardTitle`·`CardAction`·`CardDescription`·`CardContent`·`CardFooter` 여섯 파트를 공개하면서 `anatomy: []`로 **43세대를 통과했다.** 게이트의 part 검사가 **anatomy → parts 한 방향만** 봤고 Card에는 `parts`가 없었기 때문이다. [#122](https://github.com/flameware/massive-design/issues/122)가 이름 붙인 **"없는 것은 통과가 아니라 침묵이다"** 가 계약 자체에서 재현된 것이다([#121](https://github.com/flameware/massive-design/issues/121)).

그리고 이건 하나가 아니었다. upstream 문서에는 있는데 우리 계약에는 없고, `limits`에 **닫는다고 적힌 적조차 없는** 표면이 14개 있었다 — `AvatarBadge`, `AlertAction`, `ItemMedia`의 `image`, `InputGroupAddon`의 `align`, `TabsList`의 밑줄 축…. `limits`에 없다는 것은 "닫기로 했다"가 아니라 **"고려된 적 없다"** 이고, 그건 판정을 재검토하는 일보다 한 겹 더 깊다.

## 결정

**판정 3(승격)은 두 관문을 모두 통과해야 한다.**

- **ⓐ 파생 채널이 구분하는가** — anatomy가 늘거나 `cva` 축이 생기는가. [#97](https://github.com/flameware/massive-design/issues/97)·[#119](https://github.com/flameware/massive-design/issues/119) 규칙의 직접 적용이다.
- **ⓑ 소비처가 스스로 하면 계약이 새는가** — 소비처가 `className`으로 재현해야 하고, 그 클래스가 **우리 스타일 결정을 복제**하는가.

**판정 결과는 열지 않기로 한 것까지 `limits`에 문장으로 남긴다.** 이 원칙의 대상은 종류 ②(고려된 적 없는 표면)이며, 기록이 없으면 다음 재조회가 같은 자리를 다시 발견한다.

**그리고 게이트에 반대 방향을 세운다** — 대문자로 시작하는 공개 export는 anatomy에 이름이 있어야 한다. `cva` 헬퍼는 소문자라 저절로 빠진다.

## 고려한 대안

- **ⓐ만으로 가른다** — 축이 늘면 승격. 단순하지만 `Card`의 `size`처럼 "축은 늘지만 소비처가 패딩 유틸 한 줄로 끝내는" 것까지 통과해, 우리가 정한 적 없는 스케일 결정을 떠안게 된다. ⓑ가 있어야 **"왜 이건 우리 것이어야 하는가"** 에 답이 생긴다.
- **upstream을 그대로 따라간다** — 판정 자체를 없애고 shadcn/ui의 표면을 전부 승계한다. #97이 Drawer를 닫고 #119가 Aspect Ratio를 닫으며 세운 "우리 계약이 설명할 것이 있는가"라는 기준을 통째로 버리는 일이다.
- **`notContracted` 같은 구조화 필드를 새로 만든다** — `externalSurfaces`·`gestures`의 선례를 따르는 모양이다. 그러나 그 둘이 필드가 된 이유는 **파생 채널이 읽어야 하거나 게이트가 지킬 수 있기 때문**인데, "upstream에 있지만 우리는 안 연다"는 소비할 파생 채널도 없고 **없는 것을 없다고 검사할 수단도 없다.** `schemaVersion`을 올리면서 아무도 읽지 않는 필드가 생긴다.
- **게이트 규칙 없이 `limits` 문장만** — 가장 싸다. 그러나 `Card`의 침묵을 만든 것이 정확히 "사람만 읽는 기록"이었다. 문장은 사람이 볼 때만 보이고 게이트는 매번 본다.

## 파급

**`limits`의 성격이 갈라진다.** 지금까지 `limits`는 *사용 지침*이었다("잠깐 나타나는 결과에는 Toast를 써라"). 이제 *공백 대장*을 겸한다 — 12개 계약의 문장이 길어졌고 두 목소리가 한 문장에 섞인다. 새 필드를 만들지 않기로 한 대가이며, `limits`가 계약의 **유일한 공백 기록 필드**라는 사실을 받아들인 결과다.

**게이트 규칙은 anatomy의 *존재*만 지킨다.** 이름이 anatomy에 있는지는 보지만 그 anatomy가 **옳은지** — 순서, 선택·반복 표식, 실제 조립 가능성 — 는 못 본다. `Card`의 새 anatomy가 맞는지는 사람이 Storybook에서 판정했다.

**판정 3이 곧 실행은 아니다.** [#121](https://github.com/flameware/massive-design/issues/121)의 승격 8건은 근거를 갖췄지만 [#118](https://github.com/flameware/massive-design/issues/118)의 destination 밖이라 별도 effort로 갔다 — destination이 [#74](https://github.com/flameware/massive-design/issues/74)의 P2 11개를 실행하는 일이고 승격분은 **이미 완성된 43개를 다시 여는 일**이기 때문이며, #110·#111을 밖에 둔 것과 같은 근거다. **열 근거가 있다는 판정과 지금 여는 결정은 다른 층위다.** 판정과 근거가 `limits`에 이미 있으므로 그 effort는 새 조사가 아니라 실행에서 시작한다.

**upstream 대조는 여전히 사람이 진다.** 게이트는 "upstream에 있는데 우리에게 없다"를 판정할 수 없다 — 남의 문서를 읽어야 알기 때문이다. [#120](https://github.com/flameware/massive-design/issues/120)류의 재조회가 계속 필요하고, 이 ADR이 바꾼 것은 **그 재조회가 같은 항목을 두 번 발견하지 않게 되었다**는 것뿐이다.
