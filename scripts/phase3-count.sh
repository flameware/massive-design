#!/bin/bash
# Phase 3 후보 실측 — invest diary src/ 기준
SRC="${1:-/Users/seongki/Documents/01_Projects/investmentdiary/src}"
cd "$SRC" || exit 1
count() {
  local label="$1" pat="$2" files hits
  files=$(grep -rlE "$pat" --include='*.tsx' --include='*.ts' . 2>/dev/null | wc -l | tr -d ' ')
  hits=$(grep -rhoE "$pat" --include='*.tsx' --include='*.ts' . 2>/dev/null | wc -l | tr -d ' ')
  printf '%-26s files=%-4s hits=%s\n' "$label" "$files" "$hits"
}
count "radio(native)"        'type="radio"'
count "switch(role)"         'role="switch"'
count "date input"           'type="date"|type="datetime-local"|type="month"'
count "range/slider"         'type="range"'
count "otp/one-time-code"    'one-time-code|autoComplete="one-time'
count "scroll container"     'overflow-(y-|x-)?auto|overflow-(y|x)-scroll'
count "toast/snackbar"       'toast|Toast|snackbar|Snackbar'
count "popover(hand)"        'popover|Popover'
count "accordion/collapse"   '[Aa]ccordion|[Cc]ollapsib'
count "breadcrumb"           '[Bb]readcrumb'
count "sidebar/nav drawer"   '[Ss]idebar|[Nn]avigationMenu|[Mm]enubar'
count "context menu"         'onContextMenu|[Cc]ontextMenu'
count "command palette"      'cmdk|CommandPalette|command-palette'
count "carousel"             '[Cc]arousel|embla'
count "resizable"            '[Rr]esizable|react-resizable'
count "toolbar"              'role="toolbar"|[Tt]oolbar'
