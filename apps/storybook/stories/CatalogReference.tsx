import type { ReactNode } from "react"
import {
  Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle,
  Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, Input, Label, ListRow, ListRowContent,
  ListRowDescription, ListRowMeta, ListRowTitle, ListRowTrailing, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@massive/ui"
import { catalog } from "./catalog.gen"

export type CatalogEntry = (typeof catalog)[number]

const guidance: Record<string, { use: string; evidence: string; limits: string }> = {
  badge: { use: "짧은 분류와 상태를 보조한다.", evidence: "매수·매도, 시장, 손익 의미를 neutral·accent·success·danger에 소비처가 매핑한다.", limits: "도메인 값을 variant 이름으로 추가하지 않는다." },
  button: { use: "사용자가 명시적으로 시작하는 동작에 쓴다.", evidence: "거래 추가와 행 메뉴의 명시적 동작에 필요하다.", limits: "탐색 링크나 화면 전용 아이콘 API를 대신하지 않는다." },
  card: { use: "관련 콘텐츠를 하나의 표면으로 묶는다.", evidence: "투자 이력의 요약 영역에서 기존 Card를 재사용한다.", limits: "SummaryCard 같은 도메인 컴포넌트를 만들지 않는다." },
  checkbox: { use: "복수 행 선택과 불확정 전체 선택을 표현한다.", evidence: "투자 이력 Table의 checked·unchecked·indeterminate 구성 상태가 필요하다.", limits: "선택 모델과 일괄 동작은 소비처 책임이다." },
  "dropdown-menu": { use: "현재 맥락에 속하는 보조 동작을 묶는다.", evidence: "각 투자 행의 수정·삭제 같은 행 메뉴 진입점에 필요하다.", limits: "삭제 확인과 실제 동작 로직은 포함하지 않는다." },
  input: { use: "한 줄 텍스트 값을 입력하거나 검색어를 받는다.", evidence: "투자 이력 검색의 접근 가능한 기본 필드가 필요하다.", limits: "SearchField, 검색 아이콘, debounce는 소비처가 조립한다." },
  label: { use: "폼 컨트롤에 사람이 읽는 이름을 연결한다.", evidence: "검색·필터 컨트롤의 접근 가능한 이름을 제공한다.", limits: "장식 텍스트에는 사용하지 않는다." },
  "list-row": { use: "모바일 폭에서 한 항목의 우선 정보와 보조 동작을 조립한다.", evidence: "데스크톱 Table과 같은 투자 이력을 모바일에서 긴 종목명·날짜·금액·손익으로 표현한다.", limits: "투자 도메인과 breakpoint 전환을 내장하지 않는다." },
  select: { use: "제한된 값 하나를 선택한다.", evidence: "계좌·시장 등 투자 이력 필터의 closed·open 구성 상태가 필요하다.", limits: "필터 모델과 화면 전용 라벨을 내장하지 않는다." },
  table: { use: "열 의미가 있고 비교가 중요한 데스크톱 데이터를 표현한다.", evidence: "한국어 종목명·날짜·금액·양/음수 손익과 선택 가능한 투자 이력 행을 비교한다.", limits: "정렬·필터·페이지네이션·가상화와 데이터 모델은 소비처 책임이다." },
}

function InvestmentTable() {
  return <Table><TableHeader><TableRow><TableHead>종목</TableHead><TableHead>거래일</TableHead><TableHead>금액</TableHead><TableHead>손익</TableHead></TableRow></TableHeader><TableBody><TableRow data-state="selected"><TableCell>삼성전자 우선주</TableCell><TableCell>2026. 08. 21.</TableCell><TableCell>₩12,450,000</TableCell><TableCell className="text-success-text">+₩820,000</TableCell></TableRow><TableRow><TableCell>미래에셋 TIGER 미국S&amp;P500</TableCell><TableCell>2026. 08. 18.</TableCell><TableCell>₩4,230,000</TableCell><TableCell className="text-destructive-text">−₩115,000</TableCell></TableRow></TableBody></Table>
}

function Preview({ name, selection = {} }: { name: string; selection?: Record<string, string> }) {
  const variant = selection.variant as never
  const size = selection.size as never
  const selected = selection.row === "selected"
  const previews: Record<string, ReactNode> = {
    badge: <Badge variant={variant}>수익</Badge>, button: <Button variant={variant} size={size}>거래 추가</Button>,
    card: <Card className="max-w-sm"><CardHeader><CardTitle>투자 요약</CardTitle><CardDescription>2026년 누적 투자 기록</CardDescription></CardHeader><CardContent>총 평가금액 ₩16,680,000</CardContent></Card>,
    checkbox: <div className="flex items-center gap-2"><Checkbox checked={selection.checked === "indeterminate" ? "indeterminate" : selection.checked === "checked"} id="row-check"/><Label htmlFor="row-check">삼성전자 우선주 선택</Label></div>,
    "dropdown-menu": <DropdownMenu defaultOpen={selection.open === "open"}><DropdownMenuTrigger asChild><Button variant="outline">행 작업</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>거래 관리</DropdownMenuLabel><DropdownMenuItem>수정</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem>삭제</DropdownMenuItem></DropdownMenuContent></DropdownMenu>,
    input: <div className="max-w-sm"><Label htmlFor="search">투자 이력 검색</Label><Input id="search" placeholder="종목명 또는 메모"/></div>,
    label: <Label htmlFor="label-sample">거래 메모</Label>,
    "list-row": <ListRow data-state={selected ? "selected" : undefined} className="max-w-lg"><ListRowContent><ListRowTitle>미래에셋 TIGER 미국S&amp;P500</ListRowTitle><ListRowDescription>2026. 08. 18. · 매수</ListRowDescription></ListRowContent><ListRowMeta>₩4,230,000</ListRowMeta><ListRowTrailing className="text-destructive-text">−₩115,000</ListRowTrailing></ListRow>,
    select: <Select defaultOpen={selection.open === "open"}><SelectTrigger aria-label="시장 필터" className="max-w-xs"><SelectValue placeholder="시장 선택"/></SelectTrigger><SelectContent><SelectItem value="kr">국내</SelectItem><SelectItem value="us">미국</SelectItem></SelectContent></Select>,
    table: <InvestmentTable/>,
  }
  return previews[name] ?? null
}

export function CatalogReference({ entry, selection = {} }: { entry: CatalogEntry; selection?: Record<string, string> }) {
  const guide = guidance[entry.component]!
  return <main className="mx-auto grid max-w-5xl gap-6 p-4">
    <header><p className="text-sm text-muted-foreground">GENERATED · do not edit · manifest {entry.hash}</p><h1 className="text-3xl font-semibold">{entry.displayName}</h1><p>{entry.cells} combination(s) · source <code>{entry.source}</code></p></header>
    <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-xl font-semibold">Executable reference</h2><Preview name={entry.component} selection={selection}/></section>
    <section className="rounded-lg border p-5"><h2 className="text-xl font-semibold">Generated contract</h2><p><strong>Anatomy:</strong> {entry.anatomy.join(" · ")}</p><p><strong>Axes:</strong> {Object.entries(entry.axes).map(([axis, values]) => `${axis}: ${values.join(" | ")}`).join("; ") || "none"}</p><p><strong>Configuration states:</strong> {Object.entries(entry.configurationStates).map(([axis, values]) => `${axis}: ${values.join(" | ")}`).join("; ") || "none"}</p><p><strong>Required samples:</strong> Light · Dark{entry.stateSamples ? " · hover · pressed · disabled" : ""}</p></section>
    <section className="rounded-lg border p-5"><p className="text-sm text-muted-foreground">AUTHORED · review judgment here</p><h2 className="text-xl font-semibold">Usage and provenance</h2><p><strong>Use:</strong> {guide.use}</p><p><strong>Invest Diary evidence:</strong> {guide.evidence}</p><p><strong>Boundary:</strong> {guide.limits}</p></section>
  </main>
}
