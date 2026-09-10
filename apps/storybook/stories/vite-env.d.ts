/* Vite의 `import.meta.glob` — 카탈로그가 스토리 파일을 훑는 자리(catalog.ts).
 *
 * `vite/client`를 참조하지 않는다: vite는 이 워크스페이스의 의존이 아니라
 * Storybook이 안에서 쓰는 것이라 타입이 여기서 해석되지 않는다. 필요한 것은
 * 함수 하나뿐이므로 그것만 적는다 — 의존을 하나 더 무는 것보다 싸다. */
interface ImportMeta {
  glob<T>(pattern: string, options: { eager: true }): Record<string, T>
}
