import { Table } from "@flameware/ui/table"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Header,
  useReactTable,
} from "@tanstack/react-table"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* Table.Root가 진짜 컴포넌트다 — Header·Body·Row·Head·Cell은 그 아래 파트일
 * 뿐이라 각자 독립된 스토리 파일을 갖지 않는다(Field.stories.tsx와 같은 결).
 * `parameters.ds`가 없는 이유는 이 primitive에 축(variant·size)이 없어서다 —
 * Playground/Controls로 흔들 것이 없다. */
const meta = {
  title: "Data display/Table",
  component: Table.Root,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
} satisfies Meta<typeof Table.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

interface Trade {
  id: string
  date: string
  symbol: string
  quantity: number
  price: number
  gain: number
}

/* 손익 부호만 적고 색은 칠하지 않는다 — 상승/하락 색은 앱 소유다(CONTEXT.md
 * "램프" 절, ADR-0023 §10). DS Table이 danger/success 계열로 손익을 칠하면
 * 그 판단을 DS가 대신 내리는 것이 된다. */
const TRADES: Trade[] = [
  { id: "1", date: "2026-08-04", symbol: "삼성전자", quantity: 10, price: 71_200, gain: 34_000 },
  { id: "2", date: "2026-08-12", symbol: "NAVER", quantity: 3, price: 214_500, gain: -12_800 },
  { id: "3", date: "2026-08-19", symbol: "카카오", quantity: 20, price: 41_300, gain: 6_200 },
  { id: "4", date: "2026-08-27", symbol: "SK하이닉스", quantity: 5, price: 189_400, gain: -3_100 },
  { id: "5", date: "2026-09-02", symbol: "삼성전자", quantity: 8, price: 73_600, gain: 19_600 },
]

const won = new Intl.NumberFormat("ko-KR")
const signed = (n: number) => `${n >= 0 ? "+" : ""}${won.format(n)}원`

/* 정적 앤어토미 — Head·Cell을 손으로 채운다. 아래 TanStack 스토리와 나란히 두면
 * 같은 파트가 두 방식(손으로 채우기·flexRender로 채우기) 모두를 받는 것이
 * 보인다. */
export const Basic: Story = {
  render: () => (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head scope="col">날짜</Table.Head>
          <Table.Head scope="col">종목</Table.Head>
          <Table.Head scope="col" className="text-right">
            수량
          </Table.Head>
          <Table.Head scope="col" className="text-right">
            단가
          </Table.Head>
          <Table.Head scope="col" className="text-right">
            손익
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {TRADES.map((t) => (
          <Table.Row key={t.id}>
            <Table.Cell>{t.date}</Table.Cell>
            <Table.Cell>{t.symbol}</Table.Cell>
            <Table.Cell className="text-right">{won.format(t.quantity)}</Table.Cell>
            <Table.Cell className="text-right">{won.format(t.price)}원</Table.Cell>
            <Table.Cell className="text-right">{signed(t.gain)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ),
}

const columnHelper = createColumnHelper<Trade>()

const columns = [
  columnHelper.accessor("date", { header: "날짜" }),
  columnHelper.accessor("symbol", { header: "종목" }),
  columnHelper.accessor("quantity", { header: "수량", cell: (info) => won.format(info.getValue()) }),
  columnHelper.accessor("price", { header: "단가", cell: (info) => `${won.format(info.getValue())}원` }),
  columnHelper.accessor("gain", { header: "손익", cell: (info) => signed(info.getValue()) }),
]

function useTradesTable() {
  return useReactTable({
    data: TRADES,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}

/* AC1의 스토리 — TanStack Table 위에 그대로 얹힌다. `@flameware/ui/table`이
 * 아는 것은 여기까지고, `@tanstack/react-table`은 table.tsx 어디에도 없다
 * (package.json에 devDependency로도 없다 — 이 앱(apps/storybook)만의 devDependency다).
 * `header.column.columnDef.header`·`cell.column.columnDef.cell`을 `flexRender`로
 * 편 것을 `Table.Head`·`Table.Cell`의 children으로 그대로 꽂는다. */
export const OnTanStackTable: Story = {
  name: "TanStack Table 위에서",
  render: () => <TanStackFixture />,
}

function TanStackFixture() {
  const table = useTradesTable()
  return (
    <Table.Root>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <SortableHead key={header.id} header={header} />
            ))}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <Table.Row key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell key={cell.id} className={cell.column.id === "date" ? undefined : "text-right"}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

/* 정렬 가능한 머리 셀 — 클릭 대상은 `<th>` 전체가 아니라 안의 `<button>`이다
 * (스토리 22·rules.md 포인터 기하). 시각 크기는 텍스트 높이만큼 작아도
 * `hit-area`가 24px 하한을 유사요소로 지고, `state`가 hover/press 피드백을
 * 준다 — 둘 다 이미 있는 DS 유틸리티라 Table이 새 CSS를 더하지 않는다. */
function SortableHead({ header, testId }: { header: Header<Trade, unknown>; testId?: string }) {
  const sorted = header.column.getIsSorted()
  return (
    <Table.Head
      scope="col"
      className={header.column.id === "date" ? undefined : "text-right"}
      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
    >
      {header.isPlaceholder ? null : (
        <button
          type="button"
          data-testid={testId}
          onClick={header.column.getToggleSortingHandler()}
          className={
            "hit-area state -mx-1 -my-1 inline-flex items-center gap-1 rounded-sm px-1 py-1" +
            (header.column.id !== "date" ? " flex-row-reverse" : "")
          }
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          <SortIcon direction={sorted} />
        </button>
      )}
    </Table.Head>
  )
}

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ opacity: direction ? 1 : 0.4 }}>
      <path
        d={direction === "desc" ? "M4 6l4 4 4-4" : "M4 10l4-4 4 4"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* 키보드 계약을 재는 스토리. `sort-state`가 밖에서 보이는 결과다 — 정렬 아이콘의
 * 방향이 아니라 화면에 적힌 문장으로 잰다(rules.md 방법론 — 밖에서 보이는
 * 결과만 잰다). */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 첫 정렬 버튼(날짜)에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=sort-date]" },
  },
  {
    name: "Enter가 오름차순으로 정렬한다",
    focus: "[data-testid=sort-date]",
    press: ["Enter"],
    expect: { focused: "[data-testid=sort-date]", text: { "[data-testid=sort-state]": "오름차순" } },
  },
  {
    name: "Space를 두 번 누르면 오름차순 다음은 내림차순이다",
    focus: "[data-testid=sort-date]",
    press: ["Space", "Space"],
    expect: { text: { "[data-testid=sort-state]": "내림차순" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const table = useTradesTable()
  const dateSort = table.getColumn("date")?.getIsSorted()
  const label = dateSort === "asc" ? "오름차순" : dateSort === "desc" ? "내림차순" : "없음"

  return (
    <div>
      <p>
        날짜 정렬: <span data-testid="sort-state">{label}</span>
      </p>
      <Table.Root>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <SortableHead
                  key={header.id}
                  header={header}
                  testId={header.column.id === "date" ? "sort-date" : undefined}
                />
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map((row) => (
            <Table.Row key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id} className={cell.column.id === "date" ? undefined : "text-right"}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  )
}
