/* `@flameware/ui/styles.css`의 side-effect import를 tsc가 읽는 자리.
 * 스타일은 타입이 없다 — 번들러가 처리하고 타입 검사기는 존재만 알면 된다. */
declare module "*.css" {}
