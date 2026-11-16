#!/bin/sh
# 스파이크 대상 하나를 빌드하고 apps/storybook의 테스트를 **그대로** 돌린다.
#
#   ./run.sh form        # stories/form만
#   ./run.sh all         # 전부
#
# 테스트 파일은 고치지 않는다는 것이 #496의 합격선이다. 그래서 매번
# apps/storybook/test에서 새로 복사해 오고, 스파이크에는 테스트 사본을 두지 않는다.
# 대상마다 runs/<대상>/에 따로 빌드하므로 여러 대상을 동시에 돌려도 섞이지 않는다.
set -eu
cd "$(dirname "$0")"
target=${1:?대상을 준다: form | field | combobox | dialog | drawer | list-row | all}
shift
run="runs/$target"
rm -rf "$run"
mkdir -p "$run/test"
if [ "$target" = all ]; then unset SPIKE_TARGET; else export SPIKE_TARGET="$target"; fi
../../apps/storybook/node_modules/.bin/storybook build --quiet -c .storybook -o "$run/storybook-static" >"$run/build.log" 2>&1 || {
  tail -40 "$run/build.log"
  exit 1
}
cp ../../apps/storybook/test/stories.test.mjs "$run/test/"
# 칸 안 그룹의 치수 테스트는 Combobox 스토리가 있을 때만 뜻이 있다
case "$target" in combobox | all) cp ../../apps/storybook/test/combobox-input-group.test.mjs "$run/test/" ;; esac
cd "$run"
node --test "$@"
