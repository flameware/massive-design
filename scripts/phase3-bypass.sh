#!/bin/bash
# Phase 3 모집단 — 소비처가 DS 컴포넌트에 className으로 얹은 것을 종류별로 센다.
SRC="${1:-/Users/seongki/Documents/01_Projects/investmentdiary/src}"
cd "$SRC" || exit 1
DS='Button|Badge|Card|Alert|Text|Heading|Input|Textarea|Field|Form|Select|Checkbox|Toggle|ToggleGroup|Table|Combobox|Progress|EmptyState|NumberField|Pagination|ConfirmDialog|Spinner|Separator|Skeleton|ListRow|Tabs|Menu|Dialog|Drawer|Tooltip|Avatar|AlertDialog|PageShell'
RAW=$(mktemp)
grep -rnoE "<($DS)(\.[A-Za-z]+)? [^>]*className=\"[^\"]*\"" --include='*.tsx' . 2>/dev/null > "$RAW"
tok() { grep -oE 'className="[^"]*"' "$1" | sed 's/className="//;s/"$//' | tr ' ' '\n' | grep -v '^$'; }
kind() {
  local n
  n=$(grep -E "<($2)" "$RAW" | grep -oE 'className="[^"]*"' | sed 's/className="//;s/"$//' \
      | tr ' ' '\n' | grep -v '^$' | grep -cE "$3")
  printf '%-34s %s\n' "$1" "$n"
}
echo "총 자리(JSX 여는 태그 수): $(wc -l < "$RAW" | tr -d ' ')"
echo "총 클래스 토큰 수:         $(tok "$RAW" | wc -l | tr -d ' ')"
kind "톤(text-muted/danger/accent…)" "$DS" '^text-(muted|danger|accent|default|success|warning|on-)'
kind "타이포 크기(text-xs/sm/…)"      "$DS" '^text-(xs|sm|base|lg|xl|[0-9]xl)$'
kind "정렬(text-right/center/left)"   "$DS" '^text-(right|center|left)$'
kind "숫자 서체(font-mono/tabular)"   "$DS" '^(font-mono|tabular-nums)$'
kind "굵기(font-bold/normal/…)"       "$DS" '^font-(thin|light|normal|medium|semibold|bold|extrabold)$'
kind "치수(h-/w-/size-/min-/max-)"    "$DS" '^(h|w|size|min-h|min-w|max-h|max-w)-'
kind "레이아웃(flex/grid/gap/space)"  "$DS" '^(flex|grid|gap|space|items|justify|col|row|order|shrink|grow|basis)'
kind "여백(p-/m-/px-/mt-…)"           "$DS" '^-?(p|m)[xytblrse]?-'
grep -oE "<($DS)(\.[A-Za-z]+)?" "$RAW" | sort | uniq -c | sort -rn | head -12
rm -f "$RAW"
