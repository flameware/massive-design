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
    "hash": "084e3cca70c4",
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
      "AlertDescription"
    ],
    "configurationStates": {},
    "reference": {
      "example": "alert",
      "guidance": {
        "evidence": "투자 데이터 동기화 결과와 가격 지연 경고를 성공·warning·danger 의미로 구별해야 한다.",
        "limits": "잠깐 나타나는 작업 결과에는 Toast를 사용하고, 모든 안내를 role=alert로 반복해 쌓지 않는다. upstream의 `AlertAction`과 아이콘 슬롯은 계약하지 않는다 — `AlertAction`은 열 근거가 있으나 별도 effort로 미뤘고, 아이콘 컬럼은 이 Alert이 1열 그리드라 도입하면 기존 인스턴스의 격자를 재해석하는 breaking이다(#121).",
        "use": "화면 안에서 사용자가 알아야 할 지속적인 피드백이나 주의 사항을 의미별로 전달한다."
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
    "hash": "a03c4ba9bb2a",
    "cells": 3,
    "axes": {
      "size": [
        "sm",
        "default",
        "lg"
      ]
    },
    "anatomy": [
      "Avatar",
      "AvatarImage?",
      "AvatarFallback"
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
        "evidence": "투자 기록의 작성자나 연결된 증권 계정을 목록과 활동 내역에서 빠르게 구별해야 한다.",
        "limits": "이미지만으로 이름을 전달하지 말고 주변 텍스트나 접근 가능한 이름을 제공하며, 장식 이미지에는 빈 대체 텍스트를 사용한다. upstream의 `AvatarBadge`·`AvatarGroup`·`AvatarGroupCount`는 계약하지 않는다 — anatomy가 늘고 겹침·ring 배치를 소비처가 복제해야 하는 진짜 표면이라 열 근거는 있으나, 기존 카탈로그를 다시 여는 일이라 별도 effort에서 additive로 붙인다(#121).",
        "use": "사람이나 계정을 작은 원형 이미지로 식별하고 이미지가 없거나 실패하면 안정적인 fallback을 표시한다."
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
    "component": "checkbox",
    "displayName": "Checkbox",
    "hash": "b952b37163b6",
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
    "hash": "c7f9281f045a",
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
        "limits": "값이 적고 고정된 선택에는 Select를, 맥락 동작 묶음에는 Dropdown Menu를 쓴다. 팝오버·모달 안에 넣는 것과 닫기, 원격 검색과 정렬 순서는 소비처가 조립하며 검색 입력의 접근 가능한 이름도 소비처가 준다.",
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
    "hash": "e3617c6fd13c",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "DropdownMenu",
      "DropdownMenuTrigger",
      "DropdownMenuContent",
      "DropdownMenuGroup*",
      "DropdownMenuLabel?",
      "DropdownMenuItem*",
      "DropdownMenuSeparator?"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "reference": {
      "example": "dropdown-menu",
      "guidance": {
        "evidence": "각 투자 행의 수정·삭제 같은 행 메뉴 진입점에 필요하다.",
        "limits": "삭제 확인과 실제 동작 로직은 포함하지 않는다.",
        "use": "현재 맥락에 속하는 보조 동작을 묶는다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/dropdown-menu.tsx"
  },
  {
    "component": "empty",
    "displayName": "Empty",
    "hash": "b7ac43840fbd",
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
        "evidence": "검색 결과나 아직 생성되지 않은 목록에서 빈 영역의 이유와 회복 경로를 함께 보여줘야 한다.",
        "limits": "오류·권한·온보딩 의미를 자체 판단하지 않으며 문구, 일러스트, 행동의 제품 의미는 소비처가 제공한다. `EmptyMedia`의 icon 축은 계약하지 않는다 — `ItemMedia`와 같은 자리이고 판정도 같다. 열 때는 upstream의 값 이름을 그대로 써 두 Media의 값 집합이 갈라지지 않게 한다(#121).",
        "use": "표시할 내용이 없는 영역에 상태 설명과 선택적인 다음 행동을 조립한다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/empty.tsx"
  },
  {
    "component": "field",
    "displayName": "Field",
    "hash": "2c6116855f68",
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
    "hash": "e3e72b6225f6",
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
        "limits": "값을 가진 컨트롤을 둘 이상 담지 않으며, 라벨·설명·오류 문구는 여전히 Field가 소유하고 접근성 상태의 정본은 안쪽 컨트롤의 disabled·aria-invalid다. `InputGroupAddon`의 4방향 배치 축(upstream의 `align`)은 계약하지 않는다 — 파트 축이라 열 근거는 있으나 별도 effort로 미뤘다. `InputGroupButton`의 variant·size는 열지 않는다 — 소비처가 `Button`의 축을 그대로 쓰면 되고 우리 스타일 결정을 복제하지 않는다(#121).",
        "use": "한 줄 입력 컨트롤 하나와 아이콘·단위·버튼 같은 부가물을 하나의 필드 껍데기 안에 붙이고, 포커스·비활성·오류 표시를 껍데기가 대신 그린다."
      }
    },
    "stateSamples": false,
    "source": "src/components/ui/input-group.tsx"
  },
  {
    "component": "item",
    "displayName": "Item",
    "hash": "008b33625ebc",
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
        "evidence": "검색 결과, 선택 목록, 설정 행처럼 같은 정보 위계를 공유하지만 제품 의미가 다른 반복 항목이 필요하다.",
        "limits": "탐색·선택·버튼 역할을 자동으로 부여하지 않으며 도메인 필드와 상호작용 의미는 소비처가 명시한다. `ItemMedia`의 icon/image 축은 계약하지 않는다 — 파트 축이라 열 근거는 있으나 별도 effort로 미뤘으며, 열 때는 upstream의 값 이름(`icon`·`image`)을 그대로 쓴다(#121).",
        "use": "미디어, 주 정보, 보조 설명과 행동을 재배치 가능한 한 항목으로 조립한다."
      }
    },
    "stateSamples": true,
    "source": "src/components/ui/item.tsx"
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
    "hash": "109497324ece",
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
        "evidence": "투자 기록의 필터 설명과 빠른 설정을 원래 화면 맥락을 떠나지 않고 보여줘야 한다.",
        "limits": "핵심 작업 흐름이나 긴 양식은 Dialog로 옮기고, 행동 없는 짧은 설명은 Tooltip을 사용한다.",
        "use": "트리거와 가까운 곳에서 짧은 보조 정보나 설정을 제공한다."
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
    "hash": "73605238388e",
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
    "hash": "5503b18695d6",
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
    "hash": "d6fdc43dd30e",
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
        "evidence": "투자 상세에서 보유 현황과 거래 내역처럼 동일 대상의 병렬 보기를 화면 이동 없이 전환해야 한다.",
        "limits": "서로 독립된 작업 흐름이나 URL로 직접 접근해야 하는 화면 탐색에는 링크나 내비게이션을 사용한다. `TabsList`의 밑줄 표현 축(upstream의 `variant=\"line\"`)은 계약하지 않는다 — List와 Trigger 양쪽을 재작성해야 하는 진짜 표면이라 열 근거는 있으나 별도 effort로 미뤘다(#121).",
        "use": "같은 맥락의 콘텐츠 패널을 한 번에 하나씩 전환하며 가로 또는 세로로 조립한다."
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
    "hash": "bf3647e14670",
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
    "hash": "d0b9e9cc0cb2",
    "cells": 12,
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
        "evidence": "차트 기간은 하나만, 비교 지표는 여러 개를 고르는 조밀한 도구 모음이 필요하다.",
        "limits": "서로 무관한 동작을 시각적으로 붙이는 Button Group이나 제출형 선택 필드를 대신하지 않는다. 붙은 형태(upstream의 `spacing={0}`)는 계약하지 않는다 — 축이 생기고 자식 radius 평탄화 로직이 따라오는 진짜 표면이라 열 근거는 있으나 별도 effort로 미뤘다(#121).",
        "use": "관련된 토글을 묶어 하나 또는 여러 값을 선택하고 화살표 키로 항목 사이를 이동한다."
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
