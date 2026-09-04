/* GENERATED from @massive/ui manifests. Do not edit. */
export const catalog = [
  {
    "component": "accordion",
    "displayName": "Accordion",
    "hash": "d26a258fcc56",
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
        "limits": "잠깐 보이는 결과에는 Toast를 쓰고, 안내를 role=alert로 쌓지 않는다. `AlertAction`의 내용은 소비처가 넣고(대개 `Button`) anatomy 순서대로 DOM 맨 뒤에 둔다. 위치 축과 아이콘 컬럼은 열지 않는다 — 다른 자리는 className으로, 긴 제목은 `pr-*`로 겹침을 피한다.",
        "use": "화면 안에서 사용자가 알아야 할 지속적인 피드백이나 주의 사항을 의미별로 전달하고, 그 자리에서 할 수 있는 동작 하나를 `AlertAction`에 얹는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/alert.tsx"
  },
  {
    "component": "alert-dialog",
    "displayName": "Alert Dialog",
    "hash": "a0d460a178ce",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "AlertDialog",
      "AlertDialogTrigger",
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
        "limits": "일반 정보·양식·되돌리기 쉬운 행동은 Dialog로 가고 반복 확인 단계로 쓰지 않는다. `size` 축·`AlertDialogMedia`는 열지 않고 크기는 유틸리티로 정한다. `AlertDialogPortal`은 공개하지 않고 포탈 대상은 `AlertDialogContent`의 prop으로 온다 — 근거: ADR-0018",
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
        "limits": "이름은 주변 텍스트로 주고 장식 이미지는 빈 alt다. `AvatarGroup`·`AvatarBadge`·`AvatarGroupCount`는 `aria-label`이 필수다. 겹치지 않는 나열은 소비처의 `flex gap-*`이다. 배지 위치와 카드 위 링 색은 className으로 덮고, 넘침 기준은 텍스트로 넣는다.",
        "use": "사람이나 계정을 작은 원형 이미지로 식별하고 없으면 fallback을 낸다. 겹친 무리는 `AvatarGroup`·`AvatarGroupCount`가, 상태 점은 `AvatarBadge`가 진다."
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
        "limits": "도메인 값을 variant 이름으로 추가하지 않는다 — 매수·매도·손익 같은 의미는 소비처가 neutral·accent·success·danger에 매핑한다. `variant`는 의미 계열만 채우고, upstream의 `outline`·`ghost`·`link`는 실측 수요가 확인되면 연다 — 근거: ADR-0019",
        "use": "짧은 분류와 상태를 보조한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/badge.tsx"
  },
  {
    "component": "breadcrumb",
    "displayName": "Breadcrumb",
    "hash": "28e34b93c508",
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
    "hash": "c31e2df5071e",
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
        "limits": "하나의 값을 고르는 선택 위젯에는 Toggle Group을 쓴다. `disabled`는 그룹이 아니라 각 Button에 준다. 구분선의 방향은 `ButtonGroupSeparator`의 `orientation`으로 그룹과 짝 맞춘다. 뜻으로 갈리는 묶음은 구분선이 아니라 두 `ButtonGroup`이다.",
        "use": "서로 무관한 동작 버튼을 한 덩어리로 붙여 보이는 자리에 쓴다. 자식마다 탭 정지와 각자의 `disabled`가 남는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/button-group.tsx"
  },
  {
    "component": "calendar",
    "displayName": "Calendar",
    "hash": "391ec5e6e100",
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
        "limits": "Date Picker 조합·연월 드롭다운·다중 월·다중 선택(multiple)은 계약하지 않는다. 시간대·파싱·직렬화도 다루지 않고 지역 날짜만 받는다. 월·요일 이름은 locale prop이 정하고 주 시작·오늘 기준일은 소비처가 준다. `CalendarDay`는 upstream `CalendarDayButton`과 같은 노드이나 이름은 유지한다.",
        "use": "한 달 격자에서 날짜 하나(single) 또는 시작·끝이 있는 기간(range)을 고르고, 오늘·이번 달 밖·선택 불가 날짜를 격자 안에서 구분한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/calendar.tsx"
  },
  {
    "component": "card",
    "displayName": "Card",
    "hash": "5c2b70656b1d",
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
        "limits": "SummaryCard 같은 도메인 컴포넌트를 만들지 않고 기존 Card 파트로 조립한다. `size` 축(upstream의 default/sm)은 열지 않는다 — 간격은 소비처가 유틸리티로 정한다.",
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
        "limits": "목록을 전부 봐야 하는 자리에는 다 펼친 목록을 쓴다. 접근 가능한 이름은 소비처가 루트에 aria-label로 준다. 자동 재생은 없다. 드래그·포커스 스크롤은 opts로 끈다. 보일 장 수(basis-*)와 loop·align은 소비처가 정한다. 위치 표시기(dots)는 없다 — 필요하면 `setApi`로 받은 인스턴스로 그린다.",
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
        "limits": "차트 본체는 Recharts prop(`stroke`·`tick`·`fill`)으로 소비처가 그린다. `Tooltip`·`Legend`는 recharts에서 가져와 `content`에 카드를 꽂는다. 계열 색은 `ChartConfig.color`로 모드 전환이 끝난 변수를 준다. 값을 읽는 자리는 Table이다.",
        "use": "시계열이나 범주 비교를 Recharts로 그리면서, 툴팁 카드와 범례만 카탈로그의 면·글자·모서리 규칙에 맞춰 통일한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/chart.tsx"
  },
  {
    "component": "checkbox",
    "displayName": "Checkbox",
    "hash": "103951efaf4b",
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
    "hash": "3572efa3a251",
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
    "hash": "378d48951e29",
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
      "CommandSeparator?",
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
        "limits": "값이 적고 고정되면 Select, 폼 제출과 시스템 피커가 중요하면 Native Select, 고를 값이 아니라 실행할 동작이면 Command를 쓴다. 접근 가능한 이름은 소비처가 `aria-label`이나 Field 라벨로 준다. 다중 선택과 값 생성은 계약하지 않는다. 구분선을 포함해 목록 안쪽은 `Command*`로 직접 조립한다.",
        "use": "값이 많아 눈으로 훑기 어려운 목록에서 검색으로 좁혀 하나를 고르고, 닫힌 상태에서는 고른 값을 트리거에 보여준다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/combobox.tsx"
  },
  {
    "component": "command",
    "displayName": "Command",
    "hash": "efd26d5beca5",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Command",
      "CommandInput",
      "CommandList",
      "CommandGroup*",
      "CommandGroupHeading?",
      "CommandItem*",
      "CommandSeparator?",
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
        "limits": "값이 적고 고정된 선택에는 Select, 맥락 동작 묶음에는 Dropdown Menu를 쓴다. 팝오버·모달 안에 넣기와 닫기, 원격 검색과 정렬, 검색 입력의 접근 가능한 이름은 소비처가 준다. 단축키 표기는 `Kbd`를 `ml-auto`로 놓는다. `CommandSeparator`는 `CommandGroup` 안에 넣지 않는다.",
        "use": "검색어로 목록을 좁혀 명령이나 항목 하나를 고르고, 키보드 커서(highlighted)와 고른 값(selected)을 함께 보여준다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/command.tsx"
  },
  {
    "component": "dialog",
    "displayName": "Dialog",
    "hash": "f8e7ca31ab67",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Dialog",
      "DialogTrigger",
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
        "limits": "파괴적 행동 확인에는 Alert Dialog를, 단순 보조 정보에는 Popover를 쓴다. `DialogPortal`은 공개하지 않는다 — 포탈 대상을 골라야 하면 노드가 아니라 `DialogContent`의 prop으로 온다 — 근거: ADR-0018",
        "use": "현재 흐름을 잠시 멈추고 집중해서 완료할 작업을 연다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/dialog.tsx"
  },
  {
    "component": "dropdown-menu",
    "displayName": "Dropdown Menu",
    "hash": "3ccb17fb03d8",
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
        "evidence": "각 투자 행의 수정·삭제 같은 행 메뉴 진입점이 필요하고, 표의 행을 우클릭해 같은 메뉴를 여는 경로도 같은 자산이어야 한다. 같은 메뉴에서 즐겨찾기를 켜고 끄고, 통화를 하나만 고르고, 내보내기 형식을 한 겹 더 들어가 고른다.",
        "limits": "variant=\"destructive\"는 강조만 바꾼다 — 확인·실행은 소비처가 둔다. openOn=\"context\"는 대상 영역에만 쓰고 트리거는 포커스 가능한 요소를 asChild로 준다. defaultOpen·sideOffset은 press에서만 듣는다. 상시 노출 명령 막대는 Menubar, 사이트 탐색은 Navigation Menu다.",
        "use": "현재 맥락의 보조 동작을 묶는다. 보이는 컨트롤에서 여는 press 모드와 대상 영역을 우클릭·롱프레스해 여는 openOn=\"context\" 모드가 같은 계약이고, 체크·라디오·서브메뉴는 두 모드에서 같다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/dropdown-menu.tsx"
  },
  {
    "component": "empty",
    "displayName": "Empty",
    "hash": "4dc424478a50",
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
        "limits": "오류·권한·온보딩 의미와 문구·일러스트·행동은 소비처가 정한다. `frame`은 `icon`(기본)·`none` 둘이고 `image`는 없다 — 큰 그림은 소비처가 `EmptyHeader` 안에 자기 노드로 둔다. 대체 텍스트는 장식이면 `EmptyMedia`에 `aria-hidden`, 뜻이 있으면 안쪽 요소의 `alt`로 준다.",
        "use": "표시할 내용이 없는 영역에 상태 설명과 선택적인 다음 행동을 조립하고, 미디어 자리가 그릴 틀은 `EmptyMedia`의 `frame` 축이 정한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/empty.tsx"
  },
  {
    "component": "field",
    "displayName": "Field",
    "hash": "b3f1aa9d93f9",
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
      "FieldLegend?",
      "FieldSeparator?",
      "FieldSeparatorContent?"
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
        "evidence": "투자 입력 화면의 라벨·메모·검증 메시지를 한 구조로 묶어야 하고, 같은 `<legend>`가 섹션 캡션인 화면과 필드 라벨로 앉는 화면이 갈리며, 매수·매도처럼 배타적인 묶음 사이에 \"또는\" 구분선이 필요하다.",
        "limits": "폼 상태·검증 규칙·제출은 소비처가 소유한다. `FieldTitle`은 열지 않는다 — 한 단 작은 라벨은 `FieldLabel`에 `text-xs`를 준다. `rank`는 글자만 바꾼다. \"또는\" 칩은 `FieldSeparator`의 `children`으로 주고, 캔버스가 아닌 면 위에서는 칩 배경을 소비처가 맞춘다.",
        "use": "라벨·컨트롤·도움말·오류를 접근 가능한 한 필드로 조립한다. `FieldSet` 캡션의 층위는 `FieldLegend`의 `rank` 축이, 묶음 사이 장식선은 `FieldSeparator`가 진다."
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
    "hash": "b0c644a4b024",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "InputGroup",
      "InputGroupAddon?",
      "InputGroupText?",
      "InputGroupInput?",
      "InputGroupTextarea?",
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
        "limits": "컨트롤은 `InputGroupInput`·`InputGroupTextarea` 하나다. 라벨·설명·오류는 Field가 진다. `InputGroupText`는 `InputGroupAddon` 안에만 선다. 버튼 정렬은 className, 모양은 `Button` 축. `text-xs`는 nova(`text-sm`)와 다르지만 발행 인스턴스를 지켜 유지한다.",
        "use": "한 줄 또는 여러 줄 입력 컨트롤 하나와 아이콘·단위·글자·버튼 같은 부가물을 하나의 필드 껍데기 안에 붙이고, 포커스·비활성·오류 표시를 껍데기가 대신 그린다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/input-group.tsx"
  },
  {
    "component": "input-otp",
    "displayName": "Input Otp",
    "hash": "05e041a813e9",
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
        "limits": "일반 텍스트나 금액에는 Input을 쓴다. 접근 가능한 이름은 소비처가 Field나 aria-label로 주고, 오류는 컨트롤의 aria-invalid가 정본이며 슬롯도 같은 값을 받는다. IME 조합 문자가 필요한 코드에는 쓰지 않는다. 재전송 타이머·자동 제출·검증 규칙은 소비처가 소유한다.",
        "use": "여섯 자리 안팎의 일회용 코드를 칸으로 나눠 보여주면서, 값과 폼 제출은 입력 하나가 그대로 지게 한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/input-otp.tsx"
  },
  {
    "component": "item",
    "displayName": "Item",
    "hash": "c87aa8a24695",
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
        "limits": "탐색·선택·버튼 역할은 주지 않는다 — 상호작용 의미는 소비처가 명시한다. 아바타는 `frame=\"none\"` 안에 `Avatar`를 넣는다(`image`는 틀이 겹친다). 대체 텍스트는 장식이면 `ItemMedia`에 `aria-hidden`, 뜻이 있으면 `<img>`의 `alt`로 소비처가 준다.",
        "use": "미디어·주 정보·보조 설명·행동을 재배치 가능한 한 항목으로 조립할 때 쓴다. 미디어 자리의 틀은 `ItemMedia`의 `frame`으로 고른다."
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
        "limits": "크기 축은 없다 — `text-xs` 캡 하나가 Button·Tooltip·Input Group에 다 들어간다. 구분자 `+`는 소비처가 텍스트로 넣고, 기호 이름과 `aria-keyshortcuts`는 동작 컨트롤에 준다. Tooltip 반전 면 위의 색과 Command 항목 끝 배치는 className으로 준다.",
        "use": "키보드 키와 단축키 조합을 본문·툴팁·버튼 안에서 본문 글자와 구분되는 키캡으로 표기한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/kbd.tsx"
  },
  {
    "component": "label",
    "displayName": "Label",
    "hash": "12a012388cca",
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
    "hash": "13b2dd444ee2",
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
    "hash": "0e30daf20e52",
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
        "limits": "사이트 탐색은 Navigation Menu, 행·캔버스 메뉴는 Dropdown Menu, 패널 전환은 Tabs다. 단축키는 Kbd를 ml-auto로, 막대 이름은 aria-label로 준다. `MenubarItem`은 variant를 열지 않는다 — 파괴적 명령이 막대에 오면 DropdownMenuItem과 같은 축으로 연다.",
        "use": "상시 노출 가로 막대에 명령 메뉴 여러 개를 나란히 둘 때 쓴다. 체크·라디오·하위 묶음은 `MenubarCheckboxItem`·`MenubarRadioGroup`·`MenubarSub`다."
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
        "limits": "옵션에 아이콘·설명·구분선을 넣거나 열린 목록을 디자인해야 하면 Radix 기반 Select를 쓴다 — 열림 상태는 OS 소유라 이 컴포넌트의 구성 상태에 없다. 라벨은 Field가 연결하고, 옵션 묶음은 `NativeSelectGroup`(`<optgroup>`)이다.",
        "use": "폼에 실려야 하는 짧은 값 하나를 고를 때 브라우저의 select를 그대로 쓰고, 필드 껍데기와 화살표만 디자인 시스템이 그린다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/native-select.tsx"
  },
  {
    "component": "navigation-menu",
    "displayName": "Navigation Menu",
    "hash": "af3c3587734c",
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
        "limits": "패널 전환은 Tabs, 명령 메뉴는 Menubar, 보조 동작은 Dropdown Menu다. 하위 없는 항목은 `NavigationMenuLink`에 `navigationMenuTriggerVariants()`를 입혀 막대에 놓고 라우터 링크는 `asChild`로 끼운다. `aria-label`과 라우팅은 소비처가 준다.",
        "use": "화면 상단에서 사이트의 주요 목적지를 가로로 늘어놓는 자리에 쓴다. 하위 목적지가 여럿인 항목만 카드로 펼치고, 현재 화면 링크는 `active`로 표시한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/navigation-menu.tsx"
  },
  {
    "component": "pagination",
    "displayName": "Pagination",
    "hash": "d4c46e1ca5f0",
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
        "limits": "데이터가 적으면 한 페이지에 다 보이고, 연속 스크롤이 핵심인 흐름은 소비처가 자기 목록으로 푼다. 축약 뒤에도 현재 페이지·이전·다음 링크의 접근 가능한 이름과 기본 키보드 동작을 보존한다. 이전·다음의 문구는 children으로 정한다. 링크 크기(default·icon)는 Button 계약이 그린다 — 다른 크기는 Button `asChild`로.",
        "use": "긴 결과 집합을 여러 페이지로 나누고 현재 페이지와 인접 이동을 링크로 제공한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/pagination.tsx"
  },
  {
    "component": "popover",
    "displayName": "Popover",
    "hash": "dce574a7ca7d",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Popover",
      "PopoverTrigger",
      "PopoverAnchor?",
      "PopoverContent",
      "PopoverHeader?",
      "PopoverTitle?",
      "PopoverDescription?"
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
        "evidence": "투자 기록의 필터 설명과 빠른 설정을 화면 맥락을 떠나지 않고 보여줘야 하고, 종목 이름 위에 머무르면 요약을 미리 보는 경로도 같은 자산이어야 한다. 그 표면은 대개 제목 한 줄과 설명 한 줄로 시작한다.",
        "limits": "핵심 흐름·긴 양식은 Dialog, 행동 없는 짧은 설명은 Tooltip을 쓴다. hover Popover는 대상의 미리보기라 hover 없는 경로도 두고 필수 흐름을 담지 않는다. `PopoverPortal`은 공개하지 않고 포탈 대상은 `PopoverContent`의 prop으로 온다 — 근거: ADR-0018",
        "use": "트리거 가까이에 짧은 보조 정보·설정을 연다. `PopoverTitle`·`PopoverDescription`이 제목·설명을 지고, 클릭(기본)과 openOn=\"hover\"를 한 계약으로 덮는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/popover.tsx"
  },
  {
    "component": "progress",
    "displayName": "Progress",
    "hash": "9a2746f492c7",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Progress",
      "ProgressIndicator",
      "ProgressLabel?",
      "ProgressValue?"
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
        "evidence": "투자 내역 가져오기처럼 처리할 전체 항목 수를 아는 작업에 진행률 피드백이 필요하고, 그 화면은 대개 \"무엇을\"과 \"몇 퍼센트\"를 트랙과 함께 읽는다.",
        "limits": "완료량을 모르는 대기는 Spinner. value 계산·문구는 소비처, `ProgressValue`는 children으로 받는다. 한 줄은 소비처가 `flex items-center gap-2`로 짜고 라벨 id를 `aria-labelledby`로 문다. `text-xs`는 정본(nova) `text-sm`과 다르지만 발행 인스턴스를 지켜 유지한다.",
        "use": "완료량을 아는 작업의 진행 정도를 0에서 100 사이 값으로 보여주고, 무엇의 진행인지와 몇 퍼센트인지는 `ProgressLabel`·`ProgressValue`가 트랙 위 한 줄로 말한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/progress.tsx"
  },
  {
    "component": "radio-group",
    "displayName": "Radio Group",
    "hash": "bff46803d4c1",
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
    "hash": "c8562bec6241",
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
        "limits": "고정 비율 레이아웃은 grid·flex 유틸리티로 나눈다. 패널 크기(defaultSize·minSize·maxSize)·레이아웃 저장·명령형 API는 소비처의 것이고, 핸들 이름은 소비처가 aria-label로 준다. 키보드(화살표 ±5, Home/End, Enter 접기, F6 순회)는 upstream이 준다.",
        "use": "한 화면 안에서 두 영역의 넓이를 사용자가 직접 나눠 갖게 하고, 그 경계를 포인터와 키보드 양쪽으로 옮길 수 있게 한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/resizable.tsx"
  },
  {
    "component": "scroll-area",
    "displayName": "Scroll Area",
    "hash": "80a0cd851bd6",
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
        "limits": "페이지 전체 스크롤을 대신하지 않고, 축 없는 자유 스크롤이나 가상 스크롤 목록은 소비처가 자기 뷰포트로 푼다. 영역에 크기 제약이 없으면 스크롤바도 생기지 않는다. 스크롤이 콘텐츠에 닿는 유일한 통로가 되지 않게 하고, 초점을 받는 영역에는 aria-label로 이름을 준다.",
        "use": "크기가 고정된 영역 안에서 넘치는 콘텐츠를 한 축으로만 스크롤하게 하고, 브라우저 기본 대신 디자인 시스템 스크롤바를 그린다. 뷰포트가 초점을 받아 키보드만으로도 굴러간다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/scroll-area.tsx"
  },
  {
    "component": "select",
    "displayName": "Select",
    "hash": "1b0344daeff5",
    "cells": 2,
    "axes": {
      "size": [
        "default",
        "sm"
      ]
    },
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
        "limits": "필터 모델과 화면 전용 라벨은 소비처가 둔다. `SelectPortal`은 공개하지 않는다 — 포탈 대상은 `SelectContent`의 prop으로 온다. 스크롤 화살표 버튼은 열지 않는다. size는 default·sm 둘이다 — lg가 필요하면 NativeSelect를 쓴다. — 근거: ADR-0018 · ADR-0008",
        "use": "제한된 값 하나를 선택한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/select.tsx"
  },
  {
    "component": "separator",
    "displayName": "Separator",
    "hash": "e3aa7434689a",
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
    "hash": "a3cda7f26dd4",
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
        "limits": "중앙에서 흐름을 멈추는 작업은 Dialog, 파괴적 확인은 Alert Dialog, 배경 상호작용이 이어지는 보조 정보는 Popover다. 항상 모달이라 비모달 패널로 쓰지 않고 SheetTitle은 필수다. `SheetPortal`은 공개하지 않고 포탈 대상은 `SheetContent`의 prop으로 온다 — 근거: ADR-0018",
        "use": "본문을 덮지 않고 화면 가장자리에서 열리는 모달 표면으로, 원래 맥락을 유지한 채 필터·상세·보조 편집을 옆에서 처리한다. side는 붙는 변만 정하고 모달 동작은 네 값이 같다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/sheet.tsx"
  },
  {
    "component": "sidebar",
    "displayName": "Sidebar",
    "hash": "8c4dcde8bae2",
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
        "limits": "breakpoint·영속화·단축키는 `isMobile`·`open`·`onOpenChange`로 소비처가 배선한다. 검색·스켈레톤·접힌 레이블은 Input·Skeleton·Tooltip으로 조립한다. `<main>`·`aria-label`은 소비처가 준다. `SidebarMenuSubButton.size`는 닫는다 — 작은 글자는 `className`으로.",
        "use": "애플리케이션 셸의 왼쪽이나 오른쪽에 고정돼 본문과 함께 살며 접고 펴는 세로 탐색 표면에 쓴다. 좁은 폭에서는 `isMobile`에 따라 Sheet으로 갈아 끼운다."
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
    "hash": "e2a8080a65c8",
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
    "hash": "275b71ab4ca7",
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
        "limits": "확인이 필요한 위험 동작이나 세 값 이상의 선택에는 쓰지 않는다. off 트랙은 누르는 컨트롤 어포던스이므로 자기가 앉는 면에 대해 비텍스트 대비 3:1(WCAG 1.4.11)을 만족해야 하고, Progress·Slider의 잔여 트랙과 같은 중립 soft를 쓰지 않는다.",
        "use": "즉시 적용되는 이진 설정을 켜거나 끈다."
      }
    },
    "stateSamples": true,
    "source": "src/components/ui/switch.tsx"
  },
  {
    "component": "table",
    "displayName": "Table",
    "hash": "c0e881d471f4",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Table",
      "TableHeader",
      "TableBody",
      "TableFooter?",
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
        "limits": "정렬·필터·페이지네이션·가상화와 데이터 모델은 소비처 책임이다. `TableFooter`는 `<tfoot>`이라 본문을 요약하는 합계·소계 행의 자리이고, 첫 칸을 이름으로 읽힐지는 `TableHead scope=\"row\"`로 정한다. sticky는 소비처가 스크롤 컨테이너와 함께 `<th>`·`<td>`에 건다.",
        "use": "열 의미가 있고 비교가 중요한 데스크톱 데이터를 표현한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/table.tsx"
  },
  {
    "component": "tabs",
    "displayName": "Tabs",
    "hash": "8e8ffcfb8b6a",
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
        "limits": "주소가 바뀌는 화면 탐색은 Navigation Menu다 — 여기는 같은 화면 안에서 패널만 갈아 끼운다. 밑줄 형태에서도 목록은 가로로 늘어선다(`orientation: vertical`은 목록과 패널의 관계만 옮긴다). 목록의 폭은 계약하지 않는다 — 기준선을 본문 폭까지 늘리는 것은 소비처가 `className`으로 정한다.",
        "use": "같은 화면 안에서 콘텐츠 패널을 하나씩 갈아 끼울 때 쓴다. 활성 탭을 알약으로 표시할지 밑줄로 할지 `TabsList`의 `indicator`로 고른다."
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
    "hash": "a3b81daa6ec8",
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
    "hash": "a2a397c6cac4",
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
        "limits": "서로 무관한 동작을 시각적으로만 붙이는 자리는 Button Group, 제출형 선택 필드는 Radio Group·Select다. 붙은 형태의 경계선은 대비 기준을 지지 않는다 — 3:1 구분선이 필요하면 소비처가 `className`으로 덮는다. `attached`에서도 탭 정지 하나를 공유하는 선택 위젯이다.",
        "use": "관련된 토글을 묶어 하나 또는 여러 값을 고르는 자리에 쓴다. 화살표 키로 항목 사이를 옮기고, 항목을 붙일지 떨어뜨릴지 `spacing`으로 고른다."
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
