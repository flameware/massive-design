import type { ReactNode } from "react"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
  Badge, Button, buttonVariants, Calendar, Card, CardContent, CardDescription, CardHeader, CardTitle,
  Checkbox, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
  Input, Label, ListRow, ListRowContent,
  ListRowDescription, ListRowMeta, ListRowTitle, ListRowTrailing, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead,
  TableFooter, TableHeader, TableRow, Field, FieldDescription, FieldError, FieldGroup, FieldLabel,
  FieldLegend, FieldSeparator, FieldSet, RadioGroup,
  RadioGroupItem, Switch, Textarea,
  Toggle, ToggleGroup, ToggleGroupItem,
  Collapsible, CollapsibleContent, CollapsibleTrigger,
  Command, CommandEmpty, CommandGroup, CommandGroupHeading, CommandInput, CommandItem, CommandList, CommandSeparator,
  Combobox, ComboboxContent, ComboboxIcon, ComboboxTrigger, ComboboxValue,
  Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
  Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle,
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger, Popover, PopoverContent, PopoverDescription, PopoverHeader,
  PopoverTitle, PopoverTrigger, Tooltip,
  TooltipContent, TooltipProvider, TooltipTrigger,
  Alert, AlertAction, AlertDescription, AlertTitle, Progress, ProgressLabel, ProgressValue, Skeleton, Spinner,
  Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport,
  Separator, Tabs, TabsContent, TabsList, TabsTrigger, Avatar, AvatarFallback, AvatarImage,
  AvatarBadge, AvatarGroup, AvatarGroupCount,
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator, Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
  ScrollArea, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter,
  SheetHeader, SheetTitle, SheetTrigger,
  ButtonGroup, ButtonGroupSeparator, ButtonGroupText,
  InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea,
  NativeSelect, NativeSelectGroup, NativeSelectOption, Slider,
  Kbd, KbdGroup,
  InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot,
  ResizableHandle, ResizablePanel, ResizablePanelGroup,
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge,
  SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger,
  Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarMenu,
  MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarSub, MenubarSubContent,
  MenubarSubTrigger, MenubarTrigger,
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerVariants,
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
  ChartContainer, ChartLegendContent, ChartTooltipContent,
} from "@massive/ui"
/* 차트 본체는 계약 밖이라 소비처가 recharts를 직접 가져온다(#125). Storybook은
 * 이 카탈로그에서 그 소비처 자리에 선다 — @massive/ui는 Tooltip·Legend를
 * 재수출하지 않는다. */
import { Bar, BarChart, CartesianGrid, Legend, Tooltip as RechartsTooltip, XAxis } from "recharts"
import { catalog } from "./catalog.gen"
import itemFixture from "./fixtures/item.json"
import tableFixture from "./fixtures/table.json"

export type CatalogEntry = (typeof catalog)[number]

/* 참조 스토리는 벽시계를 읽지 않는다 — 달과 "오늘"을 고정해야 axe 실행과 스냅샷이 흔들리지 않는다. */
/* `ItemMedia`의 `image` 값이 그리는 자르기 틀을 axe가 실제로 만나야 하므로 그림을
 * 하나 둔다. 벽시계와 같은 이유로 네트워크도 읽지 않는다 — data URI다(#145). */
const LOGO_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23334155'/%3E%3Cpath d='M12 44l14-20 10 14 6-8 10 14z' fill='%23e2e8f0'/%3E%3C/svg%3E"

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
    {/* 합계 행은 `<tfoot>`이다(#170). 첫 칸은 값이 아니라 이름이라 `TableHead scope="row"`로
      * 서고, 나머지 두 칸이 앞의 두 열을 건너뛰도록 `colSpan`을 소비처가 준다 —
      * 계약은 면·경계만 지고 열 얼개는 소비처의 데이터 모델이다. */}
    <TableFooter><TableRow>
      <TableHead scope="row" colSpan={2}>{tableFixture.footer.label}</TableHead>
      <TableCell>{tableFixture.footer.cells[0]}</TableCell>
      <TableCell className={tableFixture.footer.result === "positive" ? "text-success-text" : "text-destructive-text"}>{tableFixture.footer.cells[1]}</TableCell>
    </TableRow></TableFooter>
  </Table>
}

