import type { ReactNode } from "react"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
  Badge, Button, buttonVariants, Calendar, Card, CardContent, CardDescription, CardHeader, CardTitle,
  Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, Input, Label, ListRow, ListRowContent,
  ListRowDescription, ListRowMeta, ListRowTitle, ListRowTrailing, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow, Field, FieldDescription, FieldError, FieldLabel, RadioGroup,
  RadioGroupItem, Switch, Textarea,
  Toggle, ToggleGroup, ToggleGroupItem,
  Collapsible, CollapsibleContent, CollapsibleTrigger,
  Command, CommandEmpty, CommandGroup, CommandGroupHeading, CommandInput, CommandItem, CommandList,
  Combobox, ComboboxContent, ComboboxIcon, ComboboxTrigger, ComboboxValue,
  Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
  Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle,
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger, Popover, PopoverContent, PopoverTrigger, Tooltip,
  TooltipContent, TooltipProvider, TooltipTrigger,
  Alert, AlertDescription, AlertTitle, Progress, Skeleton, Spinner,
  Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport,
  Separator, Tabs, TabsContent, TabsList, TabsTrigger, Avatar, AvatarFallback, AvatarImage,
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator, Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
  ScrollArea, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter,
  SheetHeader, SheetTitle, SheetTrigger,
  ButtonGroup, ButtonGroupSeparator, ButtonGroupText,
  InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput,
  NativeSelect, NativeSelectGroup, NativeSelectOption, Slider,
} from "@massive/ui"
import { catalog } from "./catalog.gen"
import itemFixture from "./fixtures/item.json"
import tableFixture from "./fixtures/table.json"

export type CatalogEntry = (typeof catalog)[number]

/* 참조 스토리는 벽시계를 읽지 않는다 — 달과 "오늘"을 고정해야 axe 실행과 스냅샷이 흔들리지 않는다. */
const REFERENCE_MONTH = new Date(2026, 7, 1)
const REFERENCE_TODAY = new Date(2026, 7, 18)
const REFERENCE_LAST_SELECTABLE = new Date(2026, 7, 26)

function InvestmentTable() {
  return <Table>
    <TableHeader><TableRow>{tableFixture.columns.map((column) => <TableHead key={column}>{column}</TableHead>)}</TableRow></TableHeader>
    <TableBody>{tableFixture.rows.map((row) => <TableRow key={row.cells[0]} data-state={row.state === "selected" ? "selected" : undefined}>
      {row.cells.map((value, index) => <TableCell
        key={`${row.cells[0]}-${index}`}
        className={index === row.cells.length - 1
          ? row.result === "positive" ? "text-success-text" : "text-destructive-text"
          : undefined}
      >{value}</TableCell>)}
    </TableRow>)}</TableBody>
  </Table>
}

