/* GENERATED from @massive/ui manifests. Do not edit. */
export const catalog = [
  {
    "component": "accordion",
    "displayName": "Accordion",
    "hash": "4f3463aca5d6",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Accordion",
      "AccordionItem*",
      "AccordionTrigger",
      "AccordionContent"
    ],
    "configurationStates": {
      "expansion": [
        "single",
        "multiple"
      ],
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "accordion",
      "guidance": {
        "evidence": "설정·도움말처럼 제목별로 나뉜 긴 보조 정보를 좁은 화면에서 단계적으로 확인해야 한다.",
        "limits": "순서가 필수인 절차, 항상 보여야 하는 핵심 정보, 서로 무관한 동작 모음에는 사용하지 않는다.",
        "use": "관련된 여러 섹션의 제목을 훑고 필요한 내용을 하나 또는 여러 개 펼친다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/accordion.tsx"
  },
  {
    "component": "alert",
    "displayName": "Alert",
    "hash": "6b88a734dc1b",
    "cells": 4,
    "axes": {
      "variant": [
        "default",
        "success",
        "warning",
        "destructive"
      ]
    },
    "anatomy": [
      "Alert",
      "AlertTitle?",
      "AlertDescription",
      "AlertAction?"
    ],
    "configurationStates": {},
    "reference": {
      "example": "alert",
      "guidance": {
        "evidence": "투자 데이터 동기화 결과와 가격 지연 경고를 성공·warning·danger 의미로 구별해야 하고, 동기화가 실패한 경고에는 다시 시도 버튼이 같은 카드 안에 있어야 한다.",
        "limits": "잠깐 나타나는 작업 결과에는 Toast를 사용하고, 모든 안내를 role=alert로 반복해 쌓지 않는다. `AlertAction`은 **자리만 정하고 내용은 소비처가 넣는다** — 대개 `Button`이며, 우리가 variant·size 기본값을 먹이지 않는다(#91). `AlertAction`은 anatomy 순서대로 **DOM의 맨 뒤**에 둔다: `role=alert`은 삽입 시점에 내용을 통째로 읽고 그 순서는 DOM이 정하므로, 앞에 두면 버튼 이름부터 읽힌다. 위치 축은 계약하지 않는다 — upstream이 위치 prop 없이 오른쪽 위로 고정하고 실측 수요 없이 축을 열지 않는다(#123). **absolute라 제목·설명과 겹칠 수 있다**: 긴 제목은 소비처가 `pr-*`로 자리를 비운다. 열로 두면 겹치지 않지만 1열 그리드를 재해석하거나(breaking) 조건부 열이 되어 파생 채널이 못 그린다(#144). 아이콘 컬럼은 계약하지 않는다 — 이 Alert이 1열 그리드라 도입하면 기존 인스턴스의 격자를 재해석하는 breaking이다(#121).",
        "use": "화면 안에서 사용자가 알아야 할 지속적인 피드백이나 주의 사항을 의미별로 전달하고, 그 자리에서 할 수 있는 동작 하나를 `AlertAction`에 얹는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/alert.tsx"
  },
  {
    "component": "alert-dialog",
    "displayName": "Alert Dialog",
    "hash": "ff95c8d6a7c2",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "AlertDialog",
      "AlertDialogTrigger",
      "AlertDialogPortal",
      "AlertDialogOverlay",
      "AlertDialogContent",
      "AlertDialogHeader?",
      "AlertDialogTitle",
      "AlertDialogDescription",
      "AlertDialogFooter",
      "AlertDialogCancel",
      "AlertDialogAction"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "alert-dialog",
      "guidance": {
        "evidence": "투자 거래 삭제는 기록과 손익 계산에 영향을 주므로 실행과 취소의 의미를 분리해 확인해야 한다.",
        "limits": "일반 정보, 양식 입력, 되돌리기 쉬운 행동에는 Dialog를 사용하고 Alert Dialog를 반복적인 확인 단계로 만들지 않는다. `size` 축과 `AlertDialogMedia`는 열지 않는다 — size는 소비처가 유틸리티로 정할 수 있고, Media는 Dialog에는 없어 두 컴포넌트의 anatomy를 갈라놓는 upstream의 비대칭이라 승계할 근거가 없다(#121).",
        "use": "되돌리기 어렵거나 중요한 행동을 실행하기 직전에 결과를 설명하고 명시적인 확인을 받는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/alert-dialog.tsx"
  },
  {
    "component": "avatar",
    "displayName": "Avatar",
    "hash": "756a033048b3",
    "cells": 6,
    "axes": {
      "knockout": [
        "none",
        "ring"
      ],
      "size": [
        "sm",
        "default",
        "lg"
      ]
    },
    "anatomy": [
      "Avatar",
      "AvatarImage?",
      "AvatarFallback",
      "AvatarBadge?",
      "AvatarGroup?",
      "AvatarGroupCount?"
    ],
    "configurationStates": {
      "source": [
        "image",
        "fallback"
      ]
    },
    "reference": {
      "example": "avatar",
      "guidance": {
        "evidence": "투자 기록의 작성자나 연결된 증권 계정을 목록과 활동 내역에서 빠르게 구별해야 하고, 한 기록에 참여자가 여럿이면 얼굴을 겹쳐 보이고 나머지 수를 함께 낸다.",
        "limits": "이미지만으로 이름을 전달하지 말고 주변 텍스트나 접근 가능한 이름을 제공하며, 장식 이미지에는 빈 대체 텍스트를 사용한다. `AvatarGroup`은 접근 가능한 이름을 `aria-label`로 요구한다 — 겹친 얼굴 더미는 그 자체로 무엇의 모임인지 말하지 않는다. 겹치지 않고 나란히 늘어놓는 경우에는 쓰지 않는다: 그건 소비처의 `flex gap-*`이고 이 컴포넌트가 계약하는 것은 겹침 간격과 가르는 링뿐이라 링이 필요 없으면 남는 결정이 없다. `AvatarBadge`와 `AvatarGroupCount`는 `role=\"img\"`를 달고 `aria-label`을 타입으로 요구한다 — 색점과 `+3`은 그 자체로 이름이 아니고, role 없이 `aria-label`만 얹으면 `aria-prohibited-attr`로 걸린다. `AvatarBadge`의 위치 축은 계약하지 않는다 — upstream이 위치 prop 없이 오른쪽 아래로 고정하고, 실측 수요 없이 축을 열지 않는다(#123). 다른 모서리는 소비처가 className으로 옮긴다. **겹침 링의 색은 canvas로 고정된다**(`--ds-border-knockout`) — 카드나 팝오버 면 위에 놓인 그룹에서는 링이 그 면과 어긋난다. upstream도 `ring-background`로 같은 한계를 갖고, 면마다 링 색을 가르려면 축이 하나 더 생겨 셀이 면 수만큼 늘어난다(ADR-0007). 소비처가 그 자리에서 `border-card` 같은 클래스로 덮는다. 넘침 수를 몇에서 접는지는 계약하지 않는다 — 소비처가 정해 `AvatarGroupCount`에 텍스트로 넣는다.",
        "use": "사람이나 계정을 작은 원형 이미지로 식별하고 이미지가 없거나 실패하면 안정적인 fallback을 표시한다. 여럿을 겹쳐 보일 때는 `AvatarGroup`이 겹침 간격과 가르는 링을 지고, 넘치는 수는 `AvatarGroupCount`가 같은 지름으로 잇는다. 상태 점은 `AvatarBadge`가 오른쪽 아래에 얹는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/avatar.tsx"
  },
  {
    "component": "badge",
    "displayName": "Badge",
    "hash": "37c940c4d831",
    "cells": 4,
    "axes": {
      "variant": [
        "neutral",
        "accent",
        "success",
        "danger"
      ]
    },
    "anatomy": [
      "Badge"
    ],
    "configurationStates": {},
    "reference": {
      "example": "badge",
      "guidance": {
        "evidence": "매수·매도, 시장, 손익 의미를 neutral·accent·success·danger에 소비처가 매핑한다.",
        "limits": "도메인 값을 variant 이름으로 추가하지 않는다.",
        "use": "짧은 분류와 상태를 보조한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/badge.tsx"
  },
  {
    "component": "breadcrumb",
    "displayName": "Breadcrumb",
    "hash": "ca48b1d9992c",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Breadcrumb",
      "BreadcrumbList",
      "BreadcrumbItem*",
      "BreadcrumbLink*",
      "BreadcrumbPage",
      "BreadcrumbSeparator*",
      "BreadcrumbEllipsis?"
    ],
    "configurationStates": {
      "currentLocation": [
        "ancestor",
        "current"
      ]
    },
    "reference": {
      "example": "breadcrumb",
      "guidance": {
        "evidence": "깊은 설정이나 상세 화면에서 사용자가 상위 범위로 되돌아갈 수 있는 짧은 경로가 필요하다.",
        "limits": "단일 단계 화면이나 선형 진행 상황에는 사용하지 않으며, 긴 경로를 축약해도 현재 위치와 접근 가능한 탐색 이름은 유지한다.",
        "use": "현재 위치의 상위 계층을 링크로 제공하고 마지막 항목을 현재 위치로 표시한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/breadcrumb.tsx"
  },
  {
    "component": "button",
    "displayName": "Button",
    "hash": "6ec13ce8b0c2",
    "cells": 48,
    "axes": {
      "size": [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg"
      ],
      "variant": [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link"
      ]
    },
    "anatomy": [
      "Button"
    ],
    "configurationStates": {},
    "reference": {
      "example": "button",
      "guidance": {
        "evidence": "거래 추가와 행 메뉴의 명시적 동작에 필요하다.",
        "limits": "탐색 링크나 화면 전용 아이콘 API를 대신하지 않는다.",
        "use": "사용자가 명시적으로 시작하는 동작에 쓴다."
      }
    },
    "stateSamples": true,
    "source": "src/components/ui/button.tsx"
  },
  {
    "component": "button-group",
    "displayName": "Button Group",
    "hash": "adcce550fd2b",
    "cells": 2,
    "axes": {
      "orientation": [
        "horizontal",
        "vertical"
      ]
    },
    "anatomy": [
      "ButtonGroup",
      "Button*",
      "ButtonGroupText?",
      "ButtonGroupSeparator?"
    ],
    "configurationStates": {
      "disabled": [
        "enabled",
        "disabled"
      ]
    },
    "reference": {
      "example": "button-group",
      "guidance": {
        "evidence": "투자 이력의 행 도구 모음처럼 내보내기·인쇄·행 메뉴가 나란히 서야 하고, 그중 하나만 비활성이 되는 자리가 있다.",
        "limits": "하나의 값을 고르는 선택 위젯에는 쓰지 않는다 — 그 자리는 화살표 키 이동과 선택 상태를 가진 Toggle Group이며, 이 컴포넌트는 Button의 공개 props를 주입하거나 대체하지 않는다.",
        "use": "서로 무관한 동작 버튼을 같은 맥락에서 하나의 덩어리로 붙여 보여 주고, 자식마다 탭 정지와 각자의 disabled를 남긴다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/button-group.tsx"
  },
  {
    "component": "calendar",
    "displayName": "Calendar",
    "hash": "cd1751acdc6f",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Calendar",
      "CalendarHeader",
      "CalendarNav*",
      "CalendarCaption",
      "CalendarGrid",
      "CalendarHeadCell*",
      "CalendarCell*",
      "CalendarDay*"
    ],
    "configurationStates": {
      "selection": [
        "single",
        "range"
      ]
    },
    "reference": {
      "example": "calendar",
      "guidance": {
        "evidence": "투자 이력의 거래일 입력은 하루를, 손익 조회 기간 필터는 구간을 고르며 미래 거래일처럼 고를 수 없는 날짜를 격자에서 미리 막아야 한다.",
        "limits": "입력 필드·팝오버·확인 버튼을 묶는 Date Picker 조합과 연·월 드롭다운, 다중 월 표시, 흩어진 여러 날짜 선택(multiple)은 계약하지 않는다. 시간대 변환과 날짜 파싱·직렬화도 다루지 않고 지역 달력 날짜만 받는다. 월 이름·요일 이름은 locale prop이 정하고 주 시작 요일과 오늘 기준일은 소비처가 명시한다.",
        "use": "한 달 격자에서 날짜 하나(single) 또는 시작·끝이 있는 기간(range)을 고르고, 오늘·이번 달 밖·선택 불가 날짜를 격자 안에서 구분한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/calendar.tsx"
  },
  {
    "component": "card",
    "displayName": "Card",
    "hash": "82d2063c2dba",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Card",
      "CardHeader?",
      "CardTitle?",
      "CardDescription?",
      "CardAction?",
      "CardContent?",
      "CardFooter?"
    ],
    "configurationStates": {},
    "reference": {
      "example": "card",
      "guidance": {
        "evidence": "투자 이력의 요약 영역에서 기존 Card를 재사용한다.",
        "limits": "SummaryCard 같은 도메인 컴포넌트를 만들지 않는다. `size` 축(upstream의 default/sm)은 열지 않는다 — 축은 늘지만 간격은 소비처가 유틸리티로 정하면 되고 우리 스케일 결정을 복제하지 않는다(#121).",
        "use": "관련 콘텐츠를 하나의 표면으로 묶는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/card.tsx"
  },
  {
    "component": "carousel",
    "displayName": "Carousel",
    "hash": "c2666ff27501",
    "cells": 2,
    "axes": {
      "orientation": [
        "horizontal",
        "vertical"
      ]
    },
    "anatomy": [
      "Carousel",
      "CarouselContent",
      "CarouselTrack",
      "CarouselItem*",
      "CarouselPrevious?",
      "CarouselNext?"
    ],
    "configurationStates": {
      "currentSlide": [
        "first",
        "middle",
        "last"
      ]
    },
    "reference": {
      "example": "carousel",
      "guidance": {
        "evidence": "투자 이력의 요약 화면은 보유 종목 카드와 월별 회고 카드를 좁은 폭에 나란히 놓아야 하고, 세로로 다 펼치면 그 아래의 거래 목록이 화면 밖으로 밀린다.",
        "limits": "목록을 전부 봐야 하는 자리에는 쓰지 않는다 — 넘겨야만 보이는 항목은 훑기의 대상이 되지 못한다. 접근 가능한 이름은 소비처가 루트에 aria-label로 준다. 자동 재생은 없다: Embla autoplay 플러그인을 넣지 않았으므로 스스로 움직이는 것이 없고 정지 수단을 계약할 것도 없다. 드래그는 컨트롤 제스처라 표면이 사라지지 않고 키보드 동등 경로(가로 ←/→, 세로 ↑/↓)가 계약 안에 있으므로 gestures를 선언하지 않는다(ADR 0005) — 다만 Embla의 watchDrag·watchFocus 기본값이 켜진 채로 출하되는 상속 표면이라 여기 적는다. 끄려면 소비처가 opts로 끈다. 한 번에 몇 장을 보일지(basis-*)와 loop·align·slidesToScroll은 소비처가 소유한다 — 스냅 지점은 Embla가 실측으로 정하고 우리 계약에 나타나지 않는다. 슬라이드 위치 표시기(dots)는 열지 않았다: 현재 위치를 표식 있는 노드로 그리는 표면이라 열 근거는 있으나 upstream에 없고 리포에 수요가 0건이라, 지금 열면 우리가 정한 적 없는 표시기 스케일을 떠안는다(#123이 Kbd의 크기 축을 닫은 것과 같은 근거). 터치 히트 영역의 크기는 터치 대상 크기 규칙(#111)이 정한 뒤에 다시 본다.",
        "use": "같은 무게의 항목 여럿을 한 자리에서 몇 개씩만 보여주고 나머지는 이전·다음으로 넘겨 보게 한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/carousel.tsx"
  },
  {
    "component": "chart",
    "displayName": "Chart",
    "hash": "1e10e7cac154",
    "cells": 3,
    "axes": {
      "indicator": [
        "dot",
        "line",
        "dashed"
      ]
    },
    "anatomy": [
      "ChartContainer",
      "ChartTooltipContent?",
      "ChartTooltipLabel?",
      "ChartTooltipItem*",
      "ChartTooltipIndicator?",
      "ChartTooltipValue?",
      "ChartLegendContent?",
      "ChartLegendItem*",
      "ChartLegendSwatch?"
    ],
    "configurationStates": {},
    "reference": {
      "example": "chart",
      "guidance": {
        "evidence": "투자 이력은 월별 매수·매도 금액과 평가금액 추이를 같은 화면에서 보여주고, 그 위에 뜨는 툴팁과 범례가 카드·팝오버와 다른 면으로 보이면 같은 앱으로 읽히지 않는다.",
        "limits": "차트 본체(축·격자·데이터 마크)는 계약하지 않는다 — Recharts 소유이고 우리 className이 닿는 노드가 없다. 자손 선택자로 그 노드를 칠하지도 않는다: 매니페스트에는 담기지만 Figma가 그리지 못해 자산의 공백이 아니라 거짓 자산이 되기 때문이며, 본체 스타일은 소비처가 stroke·tick·fill prop으로 준다. ChartTooltip·ChartLegend를 재수출하지 않는다 — Recharts의 Tooltip·Legend를 우리 이름으로 내보내면 우리 클래스가 하나도 없는 노드가 공개 anatomy에 들어가고, 그건 외부 소유 표면과 겹칠 수 없다는 규칙과 정면으로 부딪친다. 소비처가 recharts에서 직접 가져와 content에 우리 카드를 꽂는다. 데이터 계열 색은 우리 토큰이 아니라 소비처가 ChartConfig의 color로 주입하는 입력이고, 우리 cva는 견본의 모양만 소유한다 — --chart-1~5 alias는 무채색 플레이스홀더로 남으며(semantic-tokens.md §7.2) 시각화 팔레트 확정은 이 맵 밖이다. 다크 모드 분기는 컨테이너가 하지 않는다: theme 키를 받지 않고 --color-<key> 한 벌만 내며, 모드에 따라 갈려야 하는 색은 소비처가 이미 모드 전환이 끝난 변수를 값으로 준다 — 라이트/다크 전환은 오직 semantic 계층에서만 일어난다. ChartContainer는 공개하되 Figma 자산으로 내지 않는다: 테마 주입 통로라 자기 축도 구성 상태도 없고 그 자리에서 얻는 것은 빈 프레임 하나다. 데이터 표를 대신하지 않는다 — 값 자체를 읽어야 하는 자리에는 Table을 쓴다.",
        "use": "시계열이나 범주 비교를 Recharts로 그리면서, 툴팁 카드와 범례만 카탈로그의 면·글자·모서리 규칙에 맞춰 통일한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/chart.tsx"
  },
  {
    "component": "checkbox",
    "displayName": "Checkbox",
    "hash": "49611f71f120",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Checkbox",
      "Indicator"
    ],
    "configurationStates": {
      "checked": [
        "unchecked",
        "checked",
        "indeterminate"
      ]
    },
    "reference": {
      "example": "checkbox",
      "guidance": {
        "evidence": "투자 이력 Table의 checked·unchecked·indeterminate 구성 상태가 필요하다.",
        "limits": "선택 모델과 일괄 동작은 소비처 책임이다.",
        "use": "복수 행 선택과 불확정 전체 선택을 표현한다."
      }
    },
    "stateSamples": true,
    "source": "src/components/ui/checkbox.tsx"
  },
  {
    "component": "collapsible",
    "displayName": "Collapsible",
    "hash": "4b115285961c",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Collapsible",
      "CollapsibleTrigger",
      "CollapsibleContent"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "collapsible",
      "guidance": {
        "evidence": "필터의 고급 조건이나 부가 설명처럼 기본 흐름을 방해하지 않아야 하는 한 영역이 필요하다.",
        "limits": "여러 형제 섹션의 상호 배타적 펼침은 Accordion을 사용하고 트리거의 레이블과 접근 가능한 이름은 소비처가 제공한다.",
        "use": "한 덩어리의 보조 내용을 명시적인 트리거로 펼치거나 접는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/collapsible.tsx"
  },
  {
    "component": "combobox",
    "displayName": "Combobox",
    "hash": "720b6bb0e0de",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Combobox",
      "ComboboxTrigger",
      "ComboboxValue",
      "ComboboxIcon?",
      "ComboboxContent",
      "CommandInput",
      "CommandList",
      "CommandGroup*",
      "CommandItem*",
      "CommandEmpty?"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ],
      "selected": [
        "unselected",
        "selected"
      ]
    },
    "reference": {
      "example": "combobox",
      "guidance": {
        "evidence": "거래를 기록할 때 종목을 골라야 하는데 상장 종목이 수천 개라 고정 목록으로는 펼칠 수 없고, 고른 뒤에는 어떤 종목인지 계속 보여야 한다.",
        "limits": "값이 적고 고정되어 있으면 Select, 폼 제출과 시스템 피커가 중요하면 Native Select, 고를 값이 아니라 실행할 동작이면 Command를 그대로 쓴다. 트리거는 `role=\"combobox\"`가 아니라 dialog를 여는 버튼이므로 접근 가능한 이름은 소비처가 `aria-label`이나 Field의 라벨로 준다. Escape는 검색어를 비우지 않고 한 번에 닫으며, 닫으면 검색어는 버려진다. 다중 선택과 값 생성(새 항목 추가)은 계약하지 않는다.",
        "use": "값이 많아 눈으로 훑기 어려운 목록에서 검색으로 좁혀 하나를 고르고, 닫힌 상태에서는 고른 값을 트리거에 보여준다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/combobox.tsx"
  },
  {
    "component": "command",
    "displayName": "Command",
    "hash": "6f45a55b984d",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Command",
      "CommandInput",
      "CommandList",
      "CommandGroup*",
      "CommandGroupHeading?",
      "CommandItem*",
      "CommandEmpty?"
    ],
    "configurationStates": {
      "highlighted": [
        "highlighted",
        "idle"
      ],
      "results": [
        "matches",
        "empty"
      ],
      "selected": [
        "unselected",
        "selected"
      ]
    },
    "reference": {
      "example": "command",
      "guidance": {
        "evidence": "종목·거래·화면 이동이 한 자리에 섞여 있어 마우스로 메뉴를 파고들기보다 이름을 입력해 바로 실행하는 진입점이 필요하다.",
        "limits": "값이 적고 고정된 선택에는 Select를, 맥락 동작 묶음에는 Dropdown Menu를 쓴다. 팝오버·모달 안에 넣는 것과 닫기, 원격 검색과 정렬 순서는 소비처가 조립하며 검색 입력의 접근 가능한 이름도 소비처가 준다. 항목 끝의 단축키 표기(upstream의 `CommandShortcut`)는 열지 않는다 — 소비처가 `Kbd`를 `ml-auto`와 함께 놓으면 되고 그 클래스가 우리 스타일 결정을 복제하지 않는다(#121 ⓑ, `InputGroupButton`의 variant·size와 같은 판정 2). upstream의 `CommandShortcut`도 키캡이 아니라 평평한 muted 텍스트라 Kbd가 채우던 자리가 아니다.",
        "use": "검색어로 목록을 좁혀 명령이나 항목 하나를 고르고, 키보드 커서(highlighted)와 고른 값(selected)을 함께 보여준다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/command.tsx"
  },
  {
    "component": "dialog",
    "displayName": "Dialog",
    "hash": "61dd1a514c92",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Dialog",
      "DialogTrigger",
      "DialogPortal",
      "DialogOverlay",
      "DialogContent",
      "DialogHeader?",
      "DialogTitle",
      "DialogDescription?",
      "DialogFooter?",
      "DialogClose?"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "dialog",
      "guidance": {
        "evidence": "투자 거래를 추가하거나 편집하는 동안 제목·설명·행동을 한 모달 맥락에 유지해야 한다.",
        "limits": "파괴적 행동 확인에는 Alert Dialog를 사용하고, 단순 보조 정보에는 Popover를 사용한다.",
        "use": "현재 흐름을 잠시 멈추고 집중해서 완료할 작업을 연다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/dialog.tsx"
  },
  {
    "component": "dropdown-menu",
    "displayName": "Dropdown Menu",
    "hash": "460ce70ee692",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "DropdownMenu",
      "DropdownMenuTrigger",
      "DropdownMenuContent",
      "DropdownMenuGroup*",
      "DropdownMenuLabel?",
      "DropdownMenuItem*",
      "DropdownMenuCheckboxItem*",
      "DropdownMenuRadioGroup?",
      "DropdownMenuRadioItem*",
      "DropdownMenuSeparator?",
      "DropdownMenuSub?",
      "DropdownMenuSubTrigger",
      "DropdownMenuSubContent"
    ],
    "configurationStates": {
      "checked": [
        "unchecked",
        "checked"
      ],
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "dropdown-menu",
      "guidance": {
        "evidence": "각 투자 행의 수정·삭제 같은 행 메뉴 진입점에 필요하고, 표의 행 자체를 우클릭해 같은 메뉴를 여는 경로도 같은 자산이어야 한다. 같은 메뉴에서 즐겨찾기를 켜고 끄고, 통화를 하나만 고르고, 내보내기 형식을 한 겹 더 들어가 고르는 일이 행마다 일어난다.",
        "limits": "삭제 확인과 실제 동작 로직은 포함하지 않는다. openOn=\"context\"는 배경 영역 자체가 대상인 행·캔버스에만 쓰고, 화면에 보이는 버튼에서 여는 메뉴는 기본값 press를 쓴다. 이 모드에서 DropdownMenuTrigger는 버튼이 아니라 우클릭을 받는 영역이라 스스로 포커스를 받지 못하므로, 소비처가 포커스 가능한 요소를 asChild로 주어 Shift+F10·컨텍스트 메뉴 키로도 열리게 해야 한다. 터치에서는 upstream이 갖고 오는 롱프레스로 열리며 그 임계값은 계약하지 않는다 — 여는 제스처라 gestures 필드가 담지 못하는 첫 상속 표면이다. defaultOpen과 sideOffset은 press 모드에서만 유효하다. 여러 메뉴가 한 막대에 상시 노출되는 명령 막대에는 쓰지 않는다 — 그 자리는 Menubar이고, 화면을 이동하는 사이트 탐색은 Navigation Menu다(#127). `CheckboxItem`·`RadioItem`·`Sub`는 43세대 동안 **확인된 공백**이었고 #142가 ADR-0006의 두 관문으로 판정해 **열었다**(#154). Menubar가 같은 표면에 이미 독립 셀을 내고 있었고(ⓐ), 소비처에는 재현할 우리 노드조차 없어 `radix-ui`를 직접 집고 표식 기하를 손으로 다시 정해야 했다(ⓑ). 여섯을 한 번에 열었다 — `RadioItem`은 `RadioGroup` 없이 뜻이 없고 `Sub`는 `SubTrigger`·`SubContent` 없이 아무것도 그리지 않아, 셋만 열면 ⓑ가 그대로 다시 샌다. **Menubar와의 비대칭은 이 세대에서 해소됐고 #119의 판정은 그대로 선다**: 두 컴포넌트를 가르는 것은 루트 막대 + `MenubarMenu*` 다중 메뉴 + `value`이지 이 세 파트가 아니다. openOn=\"context\" 모드에도 상시 노출 막대가 없고 진입점이 하나이므로 여섯 파트를 줘도 Menubar가 되지 않는다. 표식(`ItemIndicator`)은 파트로 열지 않는다 — 켜졌을 때만 나타나는 글리프라 정적 시안이 그리는 것은 `checked` 구성 상태이지 별도 노드가 아니며, 껍데기를 노드로 세우면 체크·라디오 두 항목이 같은 클래스를 갖게 되어 파생 채널이 가르지 못한다(Select의 `ItemIndicator`와 같은 자리). 같은 이유로 `DropdownMenuCheckboxItem`과 `DropdownMenuRadioItem`의 조합 스타일은 서로 같다 — 둘을 가르는 것은 역할과 표식이지 면이 아니다. 체크·라디오 항목의 role과 `aria-checked`, 서브메뉴의 `aria-haspopup`·`aria-expanded`는 primitive가 내고 표식·화살표 `<svg>`는 `aria-hidden`이라 이름에 섞이지 않는다. `DropdownMenuSeparator`는 `border-t`로 그린다 — 43세대 동안 `h-px bg-border`였으나 `parts`가 없어 매니페스트에 나타나지 않았고, 등록하는 순간 `--ds-border-default`가 `background-color`에 온 것을 게이트가 물었다(없는 것은 통과가 아니라 침묵이다, ADR-0006). 렌더는 같은 1px 선이고 Menubar·Resizable이 이미 낸 답이다. `DropdownMenuShortcut`은 열지 않는다 — #123이 `CommandShortcut` 자리를 닫은 것과 같은 근거이고, 소비처가 `Kbd`를 `ml-auto`로 놓으면 같은 결과다.",
        "use": "현재 맥락에 속하는 보조 동작을 묶는다. 화면에 보이는 컨트롤에서 여는 기본 모드와, 대상 영역을 우클릭·롱프레스해서 여는 openOn=\"context\" 모드를 같은 계약으로 덮는다. 켜고 끄는 항목은 `DropdownMenuCheckboxItem`, 배타 선택은 `DropdownMenuRadioGroup`, 더 깊은 묶음은 `DropdownMenuSub`가 지며 셋 다 두 모드에서 같다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/dropdown-menu.tsx"
  },
  {
    "component": "empty",
    "displayName": "Empty",
    "hash": "ec678ab2dfd5",
    "cells": 2,
    "axes": {
      "variant": [
        "default",
        "outline"
      ]
    },
    "anatomy": [
      "Empty",
      "EmptyHeader",
      "EmptyMedia?",
      "EmptyTitle",
      "EmptyDescription?",
      "EmptyContent?"
    ],
    "configurationStates": {},
    "reference": {
      "example": "empty",
      "guidance": {
        "evidence": "검색 결과나 아직 생성되지 않은 목록에서 빈 영역의 이유와 회복 경로를 함께 보여줘야 하고, 같은 자리에 면을 두른 글리프 칩과 면 없는 글리프가 화면 밀도에 따라 갈린다.",
        "limits": "오류·권한·온보딩 의미를 자체 판단하지 않으며 문구, 일러스트, 행동의 제품 의미는 소비처가 제공한다. `EmptyMedia`가 그리는 틀은 `frame` 축이 지고 **`ItemMedia`와 같은 축 이름·같은 값 이름을 쓴다**(#145) — `icon`(면을 두른 `size-10` 칩, 기본값)·`none`(면 없음) 둘이다. 기본값이 `icon`인 것은 **오늘의 `EmptyMedia`가 이미 upstream의 `icon` 값이기 때문**이다: 기본값은 발행된 인스턴스를 지키는 값이고(#143·#144), `ItemMedia`의 기본값이 `none`인 것과 방향이 반대로 보이는 것은 두 슬롯이 오늘 서 있는 자리가 다르기 때문이지 어휘가 갈린 것이 아니다. **`image`는 계약하지 않는다** — upstream에도 없고, 이 슬롯이 제목 위 가운데 `size-10`이라 40px 틀은 빈 상태 일러스트가 아니라 글리프 칩이다. 일러스트를 원하는 소비처는 지름부터 덮으므로 그 값이 질 우리 결정이 남지 않고(ADR-0006 ⓑ), 실측 수요도 없다(#123). 큰 그림이 필요하면 소비처가 `EmptyHeader` 안에 자기 노드를 둔다. 대체 텍스트는 계약이 지지 않는다 — 장식이면 `EmptyMedia`에 `aria-hidden`을 걸고, 뜻이 있으면 소비처가 안쪽 요소의 `alt`에 넣는다. **`EmptyDescription`의 `[&>a]` 계열 세 선언은 매니페스트에서 `unresolved`로 떨어진다** — 파트를 계약에 등록하면서 드러난 것이고, 등록하지 않았을 때는 매니페스트에 아예 없어 **침묵**이었다(#122). 자손 링크의 밑줄은 `MODIFIER_POLICY`에 정책이 없다(#140의 모집단).",
        "use": "표시할 내용이 없는 영역에 상태 설명과 선택적인 다음 행동을 조립하고, 미디어 자리가 그릴 틀은 `EmptyMedia`의 `frame` 축이 정한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/empty.tsx"
  },
  {
    "component": "field",
    "displayName": "Field",
    "hash": "b89f447e9468",
    "cells": 3,
    "axes": {
      "orientation": [
        "vertical",
        "horizontal",
        "responsive"
      ]
    },
    "anatomy": [
      "Field",
      "FieldLabel",
      "Control",
      "FieldDescription?",
      "FieldError?",
      "FieldContent?",
      "FieldGroup?",
      "FieldSet?",
      "FieldLegend?"
    ],
    "configurationStates": {
      "validity": [
        "valid",
        "invalid"
      ]
    },
    "reference": {
      "example": "field",
      "guidance": {
        "evidence": "투자 입력 화면의 라벨·메모·검증 메시지를 일관된 구조로 묶어야 한다.",
        "limits": "폼 상태 관리, 검증 규칙, 제출 동작은 소비처가 소유한다. `FieldLegend`의 legend/label 표현 축(upstream의 `variant`)은 계약하지 않는다 — 파트에 축이 생기고 label 모양이 `FieldLabel` 클래스를 복제하게 되는 진짜 표면이라 열 근거는 있으나 별도 effort로 미뤘다(#121).",
        "use": "라벨, 컨트롤, 도움말과 오류를 접근 가능한 한 필드로 조립한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/field.tsx"
  },
  {
    "component": "input",
    "displayName": "Input",
    "hash": "238507ed3be1",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Input"
    ],
    "configurationStates": {},
    "reference": {
      "example": "input",
      "guidance": {
        "evidence": "투자 이력 검색의 접근 가능한 기본 필드가 필요하다.",
        "limits": "SearchField, 검색 아이콘, debounce는 소비처가 조립한다.",
        "use": "한 줄 텍스트 값을 입력하거나 검색어를 받는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/input.tsx"
  },
  {
    "component": "input-group",
    "displayName": "Input Group",
    "hash": "13e8f3db38a6",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "InputGroup",
      "InputGroupAddon?",
      "InputGroupInput",
      "InputGroupButton?"
    ],
    "configurationStates": {
      "disabled": [
        "enabled",
        "disabled"
      ],
      "validity": [
        "valid",
        "invalid"
      ]
    },
    "reference": {
      "example": "input-group",
      "guidance": {
        "evidence": "투자 이력 검색은 앞에 검색 아이콘이, 금액 입력은 뒤에 통화 단위와 초기화 버튼이 필드 안에 붙어야 한다.",
        "limits": "값을 가진 컨트롤을 둘 이상 담지 않으며, 라벨·설명·오류 문구는 여전히 Field가 소유하고 접근성 상태의 정본은 안쪽 컨트롤의 disabled·aria-invalid다. `InputGroupAddon`의 배치는 `placement` 축이 진다 — `auto`(DOM 순서가 정한다, 기본값)·`start`·`end` 셋이다. 이름이 `align`이 아닌 것은 우리 카탈로그에서 `align`이 이미 Radix의 prop 이름 공간에 속해 **떠 있는 표면이 트리거의 어느 모서리에 붙는가**를 뜻하기 때문이고, `placement`는 #125가 `ChartLegendContent`에 같은 이유로 세운 이름이다. 기본값이 `start`가 아닌 `auto`인 것은 `order-first`가 컨트롤 뒤에 쓴 기존 부가물을 앞으로 옮겨 발행된 인스턴스를 재해석하기 때문이다(#143의 `knockout: none`과 같은 자리). **upstream의 `block-start`·`block-end`는 계약하지 않는다** — 껍데기 위·아래에 한 줄을 통째로 두는 배치라 루트가 줄바꿈하는 auto 높이 컨테이너가 되어야 하고, 그건 `h-9` 한 줄과 `h-full` 컨트롤을 재해석하는 breaking이다. 조건부 클래스로 피하면 그 선언이 매니페스트에서 `unresolved`가 되어 파생 채널이 못 그린다(#144). 위·아래 줄이 필요하면 Field의 세로 축을 쓴다. 부가물 안의 버튼·`Kbd`를 필드 가장자리에 광학 정렬하는 음수 마진(upstream의 `has-[>button]:ml-*`)도 계약하지 않는다 — 부가물의 **자식**에 걸리는 조건부라 셀이 아니라 수식자가 되고, 필요하면 소비처가 그 자리에서 준다. `InputGroupButton`의 variant·size는 열지 않는다 — 소비처가 `Button`의 축을 그대로 쓰면 되고 우리 스타일 결정을 복제하지 않는다(#121).",
        "use": "한 줄 입력 컨트롤 하나와 아이콘·단위·버튼 같은 부가물을 하나의 필드 껍데기 안에 붙이고, 포커스·비활성·오류 표시를 껍데기가 대신 그린다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/input-group.tsx"
  },
  {
    "component": "input-otp",
    "displayName": "Input Otp",
    "hash": "18f7da74b84d",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "InputOTP",
      "InputOTPGroup*",
      "InputOTPSlot*",
      "InputOTPSeparator?",
      "InputOTPControl"
    ],
    "configurationStates": {
      "cursor": [
        "idle",
        "active"
      ],
      "validity": [
        "valid",
        "invalid"
      ],
      "value": [
        "empty",
        "filled"
      ]
    },
    "reference": {
      "example": "input-otp",
      "guidance": {
        "evidence": "투자 이력의 계좌 연동과 재로그인에서 문자로 받은 인증번호를 넣는 자리가 있고, 몇 자리를 넣었는지가 한눈에 보여야 한다.",
        "limits": "일반 텍스트나 금액에는 Input을 쓴다. 값의 정본은 보이지 않는 입력 하나이므로 접근 가능한 이름은 소비처가 Field나 aria-label로 주고, 오류 표시는 컨트롤의 aria-invalid가 정본이며 슬롯은 같은 값을 받아 테두리를 붉힌다 — 라이브러리가 컨테이너에 속성을 주는 통로를 열어 두지 않아 CSS로 전파할 자리가 없다. 붙여넣기는 upstream이 소유한다(iOS와 pasteTransformer를 제외하면 네이티브 경로 그대로다). IME 조합은 upstream이 다루지 않으므로 조합 문자가 필요한 코드에는 쓰지 않는다. 모바일 문자 자동완성 경로인 autoComplete=\"one-time-code\"는 켠 채로 두고, 비밀번호 관리자 배지는 컨테이너 폭을 바꾸므로 껐다. 커서 깜박임은 기존 animate-pulse로 그린다 — 전용 키프레임을 새로 열지 않는다. 재전송 타이머, 자동 제출, 검증 규칙은 소비처가 소유한다.",
        "use": "여섯 자리 안팎의 일회용 코드를 칸으로 나눠 보여주면서, 값과 폼 제출은 입력 하나가 그대로 지게 한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/input-otp.tsx"
  },
  {
    "component": "item",
    "displayName": "Item",
    "hash": "edd38728a553",
    "cells": 6,
    "axes": {
      "size": [
        "default",
        "sm"
      ],
      "variant": [
        "default",
        "outline",
        "muted"
      ]
    },
    "anatomy": [
      "Item",
      "ItemMedia?",
      "ItemContent",
      "ItemTitle",
      "ItemDescription?",
      "ItemActions?",
      "ItemHeader?",
      "ItemFooter?",
      "ItemGroup?",
      "ItemSeparator?"
    ],
    "configurationStates": {
      "item": [
        "default",
        "selected"
      ]
    },
    "reference": {
      "example": "item",
      "guidance": {
        "evidence": "검색 결과, 선택 목록, 설정 행처럼 같은 정보 위계를 공유하지만 제품 의미가 다른 반복 항목이 필요하고, 같은 목록 안에서 통화 기호 같은 글리프와 종목 로고 이미지가 같은 자리에 번갈아 선다.",
        "limits": "탐색·선택·버튼 역할을 자동으로 부여하지 않으며 도메인 필드와 상호작용 의미는 소비처가 명시한다. `ItemMedia`가 그리는 틀은 `frame` 축이 진다 — `none`(틀 없음, 기본값)·`icon`(글리프용 `size-8` 면)·`image`(그림용 `size-10` 자르기 틀) 셋이다. 값 이름은 upstream을 그대로 쓰지만(#121) **축 이름은 `variant`가 아니다** — 우리 카탈로그에서 `variant`는 루트의 의미·강조 축이고 `Item` 자신이 이미 그 이름을 쓰므로, 한 파일 안에서 한 단계 떨어진 두 축이 같은 이름으로 다른 뜻이 된다(#144가 `align`을 버린 자리). 기본값이 `none`인 것은 오늘의 `ItemMedia`가 틀 없이 글리프만 놓기 때문이고, 그래서 이 축은 additive다. 틀의 모서리·면은 `EmptyMedia`가 이미 세운 `rounded-lg`·`bg-muted`를 그대로 쓴다 — 두 미디어 슬롯이 한 축을 공유하는데 틀이 갈리면 축을 공유한 뜻이 없다(upstream의 `rounded-sm`+`border`는 따르지 않는다). **아바타는 `frame`의 값이 아니다** — upstream에도 없고, 원형 틀·지름·겹침 링은 우리 `Avatar`가 이미 지는 결정이라 값으로 열면 그 결정을 복제한다(#91). `<ItemMedia frame=\"none\"><Avatar/></ItemMedia>`로 **소비한다**: `Avatar`가 자기 틀을 그리므로 `image` 안에 넣으면 틀이 겹친다. **`image`의 `[&_img]:size-full`·`[&_img]:object-cover` 두 유틸리티는 매니페스트 항목 셋으로 `unresolved`에 떨어진다** — `MODIFIER_POLICY`가 아는 자손 선택자는 `[&_svg]` 계열뿐이고, 이 둘은 HTML에서 그림이 틀을 채우게 하는 배관이라 Figma에 대응물이 없다(#140의 모집단). 틀 자체의 결정은 전부 해결된 속성으로 떨어지므로 축이 침묵하지는 않는다. 대체 텍스트는 계약이 지지 않는다 — 장식이면 `ItemMedia`에 `aria-hidden`을 걸고, 뜻이 있으면 소비처가 안쪽 `<img>`의 `alt`에 넣는다. 슬롯은 자기가 담은 것이 장식인지 알 수 없다.",
        "use": "미디어, 주 정보, 보조 설명과 행동을 재배치 가능한 한 항목으로 조립하고, 미디어 자리가 그릴 틀은 `ItemMedia`의 `frame` 축이 정한다."
      }
    },
    "stateSamples": true,
    "source": "src/components/ui/item.tsx"
  },
  {
    "component": "kbd",
    "displayName": "Kbd",
    "hash": "5842eb5fef55",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "KbdGroup?",
      "Kbd*"
    ],
    "configurationStates": {},
    "reference": {
      "example": "kbd",
      "guidance": {
        "evidence": "투자 기록 검색과 거래 추가처럼 자주 쓰는 명령에 단축키를 함께 알려야 하고, 그 표기는 주변 문장과 눈으로 구분돼야 한다.",
        "limits": "크기 축을 두지 않는다 — 고정 20px `text-xs` 캡 하나가 Button의 네 크기와 Tooltip·Input Group의 줄 안에 모두 들어가고, 실측할 소비처가 아직 없는 상태에서 스케일을 정하면 우리가 정한 적 없는 결정을 떠안는다(#121 ⓑ). 나중에 여는 것은 additive이고 닫는 것은 breaking이라 지금은 닫는다. 조합의 구분자(`+`)도 파트로 열지 않는다 — 클래스도 노드도 없는 문자열이라 파생 채널이 그릴 것이 없다(#119·#121). `KbdGroup`을 `<kbd>`로 렌더해 중첩되는 것은 의도이며, `<kbd>`는 HTML-AAM에서 대응 역할이 없어 이 요소에 접근 가능한 이름을 붙이지 않는다 — `⌘`·`⇧` 같은 기호의 이름은 소비처가 주고, 이름이 실제로 필요한 자리는 동작을 수행하는 컨트롤의 `aria-keyshortcuts`다. Command 항목 끝의 배치도 소비처가 소유한다(`ml-auto`). Tooltip의 반전 면 위에 놓일 때 필요한 반전 subtle 채움은 우리에게 없다 — upstream의 불투명도·`dark:` 분기가 우리 규약 밖이라 가져오지 않았고, 이 수요는 열지 않은 채 확인된 공백으로 남긴다(#109·ADR-0003과 같은 모양). 그때 색은 소비처가 `className`으로 바꾼다.",
        "use": "키보드 키와 단축키 조합을 본문·툴팁·버튼 안에서 본문 글자와 구분되는 키캡으로 표기한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/kbd.tsx"
  },
  {
    "component": "label",
    "displayName": "Label",
    "hash": "e09201d777d4",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Label"
    ],
    "configurationStates": {},
    "reference": {
      "example": "label",
      "guidance": {
        "evidence": "검색·필터 컨트롤의 접근 가능한 이름을 제공한다.",
        "limits": "장식 텍스트에는 사용하지 않는다.",
        "use": "폼 컨트롤에 사람이 읽는 이름을 연결한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/label.tsx"
  },
  {
    "component": "list-row",
    "displayName": "List Row",
    "hash": "318cb36fbbd1",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "ListRow",
      "ListRowLeading?",
      "ListRowContent",
      "ListRowTitle",
      "ListRowDescription?",
      "ListRowMeta?",
      "ListRowTrailing?"
    ],
    "configurationStates": {
      "row": [
        "default",
        "selected"
      ]
    },
    "reference": {
      "example": "list-row",
      "guidance": {
        "evidence": "데스크톱 Table과 같은 투자 이력을 모바일에서 긴 종목명·날짜·금액·손익으로 표현한다.",
        "limits": "투자 도메인과 breakpoint 전환을 내장하지 않는다.",
        "use": "모바일 폭에서 한 항목의 우선 정보와 보조 동작을 조립한다."
      }
    },
    "stateSamples": true,
    "source": "src/components/ui/list-row.tsx"
  },
  {
    "component": "menubar",
    "displayName": "Menubar",
    "hash": "a4b58bb8cf3e",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Menubar",
      "MenubarMenu*",
      "MenubarTrigger",
      "MenubarContent",
      "MenubarGroup*",
      "MenubarLabel?",
      "MenubarItem*",
      "MenubarCheckboxItem*",
      "MenubarRadioGroup?",
      "MenubarRadioItem*",
      "MenubarSeparator?",
      "MenubarSub?",
      "MenubarSubTrigger",
      "MenubarSubContent"
    ],
    "configurationStates": {
      "checked": [
        "unchecked",
        "checked"
      ],
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "menubar",
      "guidance": {
        "evidence": "투자 기록 화면은 거래 추가·가져오기·내보내기 같은 실행 명령과 열 표시·정렬 같은 보기 설정을 항상 같은 자리에서 꺼내야 하고, 그 진입점이 행마다 따라다니는 메뉴와 달리 화면 상단에 고정돼 있어야 한다.",
        "limits": "화면을 이동하는 사이트 탐색에는 쓰지 않는다 — 이 막대의 항목은 명령이라 `aria-current`도 URL도 갖지 않으며, 그 자리는 Navigation Menu다. 진입점이 하나뿐인 행·캔버스 메뉴에도 쓰지 않는다: 그건 Dropdown Menu이고 우클릭으로 여는 경우까지 그쪽이 덮는다(#126). Tabs와도 갈린다 — Tabs는 같은 화면 안에서 패널을 갈아 끼우지만 이 막대는 패널을 소유하지 않고 항목이 명령이다. 어느 메뉴가 열려 있는지는 계약하지 않는다: 루트의 `value`는 소비처가 지은 이름이라 값 집합이 소비처마다 달라 파생 채널이 고를 열거가 되지 않으며, 동시에 하나만 열린다는 것은 축이 아니라 루트가 보증하는 불변식이다. `MenubarShortcut`을 파트로 열지 않는다 — #123이 `CommandShortcut` 자리를 닫은 것과 같은 근거이고, 소비처가 `Kbd`를 `ml-auto`로 놓으면 같은 결과다. 막대의 접근 가능한 이름은 소비처가 `aria-label`로 준다. 체크·라디오 표식(`ItemIndicator`)도 파트로 열지 않는다 — 켜졌을 때만 나타나는 글리프라 정적 시안이 그리는 것은 `checked` 구성 상태이지 별도 노드가 아니며, 껍데기를 노드로 세우면 두 항목이 같은 클래스를 갖게 되어 파생 채널이 가르지 못한다(Select의 `ItemIndicator`와 같은 자리다). 같은 이유로 `MenubarCheckboxItem`과 `MenubarRadioItem`의 조합 스타일은 서로 같다 — 둘을 가르는 것은 역할과 표식이지 면이 아니다. Dropdown Menu가 `CheckboxItem`·`RadioItem`·`Sub`를 공개하지 않던 비대칭은 해소됐다 — #142가 두 관문으로 열기로 판정했고 #154가 여섯 파트를 두 `openOn` 모드 모두에 냈다. **#119가 두 컴포넌트를 갈라 세운 근거는 그대로 선다**: 서술이 불완전했을 뿐이고, 둘을 실제로 가르는 것은 이 루트 막대 + `MenubarMenu*` 다중 메뉴 + 어느 것이 열렸는지를 쥔 `value`이지 이 세 파트가 아니다. Dropdown Menu는 여섯 파트를 다 가져도 진입점이 하나이고 상시 노출 막대가 없다. 두 파일은 `INDICATOR_ITEM`·`SUB_TRIGGER`를 공유하지 않고 각자 갖는다 — 공유 상수는 두 계약의 해시를 한 줄에 묶고, 여기 `ITEM`의 `select-none`처럼 이미 갈라진 차이를 지운다(#154).",
        "use": "화면에 계속 떠 있는 가로 막대에 명령 메뉴 여러 개를 나란히 두고, 그 안에서 실행·전환·설정 항목을 묶는다. 켜고 끄는 항목은 `MenubarCheckboxItem`, 배타 선택은 `MenubarRadioGroup`, 더 깊은 묶음은 `MenubarSub`가 진다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/menubar.tsx"
  },
  {
    "component": "native-select",
    "displayName": "Native Select",
    "hash": "d6531f02868f",
    "cells": 3,
    "axes": {
      "size": [
        "sm",
        "default",
        "lg"
      ]
    },
    "anatomy": [
      "NativeSelect",
      "NativeSelectIcon",
      "NativeSelectGroup?",
      "NativeSelectOption*"
    ],
    "configurationStates": {
      "disabled": [
        "enabled",
        "disabled"
      ],
      "validity": [
        "valid",
        "invalid"
      ]
    },
    "reference": {
      "example": "native-select",
      "guidance": {
        "evidence": "투자 이력 필터의 시장·계좌처럼 값이 문자열이고 모바일에서 시스템 피커가 더 빠른 자리가 있다.",
        "limits": "옵션에 아이콘·설명·구분선을 넣거나 열린 목록을 디자인해야 하면 Radix 기반 Select를 쓴다 — 열림 상태는 OS 소유라 이 컴포넌트의 구성 상태에 없고, 라벨은 Field가 연결한다.",
        "use": "폼에 실려야 하는 짧은 값 하나를 고를 때 브라우저의 select를 그대로 쓰고, 필드 껍데기와 화살표만 디자인 시스템이 그린다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/native-select.tsx"
  },
  {
    "component": "navigation-menu",
    "displayName": "Navigation Menu",
    "hash": "39a1d096b2c3",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "NavigationMenu",
      "NavigationMenuList",
      "NavigationMenuItem*",
      "NavigationMenuTrigger?",
      "NavigationMenuContent?",
      "NavigationMenuLink*"
    ],
    "configurationStates": {
      "currentLocation": [
        "other",
        "current"
      ],
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "navigation-menu",
      "guidance": {
        "evidence": "투자 기록은 포트폴리오·거래·회고가 각각 URL로 직접 열려야 하는 별개 화면이고, 포트폴리오 아래에는 보유 현황·비중 같은 하위 목적지가 더 있어 막대에서 한 겹 펼쳐 보여야 한다.",
        "limits": "Tabs가 *\"URL로 직접 접근해야 하는 화면 탐색에는 링크나 내비게이션을 사용한다\"*고 가리킨 자리가 여기다 — 같은 화면 안에서 패널만 갈아 끼우는 전환은 Tabs이고, 주소가 바뀌는 이동은 이쪽이다. Menubar와도 갈린다: 저기 항목은 실행하는 명령이라 `Link`도 `aria-current`도 없고 `CheckboxItem`·`RadioItem`·`Sub`를 갖는 반면, 여기 항목은 목적지라 그 셋을 갖지 않는다. 진입점 하나에 달린 보조 동작 묶음은 Dropdown Menu다. `NavigationMenuViewport`와 `NavigationMenuIndicator`는 공개하지 않는다 — 둘 다 실행 중 측정으로 자기 위치와 치수를 얻는 파생 노드이고, Viewport를 열면 열린 카드를 그리는 노드가 `Content`와 둘이 되어 파생 채널이 가르지 못하며(#97·#119) Indicator는 이미 열림 면을 가진 트리거를 한 번 더 가리키는 표식이다. 나중에 여는 것은 additive다. 열린 카드의 위치·치수도 계약하지 않는다: 자리는 항목이 잡고 폭은 내용이 정한다. 라우터 링크는 `NavigationMenuLink`의 `asChild`로 끼운다 — upstream이 `render`로 부르는 확장점과 같은 자리이며, 우리는 카탈로그가 이미 쓰는 `asChild` 어휘를 쓴다(Base UI 이행은 #118의 미확정 항목이라 그 어휘를 선취하지 않는다). 활성 판정 자체와 라우팅은 소비처가 소유한다. 탐색 랜드마크의 접근 가능한 이름은 소비처가 `aria-label`로 준다.",
        "use": "화면 상단에서 사이트의 주요 목적지를 가로로 늘어놓고, 하위 목적지가 여럿인 항목만 카드로 펼친다. 현재 화면을 가리키는 링크는 `active`로 표시하고, 하위가 없는 항목은 `NavigationMenuLink`에 `navigationMenuTriggerVariants()`를 입혀 막대에 직접 놓는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/navigation-menu.tsx"
  },
  {
    "component": "pagination",
    "displayName": "Pagination",
    "hash": "2a3133a0cc0e",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Pagination",
      "PaginationContent",
      "PaginationItem*",
      "PaginationPrevious?",
      "PaginationLink*",
      "PaginationEllipsis?",
      "PaginationNext?"
    ],
    "configurationStates": {
      "currentPage": [
        "other",
        "current"
      ]
    },
    "reference": {
      "example": "pagination",
      "guidance": {
        "evidence": "투자 이력처럼 전체 결과를 한 번에 표시하기 어려운 목록에서 URL로 복원 가능한 페이지 이동이 필요하다.",
        "limits": "데이터 양이 적거나 연속 스크롤이 핵심인 흐름에는 사용하지 않으며, 축약 뒤에도 현재 페이지·이전·다음 링크의 접근 가능한 이름과 기본 키보드 동작을 보존한다. 이전·다음의 문구는 children으로 소비처가 정한다 — upstream의 `text` prop에 해당하는 자리이며, 문자열이라 파생 채널이 구분하지 않는다(#121).",
        "use": "긴 결과 집합을 여러 페이지로 나누고 현재 페이지와 인접 이동을 링크로 제공한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/pagination.tsx"
  },
  {
    "component": "popover",
    "displayName": "Popover",
    "hash": "2535c4105bf4",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Popover",
      "PopoverTrigger",
      "PopoverAnchor?",
      "PopoverContent"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "popover",
      "guidance": {
        "evidence": "투자 기록의 필터 설명과 빠른 설정을 원래 화면 맥락을 떠나지 않고 보여줘야 하고, 종목 이름 위에 잠깐 머무르는 것만으로 그 종목의 요약을 미리 보는 경로도 같은 자산이어야 한다.",
        "limits": "핵심 작업 흐름이나 긴 양식은 Dialog로 옮기고, 행동 없는 짧은 설명은 Tooltip을 사용한다. openOn=\"hover\"에서도 컨트롤의 의미를 보충하는 한 줄 설명은 여전히 Tooltip이다 — Tooltip은 트리거에 aria-describedby로 묶여 이름을 보조하는 설명이고, hover 모드의 Popover는 트리거가 가리키는 대상의 미리보기다. 미리보기 안의 정보와 행동은 hover 없이도 도달할 수 있는 다른 경로가 있어야 하며 이 모드는 필수 작업 흐름을 담지 않는다. 여는 지연과 닫는 지연은 우리가 정하지만 공개 prop이 아니다.",
        "use": "트리거와 가까운 곳에서 짧은 보조 정보나 설정을 제공한다. 클릭으로 여는 기본 모드와, 포인터가 머무르면 지연 후 여는 openOn=\"hover\" 모드를 같은 계약으로 덮는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/popover.tsx"
  },
  {
    "component": "progress",
    "displayName": "Progress",
    "hash": "1861483a3c36",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Progress",
      "ProgressIndicator"
    ],
    "configurationStates": {
      "value": [
        "empty",
        "partial",
        "complete"
      ]
    },
    "reference": {
      "example": "progress",
      "guidance": {
        "evidence": "투자 내역 가져오기처럼 처리할 전체 항목 수를 아는 작업에 진행률 피드백이 필요하다.",
        "limits": "완료량을 모르는 대기에는 Spinner를 사용하고 value의 계산이나 진행 상태 문구는 소비처가 제공한다.",
        "use": "완료량을 알 수 있는 작업의 진행 정도를 0에서 100 사이 값으로 보여준다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/progress.tsx"
  },
  {
    "component": "radio-group",
    "displayName": "Radio Group",
    "hash": "acaf77f3dfa2",
    "cells": 2,
    "axes": {
      "orientation": [
        "vertical",
        "horizontal"
      ]
    },
    "anatomy": [
      "RadioGroup",
      "RadioGroupItem*",
      "Indicator"
    ],
    "configurationStates": {
      "checked": [
        "unchecked",
        "checked"
      ]
    },
    "reference": {
      "example": "radio-group",
      "guidance": {
        "evidence": "투자 계좌와 거래 유형처럼 한 번에 하나만 유효한 선택이 필요하다.",
        "limits": "선택지 데이터와 제출 모델은 소비처가 소유한다.",
        "use": "서로 배타적인 선택지에서 값 하나를 고른다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/radio-group.tsx"
  },
  {
    "component": "resizable",
    "displayName": "Resizable",
    "hash": "889a182cd242",
    "cells": 2,
    "axes": {
      "orientation": [
        "horizontal",
        "vertical"
      ]
    },
    "anatomy": [
      "ResizablePanelGroup",
      "ResizablePanel*",
      "ResizableHandle*",
      "ResizableHandleGrip?"
    ],
    "configurationStates": {
      "panel": [
        "expanded",
        "collapsed"
      ]
    },
    "reference": {
      "example": "resizable",
      "guidance": {
        "evidence": "투자 이력은 목록과 상세를 나란히 보는 자리가 있고, 종목 이름이 긴 사용자와 숫자를 넓게 보려는 사용자가 원하는 경계가 서로 다르다.",
        "limits": "고정 비율 레이아웃에는 쓰지 않으며 패널 크기는 계약하지 않는다 — 크기는 연속값이라 조합으로 나오지 않고 defaultSize·minSize·maxSize는 소비처의 값이다. 핸들은 초점을 받는 컨트롤이므로 접근 가능한 이름은 소비처가 aria-label로 준다. 키보드는 upstream이 준다 — 화살표로 ±5, Home/End로 끝까지, collapsible 패널에서 Enter로 접기·펴기, F6로 핸들 순회. 핸들을 끄는 것은 컨트롤 제스처라 표면이 사라지지 않고 위 키보드 경로가 이미 동등 경로이며, 터치 히트 영역의 크기(upstream 기본값은 coarse 20px·fine 10px)는 터치 대상 크기 규칙(#111)이 정한 뒤에 다시 본다. 레이아웃 저장(useDefaultLayout)과 명령형 API는 소비처가 소유한다.",
        "use": "한 화면 안에서 두 영역의 넓이를 사용자가 직접 나눠 갖게 하고, 그 경계를 포인터와 키보드 양쪽으로 옮길 수 있게 한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/resizable.tsx"
  },
  {
    "component": "scroll-area",
    "displayName": "Scroll Area",
    "hash": "5ec1920502d7",
    "cells": 2,
    "axes": {
      "orientation": [
        "vertical",
        "horizontal"
      ]
    },
    "anatomy": [
      "ScrollArea",
      "ScrollAreaViewport",
      "ScrollBar?",
      "ScrollAreaThumb",
      "ScrollAreaCorner?"
    ],
    "configurationStates": {
      "overflow": [
        "fits",
        "overflowing"
      ]
    },
    "reference": {
      "example": "scroll-area",
      "guidance": {
        "evidence": "투자 이력의 긴 거래 목록이나 Sheet 안의 필터 묶음처럼, 바깥 화면은 그대로 두고 한 영역만 굴려야 하는 자리가 반복된다.",
        "limits": "페이지 전체 스크롤을 대신하지 않으며, 축을 정하지 않은 자유 스크롤이나 가상 스크롤 목록에는 쓰지 않는다. 영역에 크기 제약이 없으면 아무것도 넘치지 않으므로 스크롤도 스크롤바도 생기지 않는다. 스크롤이 콘텐츠를 가리는 유일한 통로가 되어서는 안 되며, 초점을 받는 영역에는 aria-label로 이름을 준다.",
        "use": "높이나 너비가 고정된 영역 안에서 넘치는 콘텐츠를 한 축으로만 스크롤하게 하고, 브라우저 기본 스크롤바 대신 디자인 시스템 스크롤바를 그린다. 뷰포트가 초점을 받으므로 포인터 없이 키보드만으로도 스크롤할 수 있고, 콘텐츠가 넘치지 않으면 스크롤바는 나타나지 않는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/scroll-area.tsx"
  },
  {
    "component": "select",
    "displayName": "Select",
    "hash": "306160b2cb63",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Select",
      "SelectTrigger",
      "SelectValue",
      "SelectContent",
      "SelectGroup*",
      "SelectLabel?",
      "SelectItem*",
      "SelectSeparator?"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "select",
      "guidance": {
        "evidence": "계좌·시장 등 투자 이력 필터의 closed·open 구성 상태가 필요하다.",
        "limits": "필터 모델과 화면 전용 라벨을 내장하지 않는다. 열린 목록의 위치 계산(upstream의 `alignItemWithTrigger`)은 계약하지 않는다 — 동작이라 파생 채널에 실리지 않는다(#121).",
        "use": "제한된 값 하나를 선택한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/select.tsx"
  },
  {
    "component": "separator",
    "displayName": "Separator",
    "hash": "5397c850ef60",
    "cells": 2,
    "axes": {
      "orientation": [
        "horizontal",
        "vertical"
      ]
    },
    "anatomy": [
      "Separator"
    ],
    "configurationStates": {},
    "reference": {
      "example": "separator",
      "guidance": {
        "evidence": "투자 요약의 지표 묶음과 거래 상세의 정보 그룹을 구획하되 별도 컨테이너를 추가할 필요는 없다.",
        "limits": "의미 있는 구역 제목이나 레이아웃 간격을 대신하지 않으며, 보조 기술에 경계를 알려야 할 때만 decorative를 false로 지정한다.",
        "use": "서로 관련된 콘텐츠 묶음 사이의 시각적 경계를 가로 또는 세로 방향으로 표시한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/separator.tsx"
  },
  {
    "component": "sheet",
    "displayName": "Sheet",
    "hash": "dff903e3b672",
    "cells": 4,
    "axes": {
      "side": [
        "top",
        "right",
        "bottom",
        "left"
      ]
    },
    "anatomy": [
      "Sheet",
      "SheetTrigger",
      "SheetPortal",
      "SheetOverlay",
      "SheetContent",
      "SheetHeader?",
      "SheetTitle",
      "SheetDescription?",
      "SheetFooter?",
      "SheetClose?"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "sheet",
      "guidance": {
        "evidence": "투자 이력 화면에서 목록을 보면서 시장·기간·손익 필터를 조정하거나 한 거래의 상세를 확인해야 하고, 화면 중앙을 가리면 방금 본 행을 놓친다.",
        "limits": "화면 중앙에서 흐름을 멈추고 끝내야 하는 작업은 Dialog, 파괴적 확인은 Alert Dialog, 배경과 상호작용이 이어져야 하는 보조 정보는 Popover를 쓴다. Sheet은 항상 모달이므로 비모달 패널이나 접근 가능한 이름 없는 표면으로 쓰지 않으며, SheetTitle은 생략할 수 없다.",
        "use": "본문을 덮지 않고 화면 가장자리에서 열리는 모달 표면으로, 원래 맥락을 유지한 채 필터·상세·보조 편집을 옆에서 처리한다. side는 붙는 변만 정하고 열리는 동안의 동작(포커스 트랩·Esc와 바깥 클릭으로 닫기·본문 스크롤 잠금·닫은 뒤 트리거로 초점 복귀)은 네 값이 모두 같다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/sheet.tsx"
  },
  {
    "component": "sidebar",
    "displayName": "Sidebar",
    "hash": "6d9e845e1cd7",
    "cells": 12,
    "axes": {
      "collapsible": [
        "offcanvas",
        "icon"
      ],
      "side": [
        "left",
        "right"
      ],
      "variant": [
        "sidebar",
        "floating",
        "inset"
      ]
    },
    "anatomy": [
      "SidebarProvider",
      "Sidebar",
      "SidebarHeader?",
      "SidebarContent",
      "SidebarGroup*",
      "SidebarGroupLabel?",
      "SidebarGroupAction?",
      "SidebarGroupContent",
      "SidebarMenu",
      "SidebarMenuItem*",
      "SidebarMenuButton",
      "SidebarMenuAction?",
      "SidebarMenuBadge?",
      "SidebarMenuSub?",
      "SidebarMenuSubItem*",
      "SidebarMenuSubButton",
      "SidebarSeparator?",
      "SidebarFooter?",
      "SidebarRail?",
      "SidebarTrigger",
      "SidebarInset?"
    ],
    "configurationStates": {
      "item": [
        "default",
        "active"
      ],
      "state": [
        "expanded",
        "collapsed"
      ]
    },
    "reference": {
      "example": "sidebar",
      "guidance": {
        "evidence": "투자 이력·보유 현황·회고를 오가는 탐색이 화면 상단 탭으로는 다 들어가지 않고, 본문을 보면서 다른 구역으로 이동해야 한다.",
        "limits": "breakpoint 판정을 내장하지 않는다 — `list-row`가 이미 \"투자 도메인과 breakpoint 전환을 내장하지 않는다\"고 그은 선과 같은 자리이며, 소비처가 `isMobile`을 준다. 쿠키 열림 상태 영속화와 `Cmd/Ctrl+B` 단축키는 동작이라 파생 채널이 나르지 못하므로 계약 밖이고(#97), 저절로 따라오는 상속 표면도 아니라 소비처가 `defaultOpen`·`open`·`onOpenChange`로 배선한다. off-canvas 열고 닫기는 트리거·rail·키보드로만 하며 스와이프 제스처는 갖지 않는다 — 나중에 붙인다면 표면이 사라지는 dismiss 제스처이므로 ADR 0005의 존재·시각 피드백·접근성 동등 경로를 함께 계약해야 한다. upstream의 `collapsible: \"none\"`은 열지 않는다: 렌더 결과가 `offcanvas`의 펼친 상태와 구분되지 않아 파생 채널이 가르지 못하며(#97), 트리거와 rail을 렌더하지 않으면 같은 결과가 된다. `SidebarMenuButton`의 `outline` variant도 열지 않는다 — 컨트롤 테두리를 `--sidebar-border`(`border.default`)로 그리는데 그것은 구분선이라 3:1 게이트에서 빠져 있고 다크에서 1.31이며, 게이트를 통과하는 `border.strong`에는 alias 이름이 없어 여는 데 토큰 변경이 선행된다. `SidebarInput`과 `SidebarMenuSkeleton`은 파트로 열지 않는다: 앞은 Input에 유틸리티 두 줄을 얹은 것이라 파생 채널이 구분하지 못하고, 뒤는 폭이 난수라 참조 스토리가 결정적이지 않다 — 소비처가 Input·Skeleton을 직접 조립한다. 접힌 상태의 메뉴 버튼에 레이블을 보충해야 하면 Tooltip을 소비처가 감싼다. 페이지 랜드마크도 소유하지 않는다 — `SidebarInset`은 `<div>`이고 `<main>`은 소비처의 페이지 구조다(upstream과 다른 지점이며, 셸이 이미 `<main>`을 가진 문서에 놓이면 랜드마크가 둘이 된다). sidebar 안쪽의 탐색 랜드마크는 우리가 주되 그 접근 가능한 이름은 소비처가 준다 — 한 화면에 사이드바가 둘일 수 있다.",
        "use": "애플리케이션 셸의 왼쪽이나 오른쪽에 고정되는 세로 탐색 표면으로, 본문과 함께 살면서 접고 펼 수 있다. `variant`는 패널의 형태만, `collapsible`은 접혔을 때의 폭만 정하고 열림 상태는 소비처가 소유한다. 좁은 폭에서는 소비처가 알려준 `isMobile`에 따라 Sheet으로 갈아 끼운다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/sidebar.tsx"
  },
  {
    "component": "skeleton",
    "displayName": "Skeleton",
    "hash": "9c2250c043f6",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Skeleton"
    ],
    "configurationStates": {},
    "reference": {
      "example": "skeleton",
      "guidance": {
        "evidence": "투자 요약 카드와 이력 행을 불러오는 동안 레이아웃 이동을 줄여야 한다.",
        "limits": "실제 콘텐츠를 그대로 복제하거나 접근성 이름을 부여하지 말고, 로딩 상태는 감싸는 영역이 알린다.",
        "use": "콘텐츠 구조를 예측할 수 있는 로딩 구간에서 최종 레이아웃과 닮은 자리표시자를 보여준다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/skeleton.tsx"
  },
  {
    "component": "slider",
    "displayName": "Slider",
    "hash": "f7f90ee58411",
    "cells": 6,
    "axes": {
      "orientation": [
        "horizontal",
        "vertical"
      ],
      "size": [
        "sm",
        "default",
        "lg"
      ]
    },
    "anatomy": [
      "Slider",
      "SliderTrack",
      "SliderRange",
      "SliderThumb*"
    ],
    "configurationStates": {
      "value": [
        "single",
        "range"
      ]
    },
    "reference": {
      "example": "slider",
      "guidance": {
        "evidence": "투자 이력 필터의 손익 범위처럼 최소·최대를 눈으로 훑으며 좁히는 자리가 있다.",
        "limits": "정확한 금액이나 날짜를 입력받아야 하면 Input을 쓰고, 값이 몇 개뿐인 이산 선택에는 Toggle Group이나 Radio Group을 쓴다. thumb마다 접근 가능한 이름이 필요하므로 range에서는 thumbLabels를 반드시 준다.",
        "use": "정확한 숫자보다 상대적 위치가 중요한 연속 범위에서 값 하나 또는 구간의 양 끝을 고른다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/slider.tsx"
  },
  {
    "component": "spinner",
    "displayName": "Spinner",
    "hash": "5880705d6f03",
    "cells": 3,
    "axes": {
      "size": [
        "sm",
        "default",
        "lg"
      ]
    },
    "anatomy": [
      "Spinner"
    ],
    "configurationStates": {},
    "reference": {
      "example": "spinner",
      "guidance": {
        "evidence": "거래 저장처럼 소요 시간을 예측할 수 없는 비동기 동작에 즉각적인 대기 피드백이 필요하다.",
        "limits": "완료량을 알 수 있으면 Progress를 쓰고, 장시간 대기의 설명과 취소 동작은 소비처가 별도로 제공한다.",
        "use": "완료량을 알 수 없는 짧은 대기 상태를 간결하게 표시한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/spinner.tsx"
  },
  {
    "component": "switch",
    "displayName": "Switch",
    "hash": "bcf1744bc1bc",
    "cells": 2,
    "axes": {
      "size": [
        "sm",
        "default"
      ]
    },
    "anatomy": [
      "Switch",
      "Thumb"
    ],
    "configurationStates": {
      "checked": [
        "unchecked",
        "checked"
      ]
    },
    "reference": {
      "example": "switch",
      "guidance": {
        "evidence": "배당 재투자나 알림처럼 현재 활성 여부가 중요한 설정이 필요하다.",
        "limits": "확인이 필요한 위험 동작이나 세 값 이상의 선택에는 쓰지 않는다.",
        "use": "즉시 적용되는 이진 설정을 켜거나 끈다."
      }
    },
    "stateSamples": true,
    "source": "src/components/ui/switch.tsx"
  },
  {
    "component": "table",
    "displayName": "Table",
    "hash": "7b66614b9b57",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Table",
      "TableHeader",
      "TableBody",
      "TableRow*",
      "TableHead*",
      "TableCell*",
      "TableCaption?"
    ],
    "configurationStates": {
      "row": [
        "default",
        "selected"
      ]
    },
    "reference": {
      "example": "table",
      "guidance": {
        "evidence": "한국어 종목명·날짜·금액·양/음수 손익과 선택 가능한 투자 이력 행을 비교한다.",
        "limits": "정렬·필터·페이지네이션·가상화와 데이터 모델은 소비처 책임이다.",
        "use": "열 의미가 있고 비교가 중요한 데스크톱 데이터를 표현한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/table.tsx"
  },
  {
    "component": "tabs",
    "displayName": "Tabs",
    "hash": "41af970533cb",
    "cells": 2,
    "axes": {
      "orientation": [
        "horizontal",
        "vertical"
      ]
    },
    "anatomy": [
      "Tabs",
      "TabsList",
      "TabsTrigger*",
      "TabsContent*"
    ],
    "configurationStates": {
      "selected": [
        "inactive",
        "active"
      ]
    },
    "reference": {
      "example": "tabs",
      "guidance": {
        "evidence": "투자 상세에서 보유 현황과 거래 내역처럼 동일 대상의 병렬 보기를 화면 이동 없이 전환해야 하고, 본문 위에 얹히는 탭 막대는 트랙 없이 기준선 하나로 서야 한다.",
        "limits": "서로 독립된 작업 흐름이나 URL로 직접 접근해야 하는 화면 탐색에는 링크나 내비게이션을 사용한다 — 그 내비게이션이 Navigation Menu다(#127). 이 문장이 가리키던 자리가 카탈로그에 실제로 생겼으므로 경계가 닫혔다: 주소가 바뀌면 Navigation Menu, 같은 화면 안에서 패널만 갈아 끼우면 Tabs다. 활성 표식은 `indicator` 축이 진다 — `pill`(기본값)·`line` 둘이며 축은 `TabsList`에 앉고 `TabsTrigger`가 context로 받아 그린다(#125의 `ChartTooltipIndicator`가 선 자리와 같다). 이름이 upstream의 `variant`가 아닌 것은 우리 카탈로그에서 `variant`가 Button·Badge·Alert·Toggle의 **면의 계열** 이름이라 한 이름이 두 뜻을 갖기 때문이다(#144가 `align`을 버린 것과 같은 판정). 기본값이 `pill`인 것은 `line`을 기본으로 두면 발행된 탭이 트랙을 잃어 인스턴스가 재해석되기 때문이다. **Toggle Group의 `spacing`과 같은 개념이 아니다** — 저기서 갈리는 것은 항목끼리의 간격과 모서리 연속성이고 여기서 갈리는 것은 활성 표식의 정체라, 파생 채널이 집는 속성 집합부터 겹치지 않는다(#146). 밑줄은 색만으로 활성을 말하지 않는다: 갈리는 것은 색조가 아니라 아래 변의 **폭**(`0` → `2px`)이라 쉬는 트리거에는 획이 아예 없고, 여기에 `text-foreground`의 대비 상승과 Radix의 `aria-selected`가 겹친다. 색이 아니라 폭이 상태를 지는 두 번째 이유는 포커스다 — `focus-visible:border-focus-contrast`가 색만 바꾸므로, 색을 상태에 매달았다면 초점만 받은 비활성 탭이 `activationMode=\"manual\"`에서 활성 탭과 같은 밑줄을 그렸을 것이다. 선 색은 `--ds-border-focus-contrast`이고 `InputOTPSlot`이 활성 칸의 테두리에 쓰는 것과 같은 토큰이다 — 새 토큰은 세우지 않았다(맵 규칙 4). 색을 수식자 없는 `border-color`에 둔 덕에 그 토큰 선택은 `manifest/lint.mjs`의 계열 규칙이 실제로 보지만, **폭 쪽은 게이트가 보지 못한다** — `data-[state=active]`가 `MODIFIER_POLICY`에 없어 `unresolved`로 떨어지므로 활성일 때 획이 실제로 서는지는 사람이 Storybook에서 판정하며, 그 더미는 #140이 소유한다. 밑줄 형태의 트리거는 상태 면(`--ds-state-base`)을 갖지 않는다 — 깔 트랙이 없는 형태에 `--background`를 주면 트리거마다 `--ds-bg-canvas` 사각형이 깔려 이 축이 없애려는 트랙을 되그리고 Card·Dialog·Sidebar 면 위에서 면색이 어긋난다. 밑줄 형태에서도 목록은 가로로 늘어선다 — `orientation: vertical`이 옮기는 것은 목록과 패널의 관계이지 목록 안의 방향이 아니므로 기준선은 두 축 모두에서 목록의 아래 변이다. 목록의 폭은 계약하지 않는다(`w-fit`이 두 형태에 같다) — 기준선을 본문 폭까지 늘리는 것은 소비처가 `className`으로 정한다.",
        "use": "같은 맥락의 콘텐츠 패널을 한 번에 하나씩 전환하며 가로 또는 세로로 조립하고, 활성 탭을 알약으로 표시할지 밑줄로 표시할지 `TabsList`의 `indicator`로 고른다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/tabs.tsx"
  },
  {
    "component": "textarea",
    "displayName": "Textarea",
    "hash": "7760687906f5",
    "cells": 3,
    "axes": {
      "size": [
        "sm",
        "default",
        "lg"
      ]
    },
    "anatomy": [
      "Textarea"
    ],
    "configurationStates": {},
    "reference": {
      "example": "textarea",
      "guidance": {
        "evidence": "투자 거래의 근거와 회고를 남기는 가변 길이 메모가 필요하다.",
        "limits": "리치 텍스트 편집, 자동 저장, 글자 수 정책은 소비처가 조립한다.",
        "use": "여러 줄 메모나 설명을 입력받는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/textarea.tsx"
  },
  {
    "component": "toast",
    "displayName": "Toast",
    "hash": "15536a1ef2f6",
    "cells": 4,
    "axes": {
      "variant": [
        "default",
        "success",
        "warning",
        "destructive"
      ]
    },
    "anatomy": [
      "ToastProvider",
      "ToastViewport",
      "Toast",
      "ToastTitle?",
      "ToastDescription",
      "ToastAction?",
      "ToastClose?"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "toast",
      "guidance": {
        "evidence": "거래 저장이나 동기화 완료를 현재 맥락을 가리지 않고 확인시켜야 한다.",
        "limits": "전역 toast 큐와 명령형 호출 API는 소비처가 소유하며, 확인이 필요한 위험 행동에는 Alert Dialog를 사용한다. 오른쪽 스와이프로 닫히지만 그 방향과 임계값은 계약하지 않는다 — 제스처를 쓸 수 없는 사용자는 ToastClose로 동등하게 닫는다.",
        "use": "사용자 작업 직후의 짧고 비차단적인 결과를 알리고 필요할 때 한 개의 후속 동작을 제공한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/toast.tsx"
  },
  {
    "component": "toggle",
    "displayName": "Toggle",
    "hash": "4aaf46275096",
    "cells": 6,
    "axes": {
      "size": [
        "sm",
        "default",
        "lg"
      ],
      "variant": [
        "default",
        "outline"
      ]
    },
    "anatomy": [
      "Toggle"
    ],
    "configurationStates": {
      "pressed": [
        "unpressed",
        "pressed"
      ]
    },
    "reference": {
      "example": "toggle",
      "guidance": {
        "evidence": "투자 차트의 비교선이나 표시 옵션처럼 독립적으로 켜고 끄는 도구가 필요하다.",
        "limits": "즉시 적용되는 설정에는 Switch를, 제출할 복수 선택에는 Checkbox를 사용한다.",
        "use": "한 항목의 켜짐 상태를 눌러 전환하며 현재 pressed 상태를 즉시 드러낸다."
      }
    },
    "stateSamples": true,
    "source": "src/components/ui/toggle.tsx"
  },
  {
    "component": "toggle-group",
    "displayName": "Toggle Group",
    "hash": "6cff2b86c2dd",
    "cells": 24,
    "axes": {
      "orientation": [
        "horizontal",
        "vertical"
      ],
      "size": [
        "sm",
        "default",
        "lg"
      ],
      "spacing": [
        "separate",
        "attached"
      ],
      "variant": [
        "default",
        "outline"
      ]
    },
    "anatomy": [
      "ToggleGroup",
      "ToggleGroupItem*"
    ],
    "configurationStates": {
      "pressed": [
        "unpressed",
        "pressed"
      ],
      "selection": [
        "single",
        "multiple"
      ]
    },
    "reference": {
      "example": "toggle-group",
      "guidance": {
        "evidence": "차트 기간은 하나만, 비교 지표는 여러 개를 고르는 조밀한 도구 모음이 필요하고, 좁은 도구 막대에서는 그 묶음이 한 덩어리로 붙어야 한다.",
        "limits": "서로 무관한 동작을 시각적으로 붙이는 Button Group이나 제출형 선택 필드를 대신하지 않는다. 붙은 형태는 `spacing` 축이 진다 — `separate`(기본값)·`attached` 둘이고, 이름은 upstream을 따르되 값은 우리 어휘다(upstream의 `spacing={0}`은 숫자라 파생 채널이 그릴 이름이 되지 못한다). 기본값이 `separate`인 것은 `attached`를 기본으로 두면 발행된 모든 그룹이 `gap-0`과 테두리를 얻어 인스턴스가 재해석되기 때문이다(#144의 `placement: auto`와 같은 자리). **`TabsList`의 밑줄 축과 같은 개념이 아니다** — 여기서 갈리는 것은 항목끼리의 간격과 모서리 연속성이고 저기서 갈리는 것은 활성 항목을 무엇이 표시하는가라, 파생 채널이 집는 속성 집합부터 겹치지 않는다(#146). 붙은 형태에서 각 항목의 경계는 `border`가 진다 — `variant: default`에는 테두리가 없어 간격만 0으로 만들면 이웃과의 경계가 남지 않으므로, 이 축이 붙을 때만 테두리를 세우고 맞닿는 변은 한 번만 그린다. **이 선은 대비 기준을 지는 구분선이 아니다**: 색이 `--ds-border-default`라 canvas 위에서 약 1.4:1이고, 그 토큰은 `tokens:contrast`의 비텍스트 3:1 조합표에서 의도적으로 빠져 있다(`border.field`·`knockout`과 같은 자리). 이 선이 지는 것은 형태의 판독이며, `InputOTPSlot`과 `ButtonGroup`의 붙은 형태가 같은 색으로 같은 일을 하므로 여기만 다르게 그리지 않는다. 3:1을 지는 구분선은 `border.strong`의 자리인데 그 토큰에는 Tailwind 유틸리티가 없어 별칭을 새로 내야 하고 그건 `tokens.css`를 움직이는 일이라 맵 규칙 4가 금한다 — 필요하면 소비처가 `className`으로 덮는다. 바깥 모서리는 `Toggle`이 이미 쓰는 `rounded-md`를 그대로 남기므로 새 radius 단계를 요구하지 않는다. 첫·마지막 항목을 지목하는 `first:`·`last:` 수식자는 매니페스트에서 `unresolved`로 남는다 — `InputOTPSlot`이 붙은 칸을 그리는 것과 같은 관용구이고 그 더미는 #140이 소유한다. 붙은 형태에서도 이 컴포넌트는 여전히 선택 위젯이다: roving tabindex 한 칸과 화살표 키 이동은 Radix가 지며, 모양이 Button Group과 같아 보여도 자식마다 탭 정지가 남는 그쪽과 갈린다.",
        "use": "관련된 토글을 묶어 하나 또는 여러 값을 선택하고 화살표 키로 항목 사이를 이동하며, 항목을 떨어뜨려 둘지 하나의 덩어리로 붙일지 `spacing`으로 고른다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/toggle-group.tsx"
  },
  {
    "component": "tooltip",
    "displayName": "Tooltip",
    "hash": "ec053f2fcb72",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "TooltipProvider",
      "Tooltip",
      "TooltipTrigger",
      "TooltipContent"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "tooltip",
      "guidance": {
        "evidence": "투자 테이블의 아이콘 전용 작업 버튼이 가리키는 행동을 포인터와 키보드 포커스 모두에 설명해야 한다.",
        "limits": "필수 정보나 상호작용 요소를 Tooltip 안에만 두지 않는다.",
        "use": "아이콘이나 축약된 컨트롤의 의미를 짧은 텍스트로 보충한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/tooltip.tsx"
  }
] as const