/* 계열 색은 소비처가 주입하는 입력이다(#125). `--chart-1`~`5`는 무채색
 * 플레이스홀더이고, 모드 전환은 그 변수가 사는 토큰 계층에서 이미 끝나 있다 —
 * 컨테이너는 값을 그대로 `--color-<key>`로 내려보낼 뿐 모드를 알지 않는다. */
const CHART_CONFIG = {
  buy: { label: "매수", color: "var(--chart-1)" },
  sell: { label: "매도", color: "var(--chart-3)" },
}
const CHART_DATA = [
  { month: "5월", buy: 1_820_000, sell: 640_000 },
  { month: "6월", buy: 2_140_000, sell: 980_000 },
  { month: "7월", buy: 1_260_000, sell: 1_510_000 },
  { month: "8월", buy: 2_680_000, sell: 720_000 },
]
const CHART_SAMPLE_PAYLOAD = [
  { dataKey: "buy", name: "매수", value: "₩2,680,000", color: "var(--chart-1)" },
  { dataKey: "sell", name: "매도", value: "₩720,000", color: "var(--chart-3)" },
]

function Preview({ name, selection = {} }: { name: CatalogEntry["reference"]["example"]; selection?: Record<string, string> }) {
  const variant = selection.variant as never
  const size = selection.size as never
  const selected = selection.row === "selected"
  const previews: Record<CatalogEntry["reference"]["example"], ReactNode> = {
    accordion: selection.expansion === "multiple"
      ? <Accordion type="multiple" defaultValue={selection.open === "open" ? ["fees", "tax"] : []} className="max-w-lg"><AccordionItem value="fees"><AccordionTrigger>수수료는 어떻게 계산하나요?</AccordionTrigger><AccordionContent>거래별 수수료를 입력하면 손익에 반영합니다.</AccordionContent></AccordionItem><AccordionItem value="tax"><AccordionTrigger>세금은 포함되나요?</AccordionTrigger><AccordionContent>현재 기록에 입력한 세금만 계산합니다.</AccordionContent></AccordionItem></Accordion>
      : <Accordion type="single" collapsible defaultValue={selection.open === "open" ? "fees" : undefined} className="max-w-lg"><AccordionItem value="fees"><AccordionTrigger>수수료는 어떻게 계산하나요?</AccordionTrigger><AccordionContent>거래별 수수료를 입력하면 손익에 반영합니다.</AccordionContent></AccordionItem><AccordionItem value="tax"><AccordionTrigger>세금은 포함되나요?</AccordionTrigger><AccordionContent>현재 기록에 입력한 세금만 계산합니다.</AccordionContent></AccordionItem></Accordion>,
    alert: <Alert variant={variant} className="max-w-lg"><AlertTitle className="pr-24">가격 정보가 지연되고 있습니다</AlertTitle><AlertDescription className="pr-24">마지막으로 확인한 가격을 기준으로 평가금액을 표시합니다.</AlertDescription><AlertAction><Button variant="outline" size="sm">다시 시도</Button></AlertAction></Alert>,
    avatar: <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <Avatar size={size}>
          <AvatarImage src={selection.source === "image" ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%2364748b'/%3E%3Ccircle cx='48' cy='36' r='18' fill='%23f8fafc'/%3E%3Cpath d='M18 94c3-22 15-34 30-34s27 12 30 34' fill='%23f8fafc'/%3E%3C/svg%3E" : undefined} alt=""/>
          <AvatarFallback>SK</AvatarFallback>
          <AvatarBadge size={size} aria-label="온라인"/>
        </Avatar>
        <span>김서경</span>
      </div>
      <AvatarGroup size={size} aria-label="이 기록의 참여자">
        <Avatar>
          <AvatarImage src={selection.source === "image" ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%2364748b'/%3E%3Ccircle cx='48' cy='36' r='18' fill='%23f8fafc'/%3E%3Cpath d='M18 94c3-22 15-34 30-34s27 12 30 34' fill='%23f8fafc'/%3E%3C/svg%3E" : undefined} alt=""/>
          <AvatarFallback>SK</AvatarFallback>
        </Avatar>
        <Avatar><AvatarFallback>이</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>박</AvatarFallback></Avatar>
        <AvatarGroupCount aria-label="외 3명">+3</AvatarGroupCount>
      </AvatarGroup>
    </div>,
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
    command: <Command defaultSearch={selection.results === "empty" ? "없는 종목" : ""} defaultValue={selection.selected === "selected" ? "TIGER 미국S&P500" : undefined} autoHighlight={selection.highlighted !== "idle"} className="max-w-sm"><CommandInput aria-label="투자 기록 검색" placeholder="종목 또는 명령 검색"/><CommandList aria-label="검색 결과"><CommandGroup><CommandGroupHeading>보유 종목</CommandGroupHeading><CommandItem value="삼성전자" keywords={["samsung", "005930"]}>삼성전자</CommandItem><CommandItem value="TIGER 미국S&P500" keywords={["tiger", "sp500"]}>TIGER 미국S&amp;P500</CommandItem></CommandGroup><CommandSeparator /><CommandGroup><CommandGroupHeading>거래</CommandGroupHeading><CommandItem value="거래 추가" keywords={["add"]}>거래 추가</CommandItem><CommandItem value="거래 내보내기" keywords={["export"]} disabled>거래 내보내기</CommandItem></CommandGroup></CommandList><CommandEmpty>일치하는 기록이 없습니다.</CommandEmpty></Command>,
    "dropdown-menu": <DropdownMenu defaultOpen={selection.open === "open"}><DropdownMenuTrigger asChild><Button variant="outline">행 작업</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>거래 관리</DropdownMenuLabel><DropdownMenuItem>수정</DropdownMenuItem><DropdownMenuCheckboxItem checked={selection.checked === "checked"}>즐겨찾기</DropdownMenuCheckboxItem><DropdownMenuSeparator/><DropdownMenuLabel>표시 통화</DropdownMenuLabel><DropdownMenuRadioGroup value={selection.checked === "checked" ? "krw" : ""}><DropdownMenuRadioItem value="krw">원화</DropdownMenuRadioItem><DropdownMenuRadioItem value="usd">달러</DropdownMenuRadioItem></DropdownMenuRadioGroup><DropdownMenuSeparator/><DropdownMenuSub><DropdownMenuSubTrigger>내보내기</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuItem>CSV</DropdownMenuItem><DropdownMenuItem disabled>PDF</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub><DropdownMenuItem>삭제</DropdownMenuItem></DropdownMenuContent></DropdownMenu>,
    dialog: <Dialog defaultOpen={selection.open === "open"}><DialogTrigger asChild><Button>거래 추가</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>거래 추가</DialogTitle><DialogDescription>새 투자 거래의 기본 정보를 입력합니다.</DialogDescription></DialogHeader><p>종목, 거래일, 금액을 입력하는 양식이 여기에 놓입니다.</p><DialogFooter><DialogClose asChild><Button variant="outline">취소</Button></DialogClose><Button>저장</Button></DialogFooter></DialogContent></Dialog>,
    field: <FieldGroup className="max-w-sm">
      <FieldSet><FieldLegend>거래 정보</FieldLegend><Field orientation={selection.orientation as "vertical" | "horizontal" | "responsive"} data-invalid={selection.validity === "invalid" || undefined}><FieldLabel htmlFor="field-symbol">종목명</FieldLabel><Input id="field-symbol" aria-invalid={selection.validity === "invalid" || undefined} placeholder="예: 삼성전자"/><FieldDescription>거래한 종목의 정식 이름을 입력하세요.</FieldDescription>{selection.validity === "invalid" && <FieldError>종목명을 입력하세요.</FieldError>}</Field></FieldSet>
      <FieldSeparator>또는</FieldSeparator>
      <FieldSet><FieldLegend rank="label">보유 수량</FieldLegend><Field orientation={selection.orientation as "vertical" | "horizontal" | "responsive"} data-invalid={selection.validity === "invalid" || undefined}><FieldLabel htmlFor="field-quantity">수량</FieldLabel><Input id="field-quantity" aria-invalid={selection.validity === "invalid" || undefined} placeholder="예: 10"/><FieldDescription>소수점 아래 넷째 자리까지 입력할 수 있습니다.</FieldDescription>{selection.validity === "invalid" && <FieldError>수량을 입력하세요.</FieldError>}</Field></FieldSet>
    </FieldGroup>,
    empty: <div className="flex flex-col gap-4">
      <Empty variant={variant} className="max-w-lg"><EmptyHeader><EmptyMedia aria-hidden="true">⌕</EmptyMedia><EmptyTitle>검색 결과가 없습니다</EmptyTitle><EmptyDescription>검색어를 바꾸거나 필터를 초기화해 보세요.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline">필터 초기화</Button></EmptyContent></Empty>
      <Empty variant={variant} className="max-w-lg"><EmptyHeader><EmptyMedia frame="none" aria-hidden="true">⌕</EmptyMedia><EmptyTitle>검색 결과가 없습니다</EmptyTitle><EmptyDescription>검색어를 바꾸거나 필터를 초기화해 보세요.</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline">필터 초기화</Button></EmptyContent></Empty>
    </div>,
    input: <div className="max-w-sm"><Label htmlFor="search">투자 이력 검색</Label><Input id="search" placeholder="종목명 또는 메모"/></div>,
    /* 컨트롤은 한 줄 또는 여러 줄 **하나**다(#170). 두 껍데기를 나란히 그려야 axe와
     * 사람이 `min-h-9`가 두 경우를 한 선언으로 담는 것을 실제로 만난다 —
     * `InputGroupText`는 부가물의 자식으로만 서므로 그 자리에서 함께 렌더한다. */
    "input-group": <div className="flex max-w-sm flex-col gap-4">
      <Field data-invalid={selection.validity === "invalid" || undefined}><FieldLabel htmlFor="input-group-search">투자 이력 검색</FieldLabel><InputGroup><InputGroupAddon placement="start" aria-hidden="true">⌕</InputGroupAddon><InputGroupInput id="input-group-search" placeholder="종목명 또는 메모" disabled={selection.disabled === "disabled"} aria-invalid={selection.validity === "invalid" || undefined}/><InputGroupAddon placement="end" aria-hidden="true"><InputGroupText>KRW</InputGroupText></InputGroupAddon><InputGroupButton aria-label="검색어 지우기">×</InputGroupButton></InputGroup>{selection.validity === "invalid" && <FieldError>검색어를 입력하세요.</FieldError>}</Field>
      <Field data-invalid={selection.validity === "invalid" || undefined}><FieldLabel htmlFor="input-group-memo">거래 메모</FieldLabel><InputGroup><InputGroupTextarea id="input-group-memo" placeholder="매수 근거와 회고" disabled={selection.disabled === "disabled"} aria-invalid={selection.validity === "invalid" || undefined}/><InputGroupAddon placement="end" aria-hidden="true"><InputGroupText>0/200</InputGroupText></InputGroupAddon></InputGroup></Field>
    </div>,
    item: <div className="flex flex-col gap-2">
      <Item variant={variant} size={size} data-state={selection.item === "selected" ? "selected" : undefined} className="max-w-lg"><ItemMedia aria-hidden="true">{itemFixture.media}</ItemMedia><ItemContent><ItemTitle>{itemFixture.title}</ItemTitle><ItemDescription>{itemFixture.description}</ItemDescription></ItemContent><ItemActions><Button size="sm" variant="outline">{itemFixture.action}</Button></ItemActions></Item>
      <Item variant={variant} size={size} data-state={selection.item === "selected" ? "selected" : undefined} className="max-w-lg"><ItemMedia frame="icon" aria-hidden="true">{itemFixture.media}</ItemMedia><ItemContent><ItemTitle>{itemFixture.title}</ItemTitle><ItemDescription>{itemFixture.description}</ItemDescription></ItemContent><ItemActions><Button size="sm" variant="outline">{itemFixture.action}</Button></ItemActions></Item>
      <Item variant={variant} size={size} data-state={selection.item === "selected" ? "selected" : undefined} className="max-w-lg"><ItemMedia frame="image"><img src={LOGO_IMAGE} alt=""/></ItemMedia><ItemContent><ItemTitle>{itemFixture.title}</ItemTitle><ItemDescription>{itemFixture.description}</ItemDescription></ItemContent><ItemActions><Button size="sm" variant="outline">{itemFixture.action}</Button></ItemActions></Item>
      <Item variant={variant} size={size} data-state={selection.item === "selected" ? "selected" : undefined} className="max-w-lg"><ItemMedia><Avatar><AvatarFallback>SK</AvatarFallback></Avatar></ItemMedia><ItemContent><ItemTitle>{itemFixture.title}</ItemTitle><ItemDescription>{itemFixture.description}</ItemDescription></ItemContent><ItemActions><Button size="sm" variant="outline">{itemFixture.action}</Button></ItemActions></Item>
    </div>,
    label: <Label htmlFor="label-sample">거래 메모</Label>,
    "list-row": <ListRow data-state={selected ? "selected" : undefined} className="max-w-lg"><ListRowContent><ListRowTitle>미래에셋 TIGER 미국S&amp;P500</ListRowTitle><ListRowDescription>2026. 08. 18. · 매수</ListRowDescription></ListRowContent><ListRowMeta>₩4,230,000</ListRowMeta><ListRowTrailing className="text-destructive-text">−₩115,000</ListRowTrailing></ListRow>,
    "native-select": <Field className="max-w-sm" data-invalid={selection.validity === "invalid" || undefined}><FieldLabel htmlFor="native-select-market">시장</FieldLabel><NativeSelect id="native-select-market" size={size} defaultValue="kr" disabled={selection.disabled === "disabled"} aria-invalid={selection.validity === "invalid" || undefined}><NativeSelectOption value="kr">국내</NativeSelectOption><NativeSelectGroup label="해외"><NativeSelectOption value="us">미국</NativeSelectOption><NativeSelectOption value="jp">일본</NativeSelectOption></NativeSelectGroup></NativeSelect>{selection.validity === "invalid" && <FieldError>시장을 선택하세요.</FieldError>}</Field>,
    popover: <Popover defaultOpen={selection.open === "open"}><PopoverTrigger asChild><Button variant="outline">필터 도움말</Button></PopoverTrigger><PopoverContent><PopoverHeader><PopoverTitle>시장 필터</PopoverTitle><PopoverDescription>선택한 시장의 거래만 투자 이력에 표시합니다.</PopoverDescription></PopoverHeader></PopoverContent></Popover>,
    pagination: <Pagination><PaginationContent><PaginationItem><PaginationPrevious href="#page-1"/></PaginationItem><PaginationItem><PaginationLink href="#page-1">1</PaginationLink></PaginationItem><PaginationItem><PaginationLink href="#page-2" isActive={selection.currentPage === "current"}>2</PaginationLink></PaginationItem><PaginationItem><PaginationEllipsis/></PaginationItem><PaginationItem><PaginationLink href="#page-12">12</PaginationLink></PaginationItem><PaginationItem><PaginationNext href="#page-3"/></PaginationItem></PaginationContent></Pagination>,
    progress: (() => { const percent = selection.value === "empty" ? 0 : selection.value === "complete" ? 100 : 64; return <div className="max-w-sm"><div className="mb-2 flex items-center gap-2"><ProgressLabel id="progress-label">투자 내역 가져오는 중</ProgressLabel><ProgressValue>{percent}%</ProgressValue></div><Progress value={percent} aria-labelledby="progress-label" /></div> })(),
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
      ? <ToggleGroup type="multiple" variant={variant} size={size} orientation={selection.orientation as "horizontal" | "vertical"} spacing={selection.spacing as "separate" | "attached"} defaultValue={selection.pressed === "pressed" ? ["return", "average"] : []} aria-label="차트 지표"><ToggleGroupItem value="return">수익률</ToggleGroupItem><ToggleGroupItem value="average">평균단가</ToggleGroupItem><ToggleGroupItem value="volume">거래량</ToggleGroupItem></ToggleGroup>
      : <ToggleGroup type="single" variant={variant} size={size} orientation={selection.orientation as "horizontal" | "vertical"} spacing={selection.spacing as "separate" | "attached"} defaultValue={selection.pressed === "pressed" ? "month" : "week"} aria-label="차트 기간"><ToggleGroupItem value="week">1주</ToggleGroupItem><ToggleGroupItem value="month">1개월</ToggleGroupItem><ToggleGroupItem value="year">1년</ToggleGroupItem></ToggleGroup>,
    /* `indicator`는 `TabsList`의 축이라 루트 축과 달리 스토리 컨트롤로 올라오지 않는다 —
     * 두 형태를 나란히 그려야 axe가 새 셀을 본다(`InputGroupAddon`의 `placement`와 같은 자리). */
    tabs: <div className="grid gap-6">
      <Tabs orientation={selection.orientation as "horizontal" | "vertical"} defaultValue={selection.selected === "active" ? "history" : "holdings"} className="max-w-lg"><TabsList aria-label="투자 상세 보기"><TabsTrigger value="holdings">보유 현황</TabsTrigger><TabsTrigger value="history">거래 내역</TabsTrigger></TabsList><TabsContent value="holdings">현재 보유 종목과 평가금액입니다.</TabsContent><TabsContent value="history">최근 거래 기록입니다.</TabsContent></Tabs>
      <Tabs orientation={selection.orientation as "horizontal" | "vertical"} defaultValue={selection.selected === "active" ? "history" : "holdings"} className="max-w-lg"><TabsList indicator="line" aria-label="투자 상세 보기(밑줄)"><TabsTrigger value="holdings">보유 현황</TabsTrigger><TabsTrigger value="history">거래 내역</TabsTrigger></TabsList><TabsContent value="holdings">현재 보유 종목과 평가금액입니다.</TabsContent><TabsContent value="history">최근 거래 기록입니다.</TabsContent></Tabs>
    </div>,
    table: <InvestmentTable/>,
    textarea: <Field className="max-w-sm"><FieldLabel htmlFor="trade-note">거래 메모</FieldLabel><Textarea id="trade-note" size={size} placeholder="판단 근거를 남겨보세요"/><FieldDescription>다음 회고에서 확인할 수 있습니다.</FieldDescription></Field>,
    tooltip: <TooltipProvider><Tooltip defaultOpen={selection.open === "open"}><TooltipTrigger asChild><Button size="icon" variant="outline" aria-label="수익률 계산 방식">?</Button></TooltipTrigger><TooltipContent>매입 금액을 기준으로 계산합니다.</TooltipContent></Tooltip></TooltipProvider>,
    toast: <ToastProvider><Toast open={selection.open === "open"} variant={variant}><div><ToastTitle>거래를 저장했습니다</ToastTitle><ToastDescription>삼성전자 우선주 매수 기록이 추가되었습니다.</ToastDescription></div><ToastAction altText="저장한 거래 보기">보기</ToastAction><ToastClose/></Toast><ToastViewport/></ToastProvider>,
    kbd: <div className="grid gap-5">
      <KbdGroup><Kbd><span aria-hidden="true">⌘</span><span className="sr-only">Command</span></Kbd><span>+</span><Kbd>K</Kbd></KbdGroup>
      <p className="text-sm text-muted-foreground">투자 기록 검색은 <KbdGroup><Kbd><span aria-hidden="true">⌘</span><span className="sr-only">Command</span></Kbd><span>+</span><Kbd>K</Kbd></KbdGroup> 로 엽니다.</p>
      <Button variant="outline" aria-keyshortcuts="Meta+Enter" className="w-fit">거래 저장 <Kbd><span aria-hidden="true">⏎</span><span className="sr-only">Enter</span></Kbd></Button>
      <TooltipProvider><Tooltip defaultOpen><TooltipTrigger asChild><Button variant="outline" aria-keyshortcuts="n" className="w-fit">거래 추가</Button></TooltipTrigger><TooltipContent>거래 추가 <Kbd className="bg-transparent text-[var(--ds-fg-on-inverse)]">N</Kbd></TooltipContent></Tooltip></TooltipProvider>
    </div>,
    "input-otp": <Field className="max-w-sm">
      <FieldLabel htmlFor="input-otp-code">인증번호</FieldLabel>
      <InputOTP id="input-otp-code" maxLength={6} value={selection.value === "filled" ? "042195" : ""} onChange={() => {}} aria-invalid={selection.validity === "invalid" || undefined}>
        <InputOTPGroup>{[0, 1, 2].map((index) => <InputOTPSlot key={index} index={index} active={selection.cursor === "active" && index === 0} aria-invalid={selection.validity === "invalid" || undefined}/>)}</InputOTPGroup>
        <InputOTPSeparator/>
        <InputOTPGroup>{[3, 4, 5].map((index) => <InputOTPSlot key={index} index={index} aria-invalid={selection.validity === "invalid" || undefined}/>)}</InputOTPGroup>
      </InputOTP>
      <FieldDescription>문자로 받은 여섯 자리 숫자를 입력하세요.</FieldDescription>
      {selection.validity === "invalid" && <FieldError>인증번호가 일치하지 않습니다.</FieldError>}
    </Field>,
    resizable: <ResizablePanelGroup orientation={selection.orientation as "horizontal" | "vertical"} className="h-48 max-w-lg rounded-lg border">
      <ResizablePanel collapsible minSize="20%" collapsedSize="0%" defaultSize={selection.panel === "collapsed" ? "0%" : "35%"}><div className="h-full p-3 text-sm">보유 종목</div></ResizablePanel>
      <ResizableHandle withHandle aria-label="목록과 상세의 경계"/>
      <ResizablePanel defaultSize={selection.panel === "collapsed" ? "100%" : "65%"}><div className="h-full p-3 text-sm">삼성전자 · 평가금액 ₩4,230,000</div></ResizablePanel>
    </ResizablePanelGroup>,
    sidebar: <div className="relative h-80 w-full overflow-hidden rounded-lg border [transform:translate(0)]">
      <SidebarProvider open={selection.state !== "collapsed"} isMobile={false} className="h-full min-h-0">
        <Sidebar aria-label="투자 기록 탐색" side={selection.side as "left" | "right"} variant={selection.variant as "sidebar" | "floating" | "inset"} collapsible={selection.collapsible as "offcanvas" | "icon"}>
          <SidebarHeader><p className="px-2 text-sm font-medium">투자 기록</p></SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>포트폴리오</SidebarGroupLabel>
              <SidebarGroupAction aria-label="구역 추가">＋</SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={selection.item === "active"}><span>보유 현황</span></SidebarMenuButton>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="sm"><span>거래 내역</span></SidebarMenuButton>
                    <SidebarMenuAction aria-label="거래 내역 작업">⋯</SidebarMenuAction>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem><SidebarMenuSubButton href="#kr">국내</SidebarMenuSubButton></SidebarMenuSubItem>
                      <SidebarMenuSubItem><SidebarMenuSubButton href="#us" isActive={selection.item === "active"}>미국</SidebarMenuSubButton></SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator/>
          </SidebarContent>
          <SidebarFooter><p className="px-2 text-sm text-muted-foreground">김서경</p></SidebarFooter>
          <SidebarRail/>
        </Sidebar>
        <SidebarInset className="p-4"><SidebarTrigger/><p className="mt-3 text-sm">본문이 여기에 놓입니다.</p></SidebarInset>
      </SidebarProvider>
    </div>,
    menubar: <Menubar aria-label="투자 기록 명령 막대" defaultValue={selection.open === "open" ? "view" : undefined}>
      <MenubarMenu value="record">
        <MenubarTrigger>기록</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>거래</MenubarLabel>
          <MenubarItem>거래 추가</MenubarItem>
          <MenubarItem>거래 가져오기</MenubarItem>
          <MenubarSeparator/>
          <MenubarSub>
            <MenubarSubTrigger>내보내기</MenubarSubTrigger>
            <MenubarSubContent><MenubarItem>CSV</MenubarItem><MenubarItem disabled>PDF</MenubarItem></MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>보기</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={selection.checked === "checked"}>수익률 열 표시</MenubarCheckboxItem>
          <MenubarSeparator/>
          <MenubarLabel>정렬</MenubarLabel>
          <MenubarRadioGroup value={selection.checked === "checked" ? "date" : "amount"}>
            <MenubarRadioItem value="date">거래일순</MenubarRadioItem>
            <MenubarRadioItem value="amount">금액순</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
    "navigation-menu": <NavigationMenu aria-label="투자 기록 주요 탐색" defaultValue={selection.open === "open" ? "portfolio" : undefined}>
      <NavigationMenuList>
        <NavigationMenuItem value="portfolio">
          <NavigationMenuTrigger>포트폴리오</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 list-none gap-1">
              <li><NavigationMenuLink href="#holdings" active={selection.currentLocation === "current"}><span className="font-medium">보유 현황</span><span className="text-muted-foreground">평가금액과 비중을 한눈에 봅니다.</span></NavigationMenuLink></li>
              <li><NavigationMenuLink href="#allocation"><span className="font-medium">자산 배분</span><span className="text-muted-foreground">목표 비중과의 차이를 확인합니다.</span></NavigationMenuLink></li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="trades">
          <NavigationMenuLink href="#trades" className={navigationMenuTriggerVariants()}>거래</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem value="review">
          <NavigationMenuLink href="#review" className={navigationMenuTriggerVariants()}>회고</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
    carousel: (() => {
      const slides = ["삼성전자", "TIGER 미국S&P500", "현대차", "SK하이닉스"]
      const startIndex = selection.currentSlide === "last" ? slides.length - 1 : selection.currentSlide === "middle" ? 1 : 0
      const vertical = selection.orientation === "vertical"
      return <Carousel
        aria-label="보유 종목 요약"
        orientation={vertical ? "vertical" : "horizontal"}
        opts={{ startIndex }}
        className={vertical ? "mx-auto w-64 py-12" : "mx-auto max-w-md px-12"}
      >
        <CarouselContent className={vertical ? "h-48" : undefined}>
          {slides.map((slide) => <CarouselItem key={slide}>
            <Card className="h-full"><CardHeader><CardTitle>{slide}</CardTitle><CardDescription>평가금액 ₩4,230,000</CardDescription></CardHeader></Card>
          </CarouselItem>)}
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    })(),
    chart: <div className="grid gap-6">
      <ChartContainer config={CHART_CONFIG} indicator={selection.indicator as "dot" | "line" | "dashed"} className="aspect-auto h-56 w-full">
        <BarChart data={CHART_DATA} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="var(--border)"/>
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}/>
          <RechartsTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent indicator={selection.indicator as "dot" | "line" | "dashed"}/>}/>
          <Legend content={<ChartLegendContent/>}/>
          <Bar dataKey="buy" fill="var(--color-buy)" radius={4}/>
          <Bar dataKey="sell" fill="var(--color-sell)" radius={4}/>
        </BarChart>
      </ChartContainer>
      {/* 우리가 소유하는 두 자산은 차트 없이도 홀로 선다 — Figma가 그리는 것도 이 둘이다. */}
      <div className="flex flex-wrap items-start gap-6">
        <ChartTooltipContent active label="2026년 8월" indicator={selection.indicator as "dot" | "line" | "dashed"} payload={CHART_SAMPLE_PAYLOAD}/>
        <ChartLegendContent payload={CHART_SAMPLE_PAYLOAD}/>
      </div>
    </div>,
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
