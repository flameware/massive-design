#!/bin/sh
# #496 스파이크 준비. UI SDK 두 패키지만 npm으로 정확한 버전에 고정해 받고,
# 나머지(storybook·playwright·react·tailwind…)는 워크스페이스가 이미 받은 것을
# 심볼릭 링크로 빌린다 — 스파이크가 React를 한 벌 더 들이지 않게 하려는 것이다.
set -eu
cd "$(dirname "$0")"
npm install --no-audit --no-fund --legacy-peer-deps
for owner in ../../apps/storybook ../../packages/ui; do
  for entry in "$owner"/node_modules/* "$owner"/node_modules/@*/*; do
    name=${entry#"$owner"/node_modules/}
    case "$name" in @*/*) ;; @*) continue ;; esac
    [ -e "node_modules/$name" ] && continue
    mkdir -p "node_modules/$(dirname "$name")"
    ln -s "$(cd "$(dirname "$entry")" && pwd -P)/$(basename "$entry")" "node_modules/$name"
  done
done
