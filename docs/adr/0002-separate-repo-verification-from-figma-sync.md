# Repo verification과 Figma Sync를 독립 작업으로 분리한다

구현 정본 변경은 `CODE_VERIFIED`와 `STORYBOOK_VERIFIED`를 획득하는 Repo verification에서 완료한다. Figma MCP·skill의 높은 토큰 및 실행 시간 비용을 모든 코드 변경에 부과하지 않기 위해, Figma 드리프트는 기간 제한 없이 허용하고 사용자가 명시적으로 요청할 때만 전용 GitHub issue로 Figma Sync를 시작한다.

Repo verification은 Figma용 토큰 산출물·매니페스트·번역표·세대 해시의 로컬 생성과 검증을 계속 포함한다. Figma Sync는 특정 Repo verification의 commit과 `inputDigest`를 고정해 문서 주입·멱등 검증·시각 확인·사람 발행·발행 상태 재확인까지 책임지며, 리포 밖 consumer checkpoint는 별도 작업으로 남긴다. 최신 Repo verification 기록과 마지막 Figma 공개 기준선은 서로 덮어쓰지 않도록 독립적으로 보존한다.
