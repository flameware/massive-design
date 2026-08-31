import assert from 'node:assert/strict'
import { test } from 'node:test'

import { applyStorybookReview, parseReviewArgs } from './review-storybook.mjs'

const record = () => ({
  stages: { STORYBOOK_VERIFIED: { result: 'PENDING_HUMAN', automatedResult: 'PASS' } },
  lastCompletedStage: 'CODE_VERIFIED',
  failure: null,
  resumeAt: 'Storybook visual review',
})

test('PASS 리뷰가 Repo verification을 완료하고 후속 필수 단계를 남기지 않는다', () => {
  const next = applyStorybookReview(record(), {
    result: 'PASS', reviewer: 'seongki', scope: 'Button Light/Dark + hover/pressed', reason: null,
  }, '2026-08-24T00:00:00.000Z')
  assert.equal(next.stages.STORYBOOK_VERIFIED.result, 'PASS')
  assert.equal(next.stages.STORYBOOK_VERIFIED.visualReview.reviewer, 'seongki')
  assert.equal(next.lastCompletedStage, 'STORYBOOK_VERIFIED')
  assert.equal(next.result, 'PASS')
  assert.equal(next.completedAt, '2026-08-24T00:00:00.000Z')
  assert.equal(next.resumeAt, null)
})

test('FAIL 리뷰는 이유를 요구하고 코드 gate 뒤에서 멈춘다', () => {
  assert.throws(() => parseReviewArgs(['--result', 'FAIL', '--reviewer', 'seongki', '--scope', 'Button']), /--reason/)
  const next = applyStorybookReview(record(), {
    result: 'FAIL', reviewer: 'seongki', scope: 'Button', reason: 'dark hover contrast',
  })
  assert.equal(next.stages.STORYBOOK_VERIFIED.result, 'FAIL')
  assert.equal(next.lastCompletedStage, 'CODE_VERIFIED')
  assert.equal(next.result, 'FAIL')
  assert.equal(next.failure.check, 'Storybook visual review')
})

test('자동 검사가 PASS가 아니면 사람 리뷰를 기록하지 않는다', () => {
  const stale = record()
  stale.stages.STORYBOOK_VERIFIED.automatedResult = 'FAIL'
  assert.throws(() => applyStorybookReview(stale, {
    result: 'PASS', reviewer: 'seongki', scope: 'all', reason: null,
  }), /자동 검사가 PASS/)
})

test('입력 트리가 dirty면 PASS를 기록하지 않는다', () => {
  const dirty = record()
  dirty.inputTree = { commit: 'b9a8f8f', clean: false, dirtyPaths: ['apps/storybook/.storybook/preview.tsx'] }
  assert.throws(() => applyStorybookReview(dirty, {
    result: 'PASS', reviewer: 'seongki', scope: 'all', reason: null,
  }), /세대를 고정할 수 없다/)
})

test('입력 트리가 dirty여도 FAIL은 기록한다 — 실패는 고정할 세대가 필요 없다', () => {
  const dirty = record()
  dirty.inputTree = { commit: 'b9a8f8f', clean: false, dirtyPaths: ['packages/ui/src/components/ui/button.tsx'] }
  const next = applyStorybookReview(dirty, {
    result: 'FAIL', reviewer: 'seongki', scope: 'Button', reason: 'dark hover contrast',
  })
  assert.equal(next.stages.STORYBOOK_VERIFIED.result, 'FAIL')
})

test('inputTree가 없는 옛 기록은 그대로 통과한다', () => {
  const legacy = record()
  delete legacy.inputTree
  const next = applyStorybookReview(legacy, {
    result: 'PASS', reviewer: 'seongki', scope: 'all', reason: null,
  })
  assert.equal(next.stages.STORYBOOK_VERIFIED.result, 'PASS')
})
