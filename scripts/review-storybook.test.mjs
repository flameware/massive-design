import assert from 'node:assert/strict'
import { test } from 'node:test'

import { applyStorybookReview, parseReviewArgs } from './review-storybook.mjs'

const record = () => ({
  stages: { STORYBOOK_VERIFIED: { result: 'PENDING_HUMAN', automatedResult: 'PASS' } },
  lastCompletedStage: 'CODE_VERIFIED',
  failure: null,
  resumeAt: 'Storybook visual review',
})

test('PASS 리뷰가 Storybook gate를 완료하고 Figma로 넘긴다', () => {
  const next = applyStorybookReview(record(), {
    result: 'PASS', reviewer: 'seongki', scope: 'Button Light/Dark + hover/pressed', reason: null,
  }, '2026-08-24T00:00:00.000Z')
  assert.equal(next.stages.STORYBOOK_VERIFIED.result, 'PASS')
  assert.equal(next.stages.STORYBOOK_VERIFIED.visualReview.reviewer, 'seongki')
  assert.equal(next.lastCompletedStage, 'STORYBOOK_VERIFIED')
  assert.equal(next.resumeAt, 'FIGMA_DOCUMENT_SYNCED')
})

test('FAIL 리뷰는 이유를 요구하고 코드 gate 뒤에서 멈춘다', () => {
  assert.throws(() => parseReviewArgs(['--result', 'FAIL', '--reviewer', 'seongki', '--scope', 'Button']), /--reason/)
  const next = applyStorybookReview(record(), {
    result: 'FAIL', reviewer: 'seongki', scope: 'Button', reason: 'dark hover contrast',
  })
  assert.equal(next.stages.STORYBOOK_VERIFIED.result, 'FAIL')
  assert.equal(next.lastCompletedStage, 'CODE_VERIFIED')
  assert.equal(next.failure.check, 'Storybook visual review')
})

test('자동 검사가 PASS가 아니면 사람 리뷰를 기록하지 않는다', () => {
  const stale = record()
  stale.stages.STORYBOOK_VERIFIED.automatedResult = 'FAIL'
  assert.throws(() => applyStorybookReview(stale, {
    result: 'PASS', reviewer: 'seongki', scope: 'all', reason: null,
  }), /자동 검사가 PASS/)
})
