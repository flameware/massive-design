#!/bin/bash
# wait-pr-checks.sh <repo-dir> <pr-number> [max-seconds]
# Docs: docs/agents/issue-tracker.md "Waiting on a PR's checks"
# Waits until every check on the PR leaves the "pending" bucket, then prints a
# normalized summary. Uses `gh pr checks`, which flattens CheckRun /
# StatusContext / Deployment into one `bucket` field — `statusCheckRollup` does
# not, and filtering it on `.status` spins forever on StatusContext rows whose
# `.status` is null.
dir=$1; pr=$2; max=${3:-1800}
cd "$dir" || exit 2
waited=0
while :; do
  out=$(gh pr checks "$pr" --json name,bucket,state 2>/dev/null)
  if [ -n "$out" ]; then
    pending=$(jq '[.[]|select(.bucket=="pending")]|length' <<<"$out")
    [ "$pending" = "0" ] && break
  fi
  [ "$waited" -ge "$max" ] && { echo "TIMEOUT after ${max}s"; jq -r '.[]|.bucket+" "+.name' <<<"$out"; exit 1; }
  sleep 20; waited=$((waited+20))
done
jq -r '.[]|.bucket+"\t"+.name' <<<"$out"
fail=$(jq '[.[]|select(.bucket=="fail")]|length' <<<"$out")
gh pr view "$pr" --json mergeable,mergeStateStatus -q '"mergeable="+.mergeable+" state="+.mergeStateStatus'
echo "failing=$fail"