function Preview({ name, selection = {} }: { name: CatalogEntry["reference"]["example"]; selection?: Record<string, string> }) {
  const variant = selection.variant as never
  const size = selection.size as never
  const selected = selection.row === "selected"
  const previews: Record<CatalogEntry["reference"]["example"], ReactNode> = {
    accordion: selection.expansion === "multiple"
      ? <Accordion type="multiple" defaultValue={selection.open === "open" ? ["fees", "tax"] : []} className="max-w-lg"><AccordionItem value="fees"><AccordionTrigger>수수료는 어떻게 계산하나요?</AccordionTrigger><AccordionContent>거래별 수수료를 입력하면 손익에 반영합니다.</AccordionContent></AccordionItem><AccordionItem value="tax"><AccordionTrigger>세금은 포함되나요?</AccordionTrigger><AccordionContent>현재 기록에 입력한 세금만 계산합니다.</AccordionContent></AccordionItem></Accordion>
      : <Accordion type="single" collapsible defaultValue={selection.open === "open" ? "fees" : undefined} className="max-w-lg"><AccordionItem value="fees"><AccordionTrigger>수수료는 어떻게 계산하나요?</AccordionTrigger><AccordionContent>거래별 수수료를 입력하면 손익에 반영합니다.</AccordionContent></AccordionItem><AccordionItem value="tax"><AccordionTrigger>세금은 포함되나요?</AccordionTrigger><AccordionContent>현재 기록에 입력한 세금만 계산합니다.</AccordionContent></AccordionItem></Accordion>,
    alert: <Alert variant={variant}><AlertTitle>가격 정보가 지연되고 있습니다</AlertTitle><AlertDescription>마지막으로 확인한 가격을 기준으로 평가금액을 표시합니다.</AlertDescription></Alert>,
    avatar: <div className="flex items-center gap-3"><Avatar size={size}><AvatarImage src={selection.source === "image" ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%2364748b'/%3E%3Ccircle cx='48' cy='36' r='18' fill='%23f8fafc'/%3E%3Cpath d='M18 94c3-22 15-34 30-34s27 12 30 34' fill='%23f8fafc'/%3E%3C/svg%3E" : undefined} alt=""/><AvatarFallback>SK</AvatarFallback></Avatar><span>김서경</span></div>,
    "alert-dialog": <AlertDialog defaultOpen={selection.open === "open"}><AlertDialogTrigger asChild><Button variant="destructive">거래 삭제</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>이 거래를 삭제할까요?</AlertDialogTitle><AlertDialogDescription>삭제하면 이 거래가 투자 기록과 손익 계산에서 제거됩니다. 이 작업은 되돌릴 수 없습니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>취소</AlertDialogCancel><AlertDialogAction className={buttonVariants({ variant: "destructive" })}>삭제</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>,
    badge: <Badge variant={variant}>수익</Badge>, button: <Button variant={variant} size={size}>거래 추가</Button>,
    "button-group": <ButtonGroup orientation={selection.orientation as "horizontal" | "vertical"} aria-label="거래 내보내기"><Button variant="outline">CSV</Button><Button variant="outline" disabled={selection.disabled === "disabled"}>PDF</Button><ButtonGroupSeparator orientation={selection.orientation === "vertical" ? "horizontal" : "vertical"}/><ButtonGroupText>3건</ButtonGroupText></ButtonGroup>,
    breadcrumb: <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="#portfolio">포트폴리오</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem><BreadcrumbEllipsis/></BreadcrumbItem><BreadcrumbSeparator/><BreadcrumbItem>{selection.currentLocation === "current" ? <BreadcrumbPage>삼성전자</BreadcrumbPage> : <BreadcrumbLink href="#holding">보유 종목</BreadcrumbLink>}</BreadcrumbItem></BreadcrumbList></Breadcrumb>,
    calendar: selection.selection === "range"
      ? <Calendar mode="range" locale="ko-KR" defaultMonth={REFERENCE_MONTH} today={REFERENCE_TODAY} defaultSelected={{ from: new Date(2026, 7, 10), to: new Date(2026, 7, 14) }} disabled={(date) => date > REFERENCE_LAST_SELECTABLE} labels={{ previousMonth: "이전 달", nextMonth: "다음 달" }}/>
      : <Calendar locale="ko-KR" defaultMonth={REFERENCE_MONTH} today={REFERENCE_TODAY} defaultSelected={new Date(2026, 7, 12)} disabled={(date) => date > REFERENCE_LAST_SELECTABLE} labels={{ previousMonth: "이전 달", nextMonth: "다음 달" }}/>,
    card: <Card className="max-w-sm"><CardHeader><CardTitle>투자 요약</CardTitle><CardDescription>2026년 누적 투자 기록</CardDescription></CardHeader><CardContent>총 평가금액 ₩16,680,000</CardContent></Card>,
    checkbox: <div className="flex items-center gap-2"><Checkbox checked={selection.checked === "indeterminate" ? "indeterminate" : selection.checked === "checked"} id="row-check"/><Label htmlFor="row-check">삼성전자 우선주 선택</Label></div>,
    collapsible: <Collapsible defaultOpen={selection.open === "open"} className="max-w-lg rounded-lg border p-4"><div className="flex items-center justify-between gap-4"><p className="font-medium">고급 필터 3개</p><CollapsibleTrigger asChild><Button variant="ghost" size="sm">조건 보기</Button></CollapsibleTrigger></div><CollapsibleContent className="pt-3 text-muted-foreground">시장 · 거래 유형 · 손익 범위를 추가로 제한합니다.</CollapsibleContent></Collapsible>,
    combobox: <div className="max-w-sm"><Combobox defaultOpen={selection.open === "open"} defaultValue={selection.selected === "selected" ? "TIGER 미국S&P500" : undefined}><ComboboxTrigger aria-label="종목 선택"><ComboboxValue placeholder="종목 선택"/><ComboboxIcon/></ComboboxTrigger><ComboboxContent><CommandInput aria-label="종목 검색" placeholder="종목 이름 또는 코드"/><CommandList aria-label="종목 검색 결과"><CommandItem value="삼성전자" keywords={["samsung", "005930"]}>삼성전자</CommandItem><CommandItem value="TIGER 미국S&P500" keywords={["tiger", "sp500"]}>TIGER 미국S&amp;P500</CommandItem><CommandItem value="현대차" keywords={["hyundai", "005380"]}>현대차</CommandItem></CommandList><CommandEmpty>일치하는 종목이 없습니다.</CommandEmpty></ComboboxContent></Combobox></div>,
    command: <Command defaultSearch={selection.results === "empty" ? "없는 종목" : ""} defaultValue={selection.selected === "selected" ? "TIGER 미국S&P500" : undefined} autoHighlight={selection.highlighted !== "idle"} className="max-w-sm"><CommandInput aria-label="투자 기록 검색" placeholder="종목 또는 명령 검색"/><CommandList aria-label="검색 결과"><CommandGroup><CommandGroupHeading>보유 종목</CommandGroupHeading><CommandItem value="삼성전자" keywords={["samsung", "005930"]}>삼성전자</CommandItem><CommandItem value="TIGER 미국S&P500" keywords={["tiger", "sp500"]}>TIGER 미국S&amp;P500</CommandItem></CommandGroup><CommandGroup><CommandGroupHeading>거래</CommandGroupHeading><CommandItem value="거래 추가" keywords={["add"]}>거래 추가</CommandItem><CommandItem value="거래 내보내기" keywords={["export"]} disabled>거래 내보내기</CommandItem></CommandGroup></CommandList><CommandEmpty>일치하는 기록이 없습니다.</CommandEmpty></Command>,
    "dropdown-menu": <DropdownMenu defaultOpen={selection.open === "open"}><DropdownMenuTrigger asChild><Button variant="outline">행 작업</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>거래 관리</DropdownMenuLabel><DropdownMenuItem>수정</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem>삭제</DropdownMenuItem></DropdownMenuContent></DropdownMenu>,
    dialog: <Dialog defaultOpen={selection.open === "open"}><DialogTrigger asChild><Button>거래 추가</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>거래 추가</DialogTitle><DialogDescription>새 투자 거래의 기본 정보를 입력합니다.</DialogDescription></DialogHeader><p>종목, 거래일, 금액을 입력하는 양식이 여기에 놓입니다.</p><DialogFooter><DialogClose asChild><Button variant="outline">취소</Button></DialogClose><Button>저장</Button></DialogFooter></DialogContent></Dialog>,
    field: <Field orientation={selection.orientation as "vertical" | "horizontal" | "responsive"} data-invalid={selection.validity === "invalid" || undefined} className="max-w-sm"><FieldLabel htmlFor="field-symbol">종목명</FieldLabel><Input id="field-symbol" aria-invalid={selection.validity === "invalid" || undefined} placeholder="예: 삼성전자"/><FieldDescription>거래한 종목의 정식 이름을 입력하세요.</FieldDescription>{selection.validity === "invalid" && <FieldError>종목명을 입력하세요.</FieldError>}</Field>,
    empty: <Empty variant={variant} className="max-w-lg"><EmptyHeader><EmptyMedia aria-hidden="true">⌕</EmptyMedia><EmptyTitle>검색 결과가 없습니다</EmptyTitle><EmptyDescription>검색어를 바꾸거나 필터를 초기화해 보세요.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline">필터 초기화</Button></EmptyContent></Empty>,
    input: <div className="max-w-sm"><Label htmlFor="search">투자 이력 검색</Label><Input id="search" placeholder="종목명 또는 메모"/></div>,
    "input-group": <Field className="max-w-sm" data-invalid={selection.validity === "invalid" || undefined}><FieldLabel htmlFor="input-group-search">투자 이력 검색</FieldLabel><InputGroup><InputGroupAddon aria-hidden="true">⌕</InputGroupAddon><InputGroupInput id="input-group-search" placeholder="종목명 또는 메모" disabled={selection.disabled === "disabled"} aria-invalid={selection.validity === "invalid" || undefined}/><InputGroupButton aria-label="검색어 지우기">×</InputGroupButton></InputGroup>{selection.validity === "invalid" && <FieldError>검색어를 입력하세요.</FieldError>}</Field>,
    item: <Item variant={variant} size={size} data-state={selection.item === "selected" ? "selected" : undefined} className="max-w-lg"><ItemMedia aria-hidden="true">{itemFixture.media}</ItemMedia><ItemContent><ItemTitle>{itemFixture.title}</ItemTitle><ItemDescription>{itemFixture.description}</ItemDescription></ItemContent><ItemActions><Button size="sm" variant="outline">{itemFixture.action}</Button></ItemActions></Item>,
    label: <Label htmlFor="label-sample">거래 메모</Label>,
    "list-row": <ListRow data-state={selected ? "selected" : undefined} className="max-w-lg"><ListRowContent><ListRowTitle>미래에셋 TIGER 미국S&amp;P500</ListRowTitle><ListRowDescription>2026. 08. 18. · 매수</ListRowDescription></ListRowContent><ListRowMeta>₩4,230,000</ListRowMeta><ListRowTrailing className="text-destructive-text">−₩115,000</ListRowTrailing></ListRow>,
    "native-select": <Field className="max-w-sm" data-invalid={selection.validity === "invalid" || undefined}><FieldLabel htmlFor="native-select-market">시장</FieldLabel><NativeSelect id="native-select-market" size={size} defaultValue="kr" disabled={selection.disabled === "disabled"} aria-invalid={selection.validity === "invalid" || undefined}><NativeSelectOption value="kr">국내</NativeSelectOption><NativeSelectGroup label="해외"><NativeSelectOption value="us">미국</NativeSelectOption><NativeSelectOption value="jp">일본</NativeSelectOption></NativeSelectGroup></NativeSelect>{selection.validity === "invalid" && <FieldError>시장을 선택하세요.</FieldError>}</Field>,
    popover: <Popover defaultOpen={selection.open === "open"}><PopoverTrigger asChild><Button variant="outline">필터 도움말</Button></PopoverTrigger><PopoverContent><p className="font-medium">시장 필터</p><p className="text-sm text-muted-foreground">선택한 시장의 거래만 투자 이력에 표시합니다.</p></PopoverContent></Popover>,
    pagination: <Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#page-1"/></PaginationItem><PaginationItem><PaginationLink href="#page-1">1</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#page-2" isActive={selection.currentPage === "current"}>2</PaginationLink></PaginationItem><PaginationItem><PaginationEllipsis/></PaginationItem><PaginationItem><PaginationLink href="#page-12">12</PaginationLink></PaginationItem><PaginationItem><PaginationNext href="#page-3"/></PaginationItem></PaginationContent></Pagination>,
    progress: <div className="max-w-sm"><p className="mb-2 text-sm">투자 내역 가져오는 중</p><Progress value={selection.value === "empty" ? 0 : selection.value === "complete" ? 100 : 64} aria-label="투자 내역 가져오기 진행률" /></div>,
    "scroll-area": <ScrollArea orientation={selection.orientation as "vertical" | "horizontal"} type="always" aria-label="최근 거래 목록" className={selection.orientation === "horizontal" ? "w-72 rounded-lg border" : "h-48 w-72 rounded-lg border"}>
      <div className={selection.orientation === "horizontal" ? "flex w-max gap-3 p-3" : "grid gap-3 p-3"}>
        {["삼성전자", "미래에셋 TIGER 미국S&P500", "네이버", "카카오", "현대차", "SK하이닉스"].slice(0, selection.overflow === "fits" ? 2 : 6).map((name) => <p key={name} className="whitespace-nowrap text-sm">{name}</p>)}
      </div>
    </ScrollArea>,
    select: <Select defaultOpen={selection.open === "open"}><SelectTrigger aria-label="시장 필터" className="max-w-xs"><SelectValue placeholder="시장 선택"/></SelectTrigger><SelectContent><SelectItem value="kr">국내</SelectItem><SelectItem value="us">미국</SelectItem></SelectContent></Select>,
    separator: <div className={selection.orientation === "vertical" ? "flex h-12 items-center gap-4" : "grid max-w-sm gap-3"}><span>보유 현황</span><Separator orientation={selection.orientation as "horizontal" | "vertical"}/><span>거래 내역</span></div>,
    sheet: <Sheet defaultOpen={selection.open === "open"}><SheetTrigger asChild><Button variant="outline">필터 열기</Button></SheetTrigger><SheetContent side={selection.side as "top" | "right" | "bottom" | "left"}><SheetHeader><SheetTitle>투자 이력 필터</SheetTitle><SheetDescription>목록을 보면서 시장·기간·손익 조건을 조정합니다.</SheetDescription></SheetHeader><p>시장, 거래 유형, 기간을 고르는 양식이 여기에 놓입니다.</p><SheetFooter><SheetClose asChild><Button variant="outline">취소</Button></SheetClose><Button>적용</Button></SheetFooter></SheetContent></Sheet>,
    skeleton: <div className="flex max-w-sm items-center gap-3" role="status" aria-label="투자 요약 불러오는 중"><Skeleton className="size-10 rounded-full"/><div className="flex-1"><Skeleton className="mb-2 h-4 w-2/3"/><Skeleton className="h-4 w-full"/></div></div>,
    slider: <div className={selection.orientation === "vertical" ? "flex justify-center" : "max-w-sm"}>{selection.value === "range"
      ? <Slider size={size} orientation={selection.orientation as "horizontal" | "vertical"} defaultValue={[20, 70]} thumbLabels={["손익 최솟값", "손익 최댓값"]}/>
      : <Slider size={size} orientation={selection.orientation as "horizontal" | "vertical"} defaultValue={[40]} aria-label="목표 비중"/>}</div>,
    spinner: <Spinner size={size} />,
    "radio-group": <RadioGroup orientation={selection.orientation as "vertical" | "horizontal"} defaultValue={selection.checked === "checked" ? "buy" : "sell"} aria-label="거래 유형"><div className="flex items-center gap-2"><RadioGroupItem value="buy" id="trade-buy"/><Label htmlFor="trade-buy">매수</Label></div><div className="flex items-center gap-2"><RadioGroupItem value="sell" id="trade-sell"/><Label htmlFor="trade-sell">매도</Label></div></RadioGroup>,
    switch: <div className="flex items-center gap-2"><Switch id="reinvest" size={size} defaultChecked={selection.checked === "checked"}/><Label htmlFor="reinvest">배당 자동 재투자</Label></div>,
    toggle: <Toggle variant={variant} size={size} defaultPressed={selection.pressed === "pressed"}>수익률 표시</Toggle>,
    "toggle-group": selection.selection === "multiple"
      ? <ToggleGroup type="multiple" variant={variant} size={size} orientation={selection.orientation as "horizontal" | "vertical"} defaultValue={selection.pressed === "pressed" ? ["return", "average"] : []} aria-label="차트 지표"><ToggleGroupItem value="return">수익률</ToggleGroupItem><ToggleGroupItem value="average">평균단가</ToggleGroupItem><ToggleGroupItem value="volume">거래량</ToggleGroupItem></ToggleGroup>
      : <ToggleGroup type="single" variant={variant} size={size} orientation={selection.orientation as "horizontal" | "vertical"} defaultValue={selection.pressed === "pressed" ? "month" : "week"} aria-label="차트 기간"><ToggleGroupItem value="week">1주</ToggleGroupItem><ToggleGroupItem value="month">1개월</ToggleGroupItem><ToggleGroupItem value="year">1년</ToggleGroupItem></ToggleGroup>,
    tabs: <Tabs orientation={selection.orientation as "horizontal" | "vertical"} defaultValue={selection.selected === "active" ? "history" : "holdings"} className="max-w-lg"><TabsList aria-label="투자 상세 보기"><TabsTrigger value="holdings">보유 현황</TabsTrigger><TabsTrigger value="history">거래 내역</TabsTrigger></TabsList><TabsContent value="holdings">현재 보유 종목과 평가금액입니다.</TabsContent><TabsContent value="history">최근 거래 기록입니다.</TabsContent></Tabs>,
    table: <InvestmentTable/>,
    textarea: <Field className="max-w-sm"><FieldLabel htmlFor="trade-note">거래 메모</FieldLabel><Textarea id="trade-note" size={size} placeholder="판단 근거를 남겨보세요"/><FieldDescription>다음 회고에서 확인할 수 있습니다.</FieldDescription></Field>,
    tooltip: <TooltipProvider><Tooltip defaultOpen={selection.open === "open"}><TooltipTrigger asChild><Button size="icon" variant="outline" aria-label="수익률 계산 방식">?</Button></TooltipTrigger><TooltipContent>매입 금액을 기준으로 계산합니다.</TooltipContent></Tooltip></TooltipProvider>,
    toast: <ToastProvider><Toast open={selection.open === "open"} variant={variant}><div><ToastTitle>거래를 저장했습니다</ToastTitle><ToastDescription>삼성전자 우선주 매수 기록이 추가되었습니다.</ToastDescription></div><ToastAction altText="저장한 거래 보기">보기</ToastAction><ToastClose/></Toast><ToastViewport/></ToastProvider>,
  }
  return previews[name]
}

export function CatalogReference({ entry, selection = {} }: { entry: CatalogEntry; selection?: Record<string, string> }) {
  const guide = entry.reference.guidance
  return <main className="mx-auto grid max-w-5xl gap-6 p-4">
    <header><p className="text-sm text-muted-foreground">GENERATED · do not edit · manifest {entry.hash}</p><h1 className="text-3xl font-semibold">{entry.displayName}</h1><p>{entry.cells} combination(s) · source <code>{entry.source}</code></p></header>
    <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-xl font-semibold">Executable reference</h2><Preview name={entry.reference.example} selection={selection}/></section>
    <section className="rounded-lg border p-5"><h2 className="text-xl font-semibold">Generated contract</h2><p><strong>Anatomy:</strong> {entry.anatomy.join(" · ")}</p><p><strong>Axes:</strong> {Object.entries(entry.axes).map(([axis, values]) => `${axis}: ${values.join(" | ")}`).join("; ") || "none"}</p><p><strong>Configuration states:</strong> {Object.entries(entry.configurationStates).map(([axis, values]) => `${axis}: ${values.join(" | ")}`).join("; ") || "none"}</p><p><strong>Required samples:</strong> Light · Dark{entry.stateSamples ? " · hover · pressed · disabled" : ""}</p></section>
    <section className="rounded-lg border p-5"><p className="text-sm text-muted-foreground">AUTHORED · review judgment here</p><h2 className="text-xl font-semibold">Usage and provenance</h2><p><strong>Use:</strong> {guide.use}</p><p><strong>Invest Diary evidence:</strong> {guide.evidence}</p><p><strong>Boundary:</strong> {guide.limits}</p></section>
  </main>
}
