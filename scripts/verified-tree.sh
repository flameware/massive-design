#!/usr/bin/env bash
# 커밋의 tree가 `check` 워크플로를 이미 통과했는지 판정한다 (#481).
#
#   scripts/verified-tree.sh <commit> [max-seconds]
#
# `verified=true|false`를 `$GITHUB_OUTPUT`(없으면 stdout)에 적는다. 같은 tree의
# run 가운데 success가 있으면 true, 아무것도 없으면 false다. 도는 중인 run이
# 있으면 끝날 때까지 기다린다. failure만 남으면 non-zero로 끝나 게시를 막는다.
#
# 커밋이 아니라 tree를 보는 까닭: 릴리스 PR은 squash로 머지되므로 태그 커밋은
# PR이 검사한 커밋과 SHA가 다르지만, 브랜치가 main 최신 위에 있었다면 tree는
# 같다. 워크플로 파일도 tree 안에 있으니 tree가 같으면 검사의 입력도 같다.
#
# `pull_request` run은 head가 아니라 base와의 머지 결과를 검사한다. 그래도 head의
# tree로 맞춰 보는 것이 안전하다 — 브랜치가 main보다 뒤처져 머지 결과가 head와
# 달랐다면, 태그 커밋에도 그 main 변경이 들어 있어 head의 tree와 맞지 않는다.
set -euo pipefail

commit=${1:?usage: verified-tree.sh <commit> [max-seconds]}
deadline=$(($(date +%s) + ${2:-1800}))
repo=${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}
tree=$(git rev-parse "$commit^{tree}")
out=${GITHUB_OUTPUT:-/dev/stdout}

echo "tree $tree"
while :; do
  runs=$(gh api "repos/$repo/actions/workflows/check.yml/runs?per_page=50" \
    --jq "[.workflow_runs[] | select(.head_commit.tree_id == \"$tree\")]")

  passed=$(jq -r '[.[] | select(.conclusion == "success")][0].html_url // empty' <<<"$runs")
  if [ -n "$passed" ]; then
    echo "같은 tree가 통과했다: $passed"
    echo "verified=true" >>"$out"
    exit 0
  fi

  if [ "$(jq '[.[] | select(.status != "completed")] | length' <<<"$runs")" -gt 0 ]; then
    if [ "$(date +%s)" -ge "$deadline" ]; then
      echo "TIMEOUT: 같은 tree의 check가 끝나지 않았다" >&2
      exit 1
    fi
    echo "같은 tree의 check가 도는 중이다 — 30초 뒤 다시 본다"
    sleep 30
    continue
  fi

  failed=$(jq -r '[.[] | select(.conclusion == "failure")][0].html_url // empty' <<<"$runs")
  if [ -n "$failed" ]; then
    echo "같은 tree가 check에서 실패했다: $failed" >&2
    exit 1
  fi

  echo "같은 tree의 check가 없다 — 여기서 직접 검사한다"
  echo "verified=false" >>"$out"
  exit 0
done
