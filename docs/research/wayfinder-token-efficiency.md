# Wayfinder 토큰 효율 진단

- 조사일: 2026-08-24
- 범위: `flameware/massive-design`의 완료·진행 Wayfinder 이슈와 저장소 문서
- 목표: 결과 품질과 추적 가능성을 유지하면서 전체 모델 토큰 사용량을 줄일 수 있는 지점을 찾는다
- 상태: 회고적 대리 지표 분석. 저장소에 모델 토큰 사용 로그가 없어 실제 토큰 수치는 측정하지 못했다

## 1. 결론

현재 증거로는 다음 세 종류의 병목을 구분해야 한다.

1. **누적 산출물 비용은 grilling이 가장 크다.** `wayfinder:grilling` 이슈 29개의 본문과 댓글은 합계 111,325 bytes로 조사한 유형 중 가장 크다. 인터뷰 라운드와 필수 스킬 문맥까지 고려하면 전체 누적 비용 1위 후보이다.
2. **티켓당 산출물 비용은 prototype이 가장 크다.** prototype 4개의 평균 본문·댓글 크기는 6,764 bytes다. 특히 [램프 생성기 프로토타입과 키 컬러 4종 확정](https://github.com/flameware/massive-design/issues/6)은 댓글만 11,316 bytes여서 반복 실험의 비용을 보여준다.
3. **실제 단일 세션 비용은 Figma 구현·동기화가 가장 클 가능성이 높다.** 필수 운영 문서와 `CONTEXT.md`만 약 53 KB이며, 여기에 코드, manifest, 생성 스크립트와 Figma 도구 응답이 추가된다. 이 부분은 토큰 로그가 없어 추론이다.

가장 먼저 줄일 것은 조사 깊이가 아니라 **반복해서 싣는 문맥**이다. 특히 큰 map, 티켓과 무관한 문서 선로딩, 전문 생성물과 로그의 대화 내 복제, 결정을 마친 뒤 같은 세션에서 이어지는 구현 문맥이 우선 대상이다.

## 2. 조사 방법과 한계

### 2.1 확인한 자료

- 저장소의 전체 GitHub 이슈 81개와 댓글 131개
- Wayfinder label별 이슈 본문·댓글 크기
- 큰 이슈와 map의 개별 크기
- `CONTEXT.md`, `docs/agents/`, `docs/research/`, `docs/tokens/`의 문서 크기
- Wayfinder, grilling, domain-modeling 스킬의 지침 크기와 로딩 규칙

크기는 토큰 수가 아니라 UTF-8 byte 수다. 언어, 코드, JSON 비율에 따라 token/byte 비율이 달라지므로 byte를 토큰으로 환산하지 않는다. 이 수치는 상대적인 문맥 규모를 비교하는 대리 지표로만 사용한다.

### 2.2 확인할 수 없었던 것

저장소에는 세션별 `input_tokens`, `cached_input_tokens`, `output_tokens` 또는 추론 토큰 로그가 없다. 도구 호출이 모델 문맥으로 반환한 전문, 압축 전 대화, 재시도, 서브에이전트 사용량도 GitHub 이슈에 남지 않는다.

따라서 이 문서의 순위는 두 등급으로 읽어야 한다.

- **MEASURED**: 저장소와 GitHub 이슈에서 직접 센 byte, 이슈 수, 댓글 수
- **INFERRED**: 스킬 절차와 필수 문서 규모를 근거로 예상한 실제 토큰 비용

정확한 작업별 토큰 순위는 §6의 전향적 계측 후에 확정한다.

## 3. 측정 결과

### 3.1 Wayfinder 이슈 유형별 산출물

| 유형 | 이슈 수 | 본문+댓글 | 이슈당 평균 | 댓글 수 | 판정 |
| --- | ---: | ---: | ---: | ---: | --- |
| grilling | 29 | 111,325 B | 3,838 B | 45 | 누적 산출물 최대 |
| task | 36 | 103,925 B | 2,886 B | 58 | 이슈·댓글 수 최대 |
| map | 5 | 34,046 B | 6,809 B | — | 반복 입력 위험 |
| prototype | 4 | 27,058 B | 6,764 B | 12 | 티켓당 평균 최대 |
| research | 7 | 23,500 B | 3,357 B | — | 외부 조사 비용은 이 수치에 없음 |

이 표는 최종 산출물만 센다. grilling의 실제 비용에는 매 라운드의 대화 문맥과 Wayfinder가 요구하는 grilling·domain-modeling 스킬 문맥이 더해진다. prototype과 research는 실행 중 도구 출력이 이슈에 요약만 남으므로 실제 비용과의 차이가 더 클 수 있다.

### 3.2 큰 이슈

| 이슈 | 유형 | 본문+댓글 | 관찰 |
| --- | --- | ---: | --- |
| [massive-design 토큰 파운데이션](https://github.com/flameware/massive-design/issues/1) | map | 17,736 B | 본문만 14,037 B. 매 세션 map 로딩 때 반복된다 |
| [램프 생성기 프로토타입과 키 컬러 4종 확정](https://github.com/flameware/massive-design/issues/6) | prototype | 13,690 B | 댓글 11,316 B. 반복 실험 비용이 큼 |
| [Figma 컴포넌트의 상태 표현 결정](https://github.com/flameware/massive-design/issues/24) | grilling | 10,225 B | 긴 결정 문맥 |
| [Figma↔React 매핑과 낡음 판정 규약 확정](https://github.com/flameware/massive-design/issues/25) | grilling | 9,535 B | 긴 결정 문맥 |
| [@massive/tokens — var-map 생성물과 스케일 변수 노출](https://github.com/flameware/massive-design/issues/41) | task | 8,693 B | 구현·검증 문맥 |

초기 map일수록 큰 경향이 있다. map 본문 크기는 #1 14,037 B, #14 5,992 B, #56 3,725 B, #78 3,488 B, #70 2,250 B다. 후속 map은 이미 더 작은 인덱스 형태에 가까워졌으므로 map 축약은 현실적인 개선이다.

### 3.3 선로딩 문맥

Wayfinder 스킬은 약 11.9 KB다. grilling 티켓은 grilling과 domain-modeling 지침도 요구하므로 세 스킬 지침만 약 17.2 KB가 된다. 여기에 저장소 `CONTEXT.md` 약 9.4 KB와 map, 티켓, 관련 문서가 붙는다.

Figma 동기화 작업에서 흔히 필요한 다음 네 문서는 합계 약 53 KB다.

- `CONTEXT.md`
- `docs/agents/design-system-sync.md`
- `docs/agents/figma-components.md`
- `docs/agents/figma-injection.md`

저장소의 비생성 연구·운영 문서 표본은 약 573 KB다. 큰 연구 문서 여러 개를 티켓 관련성 확인 없이 함께 읽으면 구현을 시작하기 전에 문맥 비용이 크게 증가한다. 반면 Wayfinder 원문은 map을 저해상도 인덱스로 한 번 읽고, 관련 티켓만 필요할 때 확대하도록 규정한다.

## 4. 작업별 비용 판단

### 4.1 Grilling — 누적 비용 1위 후보

근거:

- 유형별 본문·댓글 총량이 가장 크다.
- 한 번의 답으로 끝나지 않고 설계 트리의 frontier마다 전체 대화 문맥을 다시 사용한다.
- Wayfinder에 더해 grilling과 domain-modeling 지침을 반드시 읽는다.
- 결정과 구현을 같은 세션에서 계속하면 확정된 대화 전체가 구현 문맥에도 남는다.

grilling 자체를 줄이면 결정 품질이 손상될 수 있다. 줄여야 하는 것은 질문 수가 아니라 이미 확정된 사실의 반복, 서로 의존하는 질문을 너무 일찍 싣는 것, 결정 이후의 구현 연장이다.

### 4.2 Prototype — 티켓당 비용 1위 후보

근거:

- 이슈당 평균 산출물 크기가 가장 크다.
- 실행 결과를 보고 수정하는 반복 루프가 생기기 쉽다.
- 스크린샷, 코드, 브라우저·Figma 응답 등 이슈에 남지 않는 입력이 많다.

prototype은 시작 전에 답하려는 질문 하나와 acceptance matrix를 확정해야 한다. 한 실행이 여러 설계 질문을 동시에 탐색하기 시작하면 별도 티켓으로 분리한다.

### 4.3 Figma 구현·동기화 — 단일 세션 비용 1위 후보

근거:

- 필수 문서만 약 53 KB다.
- component manifest, 생성된 Figma payload, preflight 결과와 라이브 파일 검사 결과가 추가된다.
- human checkpoint 뒤의 수정과 재검증이 같은 문맥에서 반복될 수 있다.

이는 실제 토큰 로그가 없는 추론이다. §6에서 Figma 세션을 별도 작업 유형으로 계측해야 한다.

### 4.4 Research — 산출물만으로 과소평가될 가능성

research 이슈의 본문·댓글 총량은 작지만 외부 문서 전문, 검색 결과와 원문 비교는 최종 이슈에 남지 않는다. 연구 비용은 읽은 출처 수와 도구 출력 byte를 함께 기록하지 않으면 판단할 수 없다.

## 5. 절감안

### P0 — 반복 입력 제거

1. **map을 인덱스로 유지한다.** Destination, 현재 Notes, 한 줄짜리 Decisions-so-far, 현재 fog와 범위만 둔다. 결정의 근거와 상세는 티켓 또는 문서 한 곳에만 둔다.
2. **티켓별 context pointers를 명시한다.** 먼저 map과 티켓을 읽고 `rg`로 관련 절을 찾은 뒤, 필요한 문서만 연다. `docs/research/` 전체나 모든 Figma 문서를 기본 문맥으로 싣지 않는다.
3. **전문 대신 경로와 요약을 전달한다.** manifest, 생성 JS, 빌드 로그, preflight 출력은 파일 경로·실패 항목·개수만 대화에 남긴다. 원문은 오류를 좁힐 때만 연다.
4. **결정과 구현 세션을 분리한다.** grilling은 결정과 짧은 resolution pointer에서 끝낸다. 구현 task는 그 pointer와 필요한 파일만 새 문맥으로 읽는다.

### P1 — 반복 루프 제한

5. **prototype은 질문 하나와 acceptance matrix 하나로 시작한다.** 실행 횟수 제한을 임의로 두기보다, 각 반복이 어느 미충족 기준을 검증하는지 기록한다. 새 질문이 나오면 새 티켓으로 보낸다.
6. **기계적 검사는 묶어서 실행하고 요약한다.** 서로 독립적인 검사 명령을 한 번에 실행하되, 모델에는 전체 성공 로그 대신 exit code, 실패 목록과 핵심 개수만 반환한다.
7. **grilling은 breadth-first frontier만 묻는다.** 아직 열린 답에 의존하는 질문은 다음 라운드로 미룬다. 각 라운드 시작 때 이미 합의된 답을 장문으로 재진술하지 않는다.

### P2 — 기존 부채와 자동화

8. **대형 map 축약을 별도 후속 작업으로 검토한다.** 우선 대상은 [massive-design 토큰 파운데이션](https://github.com/flameware/massive-design/issues/1)이다. 상세 결정을 해당 티켓·정본 문서가 실제로 보존하는지 확인한 뒤 중복만 제거해야 한다.
9. **수동 계측이 안정된 뒤 자동화한다.** 처음부터 수집기를 만들면 어떤 지표가 유용한지 확인하기 전에 운영 복잡도가 생긴다.

## 6. 전향적 측정 계획

### 6.1 표본

다음 Wayfinder 세션 10개를 기록한다. 가능한 한 grilling, prototype, research, task, Figma 구현·동기화를 포함한다. 서로 다른 작업 유형을 하나의 평균으로 합치지 않는다.

새 컨텍스트에서도 측정이 이어지도록 `AGENTS.md`가 [`docs/agents/wayfinder-token-measurement.md`](../agents/wayfinder-token-measurement.md)를 가리킨다. 세션별 값은 [`wayfinder-token-sessions.tsv`](wayfinder-token-sessions.tsv)에 최대 10행까지 누적한다. 이 방식은 저장소 기록을 자동으로 이어 주지만, 런타임이 노출하지 않는 실제 token 값까지 만들어 내지는 않는다. 정확한 값이 없으면 `n/a`로 남긴다.

### 6.2 세션 기록 스키마

| 필드 | 설명 |
| --- | --- |
| date | 세션 날짜 |
| map | map 이름과 URL |
| ticket | 티켓 이름과 URL |
| work_type | grilling / prototype / research / task / figma-sync |
| outcome | resolved / handed-off / blocked |
| input_tokens | 세션의 입력 토큰 |
| cached_input_tokens | 캐시된 입력 토큰 |
| output_tokens | 출력 토큰 |
| reasoning_tokens | 제공되는 경우 기록 |
| tool_output_bytes | 모델 문맥에 반환된 도구 출력의 총 byte |
| skill_bytes | 세션에서 읽은 스킬 지침 byte |
| repo_context_bytes | 읽은 저장소 파일의 총 byte |
| interview_rounds | HITL 질문 라운드 수 |
| retries | 실패 후 다시 실행한 횟수 |
| rework_7d | 7일 안에 같은 결정·구현을 다시 연 횟수 |
| notes | 비정상적으로 큰 입력이나 human checkpoint |

토큰 필드가 실행 환경에서 제공되지 않으면 비워 두고 byte 지표를 계속 기록한다. byte와 token을 하나의 숫자로 합산하지 않는다.

### 6.3 기준선과 1차 목표

10개 세션을 모은 뒤 작업 유형별로 다음을 계산한다.

- 비캐시 입력 토큰 중앙값: `input_tokens - cached_input_tokens`
- 출력 토큰 중앙값
- tool output byte 중앙값
- 해결된 티켓당 총 토큰
- interview round와 retry 분포

1차 가설은 **동일 작업 유형의 비캐시 입력 토큰 중앙값을 25% 줄인다**이다. 기준선이 생기기 전에는 이 수치를 성과로 주장하지 않는다.

품질 보호 지표는 다음과 같다.

- 7일 내 재작업 또는 재개 이슈 수가 증가하지 않는다.
- resolution에 결정과 근거 링크가 누락되지 않는다.
- 검증 실패와 human checkpoint 재시도 횟수가 증가하지 않는다.
- map의 fog 또는 열린 티켓이 축약 과정에서 유실되지 않는다.

## 7. 후속 판단 기준

10개 세션 뒤 다음 질문에 답한다.

1. 실제 총 토큰과 비캐시 입력 토큰에서 가장 비싼 작업 유형은 무엇인가?
2. map, skill, repo 문서, 도구 출력 중 반복 입력의 가장 큰 출처는 무엇인가?
3. Figma 세션의 비용은 문서 선로딩과 도구 반복 중 어디에 더 민감한가?
4. grilling 라운드 수와 재작업 감소 사이에 상관이 있는가?
5. 25% 절감 가설이 품질 보호 지표를 훼손하지 않고 달성 가능한가?

그 결과가 나온 뒤에만 Wayfinder 운용 문서 수정이나 자동 계측 도구를 결정한다. 이 진단 자체는 기존 Wayfinder 규칙이나 완료된 map을 변경하지 않는다.
